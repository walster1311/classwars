'use client';

import React, { useEffect, useState } from 'react';
import { Check, X, Users, Sparkles, Music } from 'lucide-react';
import { useClassroomStore } from '@/lib/store';
import { interactionsService } from '@/lib/interactions';

export function InteractionInviteModal() {
  const pendingInvite = useClassroomStore((s) => s.pendingInvite);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!pendingInvite) return;
    setTimeLeft(10);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          useClassroomStore.getState().setPendingInvite(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingInvite]);

  if (!pendingInvite) return null;

  const handleAccept = () => {
    interactionsService.respondToInvite(pendingInvite.id, true);
  };

  const handleDecline = () => {
    interactionsService.respondToInvite(pendingInvite.id, false);
  };

  const titles: Record<string, { label: string; icon: string; desc: string }> = {
    high_five: {
      label: 'High Five Request!',
      icon: '🙌',
      desc: 'wants to give you a synchronized high-five!'
    },
    dance_battle: {
      label: 'Dance Battle Challenge!',
      icon: '🎵',
      desc: 'challenged you to a 10-second classroom dance battle!'
    },
    follow: {
      label: 'Follow Friend Request!',
      icon: '👣',
      desc: 'wants to follow you as you explore the classroom!'
    }
  };

  const info = titles[pendingInvite.type] || {
    label: 'Playful Action Request',
    icon: '✨',
    desc: 'wants to interact with you!'
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-200 select-none">
      <div className="bg-slate-900/95 border-2 border-indigo-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-sm w-80 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">{info.icon}</span>
          <h4 className="font-bold text-white text-sm">{info.label}</h4>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          <span className="font-semibold text-indigo-300">{pendingInvite.initiatorName}</span> {info.desc}
        </p>

        {/* Progress timer */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-indigo-500 h-full transition-all duration-1000"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>

        {/* Accept / Decline buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecline}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Decline</span>
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept ({timeLeft}s)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
