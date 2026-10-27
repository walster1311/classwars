'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Trophy, Gauge } from 'lucide-react';
import { interactionsService } from '@/lib/interactions';
import { useClassroomStore } from '@/lib/store';

interface AirplaneLauncherProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AirplaneLauncher({ isOpen, onClose }: AirplaneLauncherProps) {
  const [power, setPower] = useState(0.65);
  const [isCharging, setIsCharging] = useState(false);
  const personalBest = useClassroomStore((s) => s.airplanePersonalBest);

  // Power bar oscillation when launcher is open
  useEffect(() => {
    if (!isOpen) return;
    let frameId: number;
    let t = 0;

    const loop = () => {
      t += 0.04;
      // Oscillate smoothly between 0.35 and 1.0
      setPower(0.65 + Math.sin(t) * 0.35);
      frameId = requestAnimationFrame(loop);
    };

    if (!isCharging) {
      frameId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, isCharging]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    interactionsService.launchPaperAirplane(power);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl max-w-sm w-full relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Paper Airplane Launcher</h3>
              <p className="text-[11px] text-slate-400">Launch and glide across the classroom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aerodynamic Launch Power Meter */}
        <div className="mb-5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2 font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-400" /> Launch Power
            </span>
            <span className="text-indigo-400 font-mono text-sm">{Math.round(power * 100)}%</span>
          </div>

          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                power > 0.8
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${Math.round(power * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>Glide</span>
            <span>Balanced</span>
            <span>Speed Dart</span>
          </div>
        </div>

        {/* Personal Best Stat */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-950/40 border border-indigo-800/40 rounded-xl mb-5">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Personal Best Distance</span>
          </div>
          <span className="text-amber-400 font-bold font-mono text-sm">
            {personalBest > 0 ? `${personalBest}m` : '—'}
          </span>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Launch Paper Airplane</span>
        </button>
      </div>
    </div>
  );
}
