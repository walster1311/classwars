'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CLASSROOM_BOUNDS } from '@classverse/shared';
import { ClassroomScene } from './ClassroomScene';
import { CameraController } from './CameraController';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

export function ClassroomCanvas() {
  const mySessionId = useClassroomStore((s) => s.mySessionId);
  const myPlayer = useClassroomStore((s) => s.players[s.mySessionId]);
  const mySeatId = useClassroomStore((s) => s.mySeatId);

  // Keyboard navigation state
  const keysDown = useRef<Record<string, boolean>>({});
  const moveTarget = useRef<THREE.Vector3 | null>(null);
  const lastSentPos = useRef({ x: 0, y: 0, z: 0, rotY: 0 });
  const lastSendTime = useRef(0);

  // Handle Floor Click-to-Move
  const handleFloorClick = useCallback((point: THREE.Vector3) => {
    // If seated, stand first
    if (mySeatId) {
      colyseusService.sendStand();
    }
    moveTarget.current = new THREE.Vector3(
      Math.max(CLASSROOM_BOUNDS.minX, Math.min(CLASSROOM_BOUNDS.maxX, point.x)),
      0,
      Math.max(CLASSROOM_BOUNDS.minZ, Math.min(CLASSROOM_BOUNDS.maxZ, point.z))
    );
  }, [mySeatId]);

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
        moveTarget.current = null; // Keyboard overrides click-to-move
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

        // 1. Check Keyboard Inputs
        if (keysDown.current['w'] || keysDown.current['arrowup']) dz -= speed;
        if (keysDown.current['s'] || keysDown.current['arrowdown']) dz += speed;
        if (keysDown.current['a'] || keysDown.current['arrowleft']) dx -= speed;
        if (keysDown.current['d'] || keysDown.current['arrowright']) dx += speed;

        let isMoving = false;
        let newX = player.x;
        let newZ = player.z;
        let newRotY = player.rotY;

        if (dx !== 0 || dz !== 0) {
          // Normalize diagonal movement
          if (dx !== 0 && dz !== 0) {
            dx *= 0.7071;
            dz *= 0.7071;
          }

          newX = Math.max(CLASSROOM_BOUNDS.minX, Math.min(CLASSROOM_BOUNDS.maxX, player.x + dx));
          newZ = Math.max(CLASSROOM_BOUNDS.minZ, Math.min(CLASSROOM_BOUNDS.maxZ, player.z + dz));
          newRotY = Math.atan2(dx, dz);
          isMoving = true;
        } else if (moveTarget.current) {
          // 2. Click-to-move handling
          const toTargetX = moveTarget.current.x - player.x;
          const toTargetZ = moveTarget.current.z - player.z;
          const dist = Math.hypot(toTargetX, toTargetZ);

          if (dist > 0.15) {
            const stepX = (toTargetX / dist) * Math.min(speed, dist);
            const stepZ = (toTargetZ / dist) * Math.min(speed, dist);
            newX = player.x + stepX;
            newZ = player.z + stepZ;
            newRotY = Math.atan2(stepX, stepZ);
            isMoving = true;
          } else {
            moveTarget.current = null;
          }
        }

        // Send network updates if moved or animation state changed
        const now = Date.now();
        const distMoved = Math.hypot(newX - lastSentPos.current.x, newZ - lastSentPos.current.z);
        const anim = isMoving ? 'walk' : (player.isHandRaised ? 'raise_hand' : 'idle');

        if (isMoving && (distMoved > 0.05 || now - lastSendTime.current > 60)) {
          lastSentPos.current = { x: newX, y: 0, z: newZ, rotY: newRotY };
          lastSendTime.current = now;

          // Optimistically update local player in store
          useClassroomStore.getState().upsertPlayer(mySessionId, {
            x: newX,
            y: 0,
            z: newZ,
            rotY: newRotY,
            animation: 'walk'
          });

          colyseusService.sendMove(newX, 0, newZ, newRotY, 'walk');
        } else if (!isMoving && player.animation === 'walk') {
          // Stopped moving
          useClassroomStore.getState().upsertPlayer(mySessionId, {
            animation: anim
          });
          colyseusService.sendMove(player.x, 0, player.z, player.rotY, anim);
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
        camera={{ position: [14, 16, 16], fov: 38 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <CameraController />
        <ClassroomScene onFloorClick={handleFloorClick} />
      </Canvas>

      {/* Subtle Controls Helper Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-lg flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-slate-200">WASD</kbd>
          <span>Walk</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-400 font-medium">Click Floor</span>
          <span>Move</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-medium">Click Chair</span>
          <span>Sit</span>
        </div>
      </div>
    </div>
  );
}
