export type UserRole = 'teacher' | 'student';
export type ClassroomMode = 'lecture' | 'discussion' | 'social' | 'group';
export type CharacterType = 'boy' | 'girl';
export type BoyHairstyleId = 'boy_classic_short' | 'boy_spiky_anime' | 'boy_side_part' | 'boy_messy' | 'boy_bowl_cut' | 'boy_wavy';
export type GirlHairstyleId = 'girl_long_straight' | 'girl_bob_cut' | 'girl_ponytail' | 'girl_twin_tails' | 'girl_short_wavy' | 'girl_braided';
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
export declare const BOY_HAIRSTYLES: HairstyleOption[];
export declare const GIRL_HAIRSTYLES: HairstyleOption[];
export declare const APPROVED_HAIRSTYLES: Record<CharacterType, string[]>;
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
export declare const CLASSROOM_SEATS: SeatInfo[];
export declare const CLASSROOM_BOUNDS: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
};
export declare const MSG_TYPES: {
    readonly MOVE: "move";
    readonly SIT: "sit";
    readonly STAND: "stand";
    readonly RAISE_HAND: "raise_hand";
    readonly LOWER_HAND: "lower_hand";
    readonly APPROVE_HAND: "approve_hand";
    readonly REJECT_HAND: "reject_hand";
    readonly CHAT: "chat";
    readonly ANNOUNCEMENT: "announcement";
    readonly CHANGE_MODE: "change_mode";
    readonly SET_MIC_PERMISSION: "set_mic_permission";
    readonly MUTE_ALL: "mute_all";
    readonly TOGGLE_CHAT_LOCK: "toggle_chat_lock";
    readonly KICK_PARTICIPANT: "kick_participant";
    readonly REACTION: "reaction";
    readonly CHANGE_BOARD_SLIDE: "change_board_slide";
    readonly CHANGE_BOARD_TOPIC: "change_board_topic";
    readonly START_SCREENSHARE: "start_screenshare";
    readonly STOP_SCREENSHARE: "stop_screenshare";
    readonly INTERACTION_TRIGGER: "interaction:trigger";
    readonly INTERACTION_REQUEST: "interaction:request";
    readonly INTERACTION_RESPOND: "interaction:respond";
    readonly INTERACTION_CANCEL: "interaction:cancel";
    readonly PROJECTILE_LAUNCH: "projectile:launch";
    readonly TEACHER_UPDATE_INTERACTIONS: "teacher:update_interactions";
};
export type FunActionType = 'paper_ball' | 'high_five' | 'dance_battle' | 'emoji' | 'follow' | 'power_up' | 'paper_airplane';
export type FunInteractionMode = 'lesson' | 'break' | 'free_play';
export type PowerUpColor = 'golden' | 'blue' | 'purple';
export type DanceStyle = 'cute_side_step' | 'anime_victory' | 'funny_robot' | 'jump_and_spin' | 'silly_freestyle';
export type EmojiReactionId = 'love' | 'laugh' | 'surprised' | 'crying' | 'cool' | 'angry' | 'sleepy' | 'confused' | 'sweat' | 'excited';
export interface EmojiDefinition {
    id: EmojiReactionId;
    label: string;
    char: string;
    facialAnim: string;
}
export declare const EMOJI_DEFINITIONS: EmojiDefinition[];
export interface ProjectileEventData {
    id: string;
    type: 'paper_ball' | 'paper_airplane';
    ownerSessionId: string;
    ownerName: string;
    startPos: {
        x: number;
        y: number;
        z: number;
    };
    velocity: {
        x: number;
        y: number;
        z: number;
    };
    targetSessionId?: string;
    targetPos?: {
        x: number;
        y: number;
        z: number;
    };
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
