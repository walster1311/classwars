import { Room, Client } from 'colyseus';
import { ClassroomState, PlayerState, ChatMessageState, SeatState } from '@classverse/shared';
import { MSG_TYPES, CLASSROOM_BOUNDS } from '@classverse/shared';

interface JoinOptions {
  userId?: string;
  displayName?: string;
  role?: 'teacher' | 'student';
  avatarColor?: string;
  classroomId?: string;
  title?: string;
}

export class ClassroomRoom extends Room<ClassroomState> {
  maxClients = 35;
  private lastChatTimes = new Map<string, number>();

  onCreate(options: JoinOptions) {
    this.setState(new ClassroomState());

    if (options.classroomId) {
      this.state.classroomId = options.classroomId;
    }
    if (options.title) {
      this.state.title = options.title;
    }

    // Initialize all classroom seats
    this.state.initSeats();

    // 1. Movement synchronization
    this.onMessage(MSG_TYPES.MOVE, (client, data: { x: number; y: number; z: number; rotY: number; animation: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // If player is seated, they cannot move unless they stand first
      if (player.seatId) {
        return;
      }

      // Enforce bounds
      const clampedX = Math.max(CLASSROOM_BOUNDS.minX, Math.min(CLASSROOM_BOUNDS.maxX, data.x || 0));
      const clampedZ = Math.max(CLASSROOM_BOUNDS.minZ, Math.min(CLASSROOM_BOUNDS.maxZ, data.z || 0));

      player.x = clampedX;
      player.y = data.y || 0;
      player.z = clampedZ;
      player.rotY = data.rotY || 0;
      player.animation = data.animation || 'idle';
    });

    // 2. Sit down at a specific seat
    this.onMessage(MSG_TYPES.SIT, (client, data: { seatId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !data.seatId) return;

      const targetSeat = this.state.seats.get(data.seatId);
      if (!targetSeat) {
        client.send('error', { message: 'Invalid seat specified.' });
        return;
      }

      // Check if occupied by someone else
      if (targetSeat.occupiedBy && targetSeat.occupiedBy !== client.sessionId) {
        client.send('error', { message: 'Seat is already occupied.' });
        return;
      }

      // If player was already in another seat, vacate it
      if (player.seatId && player.seatId !== data.seatId) {
        const prevSeat = this.state.seats.get(player.seatId);
        if (prevSeat && prevSeat.occupiedBy === client.sessionId) {
          prevSeat.occupiedBy = '';
          prevSeat.occupiedByName = '';
        }
      }

      // Occupy target seat
      targetSeat.occupiedBy = client.sessionId;
      targetSeat.occupiedByName = player.displayName;

      player.seatId = targetSeat.id;
      player.x = targetSeat.x;
      player.y = targetSeat.y;
      player.z = targetSeat.z;
      player.rotY = targetSeat.rotY;
      player.animation = 'sit';

      client.send('seat_confirmed', { seatId: targetSeat.id });
    });

    // 3. Stand up from current seat
    this.onMessage(MSG_TYPES.STAND, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !player.seatId) return;

      const seat = this.state.seats.get(player.seatId);
      if (seat && seat.occupiedBy === client.sessionId) {
        seat.occupiedBy = '';
        seat.occupiedByName = '';
      }

      player.seatId = '';
      player.animation = 'idle';
      // Shift slightly forward to step out of the chair
      player.z += (seat?.isTeacherSeat ? 0.8 : -0.8);

      client.send('stand_confirmed');
    });

    // 4. Raise hand (Students request speaking permission or attention)
    this.onMessage(MSG_TYPES.RAISE_HAND, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.isHandRaised = true;
      player.handRaiseTime = Date.now();
      if (player.seatId) {
        player.animation = 'raise_hand';
      }

      this.broadcast('hand_raised', {
        sessionId: client.sessionId,
        displayName: player.displayName,
        time: player.handRaiseTime
      });
    });

    // 5. Lower hand (student or teacher)
    this.onMessage(MSG_TYPES.LOWER_HAND, (client, data?: { targetSessionId?: string }) => {
      const sender = this.state.players.get(client.sessionId);
      if (!sender) return;

      let targetSessionId = client.sessionId;
      if (data?.targetSessionId) {
        // Only teacher can lower another student's hand
        if (sender.role === 'teacher') {
          targetSessionId = data.targetSessionId;
        }
      }

      const target = this.state.players.get(targetSessionId);
      if (target) {
        target.isHandRaised = false;
        target.handRaiseTime = 0;
        if (target.seatId) {
          target.animation = 'sit';
        }
      }
    });

    // 6. Teacher approves hand -> grants speaking permission
    this.onMessage(MSG_TYPES.APPROVE_HAND, (client, data: { targetSessionId: string }) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can approve speaking permissions.' });
        return;
      }

      const target = this.state.players.get(data.targetSessionId);
      if (target) {
        target.isHandRaised = false;
        target.canSpeak = true;
        target.isMuted = false;
        if (target.seatId) {
          target.animation = 'sit';
        }

        this.broadcast('speaking_granted', {
          sessionId: target.sessionId,
          displayName: target.displayName
        });
      }
    });

    // 7. Teacher directly sets microphone permission for a participant
    this.onMessage(MSG_TYPES.SET_MIC_PERMISSION, (client, data: { targetSessionId: string; canSpeak: boolean }) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can configure microphone permissions.' });
        return;
      }

      const target = this.state.players.get(data.targetSessionId);
      if (target) {
        target.canSpeak = !!data.canSpeak;
        if (!target.canSpeak) {
          target.isMuted = true;
        }
      }
    });

    // 8. Teacher mutes all students
    this.onMessage(MSG_TYPES.MUTE_ALL, (client) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can mute the classroom.' });
        return;
      }

      this.state.players.forEach((player) => {
        if (player.role !== 'teacher') {
          player.canSpeak = false;
          player.isMuted = true;
          player.isHandRaised = false;
        }
      });

      this.broadcast('muted_all');
    });

    // 9. Teacher changes classroom mode (Lecture vs Discussion)
    this.onMessage(MSG_TYPES.CHANGE_MODE, (client, data: { mode: 'lecture' | 'discussion' | 'social' | 'group' }) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can change classroom mode.' });
        return;
      }

      this.state.mode = data.mode;

      if (data.mode === 'discussion') {
        // In discussion mode, students are allowed to speak
        this.state.players.forEach(p => {
          p.canSpeak = true;
        });
      } else if (data.mode === 'lecture') {
        // In lecture mode, revoke non-teacher speaking unless specifically kept
        this.state.players.forEach(p => {
          if (p.role !== 'teacher') {
            p.canSpeak = false;
            p.isMuted = true;
          }
        });
      }

      this.broadcast('mode_changed', { mode: data.mode });
    });

    // 10. Teacher locks / unlocks student chat
    this.onMessage(MSG_TYPES.TOGGLE_CHAT_LOCK, (client) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can configure chat locks.' });
        return;
      }

      this.state.isChatLocked = !this.state.isChatLocked;
      this.broadcast('chat_lock_changed', { isChatLocked: this.state.isChatLocked });
    });

    // 11. Chat message delivery
    this.onMessage(MSG_TYPES.CHAT, (client, data: { text: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (this.state.isChatLocked && player.role !== 'teacher') {
        client.send('error', { message: 'Chat is currently locked by the teacher.' });
        return;
      }

      const text = (data.text || '').trim();
      if (!text || text.length > 500) return;

      // Rate limiting: 1 message per 400ms per client
      const now = Date.now();
      const lastTime = this.lastChatTimes.get(client.sessionId) || 0;
      if (now - lastTime < 400) {
        client.send('error', { message: 'Sending messages too fast.' });
        return;
      }
      this.lastChatTimes.set(client.sessionId, now);

      const msg = new ChatMessageState();
      msg.id = `msg_${now}_${Math.random().toString(36).substring(2, 7)}`;
      msg.senderId = player.userId || client.sessionId;
      msg.senderName = player.displayName;
      msg.senderRole = player.role;
      msg.text = text;
      msg.timestamp = now;
      msg.isAnnouncement = false;

      this.state.messages.push(msg);
      if (this.state.messages.length > 150) {
        this.state.messages.shift();
      }
    });

    // 12. Teacher announcement
    this.onMessage(MSG_TYPES.ANNOUNCEMENT, (client, data: { text: string }) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can post announcements.' });
        return;
      }

      const text = (data.text || '').trim();
      if (!text) return;

      const now = Date.now();
      const msg = new ChatMessageState();
      msg.id = `ann_${now}_${Math.random().toString(36).substring(2, 7)}`;
      msg.senderId = teacher.userId || client.sessionId;
      msg.senderName = teacher.displayName;
      msg.senderRole = 'teacher';
      msg.text = text;
      msg.timestamp = now;
      msg.isAnnouncement = true;

      this.state.messages.push(msg);
      this.broadcast('announcement_received', { text, senderName: teacher.displayName });
    });

    // 13. Emoji Reaction
    this.onMessage(MSG_TYPES.REACTION, (client, data: { emoji: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      this.broadcast('reaction_triggered', {
        sessionId: client.sessionId,
        emoji: data.emoji || '👍'
      });
    });

    // 14. Kick participant (Teacher only)
    this.onMessage(MSG_TYPES.KICK_PARTICIPANT, (client, data: { targetSessionId: string }) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') return;

      const targetClient = this.clients.find(c => c.sessionId === data.targetSessionId);
      if (targetClient) {
        targetClient.leave(4001); // 4001: Kicked by teacher
      }
    });

    // 15. Change Smart Board Slide (Teacher only)
    this.onMessage(MSG_TYPES.CHANGE_BOARD_SLIDE, (client, data: { slide: number }) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can control the presentation board.' });
        return;
      }
      this.state.boardSlide = Math.max(0, Math.min(5, Number(data.slide) || 0));
      this.broadcast('board_slide_changed', { slide: this.state.boardSlide });
    });

    // 16. Change Smart Board Topic (Teacher only)
    this.onMessage(MSG_TYPES.CHANGE_BOARD_TOPIC, (client, data: { topic: string }) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can change the board topic.' });
        return;
      }
      this.state.boardTopic = data.topic || 'biology';
      this.state.boardSlide = 0; // reset to first slide on topic switch
      this.broadcast('board_topic_changed', { topic: this.state.boardTopic, slide: 0 });
    });
  }

  onJoin(client: Client, options: JoinOptions) {
    const player = new PlayerState();
    player.id = client.sessionId;
    player.sessionId = client.sessionId;
    player.userId = options.userId || `user_${client.sessionId}`;
    player.displayName = options.displayName || `Participant ${this.state.players.size + 1}`;
    player.role = options.role === 'teacher' ? 'teacher' : 'student';
    player.avatarColor = options.avatarColor || (player.role === 'teacher' ? '#3B82F6' : '#10B981');
    player.joinedAt = Date.now();
    player.connectionStatus = 'connected';

    if (player.role === 'teacher') {
      this.state.teacherId = player.userId;
      player.canSpeak = true;
      player.isMuted = false;
      // Teacher spawns in front of presentation board / podium
      player.x = 0;
      player.y = 0;
      player.z = -3.8;
      player.rotY = 0; // facing students (+Z)
    } else {
      // Students spawn near classroom door / back
      // Stagger slightly so multiple joining students don't overlap exactly
      const offset = (this.state.players.size % 5) * 0.5 - 1.0;
      player.x = offset;
      player.y = 0;
      player.z = 5.6;
      player.rotY = Math.PI; // facing front (-Z)
      player.canSpeak = this.state.mode === 'discussion';
      player.isMuted = true;
    }

    this.state.players.set(client.sessionId, player);

    console.log(`[ClassroomRoom] Player joined: ${player.displayName} (${player.role}) - Session: ${client.sessionId}`);
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    // If student was sitting, free the seat immediately
    if (player.seatId) {
      const seat = this.state.seats.get(player.seatId);
      if (seat && seat.occupiedBy === client.sessionId) {
        seat.occupiedBy = '';
        seat.occupiedByName = '';
      }
      player.seatId = '';
    }

    if (consented) {
      console.log(`[ClassroomRoom] Player left consented: ${player.displayName}`);
      this.state.players.delete(client.sessionId);
      this.lastChatTimes.delete(client.sessionId);
      return;
    }

    try {
      player.connectionStatus = 'reconnecting';
      // Reconnection window: wait up to 5 seconds for reconnect
      await this.allowReconnection(client, 5);
      player.connectionStatus = 'connected';
      console.log(`[ClassroomRoom] Player reconnected: ${player.displayName}`);
    } catch {
      // Permanent departure
      console.log(`[ClassroomRoom] Player left permanently: ${player.displayName}`);
      this.state.players.delete(client.sessionId);
      this.lastChatTimes.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log(`[ClassroomRoom] Room disposed for classroom: ${this.state.classroomId}`);
  }
}
