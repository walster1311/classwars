'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  Shield,
  Volume2,
  Armchair,
  Radio
} from 'lucide-react';
import { UserRole } from '@classverse/shared';

const AVATAR_COLORS = [
  { name: 'Emerald', value: '#10B981' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
];

export default function LobbyPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>('teacher');
  const [displayName, setDisplayName] = useState('Dr. Evelyn Reed');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [classroomId, setClassroomId] = useState('bio-101');

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'teacher' && displayName.startsWith('Student')) {
      setDisplayName('Dr. Evelyn Reed');
      setSelectedColor('#6366F1');
    } else if (newRole === 'student' && displayName.startsWith('Dr.')) {
      setDisplayName(`Student ${Math.floor(Math.random() * 900 + 100)}`);
      setSelectedColor('#10B981');
    }
  };

  const handleEnterClassroom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetRoom = (classroomId || 'bio-101').trim().toLowerCase();

    // Use or create a persistent client user ID
    let uid = typeof window !== 'undefined' ? localStorage.getItem('classverse_user_id') : null;
    if (!uid) {
      uid = `usr_${Math.random().toString(36).substring(2, 9)}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('classverse_user_id', uid);
      }
    }

    const query = new URLSearchParams({
      role,
      name: displayName || (role === 'teacher' ? 'Teacher' : 'Student'),
      color: selectedColor,
      uid
    });

    if (role === 'student') {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:2567';
        const res = await fetch(`${serverUrl}/api/profiles/${uid}/validate-entry?role=student`);
        if (res.ok) {
          const data = await res.json();
          if (!data.allowed) {
            router.push(`/character-selection?${query.toString()}&classroomId=${targetRoom}`);
            return;
          }
        }
      } catch (err) {
        console.warn('[Lobby] Profile validation error:', err);
      }
    }

    router.push(`/classroom/${targetRoom}?${query.toString()}`);
  };

  const launchTestSession = async (testRole: UserRole, testName: string, testColor: string) => {
    const targetRoom = (classroomId || 'bio-101').trim().toLowerCase();
    const isAlex = testName.toLowerCase().includes('alex');
    const isMaya = testName.toLowerCase().includes('maya');
    const uid = isAlex ? 'student_alex' : isMaya ? 'student_maya' : `usr_${Math.random().toString(36).substring(2, 9)}`;

    const query = new URLSearchParams({
      role: testRole,
      name: testName,
      color: testColor,
      uid
    });

    if (testRole === 'student') {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:2567';
        const res = await fetch(`${serverUrl}/api/profiles/${uid}/validate-entry?role=student`);
        if (res.ok) {
          const data = await res.json();
          if (!data.allowed) {
            window.open(`/character-selection?${query.toString()}&classroomId=${targetRoom}`, '_blank');
            return;
          }
        }
      } catch (err) {
        console.warn('[Lobby] Test session validation error:', err);
      }
    }

    window.open(`/classroom/${targetRoom}?${query.toString()}`, '_blank');
  };

  return (
    <div className="w-screen h-screen overflow-y-auto bg-slate-950 text-white flex flex-col justify-between select-none">
      {/* Lobby Navigation Header */}
      <header className="px-8 py-5 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md bg-slate-900/60 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30">
            CV
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight">CLASSVERSE</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300">
              Multiplayer 3D Virtual Classroom
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Colyseus WebSocket Server</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>LiveKit Live Audio</span>
          </div>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col lg:flex-row items-center gap-12 justify-center">
        {/* Left Side: Pitch and Architecture */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Real-Time Authoritative Multiplayer</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Step Inside the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">3D Classroom</span>.
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            CLASSVERSE connects teachers and students inside a shared isometric virtual environment. Move around, sit at desks, chat in real time, raise hands, and communicate through live permission-governed voice.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <Armchair className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Authoritative Seating</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Server-enforced seat locking prevents double occupancy.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Teacher Governance</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Control student microphones, chat permissions, and lesson mode.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Setup Card */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleEnterClassroom} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1. Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('teacher')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    role === 'teacher'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <div className="text-left">
                    <div className="text-xs font-bold">Teacher</div>
                    <div className="text-[10px] text-slate-400">Classroom Host</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    role === 'student'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-xs font-bold">Student</div>
                    <div className="text-[10px] text-slate-400">Participant</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                2. Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                3. Avatar Shirt Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setSelectedColor(col.value)}
                    style={{ backgroundColor: col.value }}
                    className={`w-8 h-8 rounded-full transition-transform active:scale-90 ${
                      selectedColor === col.value
                        ? 'ring-4 ring-offset-2 ring-offset-slate-900 ring-white scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Classroom Room Code */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                4. Classroom Code
              </label>
              <input
                type="text"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                placeholder="e.g. bio-101"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono uppercase"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>ENTER 3D CLASSROOM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Multi-Window Tester */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Instant Multi-Client Test</span>
              <span className="text-[10px] text-indigo-400 font-normal">Opens New Tab</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => launchTestSession('teacher', 'Prof. Anderson (Teacher)', '#6366F1')}
                className="p-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/60 text-[11px] font-semibold text-indigo-300 transition-colors"
              >
                + Teacher
              </button>
              <button
                type="button"
                onClick={() => launchTestSession('student', 'Alex (Student 1)', '#10B981')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
              >
                + Student 1
              </button>
              <button
                type="button"
                onClick={() => launchTestSession('student', 'Maya (Student 2)', '#F59E0B')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
              >
                + Student 2
              </button>
              <button
                type="button"
                onClick={() => launchTestSession('student', 'Liam (Student 3)', '#0EA5E9')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
              >
                + Student 3
              </button>
              <button
                type="button"
                onClick={() => launchTestSession('student', 'Sophia (Student 4)', '#F43F5E')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
              >
                + Student 4
              </button>
              <button
                type="button"
                onClick={() => launchTestSession('student', 'Noah (Student 5)', '#A855F7')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
              >
                + Student 5
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        CLASSVERSE 3D Virtual Classroom • Server Authoritative Colyseus • LiveKit WebRTC Voice Engine
      </footer>
    </div>
  );
}
