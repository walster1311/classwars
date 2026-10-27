import { Room, Client } from 'colyseus';
import { ClassroomState, PlayerState, ChatMessageState, SeatState } from '@classverse/shared';
import {
  MSG_TYPES,
  CLASSROOM_BOUNDS,
  CharacterType,
  UniformId,
  FunActionType,
  FunInteractionMode,
  ProjectileEventData,
  SocialInteractionEventData,
  TeacherInteractionsUpdateData,
  DanceStyle
} from '@classverse/shared';
import { profileStore } from '../profileStore';

interface JoinOptions {
  userId?: string;
  displayName?: string;
  role?: 'teacher' | 'student';
  avatarColor?: string;
  classroomId?: string;
  title?: string;
  characterType?: CharacterType;
  hairstyleId?: string;
  uniformId?: UniformId;
}

export class ClassroomRoom extends Room<ClassroomState> {
  maxClients = 120;
  private lastChatTimes = new Map<string, number>();
  private playerCooldowns = new Map<string, Map<string, number>>();
  private activeInteractions = new Map<string, SocialInteractionEventData>();

  private checkCooldown(sessionId: string, action: string, cooldownMs: number): boolean {
    let pMap = this.playerCooldowns.get(sessionId);
    if (!pMap) {
      pMap = new Map<string, number>();
      this.playerCooldowns.set(sessionId, pMap);
    }
    const now = Date.now();
    const last = pMap.get(action) || 0;
    if (now - last < cooldownMs) {
      return false;
    }
    pMap.set(action, now);
    return true;
  }

  private isActionAllowed(action: FunActionType): boolean {
    const s = this.state;
    if (s.funActionsMode === 'free_play') return true;
    if (s.funActionsMode === 'lesson') {
      if (action === 'emoji') return s.allowEmoji;
      if (action === 'high_five') return s.allowHighFive;
      return false;
    }
    switch (action) {
      case 'paper_ball': return s.allowPaperBall;
      case 'high_five': return s.allowHighFive;
      case 'dance_battle': return s.allowDanceBattle;
      case 'emoji': return s.allowEmoji;
      case 'follow': return s.allowFollow;
      case 'power_up': return s.allowPowerUp;
      case 'paper_airplane': return s.allowPaperAirplane;
      default: return true;
    }
  }

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

    // 17. Start Desktop Screen Share (Teacher only)
    this.onMessage(MSG_TYPES.START_SCREENSHARE, (client, data: { presenterName?: string }) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only the teacher can share their desktop screen.' });
        return;
      }
      this.state.isScreenSharing = true;
      this.state.screenSharePresenterId = client.sessionId;
      this.state.screenSharePresenterName = data?.presenterName || teacher.displayName;
      this.broadcast('screenshare_state_changed', {
        isScreenSharing: true,
        presenterId: client.sessionId,
        presenterName: this.state.screenSharePresenterName
      });
      console.log(`[ClassroomRoom] Desktop screensharing started by ${this.state.screenSharePresenterName}`);
    });

    // 18. Stop Desktop Screen Share (Teacher only)
    this.onMessage(MSG_TYPES.STOP_SCREENSHARE, (client) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') return;
      this.state.isScreenSharing = false;
      this.state.screenSharePresenterId = '';
      this.state.screenSharePresenterName = '';
      this.broadcast('screenshare_state_changed', {
        isScreenSharing: false,
        presenterId: '',
        presenterName: ''
      });
      console.log('[ClassroomRoom] Desktop screensharing stopped');
    });

    // 19. Fun Actions: Single Player Interaction Trigger (Power-Up, Emoji)
    this.onMessage(MSG_TYPES.INTERACTION_TRIGGER, (client, data: { action: FunActionType; data?: any }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (player.isInteractionDisabled) {
        client.send('error', { message: 'Your playful actions are temporarily disabled by the teacher.' });
        return;
      }

      if (!this.isActionAllowed(data.action)) {
        client.send('error', { message: `${data.action.replace('_', ' ')} is disabled in ${this.state.funActionsMode} mode.` });
        return;
      }

      if (data.action === 'power_up') {
        if (!this.checkCooldown(client.sessionId, 'power_up', 6000)) {
          client.send('error', { message: 'Power-up is on cooldown! Catch your breath.' });
          return;
        }
        const color = data.data?.color || 'golden';
        player.activeAuraColor = color;
        player.animation = 'power_up';
        this.broadcast('player_power_up', {
          sessionId: client.sessionId,
          displayName: player.displayName,
          color,
          timestamp: Date.now()
        });

        // Auto reset after 4.8 seconds
        this.clock.setTimeout(() => {
          if (player.activeAuraColor === color) {
            player.activeAuraColor = '';
            if (player.animation === 'power_up') {
              player.animation = player.seatId ? 'sit' : 'idle';
            }
            this.broadcast('player_power_up_ended', { sessionId: client.sessionId });
          }
        }, 4800);
      } else if (data.action === 'emoji') {
        if (!this.checkCooldown(client.sessionId, 'emoji', 1200)) {
          return;
        }
        const emojiId = data.data?.emojiId || 'love';
        const emojiChar = data.data?.emojiChar || '❤️';
        player.activeEmoji = emojiId;
        this.broadcast('emoji_reacted', {
          sessionId: client.sessionId,
          displayName: player.displayName,
          emojiId,
          emojiChar,
          timestamp: Date.now()
        });

        this.clock.setTimeout(() => {
          if (player.activeEmoji === emojiId) {
            player.activeEmoji = '';
          }
        }, 2800);
      }
    });

    // 20. Fun Actions: Social Request (High Five, Dance Battle, Follow)
    this.onMessage(MSG_TYPES.INTERACTION_REQUEST, (client, data: { type: 'high_five' | 'dance_battle' | 'follow'; targetSessionId: string; danceStyle?: DanceStyle }) => {
      const initiator = this.state.players.get(client.sessionId);
      if (!initiator) return;

      if (initiator.isInteractionDisabled) {
        client.send('error', { message: 'Your playful actions are temporarily disabled.' });
        return;
      }

      if (!this.isActionAllowed(data.type)) {
        client.send('error', { message: `${data.type.replace('_', ' ')} is disabled in ${this.state.funActionsMode} mode.` });
        return;
      }

      if (client.sessionId === data.targetSessionId) {
        client.send('error', { message: 'You cannot target yourself.' });
        return;
      }

      const target = this.state.players.get(data.targetSessionId);
      if (!target) {
        client.send('error', { message: 'Target student is not available.' });
        return;
      }

      if (target.isInteractionDisabled) {
        client.send('error', { message: `${target.displayName} is not accepting playful requests right now.` });
        return;
      }

      // Proximity check
      const dist = Math.hypot(initiator.x - target.x, initiator.z - target.z);
      const maxDist = data.type === 'high_five' ? 4.5 : (data.type === 'dance_battle' ? 6.0 : 9.0);
      if (dist > maxDist) {
        client.send('error', { message: `Move closer to ${target.displayName} to ${data.type.replace('_', ' ')}.` });
        return;
      }

      // Cooldown check
      const cooldownMs = data.type === 'dance_battle' ? 12000 : (data.type === 'high_five' ? 4000 : 3000);
      if (!this.checkCooldown(client.sessionId, data.type, cooldownMs)) {
        client.send('error', { message: `${data.type.replace('_', ' ')} is on cooldown! Wait a moment.` });
        return;
      }

      const interactionId = `interact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const eventData: SocialInteractionEventData = {
        id: interactionId,
        type: data.type,
        initiatorSessionId: client.sessionId,
        initiatorName: initiator.displayName,
        targetSessionId: data.targetSessionId,
        targetName: target.displayName,
        status: 'requested',
        danceStyle: data.danceStyle,
        timestamp: Date.now()
      };

      this.activeInteractions.set(interactionId, eventData);

      const targetClient = this.clients.find(c => c.sessionId === data.targetSessionId);
      if (targetClient) {
        targetClient.send('interaction_invite_received', eventData);
        client.send('interaction_request_pending', { interactionId, targetName: target.displayName, type: data.type });
      }

      // Auto expire invite after 10 seconds if not answered
      this.clock.setTimeout(() => {
        const cur = this.activeInteractions.get(interactionId);
        if (cur && cur.status === 'requested') {
          this.activeInteractions.delete(interactionId);
          client.send('interaction_expired', { interactionId, targetName: target.displayName });
        }
      }, 10000);
    });

    // 21. Fun Actions: Respond to Social Request (Accept / Decline)
    this.onMessage(MSG_TYPES.INTERACTION_RESPOND, (client, data: { interactionId: string; accept: boolean }) => {
      const interaction = this.activeInteractions.get(data.interactionId);
      if (!interaction || interaction.targetSessionId !== client.sessionId) return;

      const initiatorClient = this.clients.find(c => c.sessionId === interaction.initiatorSessionId);
      const initiator = this.state.players.get(interaction.initiatorSessionId);
      const target = this.state.players.get(client.sessionId);

      if (!initiator || !target) {
        this.activeInteractions.delete(data.interactionId);
        return;
      }

      if (!data.accept) {
        interaction.status = 'declined';
        this.activeInteractions.delete(data.interactionId);
        if (initiatorClient) {
          initiatorClient.send('interaction_declined', { interactionId: data.interactionId, targetName: target.displayName, type: interaction.type });
        }
        return;
      }

      interaction.status = 'active';

      if (interaction.type === 'high_five') {
        // Face each other
        const angleToTarget = Math.atan2(target.x - initiator.x, target.z - initiator.z);
        initiator.rotY = angleToTarget;
        target.rotY = angleToTarget + Math.PI;

        initiator.animation = 'high_five';
        target.animation = 'high_five';

        const midX = (initiator.x + target.x) / 2;
        const midZ = (initiator.z + target.z) / 2;

        this.broadcast('high_five_executed', {
          interactionId: data.interactionId,
          initiatorSessionId: initiator.sessionId,
          targetSessionId: target.sessionId,
          sparklePos: { x: midX, y: 0.95, z: midZ },
          timestamp: Date.now()
        });

        this.clock.setTimeout(() => {
          if (initiator.animation === 'high_five') initiator.animation = initiator.seatId ? 'sit' : 'idle';
          if (target.animation === 'high_five') target.animation = target.seatId ? 'sit' : 'idle';
          this.activeInteractions.delete(data.interactionId);
        }, 2200);
      } else if (interaction.type === 'dance_battle') {
        const angleToTarget = Math.atan2(target.x - initiator.x, target.z - initiator.z);
        initiator.rotY = angleToTarget;
        target.rotY = angleToTarget + Math.PI;

        const dances: DanceStyle[] = ['cute_side_step', 'anime_victory', 'funny_robot', 'jump_and_spin', 'silly_freestyle'];
        const dance1 = interaction.danceStyle || dances[Math.floor(Math.random() * dances.length)];
        const dance2 = dances[Math.floor(Math.random() * dances.length)];

        initiator.activeDance = dance1;
        initiator.animation = `dance_${dance1}`;
        target.activeDance = dance2;
        target.animation = `dance_${dance2}`;

        this.broadcast('dance_battle_started', {
          interactionId: data.interactionId,
          player1: { sessionId: initiator.sessionId, displayName: initiator.displayName, dance: dance1 },
          player2: { sessionId: target.sessionId, displayName: target.displayName, dance: dance2 },
          durationSeconds: 10,
          timestamp: Date.now()
        });

        this.clock.setTimeout(() => {
          initiator.activeDance = '';
          target.activeDance = '';
          if (initiator.animation.startsWith('dance_')) initiator.animation = 'celebrate';
          if (target.animation.startsWith('dance_')) target.animation = 'celebrate';

          this.broadcast('dance_battle_ended', {
            interactionId: data.interactionId,
            player1SessionId: initiator.sessionId,
            player2SessionId: target.sessionId,
            timestamp: Date.now()
          });

          this.clock.setTimeout(() => {
            if (initiator.animation === 'celebrate') initiator.animation = initiator.seatId ? 'sit' : 'idle';
            if (target.animation === 'celebrate') target.animation = target.seatId ? 'sit' : 'idle';
            this.activeInteractions.delete(data.interactionId);
          }, 2000);
        }, 10000);
      } else if (interaction.type === 'follow') {
        initiator.followingSessionId = target.sessionId;
        this.broadcast('follow_started', {
          followerSessionId: initiator.sessionId,
          followerName: initiator.displayName,
          targetSessionId: target.sessionId,
          targetName: target.displayName,
          timestamp: Date.now()
        });
      }
    });

    // 22. Fun Actions: Cancel / Stop Following / Interaction Cancel
    this.onMessage(MSG_TYPES.INTERACTION_CANCEL, (client, data: { type?: string; interactionId?: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (player.followingSessionId) {
        const targetSessionId = player.followingSessionId;
        player.followingSessionId = '';
        this.broadcast('follow_ended', {
          followerSessionId: client.sessionId,
          targetSessionId,
          timestamp: Date.now()
        });
      }

      if (data?.interactionId) {
        this.activeInteractions.delete(data.interactionId);
      }
    });

    // 23. Fun Actions: Projectile Launch (Paper Ball, Paper Airplane)
    this.onMessage(MSG_TYPES.PROJECTILE_LAUNCH, (client, data: {
      type: 'paper_ball' | 'paper_airplane';
      startPos: { x: number; y: number; z: number };
      velocity: { x: number; y: number; z: number };
      targetSessionId?: string;
      targetPos?: { x: number; y: number; z: number };
      power?: number;
    }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (player.isInteractionDisabled) {
        client.send('error', { message: 'Your playful actions are temporarily disabled.' });
        return;
      }

      if (!this.isActionAllowed(data.type)) {
        client.send('error', { message: `${data.type.replace('_', ' ')} is disabled in ${this.state.funActionsMode} mode.` });
        return;
      }

      const cooldown = data.type === 'paper_ball' ? 8000 : 6000;
      if (!this.checkCooldown(client.sessionId, data.type, cooldown)) {
        client.send('error', { message: `${data.type.replace('_', ' ')} is on cooldown! Wait a moment.` });
        return;
      }

      const projectileId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      player.animation = 'throw';

      const projectileData: ProjectileEventData = {
        id: projectileId,
        type: data.type,
        ownerSessionId: client.sessionId,
        ownerName: player.displayName,
        startPos: data.startPos || { x: player.x, y: 0.8, z: player.z },
        velocity: data.velocity,
        targetSessionId: data.targetSessionId,
        targetPos: data.targetPos,
        power: data.power || 1.0,
        timestamp: Date.now()
      };

      this.broadcast('projectile_spawned', projectileData);

      this.clock.setTimeout(() => {
        if (player.animation === 'throw') {
          player.animation = player.seatId ? 'sit' : 'idle';
        }
      }, 900);

      // Paper ball impact reaction on targeted avatar
      if (data.type === 'paper_ball' && data.targetSessionId) {
        const target = this.state.players.get(data.targetSessionId);
        if (target && !target.isInteractionDisabled) {
          this.clock.setTimeout(() => {
            target.animation = 'hit_reaction';
            this.broadcast('player_hit_reaction', {
              targetSessionId: data.targetSessionId,
              targetName: target.displayName,
              projectileId,
              timestamp: Date.now()
            });

            this.clock.setTimeout(() => {
              if (target.animation === 'hit_reaction') {
                target.animation = target.seatId ? 'sit' : 'idle';
              }
            }, 1200);
          }, 1100);
        }
      }
    });

    // 24. Teacher Governance: Update Interaction Settings & Permissions
    this.onMessage(MSG_TYPES.TEACHER_UPDATE_INTERACTIONS, (client, data: TeacherInteractionsUpdateData) => {
      const teacher = this.state.players.get(client.sessionId);
      if (!teacher || teacher.role !== 'teacher') {
        client.send('error', { message: 'Only teachers can configure classroom interaction settings.' });
        return;
      }

      if (data.funActionsMode !== undefined) {
        this.state.funActionsMode = data.funActionsMode;
        if (data.funActionsMode === 'lesson') {
          this.state.allowPaperBall = false;
          this.state.allowDanceBattle = false;
          this.state.allowPaperAirplane = false;
          this.state.allowPowerUp = false;
          this.state.allowFollow = false;
        } else if (data.funActionsMode === 'free_play') {
          this.state.allowPaperBall = true;
          this.state.allowHighFive = true;
          this.state.allowDanceBattle = true;
          this.state.allowEmoji = true;
          this.state.allowFollow = true;
          this.state.allowPowerUp = true;
          this.state.allowPaperAirplane = true;
        }
      }

      if (data.allowPaperBall !== undefined) this.state.allowPaperBall = data.allowPaperBall;
      if (data.allowHighFive !== undefined) this.state.allowHighFive = data.allowHighFive;
      if (data.allowDanceBattle !== undefined) this.state.allowDanceBattle = data.allowDanceBattle;
      if (data.allowEmoji !== undefined) this.state.allowEmoji = data.allowEmoji;
      if (data.allowFollow !== undefined) this.state.allowFollow = data.allowFollow;
      if (data.allowPowerUp !== undefined) this.state.allowPowerUp = data.allowPowerUp;
      if (data.allowPaperAirplane !== undefined) this.state.allowPaperAirplane = data.allowPaperAirplane;

      // Stop All Active Interactions
      if (data.stopAllActive) {
        this.activeInteractions.clear();
        this.state.players.forEach((p) => {
          p.followingSessionId = '';
          p.activeAuraColor = '';
          p.activeDance = '';
          if (['throw', 'hit_reaction', 'high_five', 'power_up'].includes(p.animation) || p.animation.startsWith('dance_')) {
            p.animation = p.seatId ? 'sit' : 'idle';
          }
        });
        this.broadcast('interactions_stopped_all', { timestamp: Date.now() });
      }

      // Moderation: Mute / Restore individual student
      if (data.targetStudentSessionId && data.studentDisabled !== undefined) {
        const student = this.state.players.get(data.targetStudentSessionId);
        if (student) {
          student.isInteractionDisabled = data.studentDisabled;
          const targetClient = this.clients.find(c => c.sessionId === data.targetStudentSessionId);
          if (targetClient) {
            targetClient.send(data.studentDisabled ? 'interactions_muted_by_teacher' : 'interactions_restored_by_teacher', {});
          }
        }
      }

      this.broadcast('teacher_interactions_updated', {
        funActionsMode: this.state.funActionsMode,
        allowPaperBall: this.state.allowPaperBall,
        allowHighFive: this.state.allowHighFive,
        allowDanceBattle: this.state.allowDanceBattle,
        allowEmoji: this.state.allowEmoji,
        allowFollow: this.state.allowFollow,
        allowPowerUp: this.state.allowPowerUp,
        allowPaperAirplane: this.state.allowPaperAirplane,
        timestamp: Date.now()
      });
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
      player.z = -9.0;
      player.rotY = 0; // facing students (+Z)
    } else {
      // Enforce student character selection
      if (options.characterType && options.hairstyleId) {
        profileStore.saveCharacter(player.userId, {
          characterType: options.characterType,
          hairstyleId: options.hairstyleId,
          displayName: player.displayName,
          role: 'student'
        });
      }

      const character = profileStore.getCharacter(player.userId);
      if (!character || !character.selectionCompleted) {
        throw new Error('Mandatory character selection required before entering classroom.');
      }

      player.characterType = character.characterType;
      player.hairstyleId = character.hairstyleId;
      player.uniformId = character.uniformId;

      // Students spawn near classroom door / back
      // Stagger slightly so multiple joining students don't overlap exactly
      const offset = (this.state.players.size % 9) * 0.8 - 3.2;
      player.x = offset;
      player.y = 0;
      player.z = 12.5;
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

    // If teacher was sharing screen, terminate screenshare
    if (this.state.isScreenSharing && this.state.screenSharePresenterId === client.sessionId) {
      this.state.isScreenSharing = false;
      this.state.screenSharePresenterId = '';
      this.state.screenSharePresenterName = '';
      this.broadcast('screenshare_state_changed', {
        isScreenSharing: false,
        presenterId: '',
        presenterName: ''
      });
    }

    // Clean up follow states
    if (player.followingSessionId) {
      player.followingSessionId = '';
    }
    this.state.players.forEach((p) => {
      if (p.followingSessionId === client.sessionId) {
        p.followingSessionId = '';
        const followerClient = this.clients.find(c => c.sessionId === p.sessionId);
        if (followerClient) {
          followerClient.send('follow_target_disconnected', {});
        }
      }
    });

    // Clean up active social interactions involving this player
    this.activeInteractions.forEach((interact, id) => {
      if (interact.initiatorSessionId === client.sessionId || interact.targetSessionId === client.sessionId) {
        this.activeInteractions.delete(id);
      }
    });

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
