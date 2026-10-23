'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ClientPlayer, useClassroomStore } from '@/lib/store';

interface AvatarProps {
  player: ClientPlayer;
  isLocal: boolean;
}

export function Avatar({ player, isLocal }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Position interpolation vector
  const currentPos = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const currentRotY = useRef(player.rotY);

  const activeReaction = useClassroomStore((s) => s.activeReaction);
  const showReaction = activeReaction && activeReaction.sessionId === player.sessionId;

  const isSitting = Boolean(player.seatId) || player.animation === 'sit';
  const isWalking = player.animation === 'walk';
  const isHandRaised = player.isHandRaised || player.animation === 'raise_hand';
  const isSpeaking = Boolean(player.isSpeaking);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth movement interpolation for remote and local players
    const targetPos = new THREE.Vector3(player.x, isSitting ? player.y : 0, player.z);
    currentPos.current.lerp(targetPos, 0.25);
    groupRef.current.position.copy(currentPos.current);

    // Smooth rotation interpolation
    // Normalize angle difference to avoid spinning 360 degrees
    let diff = (player.rotY - currentRotY.current) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    currentRotY.current += diff * 0.25;
    groupRef.current.rotation.y = currentRotY.current;

    const t = state.clock.getElapsedTime();

    // Procedural Animation System
    if (isSitting) {
      // Sitting posture: legs rotated forward 90 degrees
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
        leftLegRef.current.position.set(-0.14, 0.35, 0.22);
        rightLegRef.current.position.set(0.14, 0.35, 0.22);
      }

      // Hand raise while seated
      if (isHandRaised) {
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.PI - 0.2;
          rightArmRef.current.rotation.z = -0.3 + Math.sin(t * 8) * 0.15; // Waving motion
        }
      } else {
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 3;
          rightArmRef.current.rotation.z = -0.1;
        }
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.PI / 3;
        leftArmRef.current.rotation.z = 0.1;
      }
    } else if (isWalking) {
      // Walking swing
      const swing = Math.sin(t * 12) * 0.7;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = swing;
        rightLegRef.current.rotation.x = -swing;
        leftLegRef.current.position.set(-0.14, 0.35, 0);
        rightLegRef.current.position.set(0.14, 0.35, 0);
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -swing * 0.8;
      }
      if (rightArmRef.current) {
        if (isHandRaised) {
          rightArmRef.current.rotation.x = Math.PI - 0.2;
        } else {
          rightArmRef.current.rotation.x = swing * 0.8;
        }
      }
    } else {
      // Standing Idle: Gentle breathing sway
      const breath = Math.sin(t * 2) * 0.02;
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.72 + breath;
      }

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
        leftLegRef.current.position.set(-0.14, 0.35, 0);
        rightLegRef.current.position.set(0.14, 0.35, 0);
      }

      if (isHandRaised && rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.PI - 0.2;
        rightArmRef.current.rotation.z = -0.3 + Math.sin(t * 6) * 0.2;
      } else if (rightArmRef.current) {
        rightArmRef.current.rotation.x = breath;
        rightArmRef.current.rotation.z = -0.05;
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -breath;
        leftArmRef.current.rotation.z = 0.05;
      }
    }
  });

  const isTeacher = player.role === 'teacher';
  const shirtColor = player.avatarColor || (isTeacher ? '#2563EB' : '#10B981');

  return (
    <group ref={groupRef} position={[player.x, 0, player.z]}>
      {/* Local player pointer indicator under feet */}
      {isLocal && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.42, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Speaking Soundwaves Visualizer Ring */}
      {isSpeaking && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.7, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Floating 2D Nameplate & Status Indicators */}
      <Html position={[0, isSitting ? 1.95 : 1.75, 0]} center distanceFactor={14}>
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-sm">
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

      {/* 3D Humanoid Character Mesh */}
      <group ref={bodyRef} position={[0, 0.72, 0]}>
        {/* Head */}
        <mesh position={[0, 0.44, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.4} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.07, 0.46, 0.19]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.07, 0.46, 0.19]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>

        {/* Hair / Cap */}
        <mesh position={[0, 0.54, -0.02]} castShadow>
          <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={isTeacher ? '#475569' : '#b45309'} />
        </mesh>

        {/* Torso / Shirt */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.48, 0.28]} />
          <meshStandardMaterial color={shirtColor} roughness={0.5} />
        </mesh>

        {/* Teacher Collar or Tie */}
        {isTeacher && (
          <mesh position={[0, 0.08, 0.15]}>
            <boxGeometry args={[0.08, 0.24, 0.02]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        )}

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

      {/* Legs (Standing or Seated) */}
      <mesh ref={leftLegRef} position={[-0.14, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.07, 0.52]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh ref={rightLegRef} position={[0.14, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.07, 0.52]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}
