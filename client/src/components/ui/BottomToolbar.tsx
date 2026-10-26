'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  Hand,
  Armchair,
  Compass,
  Smile,
  LogOut,
  Lock,
  Layers,
  ScreenShare,
  ScreenShareOff,
  Monitor
} from 'lucide-react';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';
import { livekitService } from '@/lib/livekit';
import { screenShareService } from '@/lib/screenshare';

export function BottomToolbar() {
  const router = useRouter();
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  const myRole = useClassroomStore((s) => s.myRole);
  const mySeatId = useClassroomStore((s) => s.mySeatId);
  const isHandRaised = useClassroomStore((s) => s.isHandRaised);
  const canSpeak = useClassroomStore((s) => s.canSpeak);
  const isMicMuted = useClassroomStore((s) => s.isMicMuted);
  const triggerCameraReset = useClassroomStore((s) => s.triggerCameraReset);
  const wallCutoffMode = useClassroomStore((s) => s.wallCutoffMode);
  const cycleWallCutoffMode = useClassroomStore((s) => s.cycleWallCutoffMode);
  const isScreenSharing = useClassroomStore((s) => s.isScreenSharing);
  const showToast = useClassroomStore((s) => s.showToast);

  const isTeacher = myRole === 'teacher';
  const hasMicPermission = isTeacher || canSpeak;

  const handleMicToggle = async () => {
    if (!hasMicPermission) {
      showToast('You need speaking permission from the teacher to use microphone. Raise your hand!', 'error');
      return;
    }
    await livekitService.toggleMicrophone();
  };

  const handleHandToggle = () => {
    if (isHandRaised) {
      colyseusService.sendLowerHand();
      showToast('Hand lowered', 'info');
    } else {
      colyseusService.sendRaiseHand();
      showToast('Hand raised! The teacher has been notified.', 'success');
    }
  };

  const handleSeatToggle = () => {
    if (mySeatId) {
      colyseusService.sendStand();
      showToast('Stood up from seat', 'info');
    } else {
      showToast('Click directly on any available chair in the 3D room to sit down.', 'info');
    }
  };

  const handleLeave = () => {
    colyseusService.disconnect();
    livekitService.disconnect();
    router.push('/');
  };

  const reactions = ['👏', '👍', '❤️', '💡', '🎉', '🔥', '🙌', '⭐'];

  return (
    <footer className="h-16 border-t border-slate-800 bg-slate-900 px-6 flex items-center justify-between select-none z-30 relative shadow-2xl">
      {/* Left: Status note */}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Connected</span>
        </div>
        {mySeatId && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium border border-slate-700">
            Seated ({mySeatId})
          </span>
        )}
      </div>

      {/* Center: Primary Interaction Actions */}
      <div className="flex items-center gap-2">
        {/* Microphone Toggle */}
        <button
          onClick={handleMicToggle}
          title={
            hasMicPermission
              ? isMicMuted
                ? 'Unmute Microphone'
                : 'Mute Microphone'
              : 'Speaking permission required'
          }
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 ${
            !hasMicPermission
              ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : isMicMuted
              ? 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-rose-600/20'
              : 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-emerald-600/20'
          }`}
        >
          {!hasMicPermission ? (
            <Lock className="w-4 h-4 text-slate-500" />
          ) : isMicMuted ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4 animate-pulse" />
          )}
          <span>
            {!hasMicPermission
              ? 'Mic Locked'
              : isMicMuted
              ? 'Unmute'
              : 'Mute'}
          </span>
        </button>

        {/* Teacher Desktop Screen Share onto Blackboard */}
        {isTeacher ? (
          <button
            onClick={() => screenShareService.toggleScreenShare()}
            title={isScreenSharing ? 'Stop sharing desktop screen' : 'Share desktop screen onto blackboard'}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 ${
              isScreenSharing
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30 ring-2 ring-rose-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            {isScreenSharing ? (
              <ScreenShareOff className="w-4 h-4" />
            ) : (
              <ScreenShare className="w-4 h-4" />
            )}
            <span>{isScreenSharing ? 'Stop Screen' : 'Share Screen'}</span>
          </button>
        ) : isScreenSharing ? (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold shadow-indigo-900/20">
            <Monitor className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Screen: Live</span>
          </div>
        ) : null}

        {/* Raise Hand Button */}
        <button
          onClick={handleHandToggle}
          title={isHandRaised ? 'Lower Hand' : 'Raise Hand to Speak'}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 ${
            isHandRaised
              ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold shadow-amber-500/30 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Hand className="w-4 h-4" />
          <span>{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
        </button>

        {/* Sit / Stand Button */}
        <button
          onClick={handleSeatToggle}
          title={mySeatId ? 'Stand up from seat' : 'Click a chair in 3D to sit'}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 ${
            mySeatId
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Armchair className="w-4 h-4" />
          <span>{mySeatId ? 'Stand Up' : 'Sit at Desk'}</span>
        </button>

        {/* Reactions Popover */}
        <div className="relative">
          <button
            onClick={() => setShowReactionsMenu(!showReactionsMenu)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Emoji Reactions"
          >
            <Smile className="w-4 h-4" />
          </button>

          {showReactionsMenu && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex items-center gap-1 z-50">
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    colyseusService.sendReaction(emoji);
                    setShowReactionsMenu(false);
                  }}
                  className="p-1.5 text-lg rounded-lg hover:bg-slate-800 transition-transform active:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wall Cutoff Mode Toggle */}
        <button
          onClick={cycleWallCutoffMode}
          title="Toggle Wall Cutoff: Auto Orbit Cutoff / Cut Off All / Full Walls"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
            wallCutoffMode === 'auto'
              ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60'
              : wallCutoffMode === 'cutoff'
              ? 'bg-amber-950/60 border-amber-700/60 text-amber-300 hover:bg-amber-900/60'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            {wallCutoffMode === 'auto'
              ? 'Walls: Auto Cutoff'
              : wallCutoffMode === 'cutoff'
              ? 'Walls: Cut Off'
              : 'Walls: Full'}
          </span>
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={triggerCameraReset}
          title="Reset 3D Camera View to Default Isometric Angle"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
        >
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Reset View</span>
        </button>
      </div>

      {/* Right: Leave Classroom */}
      <div>
        <button
          onClick={handleLeave}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold shadow-md transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Class</span>
        </button>
      </div>
    </footer>
  );
}
