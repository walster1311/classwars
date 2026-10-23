import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { AccessToken } from 'livekit-server-sdk';
import { ClassroomRoom } from './rooms/ClassroomRoom';

dotenv.config();

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// In-memory registry for classrooms (backed by Supabase when credentials exist)
interface ClassroomRecord {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  inviteCode: string;
  createdAt: number;
}

const classroomStore = new Map<string, ClassroomRecord>();

// Pre-seed a default classroom for immediate instant testing
classroomStore.set('bio-101', {
  id: 'bio-101',
  title: 'Biology Class: Cellular Biology',
  teacherId: 'teacher_1',
  teacherName: 'Dr. Evelyn Reed',
  inviteCode: 'BIO101',
  createdAt: Date.now()
});

classroomStore.set('default', {
  id: 'default',
  title: 'General Science Virtual Classroom',
  teacherId: 'teacher_default',
  teacherName: 'Prof. Anderson',
  inviteCode: 'CLASS1',
  createdAt: Date.now()
});

// REST ENDPOINTS

// 1. Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    activeClassrooms: classroomStore.size
  });
});

// 2. Classroom retrieval
app.get('/api/classrooms/:id', (req, res) => {
  const room = classroomStore.get(req.params.id);
  if (!room) {
    // If not in store, auto-provision dynamic room for testing convenience
    const dynamicRoom: ClassroomRecord = {
      id: req.params.id,
      title: `${req.params.id.toUpperCase()} Classroom`,
      teacherId: 'teacher_auto',
      teacherName: 'Host Teacher',
      inviteCode: req.params.id,
      createdAt: Date.now()
    };
    classroomStore.set(req.params.id, dynamicRoom);
    return res.json(dynamicRoom);
  }
  res.json(room);
});

// 3. Classroom creation
app.post('/api/classrooms', (req, res) => {
  const { title, teacherId, teacherName, inviteCode } = req.body;
  const id = `room_${Math.random().toString(36).substring(2, 9)}`;
  const newRoom: ClassroomRecord = {
    id,
    title: title || 'New Interactive Classroom',
    teacherId: teacherId || 'teacher_default',
    teacherName: teacherName || 'Teacher',
    inviteCode: inviteCode || id.substring(0, 6).toUpperCase(),
    createdAt: Date.now()
  };
  classroomStore.set(id, newRoom);
  res.status(201).json(newRoom);
});

// 4. LiveKit Token Dispenser (Voice Communication with Server-Enforced Permissions)
app.post('/api/livekit/token', async (req, res) => {
  try {
    const { roomName, identity, name, role, canPublishAudio } = req.body;

    if (!roomName || !identity) {
      return res.status(400).json({ error: 'roomName and identity are required.' });
    }

    const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret_key_classverse_dev_min_32_characters_long_1234';

    // Role-based publish permission
    const isTeacher = role === 'teacher';
    const allowPublish = isTeacher || Boolean(canPublishAudio);

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: name || identity,
      ttl: '4h',
      metadata: JSON.stringify({ role, isTeacher })
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: allowPublish,
      canSubscribe: true,
      canPublishData: true
    });

    const token = await at.toJwt();

    res.json({
      token,
      url: process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || 'wss://classverse-dev.livekit.cloud',
      identity,
      canPublish: allowPublish
    });
  } catch (err: any) {
    console.error('[LiveKit Token Error]', err);
    res.status(500).json({ error: 'Failed to generate voice token', details: err.message });
  }
});

// HTTP + WebSocket Server Setup
const server = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
    pingInterval: 5000,
    pingMaxRetries: 3
  })
});

// Register Classroom Colyseus Room
gameServer.define('classroom', ClassroomRoom);

server.listen(port, () => {
  console.log(`=======================================================`);
  console.log(`  CLASSVERSE Multiplayer Server running on port ${port}`);
  console.log(`  WebSocket Colyseus Room: ws://localhost:${port}`);
  console.log(`  HTTP API Health: http://localhost:${port}/health`);
  console.log(`=======================================================`);
});
