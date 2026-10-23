# CLASSVERSE — Real-Time Multiplayer 3D Virtual Classroom

CLASSVERSE is a production-ready, browser-based multiplayer 3D virtual classroom. Built with Next.js, React Three Fiber, Colyseus authoritative WebSocket networking, LiveKit WebRTC voice streaming, and Supabase.

---

## Key Highlights

- **Real-Time Authoritative Multiplayer**: Powered by Colyseus state synchronization over WebSockets. Every movement, rotation, and animation state is synchronized across all connected browser clients.
- **Interactive 3D Isometric Diorama**: Miniature classroom environment with sunlight windows, student desks, teacher podium, interactive chairs, chalkboard, and bookshelves.
- **Server-Authoritative Seating**: Double seating is strictly prevented by the server state machine. Clicking an available seat locks it to your avatar; other students see immediate occupancy status.
- **Raise Hand & Speaking Queue**: Students raise their hands, adding them to a FIFO queue on the teacher's control dashboard.
- **Teacher Governance**: The teacher controls student microphone permissions, locks/unlocks student chat, switches lesson modes (Lecture vs Discussion Mode), and broadcasts official class announcements.
- **Live Voice Communication (LiveKit)**: Built with LiveKit WebRTC voice streaming and server-enforced publication tokens.
- **Real-Time Chat & Emoji Reactions**: Persistent chat messages, high-priority announcement banners, and floating emoji reactions above 3D avatars.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand |
| **3D Rendering** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **Multiplayer Server**| Colyseus 0.15, WebSocket Transport (`@colyseus/ws-transport`), Node.js, Express |
| **Voice & Audio** | LiveKit WebRTC (`livekit-client`, `livekit-server-sdk`) |
| **Database & Auth** | Supabase (PostgreSQL schema with Row-Level Security) |
| **Automated Testing**| Playwright end-to-end multi-browser test runner |

---

## Project Structure

```text
classroom/
├── client/                      # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/                 # App Router (Lobby `/`, Classroom `/[id]`)
│   │   ├── components/
│   │   │   ├── classroom/       # 3D Scene, Canvas, Avatars, Seating, Camera
│   │   │   └── ui/              # TopBar, LeftSidebar, RightSidebar, Toolbar, Modals
│   │   └── lib/                 # Colyseus service, LiveKit service, Zustand store
│   └── package.json
├── server/                      # Colyseus Dedicated Multiplayer Server
│   ├── src/
│   │   ├── rooms/               # ClassroomRoom authoritative game room
│   │   └── index.ts             # Express + WebSocket + LiveKit token endpoint
│   └── package.json
├── packages/
│   └── shared/                  # Shared room schemas, bounds, seats, and types
├── supabase/
│   └── migrations/              # Complete SQL migrations (tables, RLS, functions)
├── tests/                       # Playwright Multi-Client Automated Tests
├── playwright.config.ts         # Playwright test configuration
└── package.json                 # Monorepo workspace configuration
```

---

## Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v26)
- **npm**: v9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Shared Packages
```bash
npm run build:shared
```

### 4. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp server/.env.example server/.env
cp client/.env.local.example client/.env.local
```

Default local development values:
- `server/.env`:
  ```ini
  PORT=2567
  LIVEKIT_API_KEY=devkey
  LIVEKIT_API_SECRET=secret_key_classverse_dev_min_32_characters_long_1234
  LIVEKIT_URL=wss://classverse-dev.livekit.cloud
  ```
- `client/.env.local`:
  ```ini
  NEXT_PUBLIC_SERVER_URL=http://localhost:2567
  NEXT_PUBLIC_WS_URL=ws://localhost:2567
  NEXT_PUBLIC_LIVEKIT_URL=wss://classverse-dev.livekit.cloud
  ```

### 5. Start Servers
In two separate terminals:
```bash
# Terminal 1: Start Colyseus Multiplayer Server
npm run dev:server

# Terminal 2: Start Next.js Client
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Multi-Window Instant Testing

The Lobby page includes quick launch buttons allowing you to test multiplayer with one click:
- Click **+ Teacher** to open a Teacher tab.
- Click **+ Student 1**, **+ Student 2**, **+ Student 3**, etc., to launch multiple student tabs side-by-side.
- Watch avatars spawn, move across screens with WASD, occupy desks, raise hands, and chat in real-time!

---

## Automated Multiplayer Verification

Run the full multi-client automated test suite powered by Playwright:
```bash
npx playwright test
```

This automated test executes the complete MVP acceptance milestone:
1. Spawns 1 Teacher and 5 Students concurrently in isolated browser contexts.
2. Verifies real-time room discovery and 6-participant synchronization.
3. Tests instant chat broadcasting across all clients without page reloading.
4. Tests student hand-raise, FIFO queue ordering on teacher dashboard, and mic permission approval.
5. Tests teacher classroom mode switching and chat moderation locking.
6. Tests authoritative seating conflict resolution and LiveKit server-enforced voice tokens.

---

## Database Migrations (Supabase)

To connect Supabase:
1. Run the migration script located at [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/walst/Documents/classroom/supabase/migrations/001_initial_schema.sql) in your Supabase SQL editor.
2. Tables created:
   - `profiles`
   - `classrooms`
   - `classroom_members`
   - `sessions`
   - `session_participants`
   - `classroom_messages`
   - `classroom_seats`
   - `classroom_permissions`
3. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `client/.env.local` and `server/.env`.
