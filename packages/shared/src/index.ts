export type UserRole = 'teacher' | 'student';

export type ClassroomMode = 'lecture' | 'discussion' | 'social' | 'group';

export type CharacterType = 'boy' | 'girl';

export type BoyHairstyleId =
  | 'boy_classic_short'
  | 'boy_spiky_anime'
  | 'boy_side_part'
  | 'boy_messy'
  | 'boy_bowl_cut'
  | 'boy_wavy';

export type GirlHairstyleId =
  | 'girl_long_straight'
  | 'girl_bob_cut'
  | 'girl_ponytail'
  | 'girl_twin_tails'
  | 'girl_short_wavy'
  | 'girl_braided';

export type HairstyleId = BoyHairstyleId | GirlHairstyleId;

export type UniformId = 'boy_standard' | 'girl_standard';

export interface ChibiCharacterConfig {
  characterType: CharacterType;
  hairstyleId: string;
  uniformId: UniformId;
  characterVersion: number;
  selectionCompleted: boolean;
}

export interface HairstyleOption {
  id: string;
  name: string;
  description: string;
  gender: CharacterType;
  accentColor?: string;
}

export const BOY_HAIRSTYLES: HairstyleOption[] = [
  { id: 'boy_classic_short', name: 'Classic Short', description: 'Neat and trimmed student cut', gender: 'boy' },
  { id: 'boy_spiky_anime', name: 'Spiky Anime', description: 'Dynamic anime hero spikes', gender: 'boy' },
  { id: 'boy_side_part', name: 'Side Part', description: 'Smart side-swept gentleman look', gender: 'boy' },
  { id: 'boy_messy', name: 'Messy Hair', description: 'Casual textured carefree locks', gender: 'boy' },
  { id: 'boy_bowl_cut', name: 'Bowl Cut', description: 'Retro clean rounded fringe', gender: 'boy' },
  { id: 'boy_wavy', name: 'Wavy Hair', description: 'Soft undulating wavy style', gender: 'boy' },
];

export const GIRL_HAIRSTYLES: HairstyleOption[] = [
  { id: 'girl_long_straight', name: 'Long Straight', description: 'Flowing silky straight hair', gender: 'girl' },
  { id: 'girl_bob_cut', name: 'Bob Cut', description: 'Chic shoulder-skimming bob with bangs', gender: 'girl' },
  { id: 'girl_ponytail', name: 'Ponytail', description: 'High energetic ponytail with tie', gender: 'girl' },
  { id: 'girl_twin_tails', name: 'Twin Tails', description: 'Iconic anime pigtails with ribbons', gender: 'girl' },
  { id: 'girl_short_wavy', name: 'Short Wavy', description: 'Bouncy playful wavy curls', gender: 'girl' },
  { id: 'girl_braided', name: 'Braided Hair', description: 'Twin neat traditional braids', gender: 'girl' },
];

export const APPROVED_HAIRSTYLES: Record<CharacterType, string[]> = {
  boy: BOY_HAIRSTYLES.map((h) => h.id),
  girl: GIRL_HAIRSTYLES.map((h) => h.id),
};

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

// Classroom Seat Layout (1 Teacher Desk + 100 Student Desks arranged in 10 rows x 10 columns)
const generate100ClassroomSeats = (): SeatInfo[] => {
  const seats: SeatInfo[] = [
    {
      id: 'seat-teacher',
      name: "Teacher's Desk",
      x: 0,
      y: 0,
      z: -11.45,
      rotY: 0,
      row: 0,
      col: 0,
      isTeacherSeat: true
    }
  ];

  // 10 Columns arranged into 3 banks with 2 grand aisles:
  // Left Bank (Cols 1-3), Center Bank (Cols 4-7), Right Bank (Cols 8-10)
  const COL_X_COORDS = [
    -9.2, -7.4, -5.6,     // Left bank
    -3.0, -1.0, 1.0, 3.0, // Center bank
    5.6, 7.4, 9.2         // Right bank
  ];

  const ROW_Z_START = -6.5;
  const ROW_Z_SPACING = 1.9;

  let seatIndex = 1;
  for (let r = 1; r <= 10; r++) {
    const zPos = ROW_Z_START + (r - 1) * ROW_Z_SPACING;
    for (let c = 1; c <= 10; c++) {
      const xPos = COL_X_COORDS[c - 1];
      seats.push({
        id: `seat-${seatIndex}`,
        name: `Desk ${seatIndex} (R${r}-C${c})`,
        x: Number(xPos.toFixed(2)),
        y: 0,
        z: Number(zPos.toFixed(2)),
        rotY: Math.PI, // Facing forward towards teacher and blackboard (-Z)
        row: r,
        col: c,
        isTeacherSeat: false
      });
      seatIndex++;
    }
  }

  return seats;
};

export const CLASSROOM_SEATS: SeatInfo[] = generate100ClassroomSeats();

export const CLASSROOM_BOUNDS = {
  minX: -12.2,
  maxX: 12.2,
  minZ: -13.2,
  maxZ: 13.8
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
  CHANGE_BOARD_TOPIC: 'change_board_topic',
  START_SCREENSHARE: 'start_screenshare',
  STOP_SCREENSHARE: 'stop_screenshare',

  // Interactive Classroom Fun & Social System Messages
  INTERACTION_TRIGGER: 'interaction:trigger',
  INTERACTION_REQUEST: 'interaction:request',
  INTERACTION_RESPOND: 'interaction:respond',
  INTERACTION_CANCEL: 'interaction:cancel',
  PROJECTILE_LAUNCH: 'projectile:launch',
  TEACHER_UPDATE_INTERACTIONS: 'teacher:update_interactions'
} as const;

export type FunActionType =
  | 'paper_ball'
  | 'high_five'
  | 'dance_battle'
  | 'emoji'
  | 'follow'
  | 'power_up'
  | 'paper_airplane';

export type FunInteractionMode = 'lesson' | 'break' | 'free_play';

export type PowerUpColor = 'golden' | 'blue' | 'purple';

export type DanceStyle =
  | 'cute_side_step'
  | 'anime_victory'
  | 'funny_robot'
  | 'jump_and_spin'
  | 'silly_freestyle';

export type EmojiReactionId =
  | 'love'
  | 'laugh'
  | 'surprised'
  | 'crying'
  | 'cool'
  | 'angry'
  | 'sleepy'
  | 'confused'
  | 'sweat'
  | 'excited';

export interface EmojiDefinition {
  id: EmojiReactionId;
  label: string;
  char: string;
  facialAnim: string;
}

export const EMOJI_DEFINITIONS: EmojiDefinition[] = [
  { id: 'love', label: 'Love', char: '❤️', facialAnim: 'heart_eyes' },
  { id: 'laugh', label: 'Laugh', char: '😂', facialAnim: 'laughing' },
  { id: 'surprised', label: 'Surprised', char: '😮', facialAnim: 'gasp' },
  { id: 'crying', label: 'Crying', char: '😭', facialAnim: 'tear_streams' },
  { id: 'cool', label: 'Cool', char: '😎', facialAnim: 'sunglasses' },
  { id: 'angry', label: 'Angry', char: '😡', facialAnim: 'anger_mark' },
  { id: 'sleepy', label: 'Sleepy', char: '😴', facialAnim: 'zzz' },
  { id: 'confused', label: 'Confused', char: '❓', facialAnim: 'question' },
  { id: 'sweat', label: 'Sweat Drop', char: '💦', facialAnim: 'sweat_drop' },
  { id: 'excited', label: 'Excited', char: '✨', facialAnim: 'sparkle_eyes' }
];

export interface ProjectileEventData {
  id: string;
  type: 'paper_ball' | 'paper_airplane';
  ownerSessionId: string;
  ownerName: string;
  startPos: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  targetSessionId?: string;
  targetPos?: { x: number; y: number; z: number };
  power?: number;
  timestamp: number;
}

export interface SocialInteractionEventData {
  id: string;
  type: 'high_five' | 'dance_battle' | 'follow';
  initiatorSessionId: string;
  initiatorName: string;
  targetSessionId: string;
  targetName: string;
  status: 'requested' | 'accepted' | 'declined' | 'active' | 'completed' | 'cancelled';
  danceStyle?: DanceStyle;
  timestamp: number;
  durationMs?: number;
}

export interface TeacherInteractionsUpdateData {
  funActionsMode?: FunInteractionMode;
  allowPaperBall?: boolean;
  allowHighFive?: boolean;
  allowDanceBattle?: boolean;
  allowEmoji?: boolean;
  allowFollow?: boolean;
  allowPowerUp?: boolean;
  allowPaperAirplane?: boolean;
  stopAllActive?: boolean;
  targetStudentSessionId?: string;
  studentDisabled?: boolean;
}

export * from './schema';

