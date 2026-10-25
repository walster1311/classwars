import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';
import { CLASSROOM_SEATS } from './index';

export class PlayerState extends Schema {
  @type('string') id: string = '';
  @type('string') sessionId: string = '';
  @type('string') userId: string = '';
  @type('string') displayName: string = '';
  @type('string') role: string = 'student';
  @type('string') avatarColor: string = '#4F46E5';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;
  @type('number') rotY: number = 0;
  @type('string') animation: string = 'idle';
  @type('string') seatId: string = '';
  @type('boolean') isHandRaised: boolean = false;
  @type('boolean') canSpeak: boolean = false;
  @type('boolean') isMuted: boolean = true;
  @type('number') handRaiseTime: number = 0;
  @type('number') joinedAt: number = 0;
  @type('string') connectionStatus: string = 'connected';
}

export class SeatState extends Schema {
  @type('string') id: string = '';
  @type('string') occupiedBy: string = '';
  @type('string') occupiedByName: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;
  @type('number') rotY: number = 0;
  @type('boolean') isTeacherSeat: boolean = false;
}

export class ChatMessageState extends Schema {
  @type('string') id: string = '';
  @type('string') senderId: string = '';
  @type('string') senderName: string = '';
  @type('string') senderRole: string = 'student';
  @type('string') text: string = '';
  @type('number') timestamp: number = 0;
  @type('boolean') isAnnouncement: boolean = false;
}

export class ClassroomState extends Schema {
  @type('string') classroomId: string = '';
  @type('string') title: string = 'Classverse Virtual Classroom';
  @type('string') teacherId: string = '';
  @type('string') mode: string = 'lecture';
  @type('boolean') isChatLocked: boolean = false;
  @type('string') boardTopic: string = 'biology';
  @type('number') boardSlide: number = 0;
  @type('number') sessionStartTime: number = Date.now();
  @type('boolean') isSessionActive: boolean = true;

  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: SeatState }) seats = new MapSchema<SeatState>();
  @type([ ChatMessageState ]) messages = new ArraySchema<ChatMessageState>();

  initSeats() {
    CLASSROOM_SEATS.forEach(seat => {
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
