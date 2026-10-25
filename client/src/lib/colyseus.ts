import { Client, Room } from 'colyseus.js';
import { ClassroomState, MSG_TYPES, UserRole, ClassroomMode } from '@classverse/shared';
import { useClassroomStore } from './store';
import { setPlayerTransform, removePlayerTransform, clearPlayerTransforms } from './transforms';

class ColyseusService {
  private client: Client | null = null;
  private room: Room<ClassroomState> | null = null;
  private serverUrl: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:2567`;
      this.serverUrl = wsUrl;
      this.client = new Client(wsUrl);
    }
  }

  async connectToClassroom(options: {
    classroomId: string;
    displayName: string;
    role: UserRole;
    avatarColor: string;
    userId: string;
  }): Promise<Room<ClassroomState>> {
    const store = useClassroomStore.getState();

    if (this.room) {
      console.log('[Colyseus] Disconnecting prior room session');
      this.room.leave();
      this.room = null;
    }

    if (!this.client) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:2567`;
      this.client = new Client(wsUrl);
    }

    try {
      console.log(`[Colyseus] Connecting to classroom "${options.classroomId}" as ${options.displayName} (${options.role})`);
      
      this.room = await this.client.joinOrCreate<ClassroomState>('classroom', {
        classroomId: options.classroomId,
        displayName: options.displayName,
        role: options.role,
        avatarColor: options.avatarColor,
        userId: options.userId
      });

      store.setClientInfo({
        sessionId: this.room.sessionId,
        name: options.displayName,
        role: options.role,
        color: options.avatarColor
      });

      store.setConnectionStatus(true, false);
      store.setClassroomDetails({
        id: this.room.state.classroomId || options.classroomId,
        title: this.room.state.title || 'Virtual Classroom',
        mode: (this.room.state.mode as ClassroomMode) || 'lecture',
        isChatLocked: this.room.state.isChatLocked || false
      });
      store.setBoardState(
        this.room.state.boardTopic || 'biology',
        this.room.state.boardSlide || 0
      );

      this.setupRoomListeners(this.room);

      return this.room;
    } catch (err: any) {
      console.error('[Colyseus] Connection failed:', err);
      store.setConnectionStatus(false, false);
      store.showToast(`Connection failed: ${err.message || 'Server unavailable'}`, 'error');
      throw err;
    }
  }

  private setupRoomListeners(room: Room<ClassroomState>) {
    const store = useClassroomStore.getState();

    // 1. Players synchronization
    const registerPlayer = (player: any, sessionId: string) => {
      // Store transform in fast in-memory map for 60Hz 3D rendering
      setPlayerTransform(sessionId, {
        x: player.x,
        y: player.y,
        z: player.z,
        rotY: player.rotY,
        animation: player.animation
      });

      useClassroomStore.getState().upsertPlayer(sessionId, {
        id: player.id || sessionId,
        sessionId,
        userId: player.userId,
        displayName: player.displayName,
        role: player.role as UserRole,
        avatarColor: player.avatarColor,
        x: player.x,
        y: player.y,
        z: player.z,
        rotY: player.rotY,
        animation: player.animation,
        seatId: player.seatId || null,
        isHandRaised: player.isHandRaised,
        canSpeak: player.canSpeak,
        isMuted: player.isMuted,
        handRaiseTime: player.handRaiseTime
      });

      // Track individual player field changes
      player.onChange(() => {
        // High frequency position updates go directly to fast transforms map (bypassing React DOM)
        setPlayerTransform(sessionId, {
          x: player.x,
          y: player.y,
          z: player.z,
          rotY: player.rotY,
          animation: player.animation
        });

        // Only dispatch to Zustand if metadata (seat, mic, hand, role, name) actually changed
        const cur = useClassroomStore.getState().players[sessionId];
        const metaChanged = !cur ||
          cur.displayName !== player.displayName ||
          cur.role !== player.role ||
          cur.avatarColor !== player.avatarColor ||
          cur.seatId !== (player.seatId || null) ||
          cur.isHandRaised !== player.isHandRaised ||
          cur.canSpeak !== player.canSpeak ||
          cur.isMuted !== player.isMuted ||
          cur.handRaiseTime !== player.handRaiseTime;

        if (metaChanged) {
          useClassroomStore.getState().upsertPlayer(sessionId, {
            displayName: player.displayName,
            role: player.role as UserRole,
            avatarColor: player.avatarColor,
            seatId: player.seatId || null,
            isHandRaised: player.isHandRaised,
            canSpeak: player.canSpeak,
            isMuted: player.isMuted,
            handRaiseTime: player.handRaiseTime
          });
        }

        // If local user's permissions changed
        if (sessionId === room.sessionId) {
          useClassroomStore.getState().setCanSpeak(player.canSpeak);
          useClassroomStore.getState().setMySeat(player.seatId || null);
          useClassroomStore.getState().setMyHandRaised(player.isHandRaised);
        }
      });
    };

    // Attach listener for both existing and newly added players
    room.state.players.forEach(registerPlayer);
    room.state.players.onAdd(registerPlayer);

    room.state.players.onRemove((_, sessionId) => {
      removePlayerTransform(sessionId);
      useClassroomStore.getState().removePlayer(sessionId);
    });

    // 2. Seats synchronization
    const registerSeat = (seat: any, seatId: string) => {
      useClassroomStore.getState().updateSeat(seatId, seat.occupiedBy, seat.occupiedByName);

      seat.onChange(() => {
        useClassroomStore.getState().updateSeat(seatId, seat.occupiedBy, seat.occupiedByName);
      });
    };

    room.state.seats.forEach(registerSeat);
    room.state.seats.onAdd(registerSeat);

    // 3. Messages synchronization
    room.state.messages.onAdd((msg) => {
      useClassroomStore.getState().addMessage({
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderRole as UserRole,
        text: msg.text,
        timestamp: msg.timestamp,
        isAnnouncement: msg.isAnnouncement
      });
    });

    // 4. Global state changes
    room.state.onChange(() => {
      useClassroomStore.getState().setClassroomDetails({
        id: room.state.classroomId,
        title: room.state.title,
        mode: room.state.mode as ClassroomMode,
        isChatLocked: room.state.isChatLocked
      });
      useClassroomStore.getState().setBoardState(
        room.state.boardTopic || 'biology',
        room.state.boardSlide || 0
      );
    });

    // 5. Custom events from server
    room.onMessage('board_slide_changed', (payload: { slide: number }) => {
      const currentTopic = useClassroomStore.getState().boardTopic;
      useClassroomStore.getState().setBoardState(currentTopic, payload.slide);
    });

    room.onMessage('board_topic_changed', (payload: { topic: string; slide: number }) => {
      useClassroomStore.getState().setBoardState(payload.topic, payload.slide);
      useClassroomStore.getState().showToast(`Lesson topic updated to ${payload.topic.toUpperCase()}`, 'info');
    });
    room.onMessage('error', (payload: { message: string }) => {
      useClassroomStore.getState().showToast(payload.message, 'error');
    });

    room.onMessage('seat_confirmed', (payload: { seatId: string }) => {
      useClassroomStore.getState().setMySeat(payload.seatId);
      useClassroomStore.getState().showToast('Sat down successfully', 'success');
    });

    room.onMessage('stand_confirmed', () => {
      useClassroomStore.getState().setMySeat(null);
    });

    room.onMessage('hand_raised', (payload: { sessionId: string; displayName: string }) => {
      if (useClassroomStore.getState().myRole === 'teacher') {
        useClassroomStore.getState().showToast(`${payload.displayName} raised their hand`, 'info');
      }
    });

    room.onMessage('speaking_granted', (payload: { sessionId: string; displayName: string }) => {
      if (payload.sessionId === room.sessionId) {
        useClassroomStore.getState().showToast('Teacher gave you permission to speak!', 'success');
        useClassroomStore.getState().setCanSpeak(true);
      } else {
        useClassroomStore.getState().showToast(`${payload.displayName} was granted permission to speak`, 'info');
      }
    });

    room.onMessage('muted_all', () => {
      if (useClassroomStore.getState().myRole !== 'teacher') {
        useClassroomStore.getState().showToast('Teacher muted all student microphones.', 'info');
        useClassroomStore.getState().setCanSpeak(false);
      }
    });

    room.onMessage('mode_changed', (payload: { mode: ClassroomMode }) => {
      useClassroomStore.getState().setMode(payload.mode);
      useClassroomStore.getState().showToast(`Classroom switched to ${payload.mode.toUpperCase()} mode`, 'info');
    });

    room.onMessage('chat_lock_changed', (payload: { isChatLocked: boolean }) => {
      useClassroomStore.getState().setChatLocked(payload.isChatLocked);
      useClassroomStore.getState().showToast(
        payload.isChatLocked ? 'Student chat has been locked by teacher' : 'Student chat has been unlocked',
        'info'
      );
    });

    room.onMessage('reaction_triggered', (payload: { sessionId: string; emoji: string }) => {
      useClassroomStore.getState().triggerReaction(payload.emoji, payload.sessionId);
    });

    room.onMessage('announcement_received', (payload: { text: string; senderName: string }) => {
      useClassroomStore.getState().showToast(`ANNOUNCEMENT: ${payload.text}`, 'info');
    });

    room.onError((code, message) => {
      console.error('[Colyseus Room Error]', code, message);
      useClassroomStore.getState().showToast(`Room error: ${message}`, 'error');
    });

    room.onLeave((code) => {
      console.log(`[Colyseus] Left room with code: ${code}`);
      useClassroomStore.getState().setConnectionStatus(false, false);
      if (code === 4001) {
        useClassroomStore.getState().showToast('You have been removed from the classroom by the teacher.', 'error');
      }
    });
  }

  // Action methods
  sendMove(x: number, y: number, z: number, rotY: number, animation: string = 'idle') {
    if (!this.room) return;
    this.room.send(MSG_TYPES.MOVE, { x, y, z, rotY, animation });
  }

  sendSit(seatId: string) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.SIT, { seatId });
  }

  sendStand() {
    if (!this.room) return;
    this.room.send(MSG_TYPES.STAND, {});
  }

  sendRaiseHand() {
    if (!this.room) return;
    this.room.send(MSG_TYPES.RAISE_HAND, {});
    useClassroomStore.getState().setMyHandRaised(true);
  }

  sendLowerHand(targetSessionId?: string) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.LOWER_HAND, { targetSessionId });
    if (!targetSessionId || targetSessionId === this.room.sessionId) {
      useClassroomStore.getState().setMyHandRaised(false);
    }
  }

  sendApproveHand(targetSessionId: string) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.APPROVE_HAND, { targetSessionId });
  }

  sendSetMicPermission(targetSessionId: string, canSpeak: boolean) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.SET_MIC_PERMISSION, { targetSessionId, canSpeak });
  }

  sendMuteAll() {
    if (!this.room) return;
    this.room.send(MSG_TYPES.MUTE_ALL, {});
  }

  sendChangeMode(mode: ClassroomMode) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.CHANGE_MODE, { mode });
  }

  sendToggleChatLock() {
    if (!this.room) return;
    this.room.send(MSG_TYPES.TOGGLE_CHAT_LOCK, {});
  }

  sendChat(text: string) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.CHAT, { text });
  }

  sendAnnouncement(text: string) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.ANNOUNCEMENT, { text });
  }

  sendReaction(emoji: string) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.REACTION, { emoji });
  }

  sendChangeBoardSlide(slide: number) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.CHANGE_BOARD_SLIDE, { slide });
  }

  sendChangeBoardTopic(topic: string) {
    if (!this.room) return;
    this.room.send(MSG_TYPES.CHANGE_BOARD_TOPIC, { topic });
  }

  disconnect() {
    clearPlayerTransforms();
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }

  getRoom() {
    return this.room;
  }
}

export const colyseusService = new ColyseusService();
