import { create } from 'zustand';
import {
  UserRole,
  ClassroomMode,
  SeatInfo,
  CLASSROOM_SEATS,
  CharacterType,
  UniformId,
  ProjectileEventData,
  SocialInteractionEventData,
  FunInteractionMode
} from '@classverse/shared';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
  isAnnouncement: boolean;
}

export interface ClientPlayer {
  id: string;
  sessionId: string;
  userId: string;
  displayName: string;
  role: UserRole;
  avatarColor: string;
  characterType?: CharacterType;
  hairstyleId?: string;
  uniformId?: UniformId;
  x: number;
  y: number;
  z: number;
  rotY: number;
  animation: string;
  seatId: string | null;
  isHandRaised: boolean;
  canSpeak: boolean;
  isMuted: boolean;
  handRaiseTime: number;
  isSpeaking?: boolean;
  isInteractionDisabled?: boolean;
  followingSessionId?: string;
  activeAuraColor?: string;
  activeDance?: string;
  activeEmoji?: string;
}

export interface SparkleEffect {
  id: string;
  x: number;
  y: number;
  z: number;
  createdAt: number;
}

interface ClassroomState {
  // Current client user
  mySessionId: string;
  myRole: UserRole;
  myDisplayName: string;
  myAvatarColor: string;
  mySeatId: string | null;
  isHandRaised: boolean;
  canSpeak: boolean;
  isMicMuted: boolean;

  // Classroom global state
  classroomId: string;
  classroomTitle: string;
  mode: ClassroomMode;
  isChatLocked: boolean;
  boardTopic: string;
  boardSlide: number;
  isScreenSharing: boolean;
  screenSharePresenterId: string;
  screenSharePresenterName: string;
  screenStream: MediaStream | null;
  screenVideoElement: HTMLVideoElement | null;
  isConnected: boolean;
  isReconnecting: boolean;

  // Remote synchronized collections
  players: Record<string, ClientPlayer>;
  seats: Record<string, { occupiedBy: string; occupiedByName: string }>;
  messages: ChatMessage[];
  activeSpeakers: Set<string>;

  // UI state
  activeTab: 'chat' | 'announcements' | 'queue';
  isTeacherModalOpen: boolean;
  wallCutoffMode: 'auto' | 'cutoff' | 'raised';
  cameraResetNonce: number;
  toast: { message: string; type: 'info' | 'error' | 'success' } | null;
  activeReaction: { emoji: string; sessionId: string; id: number } | null;

  // Interactive Classroom Fun & Social System State
  funActionsMode: FunInteractionMode;
  allowPaperBall: boolean;
  allowHighFive: boolean;
  allowDanceBattle: boolean;
  allowEmoji: boolean;
  allowFollow: boolean;
  allowPowerUp: boolean;
  allowPaperAirplane: boolean;
  pendingInvite: SocialInteractionEventData | null;
  followingSessionId: string | null;
  activeProjectiles: ProjectileEventData[];
  sparkles: SparkleEffect[];
  airplanePersonalBest: number;

  // Actions
  setClientInfo: (info: { sessionId?: string; role?: UserRole; name?: string; color?: string }) => void;
  setClassroomDetails: (details: { id: string; title: string; mode: ClassroomMode; isChatLocked: boolean }) => void;
  setConnectionStatus: (connected: boolean, reconnecting?: boolean) => void;
  setPlayers: (players: Record<string, ClientPlayer>) => void;
  upsertPlayer: (sessionId: string, player: Partial<ClientPlayer>) => void;
  removePlayer: (sessionId: string) => void;
  updateSeat: (seatId: string, occupiedBy: string, occupiedByName: string) => void;
  initSeats: (initialSeats: Record<string, { occupiedBy: string; occupiedByName: string }>) => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setSpeakingUser: (sessionId: string, isSpeaking: boolean) => void;
  setMySeat: (seatId: string | null) => void;
  setMyHandRaised: (raised: boolean) => void;
  setMyMicMuted: (muted: boolean) => void;
  setCanSpeak: (can: boolean) => void;
  setMode: (mode: ClassroomMode) => void;
  setChatLocked: (locked: boolean) => void;
  setBoardState: (topic: string, slide: number) => void;
  setScreenSharingState: (isSharing: boolean, presenterId?: string, presenterName?: string) => void;
  setScreenStream: (stream: MediaStream | null, videoEl: HTMLVideoElement | null) => void;
  setWallCutoffMode: (mode: 'auto' | 'cutoff' | 'raised') => void;
  cycleWallCutoffMode: () => void;
  setActiveTab: (tab: 'chat' | 'announcements' | 'queue') => void;
  setTeacherModalOpen: (open: boolean) => void;
  triggerCameraReset: () => void;
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  triggerReaction: (emoji: string, sessionId: string) => void;
  setFunInteractionsConfig: (config: Partial<{
    funActionsMode: FunInteractionMode;
    allowPaperBall: boolean;
    allowHighFive: boolean;
    allowDanceBattle: boolean;
    allowEmoji: boolean;
    allowFollow: boolean;
    allowPowerUp: boolean;
    allowPaperAirplane: boolean;
  }>) => void;
  setPendingInvite: (invite: SocialInteractionEventData | null) => void;
  setFollowingSessionId: (targetId: string | null) => void;
  addProjectile: (proj: ProjectileEventData) => void;
  removeProjectile: (id: string) => void;
  addSparkle: (sparkle: { x: number; y: number; z: number }) => void;
  setAirplanePersonalBest: (dist: number) => void;
}

// Initial seat map
const initialSeatsMap: Record<string, { occupiedBy: string; occupiedByName: string }> = {};
CLASSROOM_SEATS.forEach(s => {
  initialSeatsMap[s.id] = { occupiedBy: '', occupiedByName: '' };
});

export const useClassroomStore = create<ClassroomState>((set, get) => ({
  mySessionId: '',
  myRole: 'student',
  myDisplayName: 'Student',
  myAvatarColor: '#10B981',
  mySeatId: null,
  isHandRaised: false,
  canSpeak: false,
  isMicMuted: true,

  classroomId: 'bio-101',
  classroomTitle: 'Biology Class: Cellular Biology',
  mode: 'lecture',
  isChatLocked: false,
  boardTopic: 'biology',
  boardSlide: 0,
  isScreenSharing: false,
  screenSharePresenterId: '',
  screenSharePresenterName: '',
  screenStream: null,
  screenVideoElement: null,
  isConnected: false,
  isReconnecting: false,

  players: {},
  seats: initialSeatsMap,
  messages: [],
  activeSpeakers: new Set(),

  activeTab: 'chat',
  isTeacherModalOpen: false,
  wallCutoffMode: 'raised',
  cameraResetNonce: 0,
  toast: null,
  activeReaction: null,

  funActionsMode: 'break',
  allowPaperBall: true,
  allowHighFive: true,
  allowDanceBattle: true,
  allowEmoji: true,
  allowFollow: true,
  allowPowerUp: true,
  allowPaperAirplane: true,
  pendingInvite: null,
  followingSessionId: null,
  activeProjectiles: [],
  sparkles: [],
  airplanePersonalBest: 0,

  setClientInfo: (info) => set((state) => ({
    mySessionId: info.sessionId !== undefined ? info.sessionId : state.mySessionId,
    myRole: info.role !== undefined ? info.role : state.myRole,
    myDisplayName: info.name !== undefined ? info.name : state.myDisplayName,
    myAvatarColor: info.color !== undefined ? info.color : state.myAvatarColor,
  })),

  setClassroomDetails: (details) => set({
    classroomId: details.id,
    classroomTitle: details.title,
    mode: details.mode,
    isChatLocked: details.isChatLocked
  }),

  setConnectionStatus: (connected, reconnecting = false) => set({
    isConnected: connected,
    isReconnecting: reconnecting
  }),

  setPlayers: (players) => set({ players }),

  upsertPlayer: (sessionId, playerData) => set((state) => {
    const existing = state.players[sessionId] || {
      id: sessionId,
      sessionId,
      userId: `user_${sessionId}`,
      displayName: 'Participant',
      role: 'student',
      avatarColor: '#10B981',
      x: 0,
      y: 0,
      z: 5.5,
      rotY: Math.PI,
      animation: 'idle',
      seatId: null,
      isHandRaised: false,
      canSpeak: false,
      isMuted: true,
      handRaiseTime: 0
    };

    const updated = { ...existing, ...playerData };
    return {
      players: {
        ...state.players,
        [sessionId]: updated
      }
    };
  }),

  removePlayer: (sessionId) => set((state) => {
    const newPlayers = { ...state.players };
    delete newPlayers[sessionId];
    return { players: newPlayers };
  }),

  initSeats: (initialSeats) => set({ seats: initialSeats }),

  updateSeat: (seatId, occupiedBy, occupiedByName) => set((state) => {
    const cur = state.seats[seatId];
    if (cur && cur.occupiedBy === occupiedBy && cur.occupiedByName === occupiedByName) {
      return state;
    }
    return {
      seats: {
        ...state.seats,
        [seatId]: { occupiedBy, occupiedByName }
      }
    };
  }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages.slice(-150), msg]
  })),

  setMessages: (messages) => set({ messages }),

  setSpeakingUser: (sessionId, isSpeaking) => set((state) => {
    const newSpeakers = new Set(state.activeSpeakers);
    if (isSpeaking) {
      newSpeakers.add(sessionId);
    } else {
      newSpeakers.delete(sessionId);
    }
    return { activeSpeakers: newSpeakers };
  }),

  setMySeat: (seatId) => set({ mySeatId: seatId }),
  setMyHandRaised: (raised) => set({ isHandRaised: raised }),
  setMyMicMuted: (muted) => set({ isMicMuted: muted }),
  setCanSpeak: (can) => set({ canSpeak: can }),
  setMode: (mode) => set({ mode }),
  setChatLocked: (locked) => set({ isChatLocked: locked }),
  setBoardState: (topic, slide) => set({ boardTopic: topic, boardSlide: slide }),
  setScreenSharingState: (isSharing, presenterId = '', presenterName = '') => set({
    isScreenSharing: isSharing,
    screenSharePresenterId: presenterId,
    screenSharePresenterName: presenterName
  }),
  setScreenStream: (stream, videoEl) => set({
    screenStream: stream,
    screenVideoElement: videoEl
  }),
  setWallCutoffMode: (mode) => set({ wallCutoffMode: mode }),
  cycleWallCutoffMode: () => set((state) => {
    const cycleMap: Record<'auto' | 'cutoff' | 'raised', 'auto' | 'cutoff' | 'raised'> = {
      auto: 'cutoff',
      cutoff: 'raised',
      raised: 'auto'
    };
    const nextMode = cycleMap[state.wallCutoffMode];
    const labels = {
      auto: 'Auto Orbit Cutoff',
      cutoff: 'All Walls Cut Off',
      raised: 'Full Walls'
    };
    get().showToast(`Wall view: ${labels[nextMode]}`, 'info');
    return { wallCutoffMode: nextMode };
  }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTeacherModalOpen: (open) => set({ isTeacherModalOpen: open }),
  triggerCameraReset: () => set((state) => ({ cameraResetNonce: state.cameraResetNonce + 1 })),

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) {
        set({ toast: null });
      }
    }, 3500);
  },

  triggerReaction: (emoji, sessionId) => {
    set({
      activeReaction: { emoji, sessionId, id: Date.now() }
    });
  },

  setFunInteractionsConfig: (config) => set((state) => ({
    funActionsMode: config.funActionsMode !== undefined ? config.funActionsMode : state.funActionsMode,
    allowPaperBall: config.allowPaperBall !== undefined ? config.allowPaperBall : state.allowPaperBall,
    allowHighFive: config.allowHighFive !== undefined ? config.allowHighFive : state.allowHighFive,
    allowDanceBattle: config.allowDanceBattle !== undefined ? config.allowDanceBattle : state.allowDanceBattle,
    allowEmoji: config.allowEmoji !== undefined ? config.allowEmoji : state.allowEmoji,
    allowFollow: config.allowFollow !== undefined ? config.allowFollow : state.allowFollow,
    allowPowerUp: config.allowPowerUp !== undefined ? config.allowPowerUp : state.allowPowerUp,
    allowPaperAirplane: config.allowPaperAirplane !== undefined ? config.allowPaperAirplane : state.allowPaperAirplane
  })),

  setPendingInvite: (invite) => set({ pendingInvite: invite }),
  setFollowingSessionId: (targetId) => set({ followingSessionId: targetId }),

  addProjectile: (proj) => set((state) => ({
    activeProjectiles: [...state.activeProjectiles.filter(p => p.id !== proj.id), proj]
  })),

  removeProjectile: (id) => set((state) => ({
    activeProjectiles: state.activeProjectiles.filter(p => p.id !== id)
  })),

  addSparkle: (sparkle) => set((state) => ({
    sparkles: [
      ...state.sparkles.filter(s => Date.now() - s.createdAt < 2000),
      { ...sparkle, id: `sp_${Date.now()}_${Math.random()}`, createdAt: Date.now() }
    ]
  })),

  setAirplanePersonalBest: (dist) => set((state) => ({
    airplanePersonalBest: Math.max(state.airplanePersonalBest, dist)
  }))
}));

if (typeof window !== 'undefined') {
  (window as any).__CLASSROOM_STORE__ = useClassroomStore;
}
