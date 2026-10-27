'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  MicOff,
  MessageSquare,
  Megaphone,
  Radio,
  Sparkles,
  Zap,
  Music,
  Send,
  Hand,
  Users,
  Smile,
  StopCircle,
  CheckCircle2,
  Sliders,
  UserX,
  UserCheck,
  Ban
} from 'lucide-react';
import { ClassroomMode, FunInteractionMode } from '@classverse/shared';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

export function TeacherControlModal() {
  const isOpen = useClassroomStore((s) => s.isTeacherModalOpen);
  const setOpen = useClassroomStore((s) => s.setTeacherModalOpen);
  const mode = useClassroomStore((s) => s.mode);
  const isChatLocked = useClassroomStore((s) => s.isChatLocked);
  const showToast = useClassroomStore((s) => s.showToast);

  // Social & Fun Interactions state
  const funActionsMode = useClassroomStore((s) => s.funActionsMode);
  const allowPaperBall = useClassroomStore((s) => s.allowPaperBall);
  const allowHighFive = useClassroomStore((s) => s.allowHighFive);
  const allowDanceBattle = useClassroomStore((s) => s.allowDanceBattle);
  const allowEmoji = useClassroomStore((s) => s.allowEmoji);
  const allowFollow = useClassroomStore((s) => s.allowFollow);
  const allowPowerUp = useClassroomStore((s) => s.allowPowerUp);
  const allowPaperAirplane = useClassroomStore((s) => s.allowPaperAirplane);
  const players = useClassroomStore((s) => s.players);

  const studentList = Object.values(players).filter((p) => p.role !== 'teacher');

  const [announcementText, setAnnouncementText] = useState('');

  if (!isOpen) return null;

  const handleModeChange = (newMode: ClassroomMode) => {
    colyseusService.sendChangeMode(newMode);
    showToast(`Switched classroom mode to ${newMode.toUpperCase()}`, 'success');
  };

  const handleInteractionModeChange = (newMode: FunInteractionMode) => {
    colyseusService.sendTeacherUpdateInteractions({ funActionsMode: newMode });
    showToast(`Classroom interaction mode changed to ${newMode.toUpperCase()}`, 'success');
  };

  const handleToggleFeature = (feature: string, currentVal: boolean) => {
    colyseusService.sendTeacherUpdateInteractions({ [feature]: !currentVal });
  };

  const handleEnableAllFeatures = () => {
    colyseusService.sendTeacherUpdateInteractions({
      allowPaperBall: true,
      allowHighFive: true,
      allowDanceBattle: true,
      allowEmoji: true,
      allowFollow: true,
      allowPowerUp: true,
      allowPaperAirplane: true
    });
    showToast('All classroom fun actions enabled', 'success');
  };

  const handleDisableAllFeatures = () => {
    colyseusService.sendTeacherUpdateInteractions({
      allowPaperBall: false,
      allowHighFive: false,
      allowDanceBattle: false,
      allowEmoji: false,
      allowFollow: false,
      allowPowerUp: false,
      allowPaperAirplane: false
    });
    showToast('All classroom fun actions disabled', 'info');
  };

  const handleStopAllInteractions = () => {
    colyseusService.sendTeacherUpdateInteractions({ stopAllActive: true });
    showToast('Halted all active classroom interactions!', 'info');
  };

  const handleToggleStudentMute = (studentSessionId: string, currentlyDisabled: boolean) => {
    colyseusService.sendTeacherUpdateInteractions({
      targetStudentSessionId: studentSessionId,
      studentDisabled: !currentlyDisabled
    });
    showToast(
      currentlyDisabled ? 'Restored student fun action permissions' : 'Muted student fun actions',
      'info'
    );
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

          {/* Section 4: Classroom Social & Fun Action Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Classroom Fun & Social Controls
                </label>
                <p className="text-[11px] text-slate-400">
                  Manage student socialization, 3D animations, and playful activities
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                funActionsMode === 'lesson'
                  ? 'bg-amber-950/50 text-amber-300 border-amber-800/80'
                  : funActionsMode === 'break'
                  ? 'bg-blue-950/50 text-blue-300 border-blue-800/80'
                  : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/80'
              }`}>
                {funActionsMode.replace('_', ' ')}
              </span>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleInteractionModeChange('lesson')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  funActionsMode === 'lesson'
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-md shadow-amber-600/20'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5 mb-0.5 text-amber-300">
                  <span>📚</span>
                  <span>Lesson Mode</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">Focus & silence. Distractions restricted.</p>
              </button>

              <button
                type="button"
                onClick={() => handleInteractionModeChange('break')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  funActionsMode === 'break'
                    ? 'bg-blue-950/40 border-blue-500 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5 mb-0.5 text-blue-300">
                  <span>☕</span>
                  <span>Break Mode</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">Recess fun. High fives, dance & socialize.</p>
              </button>

              <button
                type="button"
                onClick={() => handleInteractionModeChange('free_play')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  funActionsMode === 'free_play'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5 mb-0.5 text-emerald-300">
                  <span>🎮</span>
                  <span>Free Play</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">Everything unlocked for classroom party.</p>
              </button>
            </div>

            {/* Quick Batch Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleEnableAllFeatures}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-emerald-900/40 border border-slate-700 hover:border-emerald-600/60 text-slate-300 hover:text-emerald-300 text-[11px] font-semibold transition-all"
              >
                ✓ Enable All (7)
              </button>
              <button
                type="button"
                onClick={handleDisableAllFeatures}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-600/60 text-slate-300 hover:text-rose-300 text-[11px] font-semibold transition-all"
              >
                ✕ Disable All
              </button>
              <button
                type="button"
                onClick={handleStopAllInteractions}
                className="py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-700 text-rose-200 text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Stop Active</span>
              </button>
            </div>

            {/* 7 Individual Toggles Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { key: 'allowPaperBall', label: 'Paper Ball Toss', icon: '🎯', active: allowPaperBall },
                { key: 'allowHighFive', label: 'High Five', icon: '🙌', active: allowHighFive },
                { key: 'allowDanceBattle', label: 'Dance Battle', icon: '🎵', active: allowDanceBattle },
                { key: 'allowEmoji', label: 'Emoji Reactions', icon: '😀', active: allowEmoji },
                { key: 'allowFollow', label: 'Follow Friend', icon: '🚶', active: allowFollow },
                { key: 'allowPowerUp', label: 'Anime Power-Up', icon: '⚡', active: allowPowerUp },
                { key: 'allowPaperAirplane', label: 'Paper Airplanes', icon: '✈️', active: allowPaperAirplane },
              ].map((feat) => (
                <button
                  key={feat.key}
                  type="button"
                  onClick={() => handleToggleFeature(feat.key, feat.active)}
                  className={`flex items-center justify-between p-2 rounded-xl border text-left text-xs transition-all ${
                    feat.active
                      ? 'bg-slate-800/80 border-indigo-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{feat.icon}</span>
                    <span className="font-semibold text-[11px]">{feat.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    feat.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {feat.active ? 'ON' : 'OFF'}
                  </span>
                </button>
              ))}
            </div>

            {/* Student Moderation Section */}
            {studentList.length > 0 && (
              <div className="pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Student Moderation & Permissions ({studentList.length})
                </label>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl divide-y divide-slate-800/60 max-h-36 overflow-y-auto">
                  {studentList.map((st) => (
                    <div key={st.sessionId} className="px-3 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: st.avatarColor || '#6366f1' }}
                        >
                          {st.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200 text-xs">{st.displayName}</span>
                        {st.isInteractionDisabled && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-400 border border-rose-800 font-semibold">
                            Muted
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleStudentMute(st.sessionId, !!st.isInteractionDisabled)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                          st.isInteractionDisabled
                            ? 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700 text-emerald-300'
                            : 'bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-300'
                        }`}
                      >
                        {st.isInteractionDisabled ? 'Restore Access' : 'Restrict Student'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Broadcast Announcement */}
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
