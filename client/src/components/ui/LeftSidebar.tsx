'use client';

import React, { useState } from 'react';
import { Hand, Users, Mic, MicOff, Check, X, Shield, Volume2 } from 'lucide-react';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<'roster' | 'queue'>('queue');
  const players = useClassroomStore((s) => s.players);
  const myRole = useClassroomStore((s) => s.myRole);
  const mySessionId = useClassroomStore((s) => s.mySessionId);
  const activeSpeakers = useClassroomStore((s) => s.activeSpeakers);

  const playerList = Object.values(players);
  
  // Hand raise queue sorted by FIFO (earliest hand raise first)
  const raisedHandsQueue = playerList
    .filter((p) => p.isHandRaised)
    .sort((a, b) => a.handRaiseTime - b.handRaiseTime);

  const isTeacher = myRole === 'teacher';

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-3.5rem-4.5rem)] select-none z-20 shadow-lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 p-1.5 gap-1 bg-slate-950/60">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'queue'
              ? 'bg-slate-800 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span>Hand Queue</span>
          {raisedHandsQueue.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              {raisedHandsQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'roster'
              ? 'bg-slate-800 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Class Roster ({playerList.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'queue' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Raised Hands Queue
              </span>
              {isTeacher && raisedHandsQueue.length > 1 && (
                <button
                  onClick={() => {
                    raisedHandsQueue.forEach((p) => colyseusService.sendLowerHand(p.sessionId));
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {raisedHandsQueue.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                <Hand className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
                <p>No students currently raising their hands.</p>
                <p className="text-[10px] text-slate-600 mt-1">Students can raise hand from the bottom toolbar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {raisedHandsQueue.map((student, idx) => (
                  <div
                    key={student.sessionId}
                    className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {student.displayName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {student.seatId ? `Seated at ${student.seatId}` : 'Standing'}
                        </div>
                      </div>
                    </div>

                    {isTeacher && (
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        <button
                          onClick={() => colyseusService.sendApproveHand(student.sessionId)}
                          title="Grant speaking permission"
                          className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => colyseusService.sendLowerHand(student.sessionId)}
                          title="Dismiss hand"
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              All Connected Participants ({playerList.length})
            </div>
            <div className="space-y-1.5">
              {playerList.map((player) => {
                const isSpeaker = activeSpeakers.has(player.sessionId) || player.isSpeaking;
                const isMe = player.sessionId === mySessionId;

                return (
                  <div
                    key={player.sessionId}
                    className={`p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      isMe ? 'bg-indigo-950/40 border border-indigo-800/50' : 'bg-slate-800/50 border border-slate-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: player.avatarColor || '#38bdf8' }}
                      />
                      <div className="truncate">
                        <span className="font-medium text-slate-200">
                          {player.displayName} {isMe && '(You)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Role Pill */}
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          player.role === 'teacher'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {player.role}
                      </span>

                      {/* Mic / Speaking Indicator */}
                      {isSpeaker ? (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      ) : player.canSpeak ? (
                        <Mic className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <MicOff className="w-3.5 h-3.5 text-slate-600" />
                      )}

                      {/* Teacher Mic Permission Toggle */}
                      {isTeacher && player.role !== 'teacher' && (
                        <button
                          onClick={() => colyseusService.sendSetMicPermission(player.sessionId, !player.canSpeak)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                        >
                          {player.canSpeak ? 'Revoke' : 'Allow'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
