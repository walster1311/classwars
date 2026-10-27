import { Schema, MapSchema, ArraySchema } from '@colyseus/schema';
export declare class PlayerState extends Schema {
    id: string;
    sessionId: string;
    userId: string;
    displayName: string;
    role: string;
    avatarColor: string;
    characterType: string;
    hairstyleId: string;
    uniformId: string;
    x: number;
    y: number;
    z: number;
    rotY: number;
    animation: string;
    seatId: string;
    isHandRaised: boolean;
    canSpeak: boolean;
    isMuted: boolean;
    handRaiseTime: number;
    joinedAt: number;
    connectionStatus: string;
    isInteractionDisabled: boolean;
    followingSessionId: string;
    activeAuraColor: string;
    activeDance: string;
    activeEmoji: string;
}
export declare class SeatState extends Schema {
    id: string;
    occupiedBy: string;
    occupiedByName: string;
    x: number;
    y: number;
    z: number;
    rotY: number;
    isTeacherSeat: boolean;
}
export declare class ChatMessageState extends Schema {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    text: string;
    timestamp: number;
    isAnnouncement: boolean;
}
export declare class ClassroomState extends Schema {
    classroomId: string;
    title: string;
    teacherId: string;
    mode: string;
    isChatLocked: boolean;
    boardTopic: string;
    boardSlide: number;
    isScreenSharing: boolean;
    screenSharePresenterId: string;
    screenSharePresenterName: string;
    funActionsMode: string;
    allowPaperBall: boolean;
    allowHighFive: boolean;
    allowDanceBattle: boolean;
    allowEmoji: boolean;
    allowFollow: boolean;
    allowPowerUp: boolean;
    allowPaperAirplane: boolean;
    sessionStartTime: number;
    isSessionActive: boolean;
    players: MapSchema<PlayerState, string>;
    seats: MapSchema<SeatState, string>;
    messages: ArraySchema<ChatMessageState>;
    initSeats(): void;
}
