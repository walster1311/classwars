'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CLASSROOM_BOUNDS } from '@classverse/shared';
import { ClassroomScene } from './ClassroomScene';
import { CameraController } from './CameraController';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';
import { getPlayerTransform, setPlayerTransform } from '@/lib/transforms';
import { interactionsService } from '@/lib/interactions';

export function ClassroomCanvas() {
  const mySessionId = useClassroomStore((s) => s.mySessionId);
  const mySeatId = useClassroomStore((s) => s.mySeatId);

  // Keyboard navigation state (WASD / Arrows only)
  const keysDown = useRef<Record<string, boolean>>({});
  const lastSentPos = useRef({ x: 0, y: 0, z: 0, rotY: 0 });
  const lastSendTime = useRef(0);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysDown.current[key] = true;
        if (mySeatId) {
          colyseusService.sendStand();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keysDown.current[key]) {
        keysDown.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mySeatId]);

  // Main client-side movement loop (60 FPS tick)
  useEffect(() => {
    if (!mySessionId) return;

    let animFrame: number;
    const speed = 0.08;

    const tick = () => {
      const player = useClassroomStore.getState().players[mySessionId];
      if (player && !player.seatId) {
        let dx = 0;
        let dz = 0;

        // Check Keyboard Inputs (WASD / Arrow Keys)
        if (keysDown.current['w'] || keysDown.current['arrowup']) dz -= speed;
        if (keysDown.current['s'] || keysDown.current['arrowdown']) dz += speed;
        if (keysDown.current['a'] || keysDown.current['arrowleft']) dx -= speed;
        if (keysDown.current['d'] || keysDown.current['arrowright']) dx += speed;

        const curTrans = getPlayerTransform(mySessionId);
        const curX = curTrans ? curTrans.x : player.x;
        const curZ = curTrans ? curTrans.z : player.z;
        const curRotY = curTrans ? curTrans.rotY : player.rotY;

        let isMoving = false;
        let newX = curX;
        let newZ = curZ;
        let newRotY = curRotY;

        const followingSessionId = useClassroomStore.getState().followingSessionId;

        if (dx !== 0 || dz !== 0) {
          // Manual movement immediately cancels following
          if (followingSessionId) {
            interactionsService.cancelFollow();
          }

          // Normalize diagonal movement
          if (dx !== 0 && dz !== 0) {
            dx *= 0.7071;
            dz *= 0.7071;
          }

          newX = Math.max(CLASSROOM_BOUNDS.minX, Math.min(CLASSROOM_BOUNDS.maxX, curX + dx));
          newZ = Math.max(CLASSROOM_BOUNDS.minZ, Math.min(CLASSROOM_BOUNDS.maxZ, curZ + dz));
          newRotY = Math.atan2(dx, dz);
          isMoving = true;
        } else if (followingSessionId) {
          // Follow Friend Autopilot (maintains 1.2m - 1.5m comfortable distance)
          const targetPlayer = useClassroomStore.getState().players[followingSessionId];
          const targetTrans = getPlayerTransform(followingSessionId);
          const tx = targetTrans ? targetTrans.x : (targetPlayer ? targetPlayer.x : curX);
          const tz = targetTrans ? targetTrans.z : (targetPlayer ? targetPlayer.z : curZ);

          const toTargetX = tx - curX;
          const toTargetZ = tz - curZ;
          const distToTarget = Math.hypot(toTargetX, toTargetZ);

          if (distToTarget > 1.35) {
            const stepSpeed = Math.min(speed, (distToTarget - 1.2) * 0.1);
            dx = (toTargetX / distToTarget) * stepSpeed;
            dz = (toTargetZ / distToTarget) * stepSpeed;

            newX = Math.max(CLASSROOM_BOUNDS.minX, Math.min(CLASSROOM_BOUNDS.maxX, curX + dx));
            newZ = Math.max(CLASSROOM_BOUNDS.minZ, Math.min(CLASSROOM_BOUNDS.maxZ, curZ + dz));
            newRotY = Math.atan2(toTargetX, toTargetZ);
            isMoving = true;
          } else {
            // Reached target, face them
            newRotY = Math.atan2(toTargetX, toTargetZ);
          }
        }

        // Send network updates if moved or animation state changed
        const now = Date.now();
        const distMoved = Math.hypot(newX - lastSentPos.current.x, newZ - lastSentPos.current.z);
        const anim = isMoving ? 'walk' : (player.isHandRaised ? 'raise_hand' : 'idle');

        if (isMoving && (distMoved > 0.04 || now - lastSendTime.current > 40)) {
          lastSentPos.current = { x: newX, y: 0, z: newZ, rotY: newRotY };
          lastSendTime.current = now;

          // Directly update fast in-memory transform (bypasses React Virtual DOM completely!)
          setPlayerTransform(mySessionId, {
            x: newX,
            y: 0,
            z: newZ,
            rotY: newRotY,
            animation: 'walk'
          });

          colyseusService.sendMove(newX, 0, newZ, newRotY, 'walk');
        } else if (!isMoving && curTrans?.animation === 'walk') {
          // Stopped moving
          setPlayerTransform(mySessionId, {
            animation: anim
          });
          colyseusService.sendMove(newX, 0, newZ, newRotY, anim);
        }
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [mySessionId]);

  return (
    <div className="relative w-full h-full select-none bg-slate-950">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        camera={{ position: [24, 26, 26], fov: 38, near: 0.1, far: 300 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false }}
      >
        <CameraController />
        <ClassroomScene />
      </Canvas>

      {/* Subtle Controls Helper Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none bg-slate-900/95 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-lg flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-slate-200">WASD</kbd>
          <span>Walk</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-medium">Click Chair</span>
          <span>Sit</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-400 font-medium">Orbit View</span>
          <span>Drag Mouse</span>
        </div>
      </div>
    </div>
  );
}
