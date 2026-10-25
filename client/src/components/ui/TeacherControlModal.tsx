'use client';

import React, { useState } from 'react';
import { X, Shield, MicOff, MessageSquare, Volume2, Megaphone, AlertTriangle, Radio } from 'lucide-react';
import { ClassroomMode } from '@classverse/shared';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

export function TeacherControlModal() {
  const isOpen = useClassroomStore((s) => s.isTeacherModalOpen);
  const setOpen = useClassroomStore((s) => s.setTeacherModalOpen);
  const mode = useClassroomStore((s) => s.mode);
  const isChatLocked = useClassroomStore((s) => s.isChatLocked);
  const showToast = useClassroomStore((s) => s.showToast);

  const [announcementText, setAnnouncementText] = useState('');

  if (!isOpen) return null;

  const handleModeChange = (newMode: ClassroomMode) => {
    colyseusService.sendChangeMode(newMode);
    showToast(`Switched classroom mode to ${newMode.toUpperCase()}`, 'success');
  };

  const handleMuteAll = () => {
    colyseusService.sendMuteAll();
    showToast('Muted all student microphones.', 'info');
  };

  const handleToggleChat = () => {
    colyseusService.sendToggleChatLock();
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    colyseusService.sendAnnouncement(announcementText.trim());
    setAnnouncementText('');
    showToast('Announcement broadcasted to entire class!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Teacher Control Center</h2>
              <p className="text-xs text-slate-400">Classroom governance, modes, and audio controls</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Section 1: Classroom Mode */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Classroom Lesson Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleModeChange('lecture')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  mode === 'lecture'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Lecture Mode</span>
                  <Radio className={`w-4 h-4 ${mode === 'lecture' ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-xs text-slate-400">
                  Teacher speaks exclusively. Students listen and must raise hand for speaking permission.
                </p>
              </button>

              <button
                onClick={() => handleModeChange('discussion')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  mode === 'discussion'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Discussion Mode</span>
                  <Radio className={`w-4 h-4 ${mode === 'discussion' ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-xs text-slate-400">
                  Interactive class seminar. Students are authorized to speak and participate in open dialogue.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Smart Presentation Board Controls */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Interactive Presentation Screen
            </label>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Lesson Topic:</span>
                <div className="flex items-center gap-1.5">
                  {(['biology', 'physics', 'chemistry'] as const).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        colyseusService.sendChangeBoardTopic(topic);
                        showToast(`Board topic switched to ${topic.toUpperCase()}`, 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                <span className="text-xs text-slate-300 font-medium">Slide Controls:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const cur = useClassroomStore.getState().boardSlide;
                      colyseusService.sendChangeBoardSlide(Math.max(0, cur - 1));
                    }}
                    className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white"
                  >
                    ◀ Prev Slide
                  </button>
                  <button
                    onClick={() => {
                      const cur = useClassroomStore.getState().boardSlide;
                      colyseusService.sendChangeBoardSlide(cur + 1);
                    }}
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                  >
                    Next Slide ▶
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Quick Audio & Chat Actions */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Classroom Governance Actions
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleMuteAll}
                className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MicOff className="w-4 h-4 text-rose-400" />
                <span>Mute All Students</span>
              </button>

              <button
                onClick={handleToggleChat}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isChatLocked
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-amber-950/40 border-amber-800 text-amber-300 hover:bg-amber-900/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isChatLocked ? 'Unlock Student Chat' : 'Lock Student Chat'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Broadcast Announcement */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Broadcast Class Announcement
            </label>
            <form onSubmit={handleSendAnnouncement} className="space-y-2">
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Type an announcement to appear prominently for all students..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!announcementText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Broadcast to Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
