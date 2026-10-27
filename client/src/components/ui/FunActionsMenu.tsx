'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  Zap,
  Users,
  Target,
  UserCheck,
  Footprints
} from 'lucide-react';
import { useClassroomStore } from '@/lib/store';
import { interactionsService } from '@/lib/interactions';
import { EmojiWheel } from './EmojiWheel';
import { AirplaneLauncher } from './AirplaneLauncher';
import { DanceStyle, PowerUpColor } from '@classverse/shared';

export function FunActionsMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEmojiWheelOpen, setIsEmojiWheelOpen] = useState(false);
  const [isAirplaneLauncherOpen, setIsAirplaneLauncherOpen] = useState(false);

  // Active sub-pickers
  const [activeModal, setActiveModal] = useState<
    'target_paper_ball' | 'target_high_five' | 'target_dance_battle' | 'target_follow' | 'power_up_color' | null
  >(null);
  const [selectedDance, setSelectedDance] = useState<DanceStyle>('cute_side_step');

  const mySessionId = useClassroomStore((s) => s.mySessionId);
  const myRole = useClassroomStore((s) => s.myRole);
  const players = useClassroomStore((s) => s.players);
  const funActionsMode = useClassroomStore((s) => s.funActionsMode);
  const allowPaperBall = useClassroomStore((s) => s.allowPaperBall);
  const allowHighFive = useClassroomStore((s) => s.allowHighFive);
  const allowDanceBattle = useClassroomStore((s) => s.allowDanceBattle);
  const allowEmoji = useClassroomStore((s) => s.allowEmoji);
  const allowFollow = useClassroomStore((s) => s.allowFollow);
  const allowPowerUp = useClassroomStore((s) => s.allowPowerUp);
  const allowPaperAirplane = useClassroomStore((s) => s.allowPaperAirplane);
  const followingSessionId = useClassroomStore((s) => s.followingSessionId);
  const showToast = useClassroomStore((s) => s.showToast);

  const isLesson = funActionsMode === 'lesson';

  // Available students list (excluding self)
  const otherStudents = Object.values(players).filter(
    (p) => p.sessionId !== mySessionId && p.role === 'student'
  );

  const followingTarget = followingSessionId ? players[followingSessionId] : null;

  const actions = [
    {
      id: 'paper_ball',
      label: 'Paper Ball Toss',
      icon: '🧻',
      allowed: !isLesson && allowPaperBall,
      tooltip: 'Throw a paper ball at a classmate’s desk!',
      onClick: () => {
        if (otherStudents.length > 0) {
          setActiveModal('target_paper_ball');
        } else {
          interactionsService.tossPaperBall();
        }
      }
    },
    {
      id: 'high_five',
      label: 'High Five',
      icon: '🙌',
      allowed: allowHighFive,
      tooltip: 'Synchronized high-five with a nearby friend!',
      onClick: () => {
        if (otherStudents.length === 0) {
          showToast('No other students nearby to high-five!', 'info');
          return;
        }
        setActiveModal('target_high_five');
      }
    },
    {
      id: 'dance_battle',
      label: 'Dance Battle',
      icon: '🎵',
      allowed: !isLesson && allowDanceBattle,
      tooltip: 'Challenge a classmate to a 10-second dance battle!',
      onClick: () => {
        if (otherStudents.length === 0) {
          showToast('No other students in the room for a dance battle!', 'info');
          return;
        }
        setActiveModal('target_dance_battle');
      }
    },
    {
      id: 'emoji',
      label: 'Emoji Reactions',
      icon: '😂',
      allowed: allowEmoji,
      tooltip: 'Floating 3D emoji and anime facial reactions',
      onClick: () => setIsEmojiWheelOpen(true)
    },
    {
      id: 'follow',
      label: 'Follow Friend',
      icon: '👣',
      allowed: !isLesson && allowFollow,
      tooltip: 'Follow another student around the classroom',
      onClick: () => {
        if (followingSessionId) {
          interactionsService.cancelFollow();
          return;
        }
        if (otherStudents.length === 0) {
          showToast('No friends available to follow!', 'info');
          return;
        }
        setActiveModal('target_follow');
      }
    },
    {
      id: 'power_up',
      label: 'Anime Power-Up',
      icon: '⚡',
      allowed: !isLesson && allowPowerUp,
      tooltip: 'Supercharged anime aura transformation!',
      onClick: () => setActiveModal('power_up_color')
    },
    {
      id: 'paper_airplane',
      label: 'Paper Airplane',
      icon: '✈️',
      allowed: !isLesson && allowPaperAirplane,
      tooltip: 'Fold and glide a paper airplane across the room',
      onClick: () => setIsAirplaneLauncherOpen(true)
    }
  ];

  return (
    <>
      {/* Active Following Status Bar */}
      {followingTarget && (
        <div className="fixed top-20 left-6 z-40 animate-in slide-in-from-left duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-indigo-950/90 border border-indigo-700/80 shadow-2xl backdrop-blur-md">
            <Footprints className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              Following <span className="text-indigo-300 font-bold">{followingTarget.displayName}</span>
            </span>
            <button
              onClick={() => interactionsService.cancelFollow()}
              className="ml-2 px-2.5 py-0.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-[11px] font-bold transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Floating CLASSVERSE — FUN ACTIONS Dock */}
      <div className="fixed bottom-20 left-6 z-40 select-none">
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-200 w-64">
          {/* Header Bar */}
          <button
            type="button"
            data-testid="fun-actions-toggle"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full px-3.5 py-2.5 bg-slate-950/70 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="text-xs font-bold text-slate-200 tracking-wide">
                CLASSVERSE • FUN ACTIONS
              </span>
            </div>
            <span className="text-slate-400 hover:text-white">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </span>
          </button>

          {/* Action List */}
          {isExpanded && (
            <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
              {actions.map((act) => {
                const cooldown = interactionsService.getCooldownRemaining(act.id as any);
                const isLocked = !act.allowed;

                return (
                  <button
                    key={act.id}
                    onClick={isLocked || cooldown > 0 ? undefined : act.onClick}
                    disabled={isLocked || cooldown > 0}
                    title={act.tooltip}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all group ${
                      isLocked
                        ? 'opacity-40 cursor-not-allowed bg-slate-950/30 text-slate-500'
                        : cooldown > 0
                        ? 'bg-slate-800/40 text-slate-400 cursor-not-allowed'
                        : 'hover:bg-indigo-600/20 text-slate-200 hover:text-white active:scale-98'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base group-hover:scale-110 transition-transform">
                        {act.icon}
                      </span>
                      <span>{act.label}</span>
                    </div>

                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    ) : cooldown > 0 ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                        {cooldown}s
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Target Selector Modal (For Paper Ball Toss, High Five, Follow) */}
      {activeModal && activeModal !== 'power_up_color' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>
                {activeModal === 'target_paper_ball' && 'Select Student to Toss At'}
                {activeModal === 'target_high_five' && 'Select Classmate to High Five'}
                {activeModal === 'target_dance_battle' && 'Challenge to Dance Battle'}
                {activeModal === 'target_follow' && 'Select Friend to Follow'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">Choose an active student in the classroom</p>

            {/* If dance battle, allow dance style selection */}
            {activeModal === 'target_dance_battle' && (
              <div className="mb-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
                  Your Dance Style
                </span>
                <select
                  value={selectedDance}
                  onChange={(e) => setSelectedDance(e.target.value as DanceStyle)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="cute_side_step">Cute Side-Step</option>
                  <option value="anime_victory">Anime Victory Dance</option>
                  <option value="funny_robot">Funny Robot Dance</option>
                  <option value="jump_and_spin">Jump and Spin</option>
                  <option value="silly_freestyle">Silly Freestyle</option>
                </select>
              </div>
            )}

            {/* Students list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4">
              {otherStudents.map((st) => (
                <button
                  key={st.sessionId}
                  onClick={() => {
                    if (activeModal === 'target_paper_ball') {
                      interactionsService.tossPaperBall(st.sessionId, { x: st.x, y: 0.8, z: st.z });
                    } else if (activeModal === 'target_high_five') {
                      interactionsService.requestHighFive(st.sessionId);
                    } else if (activeModal === 'target_dance_battle') {
                      interactionsService.requestDanceBattle(st.sessionId, selectedDance);
                    } else if (activeModal === 'target_follow') {
                      interactionsService.requestFollow(st.sessionId);
                    }
                    setActiveModal(null);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 hover:bg-indigo-600/30 border border-slate-700/60 text-slate-200 text-xs font-semibold hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: st.avatarColor || '#10b981' }}
                    />
                    <span>{st.displayName}</span>
                  </div>
                  <span className="text-[10px] text-indigo-400">Select</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Anime Power-Up Color Picker Modal */}
      {activeModal === 'power_up_color' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-150 text-center">
            <span className="text-3xl mb-2 inline-block animate-bounce">⚡</span>
            <h3 className="font-bold text-white text-base mb-1">Anime Power-Up</h3>
            <p className="text-xs text-slate-400 mb-4">Choose your original transformation aura color</p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { id: 'golden', label: 'Golden Yellow', color: '#f59e0b', ring: 'ring-amber-400', desc: 'Solar Surge' },
                { id: 'blue', label: 'Electric Blue', color: '#38bdf8', ring: 'ring-cyan-400', desc: 'Ki Flow' },
                { id: 'purple', label: 'Violet Purple', color: '#a855f7', ring: 'ring-purple-400', desc: 'Mystic Surge' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    interactionsService.triggerPowerUp(c.id as PowerUpColor);
                    setActiveModal(null);
                  }}
                  className="flex flex-col items-center p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500 hover:scale-105 active:scale-95 transition-all group"
                >
                  <div
                    className={`w-7 h-7 rounded-full shadow-lg mb-2 group-hover:ring-2 ${c.ring}`}
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-xs font-bold text-slate-100">{c.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{c.desc}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Emoji Wheel Modal */}
      <EmojiWheel isOpen={isEmojiWheelOpen} onClose={() => setIsEmojiWheelOpen(false)} />

      {/* Paper Airplane Launcher Modal */}
      <AirplaneLauncher isOpen={isAirplaneLauncherOpen} onClose={() => setIsAirplaneLauncherOpen(false)} />
    </>
  );
}
