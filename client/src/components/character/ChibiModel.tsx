'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterType } from '@classverse/shared';
import { getPlayerTransform } from '@/lib/transforms';
import { ChibiHead } from './ChibiHead';
import { ChibiHair } from './ChibiHair';
import { ChibiUniform } from './ChibiUniform';

export interface ChibiModelProps {
  gender: CharacterType;
  hairstyleId: string;
  hairColor?: string;
  animation?: 'idle' | 'walk' | 'sit' | 'raise_hand' | 'wave' | 'celebrate';
  isLocal?: boolean;
  scale?: number;
  sessionId?: string;
}

export const ChibiModel = React.memo(function ChibiModel({
  gender,
  hairstyleId,
  hairColor,
  animation = 'idle',
  isLocal = false,
  scale = 1.0,
  sessionId
}: ChibiModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Left Leg Articulations
  const leftThighRef = useRef<THREE.Mesh>(null);
  const leftShinRef = useRef<THREE.Mesh>(null);
  const leftFootRef = useRef<THREE.Mesh>(null);

  // Right Leg Articulations
  const rightThighRef = useRef<THREE.Mesh>(null);
  const rightShinRef = useRef<THREE.Mesh>(null);
  const rightFootRef = useRef<THREE.Mesh>(null);

  const skinColor = '#ffedd5';
  const shirtColor = '#ffffff';
  const navyColor = '#1e3a8a';
  const sockColor = '#f8fafc';
  const shoeColor = '#0f172a';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // High-frequency transform from in-memory map or fallback prop
    const tForm = sessionId ? getPlayerTransform(sessionId) : undefined;
    const activeAnim = tForm?.animation || animation;

    const isSitting = activeAnim === 'sit';
    const isWalking = activeAnim === 'walk';
    const isHandRaised = activeAnim === 'raise_hand';
    const isWaving = activeAnim === 'wave';
    const isCelebrating = activeAnim === 'celebrate';

    if (isSitting) {
      // 1. Torso at sitting height (snugly on seat cushion)
      if (bodyRef.current) {
        bodyRef.current.position.set(0, 0.68, -0.04);
        bodyRef.current.rotation.set(0, 0, 0);
      }

      // 2. Thighs: Horizontal forward across chair cushion
      if (leftThighRef.current && rightThighRef.current) {
        leftThighRef.current.position.set(-0.13, 0.46, 0.1);
        rightThighRef.current.position.set(0.13, 0.46, 0.1);
        leftThighRef.current.rotation.set(-Math.PI / 2, 0, 0);
        rightThighRef.current.rotation.set(-Math.PI / 2, 0, 0);
      }

      // 3. Shins: Bend 90 degrees downward at front edge of seat
      if (leftShinRef.current && rightShinRef.current) {
        leftShinRef.current.position.set(-0.13, 0.23, 0.24);
        rightShinRef.current.position.set(0.13, 0.23, 0.24);
        leftShinRef.current.rotation.set(0, 0, 0);
        rightShinRef.current.rotation.set(0, 0, 0);
      }

      // 4. Feet: Flat on floor
      if (leftFootRef.current && rightFootRef.current) {
        leftFootRef.current.position.set(-0.13, 0.04, 0.26);
        rightFootRef.current.position.set(0.13, 0.04, 0.26);
        leftFootRef.current.rotation.set(0, 0, 0);
        rightFootRef.current.rotation.set(0, 0, 0);
      }

      // 5. Arms
      if (leftArmRef.current) {
        leftArmRef.current.rotation.set(-Math.PI / 3.4, 0, 0.1);
      }
      if (rightArmRef.current) {
        if (isHandRaised) {
          rightArmRef.current.rotation.set(Math.PI - 0.2, 0, -0.3 + Math.sin(t * 8) * 0.15);
        } else {
          rightArmRef.current.rotation.set(-Math.PI / 3.4, 0, -0.1);
        }
      }
    } else if (isWalking) {
      // Coordinated Walking Swing (60 FPS procedural animation)
      const swing = Math.sin(t * 11) * 0.55;

      if (bodyRef.current) {
        bodyRef.current.position.set(0, 0.72 + Math.abs(Math.sin(t * 11)) * 0.02, 0);
        bodyRef.current.rotation.set(0.04, 0, Math.sin(t * 5.5) * 0.03);
      }

      // Left Leg Swing
      if (leftThighRef.current && leftShinRef.current && leftFootRef.current) {
        leftThighRef.current.position.set(-0.13, 0.42, swing * 0.08);
        leftThighRef.current.rotation.set(swing, 0, 0);
        leftShinRef.current.position.set(-0.13, 0.18, swing * 0.14);
        leftShinRef.current.rotation.set(Math.max(0, -swing * 0.4), 0, 0);
        leftFootRef.current.position.set(-0.13, 0.04, swing * 0.17 + 0.02);
        leftFootRef.current.rotation.set(0, 0, 0);
      }

      // Right Leg Swing
      if (rightThighRef.current && rightShinRef.current && rightFootRef.current) {
        rightThighRef.current.position.set(0.13, 0.42, -swing * 0.08);
        rightThighRef.current.rotation.set(-swing, 0, 0);
        rightShinRef.current.position.set(0.13, 0.18, -swing * 0.14);
        rightShinRef.current.rotation.set(Math.max(0, swing * 0.4), 0, 0);
        rightFootRef.current.position.set(0.13, 0.04, -swing * 0.17 + 0.02);
        rightFootRef.current.rotation.set(0, 0, 0);
      }

      // Arm Swings
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
      // Idle / Cheerful Stand: Gentle breathing sway
      const breath = Math.sin(t * 2.2) * 0.012;
      const headTilt = Math.sin(t * 1.1) * 0.03;

      if (bodyRef.current) {
        bodyRef.current.position.set(0, 0.72 + breath, 0);
        bodyRef.current.rotation.set(0, 0, 0);
      }
      if (headRef.current) {
        headRef.current.rotation.set(headTilt * 0.5, 0, headTilt);
      }

      // Standing Legs
      if (leftThighRef.current && leftShinRef.current && leftFootRef.current) {
        leftThighRef.current.position.set(-0.13, 0.42, 0);
        leftThighRef.current.rotation.set(0, 0, 0);
        leftShinRef.current.position.set(-0.13, 0.18, 0);
        leftShinRef.current.rotation.set(0, 0, 0);
        leftFootRef.current.position.set(-0.13, 0.04, 0.02);
        leftFootRef.current.rotation.set(0, 0, 0);
      }
      if (rightThighRef.current && rightShinRef.current && rightFootRef.current) {
        rightThighRef.current.position.set(0.13, 0.42, 0);
        rightThighRef.current.rotation.set(0, 0, 0);
        rightShinRef.current.position.set(0.13, 0.18, 0);
        rightShinRef.current.rotation.set(0, 0, 0);
        rightFootRef.current.position.set(0.13, 0.04, 0.02);
        rightFootRef.current.rotation.set(0, 0, 0);
      }

      // Arm Actions
      if (isCelebrating) {
        // Both arms raised high cheering
        const cheerWobble = Math.sin(t * 8) * 0.15;
        if (leftArmRef.current) leftArmRef.current.rotation.set(Math.PI - 0.3, 0, 0.4 + cheerWobble);
        if (rightArmRef.current) rightArmRef.current.rotation.set(Math.PI - 0.3, 0, -0.4 - cheerWobble);
      } else if (isWaving) {
        // Right hand wave
        if (leftArmRef.current) leftArmRef.current.rotation.set(-breath, 0, 0.05);
        if (rightArmRef.current) rightArmRef.current.rotation.set(Math.PI - 0.4, 0, -0.3 + Math.sin(t * 7) * 0.25);
      } else if (isHandRaised) {
        if (leftArmRef.current) leftArmRef.current.rotation.set(-breath, 0, 0.05);
        if (rightArmRef.current) rightArmRef.current.rotation.set(Math.PI - 0.2, 0, -0.25 + Math.sin(t * 6) * 0.15);
      } else {
        if (leftArmRef.current) leftArmRef.current.rotation.set(-breath, 0, 0.08);
        if (rightArmRef.current) rightArmRef.current.rotation.set(-breath, 0, -0.08);
      }
    }
  });

  return (
    <group ref={rootRef} scale={[scale, scale, scale]}>
      {/* ========================================================
          UPPER TORSO, HEAD & ARMS
         ======================================================== */}
      <group ref={bodyRef} position={[0, 0.72, 0]}>
        {/* Uniform Shirt, Collar, Crest & Skirt/Shorts */}
        <ChibiUniform gender={gender} />

        {/* Chibi Head & Interchangeable Hairstyle (Attached to common neck pivot) */}
        <group ref={headRef}>
          <ChibiHead gender={gender} />
          <ChibiHair gender={gender} hairstyleId={hairstyleId} hairColor={hairColor} />
        </group>

        {/* Left Arm Assembly */}
        <group ref={leftArmRef} position={[-0.23, 0.12, 0]}>
          {/* White Short Sleeve Cuff */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.058, 0.12, 12]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
          {/* Exposed Forearm (Skin) */}
          <mesh position={[0, -0.17, 0]} castShadow>
            <cylinderGeometry args={[0.048, 0.044, 0.14, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.5} />
          </mesh>
          {/* Cute Chibi Hand */}
          <mesh position={[0, -0.27, 0]}>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.5} />
          </mesh>
        </group>

        {/* Right Arm Assembly */}
        <group ref={rightArmRef} position={[0.23, 0.12, 0]}>
          {/* White Short Sleeve Cuff */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.058, 0.12, 12]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
          {/* Exposed Forearm (Skin) */}
          <mesh position={[0, -0.17, 0]} castShadow>
            <cylinderGeometry args={[0.048, 0.044, 0.14, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.5} />
          </mesh>
          {/* Cute Chibi Hand */}
          <mesh position={[0, -0.27, 0]}>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          ARTICULATED LOWER LEGS, SOCKS & SCHOOL SHOES
         ======================================================== */}
      {/* Left Leg */}
      <mesh ref={leftThighRef} castShadow>
        <cylinderGeometry args={[0.065, 0.06, 0.24, 12]} />
        <meshStandardMaterial color={gender === 'boy' ? navyColor : skinColor} />
      </mesh>
      <mesh ref={leftShinRef} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.26, 12]} />
        <meshStandardMaterial color={sockColor} />
      </mesh>
      <mesh ref={leftFootRef} castShadow>
        <boxGeometry args={[0.09, 0.055, 0.14]} />
        <meshStandardMaterial color={shoeColor} roughness={0.3} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightThighRef} castShadow>
        <cylinderGeometry args={[0.065, 0.06, 0.24, 12]} />
        <meshStandardMaterial color={gender === 'boy' ? navyColor : skinColor} />
      </mesh>
      <mesh ref={rightShinRef} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.26, 12]} />
        <meshStandardMaterial color={sockColor} />
      </mesh>
      <mesh ref={rightFootRef} castShadow>
        <boxGeometry args={[0.09, 0.055, 0.14]} />
        <meshStandardMaterial color={shoeColor} roughness={0.3} />
      </mesh>
    </group>
  );
});
