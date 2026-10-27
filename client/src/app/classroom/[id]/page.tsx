'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle, RefreshCw, Play, Settings, Server, ExternalLink, ArrowLeft } from 'lucide-react';
import { UserRole } from '@classverse/shared';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';
import { livekitService } from '@/lib/livekit';
import { getServerHttpUrl, getServerWsUrl, getCustomServerUrl, setCustomServerUrl } from '@/lib/serverConfig';
import { TopBar } from '@/components/ui/TopBar';
import { LeftSidebar } from '@/components/ui/LeftSidebar';
import { RightSidebar } from '@/components/ui/RightSidebar';
import { BottomToolbar } from '@/components/ui/BottomToolbar';
import { TeacherControlModal } from '@/components/ui/TeacherControlModal';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { FunActionsMenu } from '@/components/ui/FunActionsMenu';
import { InteractionInviteModal } from '@/components/ui/InteractionInviteModal';

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
  const [customServerInput, setCustomServerInput] = useState('');
  const [showServerConfig, setShowServerConfig] = useState(false);

  const classroomId = (params?.id as string) || 'bio-101';
  const role = (searchParams.get('role') as UserRole) || 'student';
  const displayName = searchParams.get('name') || (role === 'teacher' ? 'Dr. Evelyn Reed' : `Student ${Math.floor(Math.random() * 900 + 100)}`);
  const avatarColor = searchParams.get('color') || (role === 'teacher' ? '#2563EB' : '#10B981');
  const rawNameId = displayName ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '_') : '';
  const defaultId = rawNameId.startsWith('student_') ? rawNameId : (rawNameId ? `student_${rawNameId}` : '');
  const userId = searchParams.get('uid') || defaultId || `usr_${Math.random().toString(36).substring(2, 9)}`;

  const isConnected = useClassroomStore((s) => s.isConnected);

  useEffect(() => {
    setCustomServerInput(getCustomServerUrl());
  }, []);

  const enterSandboxMode = () => {
    let characterType = (searchParams.get('char') as any) || undefined;
    let hairstyleId = searchParams.get('hair') || undefined;
    let uniformId: any = undefined;

    // Load local stored character if present
    if (typeof window !== 'undefined' && (!characterType || !hairstyleId)) {
      try {
        const stored = localStorage.getItem(`classverse_char_${userId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          characterType = characterType || parsed.characterType;
          hairstyleId = hairstyleId || parsed.hairstyleId;
          uniformId = uniformId || parsed.uniformId;
        }
      } catch (e) {}
    }

    colyseusService.startOfflineSession({
      classroomId,
      displayName,
      role,
      avatarColor,
      userId,
      characterType,
      hairstyleId,
      uniformId
    });

    setIsLoading(false);
    setConnectionError(null);
  };

  const connect = async () => {
    setIsLoading(true);
    setConnectionError(null);

    try {
      let characterType = (searchParams.get('char') as any) || undefined;
      let hairstyleId = searchParams.get('hair') || undefined;
      let uniformId: any = undefined;

      // Server-Enforced Route Protection for Students:
      if (role === 'student') {
        const serverUrl = getServerHttpUrl();
        const checkRes = await fetch(`${serverUrl}/api/profiles/${userId}/validate-entry?role=student`).catch(() => null);
        if (checkRes && checkRes.ok) {
          const checkData = await checkRes.json();
          if (!checkData.allowed) {
            console.log('[Route Guard] Student character selection required. Redirecting to /character-selection');
            const query = new URLSearchParams({
              classroomId,
              role: 'student',
              name: displayName,
              color: avatarColor,
              uid: userId
            });
            router.push(`/character-selection?${query.toString()}`);
            return;
          } else if (checkData.character) {
            characterType = checkData.character.characterType;
            hairstyleId = checkData.character.hairstyleId;
            uniformId = checkData.character.uniformId;
          }
        }
      }

      // 1. Connect to Colyseus Authoritative Multiplayer Room
      const room = await colyseusService.connectToClassroom({
        classroomId,
        displayName,
        role,
        avatarColor,
        userId,
        characterType,
        hairstyleId,
        uniformId
      });

      // 2. Initialize LiveKit Voice Audio Engine (graceful if voice unavailable)
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
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 select-none relative overflow-y-auto">
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold tracking-tight mb-2 text-white">Connection Unavailable</h2>
          
          <p className="text-xs text-slate-300 max-w-md mb-3 leading-relaxed">
            {connectionError}
          </p>

          <p className="text-[11px] text-slate-400 max-w-sm mb-6 leading-relaxed">
            {isHttps
              ? 'Multiplayer requires a deployed WebSocket backend (e.g. Railway or Render). You can enter Sandbox Mode immediately to explore the full 3D classroom, chibis, and all fun actions!'
              : 'Make sure the CLASSVERSE multiplayer backend server is running on port 2567, or jump straight into Offline Sandbox Mode below.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mb-6">
            <button
              onClick={enterSandboxMode}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter Offline Sandbox Mode</span>
            </button>

            <button
              onClick={connect}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>

          <div className="w-full pt-4 border-t border-slate-800/80 flex flex-col items-center gap-3">
            <button
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showServerConfig ? 'Hide Server Configuration' : 'Custom Server Configuration'}</span>
            </button>

            {showServerConfig && (
              <div className="w-full mt-2 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Custom Multiplayer Server Endpoint (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customServerInput}
                    onChange={(e) => setCustomServerInput(e.target.value)}
                    placeholder="e.g. https://classverse-backend.up.railway.app"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      setCustomServerUrl(customServerInput);
                      connect();
                    }}
                    className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
                  >
                    Save & Connect
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Enter your hosted Colyseus server URL. Leave empty to use default environment configuration.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/')}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 mt-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Return to Lobby</span>
            </button>
          </div>
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
      <FunActionsMenu />
      <InteractionInviteModal />
      <TeacherControlModal />
      <ToastNotification />
    </div>
  );
}
