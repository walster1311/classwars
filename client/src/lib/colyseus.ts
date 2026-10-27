import { Client, Room } from 'colyseus.js';
import { ClassroomState, MSG_TYPES, UserRole, ClassroomMode, CharacterType, UniformId, TeacherInteractionsUpdateData, CLASSROOM_SEATS } from '@classverse/shared';
import { useClassroomStore } from './store';
import { setPlayerTransform, removePlayerTransform, clearPlayerTransforms } from './transforms';
import { soundEffects } from './soundFx';
import { getServerWsUrl } from './serverConfig';

class ColyseusService {
  private client: Client | null = null;
  private room: Room<ClassroomState> | null = null;
  private serverUrl: string = '';
  private isOffline: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const wsUrl = getServerWsUrl();
      this.serverUrl = wsUrl;
      try {
        this.client = new Client(wsUrl);
      } catch (e) {
        console.warn('[Colyseus] Could not construct client initially:', e);
      }
    }
  }

  isOfflineActive(): boolean {
    return this.isOffline;
  }

  startOfflineSession(options: {
    classroomId: string;
    displayName: string;
    role: UserRole;
    avatarColor: string;
    userId: string;
    characterType?: CharacterType;
    hairstyleId?: string;
    uniformId?: UniformId;
  }) {
    this.isOffline = true;
    if (this.room) {
      this.room.leave();
      this.room = null;
    }

    const store = useClassroomStore.getState();
    const sessionId = `local_${options.userId || 'player'}`;

    store.setClientInfo({
      sessionId,
      name: options.displayName,
      role: options.role,
      color: options.avatarColor
    });

    const charType: CharacterType = options.characterType || 'boy';
    const hair = options.hairstyleId || (charType === 'boy' ? 'boy_spiky_anime' : 'girl_twin_tails');
    const defaultUniform: UniformId = charType === 'boy' ? 'boy_standard' : 'girl_standard';
    const uniform: UniformId = options.uniformId || defaultUniform;

    // Local player in classroom
    const localPlayer = {
      id: options.userId,
      sessionId,
      userId: options.userId,
      displayName: options.displayName,
      role: options.role,
      avatarColor: options.avatarColor,
      characterType: charType,
      hairstyleId: hair,
      uniformId: uniform,
      x: 0,
      y: 0,
      z: 2.2,
      rotY: 0,
      animation: 'idle',
      seatId: null,
      isHandRaised: false,
      canSpeak: true,
      isMuted: false,
      handRaiseTime: 0
    };

    // 2 Friendly NPC Chibi Classmates seated at desks
    const npcSakura = {
      id: 'npc_sakura',
      sessionId: 'sess_sakura',
      userId: 'npc_sakura',
      displayName: 'Sakura Chibi',
      role: 'student' as UserRole,
      avatarColor: '#EC4899',
      characterType: 'girl' as CharacterType,
      hairstyleId: 'girl_twin_tails',
      uniformId: 'girl_standard' as UniformId,
      x: -1.8,
      y: 0.42,
      z: 1.0,
      rotY: 0,
      animation: 'sitting',
      seatId: 'seat_0_1',
      isHandRaised: false,
      canSpeak: false,
      isMuted: false,
      handRaiseTime: 0
    };

    const npcKenji = {
      id: 'npc_kenji',
      sessionId: 'sess_kenji',
      userId: 'npc_kenji',
      displayName: 'Kenji Chibi',
      role: 'student' as UserRole,
      avatarColor: '#3B82F6',
      characterType: 'boy' as CharacterType,
      hairstyleId: 'boy_spiky_anime',
      uniformId: 'boy_standard' as UniformId,
      x: 1.8,
      y: 0.42,
      z: 1.0,
      rotY: 0,
      animation: 'sitting',
      seatId: 'seat_0_3',
      isHandRaised: false,
      canSpeak: false,
      isMuted: false,
      handRaiseTime: 0
    };

    store.setPlayers({
      [sessionId]: localPlayer,
      [npcSakura.sessionId]: npcSakura,
      [npcKenji.sessionId]: npcKenji
    });

    // Populate seats
    const seatMap: Record<string, { occupiedBy: string; occupiedByName: string }> = {};
    CLASSROOM_SEATS.forEach((s) => {
      seatMap[s.id] = { occupiedBy: '', occupiedByName: '' };
    });
    seatMap['seat_0_1'] = { occupiedBy: npcSakura.sessionId, occupiedByName: npcSakura.displayName };
    seatMap['seat_0_3'] = { occupiedBy: npcKenji.sessionId, occupiedByName: npcKenji.displayName };
    store.initSeats(seatMap);

    // Initial transforms for 3D render loop
    setPlayerTransform(sessionId, { x: localPlayer.x, y: localPlayer.y, z: localPlayer.z, rotY: 0, animation: 'idle' });
    setPlayerTransform(npcSakura.sessionId, { x: npcSakura.x, y: npcSakura.y, z: npcSakura.z, rotY: 0, animation: 'sitting' });
    setPlayerTransform(npcKenji.sessionId, { x: npcKenji.x, y: npcKenji.y, z: npcKenji.z, rotY: 0, animation: 'sitting' });

    store.setConnectionStatus(true, false);
    store.setClassroomDetails({
      id: options.classroomId,
      title: 'Classroom (Offline Sandbox)',
      mode: 'discussion',
      isChatLocked: false
    });
    store.setBoardState('biology', 0);
    store.setFunInteractionsConfig({
      funActionsMode: 'break',
      allowPaperBall: true,
      allowHighFive: true,
      allowDanceBattle: true,
      allowEmoji: true,
      allowFollow: true,
      allowPowerUp: true,
      allowPaperAirplane: true
    });

    store.showToast('🎮 Welcome to Sandbox Mode! Explore 3D classroom, actions & animations.', 'success');
  }

  async connectToClassroom(options: {
    classroomId: string;
    displayName: string;
    role: UserRole;
    avatarColor: string;
    userId: string;
    characterType?: CharacterType;
    hairstyleId?: string;
    uniformId?: UniformId;
  }): Promise<Room<ClassroomState>> {
    this.isOffline = false;
    const store = useClassroomStore.getState();

    if (this.room) {
      console.log('[Colyseus] Disconnecting prior room session');
      this.room.leave();
      this.room = null;
    }

    const wsUrl = getServerWsUrl();
    this.serverUrl = wsUrl;
    this.client = new Client(wsUrl);

    try {
      console.log(`[Colyseus] Connecting to classroom "${options.classroomId}" as ${options.displayName} (${options.role}) at ${wsUrl}`);
      
      this.room = await this.client.joinOrCreate<ClassroomState>('classroom', {
        classroomId: options.classroomId,
        displayName: options.displayName,
        role: options.role,
        avatarColor: options.avatarColor,
        userId: options.userId,
        characterType: options.characterType,
        hairstyleId: options.hairstyleId,
        uniformId: options.uniformId
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
      store.setScreenSharingState(
        this.room.state.isScreenSharing || false,
        this.room.state.screenSharePresenterId || '',
        this.room.state.screenSharePresenterName || ''
      );
      store.setFunInteractionsConfig({
        funActionsMode: (this.room.state.funActionsMode as any) || 'break',
        allowPaperBall: this.room.state.allowPaperBall ?? true,
        allowHighFive: this.room.state.allowHighFive ?? true,
        allowDanceBattle: this.room.state.allowDanceBattle ?? true,
        allowEmoji: this.room.state.allowEmoji ?? true,
        allowFollow: this.room.state.allowFollow ?? true,
        allowPowerUp: this.room.state.allowPowerUp ?? true,
        allowPaperAirplane: this.room.state.allowPaperAirplane ?? true
      });

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
        characterType: player.characterType,
        hairstyleId: player.hairstyleId,
        uniformId: player.uniformId,
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

        // Only dispatch to Zustand if metadata (seat, mic, hand, role, name, character) actually changed
        const cur = useClassroomStore.getState().players[sessionId];
        const metaChanged = !cur ||
          cur.displayName !== player.displayName ||
          cur.role !== player.role ||
          cur.avatarColor !== player.avatarColor ||
          cur.characterType !== player.characterType ||
          cur.hairstyleId !== player.hairstyleId ||
          cur.uniformId !== player.uniformId ||
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
            characterType: player.characterType,
            hairstyleId: player.hairstyleId,
            uniformId: player.uniformId,
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

    room.onMessage('screenshare_state_changed', (payload: { isScreenSharing: boolean; presenterId: string; presenterName: string }) => {
      useClassroomStore.getState().setScreenSharingState(payload.isScreenSharing, payload.presenterId, payload.presenterName);
      if (payload.isScreenSharing) {
        useClassroomStore.getState().showToast(`📺 ${payload.presenterName || 'Teacher'} started sharing their screen on the blackboard!`, 'info');
      } else {
        useClassroomStore.getState().showToast('Screen sharing stopped. Blackboard restored.', 'info');
      }
    });

    // ============================================================
    // INTERACTIVE CLASSROOM FUN & SOCIAL SYSTEM LISTENERS
    // ============================================================
    room.onMessage('interaction_invite_received', (payload: any) => {
      useClassroomStore.getState().setPendingInvite(payload);
      soundEffects.playClick();
    });

    room.onMessage('interaction_request_pending', (payload: { targetName: string; type: string }) => {
      useClassroomStore.getState().showToast(`Sent ${payload.type.replace('_', ' ')} request to ${payload.targetName}...`, 'info');
    });

    room.onMessage('interaction_declined', (payload: { targetName: string; type: string }) => {
      useClassroomStore.getState().showToast(`${payload.targetName} is busy right now.`, 'info');
    });

    room.onMessage('interaction_expired', (payload: { targetName: string }) => {
      useClassroomStore.getState().showToast(`Request to ${payload.targetName} timed out.`, 'info');
    });

    room.onMessage('high_five_executed', (payload: { sparklePos: { x: number; y: number; z: number } }) => {
      soundEffects.playHighFiveSnap();
      useClassroomStore.getState().addSparkle(payload.sparklePos);
      useClassroomStore.getState().showToast('🙌 High Five!', 'success');
    });

    room.onMessage('dance_battle_started', (payload: { player1: any; player2: any; durationSeconds: number }) => {
      soundEffects.playDanceBeat();
      useClassroomStore.getState().showToast(`🎵 Dance Battle: ${payload.player1.displayName} vs ${payload.player2.displayName}!`, 'info');
    });

    room.onMessage('dance_battle_ended', () => {
      useClassroomStore.getState().showToast('🎉 Dance Battle Complete! Amazing moves!', 'success');
    });

    room.onMessage('follow_started', (payload: { followerSessionId: string; followerName: string; targetSessionId: string; targetName: string }) => {
      if (payload.followerSessionId === room.sessionId) {
        useClassroomStore.getState().setFollowingSessionId(payload.targetSessionId);
        useClassroomStore.getState().showToast(`Now following ${payload.targetName} (Move WASD to stop)`, 'info');
      } else if (payload.targetSessionId === room.sessionId) {
        useClassroomStore.getState().showToast(`${payload.followerName} is following you!`, 'info');
      }
    });

    room.onMessage('follow_ended', (payload: { followerSessionId: string }) => {
      if (payload.followerSessionId === room.sessionId) {
        useClassroomStore.getState().setFollowingSessionId(null);
      }
    });

    room.onMessage('follow_target_disconnected', () => {
      useClassroomStore.getState().setFollowingSessionId(null);
      useClassroomStore.getState().showToast('Friend left the classroom. Stopped following.', 'info');
    });

    room.onMessage('projectile_spawned', (payload: any) => {
      useClassroomStore.getState().addProjectile(payload);
    });

    room.onMessage('player_hit_reaction', (payload: { targetSessionId: string; targetName: string }) => {
      soundEffects.playPaperHit();
      if (payload.targetSessionId === room.sessionId) {
        useClassroomStore.getState().showToast('💥 Bonk! You were hit by a paper ball!', 'info');
      }
    });

    room.onMessage('player_power_up', (payload: { sessionId: string; displayName: string; color: string }) => {
      if (payload.sessionId !== room.sessionId) {
        soundEffects.playPowerUpCharging(payload.color as any);
      }
    });

    room.onMessage('emoji_reacted', (payload: { sessionId: string; emojiId: string; emojiChar: string }) => {
      soundEffects.playEmojiPop();
      useClassroomStore.getState().triggerReaction(payload.emojiChar, payload.sessionId);
    });

    room.onMessage('teacher_interactions_updated', (payload: any) => {
      useClassroomStore.getState().setFunInteractionsConfig(payload);
      useClassroomStore.getState().showToast(`Classroom mode: ${payload.funActionsMode.toUpperCase()}`, 'info');
    });

    room.onMessage('interactions_stopped_all', () => {
      useClassroomStore.getState().setFollowingSessionId(null);
      useClassroomStore.getState().showToast('Teacher stopped all active playful interactions.', 'info');
    });

    room.onMessage('interactions_muted_by_teacher', () => {
      useClassroomStore.getState().showToast('Your fun actions were temporarily restricted by the teacher.', 'error');
    });

    room.onMessage('interactions_restored_by_teacher', () => {
      useClassroomStore.getState().showToast('Your fun actions permissions were restored by the teacher!', 'success');
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
    if (this.room) {
      this.room.send(MSG_TYPES.MOVE, { x, y, z, rotY, animation });
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.upsertPlayer(store.mySessionId, { x, y, z, rotY, animation });
    }
  }

  sendSit(seatId: string) {
    if (this.room) {
      this.room.send(MSG_TYPES.SIT, { seatId });
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      const seat = CLASSROOM_SEATS.find((s) => s.id === seatId);
      if (seat) {
        store.updateSeat(seatId, store.mySessionId, store.myDisplayName);
        store.setMySeat(seatId);
        const yPos = 0.42;
        const rotY = seat.isTeacherSeat ? seat.rotY : 0;
        store.upsertPlayer(store.mySessionId, {
          seatId,
          x: seat.x,
          y: yPos,
          z: seat.z,
          rotY,
          animation: 'sitting'
        });
        setPlayerTransform(store.mySessionId, {
          x: seat.x,
          y: yPos,
          z: seat.z,
          rotY,
          animation: 'sitting'
        });
        store.showToast('Sat down at desk', 'info');
      }
    }
  }

  sendStand() {
    if (this.room) {
      this.room.send(MSG_TYPES.STAND, {});
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      if (store.mySeatId) {
        store.updateSeat(store.mySeatId, '', '');
      }
      store.setMySeat(null);
      const cur = store.players[store.mySessionId];
      const newZ = (cur ? cur.z : 0) + 0.6;
      store.upsertPlayer(store.mySessionId, {
        seatId: null,
        y: 0,
        z: newZ,
        animation: 'idle'
      });
      setPlayerTransform(store.mySessionId, {
        y: 0,
        z: newZ,
        animation: 'idle'
      });
      store.showToast('Stood up from desk', 'info');
    }
  }

  sendRaiseHand() {
    if (this.room) {
      this.room.send(MSG_TYPES.RAISE_HAND, {});
      useClassroomStore.getState().setMyHandRaised(true);
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.setMyHandRaised(true);
      store.upsertPlayer(store.mySessionId, { isHandRaised: true, handRaiseTime: Date.now() });
      store.showToast('Raised hand ✋', 'info');
    }
  }

  sendLowerHand(targetSessionId?: string) {
    if (this.room) {
      this.room.send(MSG_TYPES.LOWER_HAND, { targetSessionId });
      if (!targetSessionId || targetSessionId === this.room.sessionId) {
        useClassroomStore.getState().setMyHandRaised(false);
      }
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.setMyHandRaised(false);
      store.upsertPlayer(store.mySessionId, { isHandRaised: false });
      store.showToast('Lowered hand', 'info');
    }
  }

  sendApproveHand(targetSessionId: string) {
    if (this.room) {
      this.room.send(MSG_TYPES.APPROVE_HAND, { targetSessionId });
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.setCanSpeak(true);
      store.upsertPlayer(targetSessionId, { canSpeak: true, isHandRaised: false });
      store.showToast('Permission granted to speak', 'success');
    }
  }

  sendSetMicPermission(targetSessionId: string, canSpeak: boolean) {
    if (this.room) {
      this.room.send(MSG_TYPES.SET_MIC_PERMISSION, { targetSessionId, canSpeak });
    } else if (this.isOffline) {
      useClassroomStore.getState().upsertPlayer(targetSessionId, { canSpeak });
    }
  }

  sendMuteAll() {
    if (this.room) {
      this.room.send(MSG_TYPES.MUTE_ALL, {});
    } else if (this.isOffline) {
      useClassroomStore.getState().showToast('Muted all participants', 'info');
    }
  }

  sendChangeMode(mode: ClassroomMode) {
    if (this.room) {
      this.room.send(MSG_TYPES.CHANGE_MODE, { mode });
    } else if (this.isOffline) {
      useClassroomStore.getState().setMode(mode);
      useClassroomStore.getState().showToast(`Mode set to ${mode}`, 'info');
    }
  }

  sendToggleChatLock() {
    if (this.room) {
      this.room.send(MSG_TYPES.TOGGLE_CHAT_LOCK, {});
    } else if (this.isOffline) {
      const cur = useClassroomStore.getState().isChatLocked;
      useClassroomStore.getState().setChatLocked(!cur);
      useClassroomStore.getState().showToast(cur ? 'Chat unlocked' : 'Chat locked', 'info');
    }
  }

  sendChat(text: string) {
    if (this.room) {
      this.room.send(MSG_TYPES.CHAT, { text });
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.addMessage({
        id: `msg_${Date.now()}`,
        senderId: store.mySessionId,
        senderName: store.myDisplayName,
        senderRole: store.myRole,
        text,
        timestamp: Date.now(),
        isAnnouncement: false
      });
    }
  }

  sendAnnouncement(text: string) {
    if (this.room) {
      this.room.send(MSG_TYPES.ANNOUNCEMENT, { text });
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.addMessage({
        id: `ann_${Date.now()}`,
        senderId: store.mySessionId,
        senderName: store.myDisplayName,
        senderRole: store.myRole,
        text,
        timestamp: Date.now(),
        isAnnouncement: true
      });
      store.showToast(`📢 ANNOUNCEMENT: ${text}`, 'info');
    }
  }

  sendReaction(emoji: string) {
    if (this.room) {
      this.room.send(MSG_TYPES.REACTION, { emoji });
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.triggerReaction(emoji, store.mySessionId);
    }
  }

  sendChangeBoardSlide(slide: number) {
    if (this.room) {
      this.room.send(MSG_TYPES.CHANGE_BOARD_SLIDE, { slide });
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.setBoardState(store.boardTopic, slide);
    }
  }

  sendChangeBoardTopic(topic: string) {
    if (this.room) {
      this.room.send(MSG_TYPES.CHANGE_BOARD_TOPIC, { topic });
    } else if (this.isOffline) {
      useClassroomStore.getState().setBoardState(topic, 0);
    }
  }

  sendStartScreenShare(presenterName?: string) {
    if (this.room) {
      this.room.send(MSG_TYPES.START_SCREENSHARE, { presenterName });
    } else if (this.isOffline) {
      const store = useClassroomStore.getState();
      store.setScreenSharingState(true, store.mySessionId, presenterName || store.myDisplayName);
      store.showToast(`📺 Started sharing screen on the blackboard!`, 'info');
    }
  }

  sendStopScreenShare() {
    if (this.room) {
      this.room.send(MSG_TYPES.STOP_SCREENSHARE);
    } else if (this.isOffline) {
      useClassroomStore.getState().setScreenSharingState(false, '', '');
      useClassroomStore.getState().showToast('Screen sharing stopped. Blackboard restored.', 'info');
    }
  }

  sendTeacherUpdateInteractions(data: TeacherInteractionsUpdateData) {
    if (this.room) {
      this.room.send(MSG_TYPES.TEACHER_UPDATE_INTERACTIONS, data);
    } else if (this.isOffline) {
      useClassroomStore.getState().setFunInteractionsConfig(data);
    }
  }

  disconnect() {
    this.isOffline = false;
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
