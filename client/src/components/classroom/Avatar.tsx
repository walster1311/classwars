'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { EMOJI_DEFINITIONS } from '@classverse/shared';
import { ClientPlayer, useClassroomStore } from '@/lib/store';
import { getPlayerTransform } from '@/lib/transforms';
import { ChibiModel } from '../character/ChibiModel';
import { interactionsService } from '@/lib/interactions';

interface AvatarProps {
  player: ClientPlayer;
  isLocal: boolean;
}

export const Avatar = React.memo(function Avatar({ player, isLocal }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Left Leg Articulation
  const leftThighRef = useRef<THREE.Mesh>(null);
  const leftShinRef = useRef<THREE.Mesh>(null);
  const leftFootRef = useRef<THREE.Mesh>(null);

  // Right Leg Articulation
  const rightThighRef = useRef<THREE.Mesh>(null);
  const rightShinRef = useRef<THREE.Mesh>(null);
  const rightFootRef = useRef<THREE.Mesh>(null);

  // Position & rotation interpolation vectors
  const currentPos = useRef(new THREE.Vector3(player.x, 0, player.z));
  const currentRotY = useRef(player.rotY || 0);

  const activeReaction = useClassroomStore((s) => s.activeReaction);
  const showReaction = activeReaction && activeReaction.sessionId === player.sessionId;

  const isSitting = Boolean(player.seatId) || player.animation === 'sit';
  const isWalking = player.animation === 'walk';
  const isHandRaised = player.isHandRaised || player.animation === 'raise_hand';
  const isSpeaking = Boolean(player.isSpeaking);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Read high-frequency transform from fast memory (falls back to player props)
    const tForm = getPlayerTransform(player.sessionId);
    const targetX = tForm !== undefined ? tForm.x : player.x;
    const targetZ = tForm !== undefined ? tForm.z : player.z;
    const targetRotY = tForm !== undefined ? tForm.rotY : (player.rotY || 0);
    const isWalkingNow = tForm !== undefined ? (tForm.animation === 'walk') : isWalking;

    // Avatar root is always grounded at floor level (Y = 0)
    // Mesh articulation handles natural sitting height on the chair cushion
    const targetPos = new THREE.Vector3(targetX, 0, targetZ);
    currentPos.current.lerp(targetPos, 0.25);
    groupRef.current.position.copy(currentPos.current);

    // Smooth rotation interpolation (normalize angle diff to avoid 360 spin)
    let diff = (targetRotY - currentRotY.current) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    currentRotY.current += diff * 0.25;
    groupRef.current.rotation.y = currentRotY.current;

    const t = state.clock.getElapsedTime();

    // ==========================================
    // PROCEDURAL ANIMATION & POSTURE SYSTEM
    // ==========================================
    if (isSitting) {
      // 1. Torso sits firmly on the chair cushion (Y = 0.44 to 0.46)
      // Bottom of torso at Y = 0.44, back snugly against chair backrest (Z = -0.04)
      if (bodyRef.current) {
        bodyRef.current.position.set(0, 0.68, -0.04);
      }

      // 2. Thighs: Horizontal forward across the chair seat cushion
      if (leftThighRef.current && rightThighRef.current) {
        leftThighRef.current.position.set(-0.14, 0.46, 0.12);
        rightThighRef.current.position.set(0.14, 0.46, 0.12);
        leftThighRef.current.rotation.set(-Math.PI / 2, 0, 0);
        rightThighRef.current.rotation.set(-Math.PI / 2, 0, 0);
      }

      // 3. Shins: Bend 90 degrees downward at the front edge of the chair, hanging vertically
      if (leftShinRef.current && rightShinRef.current) {
        leftShinRef.current.position.set(-0.14, 0.23, 0.25);
        rightShinRef.current.position.set(0.14, 0.23, 0.25);
        leftShinRef.current.rotation.set(0, 0, 0);
        rightShinRef.current.rotation.set(0, 0, 0);
      }

      // 4. Feet: Flat on the classroom floor under the desk
      if (leftFootRef.current && rightFootRef.current) {
        leftFootRef.current.position.set(-0.14, 0.04, 0.28);
        rightFootRef.current.position.set(0.14, 0.04, 0.28);
        leftFootRef.current.rotation.set(0, 0, 0);
        rightFootRef.current.rotation.set(0, 0, 0);
      }

      // 5. Arms & Hands: Resting comfortably at desk surface height
      if (leftArmRef.current) {
        leftArmRef.current.rotation.set(-Math.PI / 3.4, 0, 0.1);
      }
      if (rightArmRef.current) {
        if (isHandRaised) {
          // Hand raised while seated
          rightArmRef.current.rotation.set(Math.PI - 0.2, 0, -0.3 + Math.sin(t * 8) * 0.15);
        } else {
          rightArmRef.current.rotation.set(-Math.PI / 3.4, 0, -0.1);
        }
      }
    } else if (isWalkingNow) {
      // Walking swing
      const swing = Math.sin(t * 12) * 0.6;
      if (bodyRef.current) {
        bodyRef.current.position.set(0, 0.72 + Math.abs(Math.sin(t * 12)) * 0.02, 0);
      }

      // Left Leg Swing
      if (leftThighRef.current && leftShinRef.current && leftFootRef.current) {
        leftThighRef.current.position.set(-0.14, 0.42, swing * 0.08);
        leftThighRef.current.rotation.set(swing, 0, 0);
        leftShinRef.current.position.set(-0.14, 0.18, swing * 0.15);
        leftShinRef.current.rotation.set(Math.max(0, -swing * 0.4), 0, 0);
        leftFootRef.current.position.set(-0.14, 0.04, swing * 0.18 + 0.03);
        leftFootRef.current.rotation.set(0, 0, 0);
      }

      // Right Leg Swing
      if (rightThighRef.current && rightShinRef.current && rightFootRef.current) {
        rightThighRef.current.position.set(0.14, 0.42, -swing * 0.08);
        rightThighRef.current.rotation.set(-swing, 0, 0);
        rightShinRef.current.position.set(0.14, 0.18, -swing * 0.15);
        rightShinRef.current.rotation.set(Math.max(0, swing * 0.4), 0, 0);
        rightFootRef.current.position.set(0.14, 0.04, -swing * 0.18 + 0.03);
        rightFootRef.current.rotation.set(0, 0, 0);
      }

      // Arms swing
      if (leftArmRef.current) {
        leftArmRef.current.rotation.set(-swing * 0.7, 0, 0.05);
      }
      if (rightArmRef.current) {
        if (isHandRaised) {
          rightArmRef.current.rotation.set(Math.PI - 0.2, 0, -0.3 + Math.sin(t * 8) * 0.15);
        } else {
          rightArmRef.current.rotation.set(swing * 0.7, 0, -0.05);
        }
      }
    } else {
      // Standing Idle: Gentle breathing sway
      const breath = Math.sin(t * 2) * 0.015;
      if (bodyRef.current) {
        bodyRef.current.position.set(0, 0.72 + breath, 0);
      }

      // Straight standing legs
      if (leftThighRef.current && leftShinRef.current && leftFootRef.current) {
        leftThighRef.current.position.set(-0.14, 0.42, 0);
        leftThighRef.current.rotation.set(0, 0, 0);
        leftShinRef.current.position.set(-0.14, 0.18, 0);
        leftShinRef.current.rotation.set(0, 0, 0);
        leftFootRef.current.position.set(-0.14, 0.04, 0.03);
        leftFootRef.current.rotation.set(0, 0, 0);
      }
      if (rightThighRef.current && rightShinRef.current && rightFootRef.current) {
        rightThighRef.current.position.set(0.14, 0.42, 0);
        rightThighRef.current.rotation.set(0, 0, 0);
        rightShinRef.current.position.set(0.14, 0.18, 0);
        rightShinRef.current.rotation.set(0, 0, 0);
        rightFootRef.current.position.set(0.14, 0.04, 0.03);
        rightFootRef.current.rotation.set(0, 0, 0);
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.set(-breath, 0, 0.05);
      }
      if (rightArmRef.current) {
        if (isHandRaised) {
          rightArmRef.current.rotation.set(Math.PI - 0.2, 0, -0.3 + Math.sin(t * 6) * 0.2);
        } else {
          rightArmRef.current.rotation.set(breath, 0, -0.05);
        }
      }
    }
  });

  const isTeacher = player.role === 'teacher';
  const shirtColor = player.avatarColor || (isTeacher ? '#2563EB' : '#10B981');

  return (
    <group ref={groupRef} position={[player.x, 0, player.z]}>
      {/* Local player pointer indicator under feet (only when standing) */}
      {isLocal && !isSitting && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.42, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Speaking Soundwaves Visualizer Ring */}
      {isSpeaking && (
        <mesh position={[0, isSitting ? 0.48 : 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.7, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Floating 2D Nameplate & Status Indicators */}
      <Html position={[0, isSitting ? 1.55 : 1.75, 0]} center distanceFactor={14}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          {/* Reaction Emoji Pop */}
          {showReaction && (
            <div className="animate-bounce text-2xl mb-1 filter drop-shadow">
              {activeReaction.emoji}
            </div>
          )}

          {/* Hand Raised Banner */}
          {isHandRaised && (
            <div className="flex items-center gap-1 px-2 py-0.5 mb-1 rounded-full bg-amber-500 text-amber-950 text-xs font-bold shadow-md animate-pulse">
              <span>✋</span> Hand Raised
            </div>
          )}

          {/* Speaking Pill */}
          {isSpeaking && (
            <div className="flex items-center gap-1 px-2 py-0.5 mb-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" /> Speaking
            </div>
          )}

          {/* Name & Role Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/95 border border-slate-700/80 shadow-lg">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: shirtColor }}
            />
            <span className="text-xs font-semibold text-slate-100 whitespace-nowrap">
              {player.displayName}
            </span>
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                isTeacher
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isTeacher ? 'Teacher' : 'Student'}
            </span>
          </div>
        </div>
      </Html>

      {/* 3D Model: Chibi Character for Students, Executive Model for Teacher */}
      {isTeacher ? (
        <>
          <group ref={bodyRef} position={[0, 0.72, 0]}>
            {/* Head */}
            <mesh position={[0, 0.44, 0]} castShadow>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color="#fcd34d" roughness={0.4} />
            </mesh>

            {/* Eyes (Facing local +Z) */}
            <mesh position={[-0.07, 0.46, 0.19]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0.07, 0.46, 0.19]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>

            {/* Hair / Cap */}
            <mesh position={[0, 0.54, -0.02]} castShadow>
              <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Torso / Shirt */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.42, 0.48, 0.28]} />
              <meshStandardMaterial color={shirtColor} roughness={0.5} />
            </mesh>

            {/* Teacher Necktie */}
            <mesh position={[0, 0.08, 0.15]}>
              <boxGeometry args={[0.08, 0.24, 0.02]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>

            {/* Left Arm */}
            <group ref={leftArmRef} position={[-0.27, 0.18, 0]}>
              <mesh position={[0, -0.2, 0]} castShadow>
                <cylinderGeometry args={[0.065, 0.06, 0.4]} />
                <meshStandardMaterial color={shirtColor} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.42, 0]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color="#fcd34d" />
              </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[0.27, 0.18, 0]}>
              <mesh position={[0, -0.2, 0]} castShadow>
                <cylinderGeometry args={[0.065, 0.06, 0.4]} />
                <meshStandardMaterial color={shirtColor} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.42, 0]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color="#fcd34d" />
              </mesh>
            </group>
          </group>

          {/* Articulated Teacher Legs */}
          <mesh ref={leftThighRef} castShadow>
            <cylinderGeometry args={[0.075, 0.07, 0.26]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh ref={leftShinRef} castShadow>
            <cylinderGeometry args={[0.065, 0.06, 0.28]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh ref={leftFootRef} castShadow>
            <boxGeometry args={[0.10, 0.06, 0.15]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          <mesh ref={rightThighRef} castShadow>
            <cylinderGeometry args={[0.075, 0.07, 0.26]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh ref={rightShinRef} castShadow>
            <cylinderGeometry args={[0.065, 0.06, 0.28]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh ref={rightFootRef} castShadow>
            <boxGeometry args={[0.10, 0.06, 0.15]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </>
      ) : (
        <ChibiModel
          gender={player.characterType || 'boy'}
          hairstyleId={player.hairstyleId || (player.characterType === 'girl' ? 'girl_twin_tails' : 'boy_spiky_anime')}
          animation={isSitting ? 'sit' : (player.animation || (isWalking ? 'walk' : (isHandRaised ? 'raise_hand' : 'idle')))}
          sessionId={player.sessionId}
          scale={1.05}
        />
      )}

      {/* ========================================================
          VISUAL EFFECTS: ANIME POWER-UP AURA
         ======================================================== */}
      {player.activeAuraColor && (
        <group position={[0, 0, 0]}>
          {/* Ground Shockwave Expanding Ring */}
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.75, 32]} />
            <meshBasicMaterial
              color={player.activeAuraColor === 'golden' ? '#f59e0b' : (player.activeAuraColor === 'blue' ? '#38bdf8' : '#a855f7')}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Glowing Energy Aura Column */}
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.42, 0.52, 1.3, 16, 1, true]} />
            <meshBasicMaterial
              color={player.activeAuraColor === 'golden' ? '#fbbf24' : (player.activeAuraColor === 'blue' ? '#60a5fa' : '#c084fc')}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Inner Core Pulsing Ring */}
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.32, 0.38, 1.25, 16, 1, true]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* ========================================================
          VISUAL EFFECTS: DANCE BATTLE DISCO RING & NOTES
         ======================================================== */}
      {(player.activeDance || player.animation.startsWith('dance_')) && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.85, 32]} />
            <meshBasicMaterial color="#ec4899" transparent opacity={0.7} />
          </mesh>
          <Html position={[0, 2.05, 0]} center distanceFactor={14}>
            <div className="flex items-center gap-1 text-pink-400 font-bold text-lg animate-bounce drop-shadow pointer-events-none select-none">
              <span>🎵</span>
              <span className="text-[10px] uppercase tracking-wider bg-pink-600/90 text-white font-bold px-2 py-0.5 rounded-full shadow-lg">
                {(player.activeDance || player.animation.replace('dance_', '')).replace(/_/g, ' ')}
              </span>
              <span>🎶</span>
            </div>
          </Html>
        </group>
      )}

      {/* ========================================================
          VISUAL EFFECTS: ACTIVE EMOJI BILLBOARD
         ======================================================== */}
      {player.activeEmoji && (
        <Html position={[0, 2.0, 0]} center distanceFactor={14}>
          <div className="animate-bounce text-3xl filter drop-shadow-lg select-none pointer-events-none">
            {EMOJI_DEFINITIONS.find((e) => e.id === player.activeEmoji)?.char || '✨'}
          </div>
        </Html>
      )}
    </group>
  );
});
