'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { UserRole } from '@classverse/shared';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';
import { livekitService } from '@/lib/livekit';
import { TopBar } from '@/components/ui/TopBar';
import { LeftSidebar } from '@/components/ui/LeftSidebar';
import { RightSidebar } from '@/components/ui/RightSidebar';
import { BottomToolbar } from '@/components/ui/BottomToolbar';
import { TeacherControlModal } from '@/components/ui/TeacherControlModal';
import { ToastNotification } from '@/components/ui/ToastNotification';

// Dynamically import Three.js Canvas to prevent SSR issues
const ClassroomCanvas = dynamic(
  () => import('@/components/classroom/ClassroomCanvas').then((m) => m.ClassroomCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs font-medium">Rendering 3D Virtual Classroom...</p>
      </div>
    )
  }
);

export default function ClassroomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const classroomId = (params?.id as string) || 'bio-101';
  const role = (searchParams.get('role') as UserRole) || 'student';
  const displayName = searchParams.get('name') || (role === 'teacher' ? 'Dr. Evelyn Reed' : `Student ${Math.floor(Math.random() * 900 + 100)}`);
  const avatarColor = searchParams.get('color') || (role === 'teacher' ? '#2563EB' : '#10B981');
  const userId = searchParams.get('uid') || `user_${Math.random().toString(36).substring(2, 9)}`;

  const isConnected = useClassroomStore((s) => s.isConnected);

  const connect = async () => {
    setIsLoading(true);
    setConnectionError(null);

    try {
      // 1. Connect to Colyseus Authoritative Multiplayer Room
      const room = await colyseusService.connectToClassroom({
        classroomId,
        displayName,
        role,
        avatarColor,
        userId
      });

      // 2. Initialize LiveKit Voice Audio Engine
      await livekitService.connect({
        roomName: classroomId,
        identity: room.sessionId,
        displayName,
        role,
        canPublishAudio: role === 'teacher'
      });

      setIsLoading(false);
    } catch (err: any) {
      console.error('[Connection Error]', err);
      setConnectionError(err.message || 'Unable to connect to multiplayer classroom server.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      colyseusService.disconnect();
      livekitService.disconnect();
    };
  }, [classroomId]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white select-none">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md -z-10 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold tracking-tight mb-1">Entering 3D Classroom</h2>
        <p className="text-xs text-slate-400 mb-2">Connecting to authoritative server at {classroomId}...</p>
        <div className="flex items-center gap-2 text-[11px] text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          <span>Synchronizing avatar position and seats</span>
        </div>
      </div>
    );
  }

  if (connectionError && !isConnected) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 select-none">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold mb-1">Connection Unavailable</h2>
        <p className="text-xs text-slate-400 max-w-md text-center mb-6">
          {connectionError}. Make sure the CLASSVERSE multiplayer server is running on port 2567.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={connect}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Top Bar */}
      <TopBar />

      {/* Main Classroom Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Roster & Hand Queue */}
        <LeftSidebar />

        {/* Center: 3D Virtual Classroom Canvas */}
        <main className="flex-1 relative overflow-hidden">
          <ClassroomCanvas />
        </main>

        {/* Right Sidebar: Chat & Announcements */}
        <RightSidebar />
      </div>

      {/* Bottom Action Bar */}
      <BottomToolbar />

      {/* Modals and Notifications */}
      <TeacherControlModal />
      <ToastNotification />
    </div>
  );
}
