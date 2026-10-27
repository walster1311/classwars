"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassroomState = exports.ChatMessageState = exports.SeatState = exports.PlayerState = void 0;
const schema_1 = require("@colyseus/schema");
const index_1 = require("./index");
class PlayerState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.sessionId = '';
        this.userId = '';
        this.displayName = '';
        this.role = 'student';
        this.avatarColor = '#4F46E5';
        this.characterType = 'boy';
        this.hairstyleId = 'boy_classic_short';
        this.uniformId = 'boy_standard';
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rotY = 0;
        this.animation = 'idle';
        this.seatId = '';
        this.isHandRaised = false;
        this.canSpeak = false;
        this.isMuted = true;
        this.handRaiseTime = 0;
        this.joinedAt = 0;
        this.connectionStatus = 'connected';
        this.isInteractionDisabled = false;
        this.followingSessionId = '';
        this.activeAuraColor = '';
        this.activeDance = '';
        this.activeEmoji = '';
    }
}
exports.PlayerState = PlayerState;
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "sessionId", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "userId", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "displayName", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "role", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "avatarColor", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "characterType", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "hairstyleId", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "uniformId", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "z", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "rotY", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "animation", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "seatId", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], PlayerState.prototype, "isHandRaised", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], PlayerState.prototype, "canSpeak", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], PlayerState.prototype, "isMuted", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "handRaiseTime", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "joinedAt", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "connectionStatus", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], PlayerState.prototype, "isInteractionDisabled", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "followingSessionId", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "activeAuraColor", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "activeDance", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "activeEmoji", void 0);
class SeatState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.occupiedBy = '';
        this.occupiedByName = '';
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rotY = 0;
        this.isTeacherSeat = false;
    }
}
exports.SeatState = SeatState;
__decorate([
    (0, schema_1.type)('string')
], SeatState.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)('string')
], SeatState.prototype, "occupiedBy", void 0);
__decorate([
    (0, schema_1.type)('string')
], SeatState.prototype, "occupiedByName", void 0);
__decorate([
    (0, schema_1.type)('number')
], SeatState.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)('number')
], SeatState.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)('number')
], SeatState.prototype, "z", void 0);
__decorate([
    (0, schema_1.type)('number')
], SeatState.prototype, "rotY", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], SeatState.prototype, "isTeacherSeat", void 0);
class ChatMessageState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.senderId = '';
        this.senderName = '';
        this.senderRole = 'student';
        this.text = '';
        this.timestamp = 0;
        this.isAnnouncement = false;
    }
}
exports.ChatMessageState = ChatMessageState;
__decorate([
    (0, schema_1.type)('string')
], ChatMessageState.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)('string')
], ChatMessageState.prototype, "senderId", void 0);
__decorate([
    (0, schema_1.type)('string')
], ChatMessageState.prototype, "senderName", void 0);
__decorate([
    (0, schema_1.type)('string')
], ChatMessageState.prototype, "senderRole", void 0);
__decorate([
    (0, schema_1.type)('string')
], ChatMessageState.prototype, "text", void 0);
__decorate([
    (0, schema_1.type)('number')
], ChatMessageState.prototype, "timestamp", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ChatMessageState.prototype, "isAnnouncement", void 0);
class ClassroomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.classroomId = '';
        this.title = 'Classverse Virtual Classroom';
        this.teacherId = '';
        this.mode = 'lecture';
        this.isChatLocked = false;
        this.boardTopic = 'biology';
        this.boardSlide = 0;
        this.isScreenSharing = false;
        this.screenSharePresenterId = '';
        this.screenSharePresenterName = '';
        this.funActionsMode = 'break'; // 'lesson' | 'break' | 'free_play'
        this.allowPaperBall = true;
        this.allowHighFive = true;
        this.allowDanceBattle = true;
        this.allowEmoji = true;
        this.allowFollow = true;
        this.allowPowerUp = true;
        this.allowPaperAirplane = true;
        this.sessionStartTime = Date.now();
        this.isSessionActive = true;
        this.players = new schema_1.MapSchema();
        this.seats = new schema_1.MapSchema();
        this.messages = new schema_1.ArraySchema();
    }
    initSeats() {
        index_1.CLASSROOM_SEATS.forEach(seat => {
            const s = new SeatState();
            s.id = seat.id;
            s.x = seat.x;
            s.y = seat.y;
            s.z = seat.z;
            s.rotY = seat.rotY;
            s.isTeacherSeat = !!seat.isTeacherSeat;
            s.occupiedBy = '';
            s.occupiedByName = '';
            this.seats.set(seat.id, s);
        });
    }
}
exports.ClassroomState = ClassroomState;
__decorate([
    (0, schema_1.type)('string')
], ClassroomState.prototype, "classroomId", void 0);
__decorate([
    (0, schema_1.type)('string')
], ClassroomState.prototype, "title", void 0);
__decorate([
    (0, schema_1.type)('string')
], ClassroomState.prototype, "teacherId", void 0);
__decorate([
    (0, schema_1.type)('string')
], ClassroomState.prototype, "mode", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "isChatLocked", void 0);
__decorate([
    (0, schema_1.type)('string')
], ClassroomState.prototype, "boardTopic", void 0);
__decorate([
    (0, schema_1.type)('number')
], ClassroomState.prototype, "boardSlide", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "isScreenSharing", void 0);
__decorate([
    (0, schema_1.type)('string')
], ClassroomState.prototype, "screenSharePresenterId", void 0);
__decorate([
    (0, schema_1.type)('string')
], ClassroomState.prototype, "screenSharePresenterName", void 0);
__decorate([
    (0, schema_1.type)('string')
], ClassroomState.prototype, "funActionsMode", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "allowPaperBall", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "allowHighFive", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "allowDanceBattle", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "allowEmoji", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "allowFollow", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "allowPowerUp", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "allowPaperAirplane", void 0);
__decorate([
    (0, schema_1.type)('number')
], ClassroomState.prototype, "sessionStartTime", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], ClassroomState.prototype, "isSessionActive", void 0);
__decorate([
    (0, schema_1.type)({ map: PlayerState })
], ClassroomState.prototype, "players", void 0);
__decorate([
    (0, schema_1.type)({ map: SeatState })
], ClassroomState.prototype, "seats", void 0);
__decorate([
    (0, schema_1.type)([ChatMessageState])
], ClassroomState.prototype, "messages", void 0);
