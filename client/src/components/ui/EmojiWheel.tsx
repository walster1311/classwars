'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { EMOJI_DEFINITIONS, EmojiDefinition } from '@classverse/shared';
import { interactionsService } from '@/lib/interactions';

interface EmojiWheelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmojiWheel({ isOpen, onClose }: EmojiWheelProps) {
  if (!isOpen) return null;

  const handleSelect = (emoji: EmojiDefinition) => {
    interactionsService.triggerEmoji(emoji.id, emoji.char);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl max-w-sm w-full relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">😂</span>
            <h3 className="font-bold text-slate-100 text-sm">Classroom Emojis</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 10 Expressive Emojis Grid */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {EMOJI_DEFINITIONS.map((emoji) => (
            <button
              key={emoji.id}
              onClick={() => handleSelect(emoji)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/60 hover:scale-110 active:scale-95 transition-all group"
              title={`${emoji.label} (${emoji.facialAnim})`}
            >
              <span className="text-2xl filter drop-shadow group-hover:scale-125 transition-transform">
                {emoji.char}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-200 mt-1 truncate max-w-[50px]">
                {emoji.label}
              </span>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Floats above avatar & plays facial emotion</span>
        </p>
      </div>
    </div>
  );
}
