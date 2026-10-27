'use client';

import React from 'react';
import { Users, Radio, Settings, ShieldCheck } from 'lucide-react';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

export function TopBar() {
  const classroomTitle = useClassroomStore((s) => s.classroomTitle);
  const mode = useClassroomStore((s) => s.mode);
  const participantCount = useClassroomStore((s) => Object.keys(s.players).length);
  const myRole = useClassroomStore((s) => s.myRole);
  const myDisplayName = useClassroomStore((s) => s.myDisplayName);
  const isConnected = useClassroomStore((s) => s.isConnected);
  const setTeacherModalOpen = useClassroomStore((s) => s.setTeacherModalOpen);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between select-none z-30 relative shadow-md">
      {/* Left: Brand & Classroom Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
            CV
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white text-sm">CLASSVERSE</span>
            <span className="ml-1 text-[10px] uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-1.5 py-0.2 rounded">
              3D Virtual
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-700/80" />

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-slate-100 max-w-md truncate">
            {classroomTitle}
          </h1>
        </div>
      </div>

      {/* Middle: Live & Mode Indicators */}
      <div className="flex items-center gap-3">
        {/* Live or Sandbox Pill */}
        {colyseusService.isOfflineActive() ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>SANDBOX</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>LIVE</span>
          </div>
        )}

        {/* Audio Mode Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
          <Radio className="w-3.5 h-3.5 text-indigo-400" />
          <span className="capitalize">{mode} Mode</span>
        </div>

        {/* Participants Count */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{participantCount} connected</span>
        </div>
      </div>

      {/* Right: Role & Teacher Dashboard Action */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 text-xs">
          <span className="font-semibold text-slate-100">{myDisplayName}</span>
          <span className="text-[10px] text-slate-400 capitalize">({myRole})</span>
        </div>

        {myRole === 'teacher' ? (
          <button
            onClick={() => setTeacherModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Teacher Controls</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 text-xs font-semibold">
            <span>Student Mode</span>
          </div>
        )}
      </div>
    </header>
  );
}
