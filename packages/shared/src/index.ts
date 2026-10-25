export type UserRole = 'teacher' | 'student';

export type ClassroomMode = 'lecture' | 'discussion' | 'social' | 'group';

export interface SeatInfo {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  row: number;
  col: number;
  isTeacherSeat?: boolean;
}

export interface PlayerData {
  id: string;
  sessionId: string;
  userId: string;
  displayName: string;
  role: UserRole;
  avatarColor: string;
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
  joinedAt: number;
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
}

export interface ChatMessageData {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
  isAnnouncement: boolean;
}

export interface ClassroomRoomMetadata {
  classroomId: string;
  title: string;
  teacherId: string;
  teacherName: string;
  createdAt: number;
}

// Classroom Seat Layout (12 Student Desks + 1 Teacher Desk)
export const CLASSROOM_SEATS: SeatInfo[] = [
  { id: 'seat-teacher', name: "Teacher's Desk", x: 0, y: 0.45, z: -5.25, rotY: 0, row: 0, col: 0, isTeacherSeat: true },
  
  // Row 1
  { id: 'seat-1', name: 'Desk 1', x: -4.2, y: 0.45, z: -1.0, rotY: Math.PI, row: 1, col: 1 },
  { id: 'seat-2', name: 'Desk 2', x: -1.4, y: 0.45, z: -1.0, rotY: Math.PI, row: 1, col: 2 },
  { id: 'seat-3', name: 'Desk 3', x: 1.4, y: 0.45, z: -1.0, rotY: Math.PI, row: 1, col: 3 },
  { id: 'seat-4', name: 'Desk 4', x: 4.2, y: 0.45, z: -1.0, rotY: Math.PI, row: 1, col: 4 },

  // Row 2
  { id: 'seat-5', name: 'Desk 5', x: -4.2, y: 0.45, z: 1.5, rotY: Math.PI, row: 2, col: 1 },
  { id: 'seat-6', name: 'Desk 6', x: -1.4, y: 0.45, z: 1.5, rotY: Math.PI, row: 2, col: 2 },
  { id: 'seat-7', name: 'Desk 7', x: 1.4, y: 0.45, z: 1.5, rotY: Math.PI, row: 2, col: 3 },
  { id: 'seat-8', name: 'Desk 8', x: 4.2, y: 0.45, z: 1.5, rotY: Math.PI, row: 2, col: 4 },

  // Row 3
  { id: 'seat-9', name: 'Desk 9', x: -4.2, y: 0.45, z: 4.0, rotY: Math.PI, row: 3, col: 1 },
  { id: 'seat-10', name: 'Desk 10', x: -1.4, y: 0.45, z: 4.0, rotY: Math.PI, row: 3, col: 2 },
  { id: 'seat-11', name: 'Desk 11', x: 1.4, y: 0.45, z: 4.0, rotY: Math.PI, row: 3, col: 3 },
  { id: 'seat-12', name: 'Desk 12', x: 4.2, y: 0.45, z: 4.0, rotY: Math.PI, row: 3, col: 4 }
];

export const CLASSROOM_BOUNDS = {
  minX: -7.5,
  maxX: 7.5,
  minZ: -6.5,
  maxZ: 6.5
};

// WebSocket Message Types between client and Colyseus
export const MSG_TYPES = {
  MOVE: 'move',
  SIT: 'sit',
  STAND: 'stand',
  RAISE_HAND: 'raise_hand',
  LOWER_HAND: 'lower_hand',
  APPROVE_HAND: 'approve_hand',
  REJECT_HAND: 'reject_hand',
  CHAT: 'chat',
  ANNOUNCEMENT: 'announcement',
  CHANGE_MODE: 'change_mode',
  SET_MIC_PERMISSION: 'set_mic_permission',
  MUTE_ALL: 'mute_all',
  TOGGLE_CHAT_LOCK: 'toggle_chat_lock',
  KICK_PARTICIPANT: 'kick_participant',
  REACTION: 'reaction',
  CHANGE_BOARD_SLIDE: 'change_board_slide',
  CHANGE_BOARD_TOPIC: 'change_board_topic'
} as const;

export * from './schema';

