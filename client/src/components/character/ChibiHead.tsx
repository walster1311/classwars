'use client';

import React from 'react';
import * as THREE from 'three';
import { CharacterType } from '@classverse/shared';

interface ChibiHeadProps {
  gender: CharacterType;
}

export const ChibiHead = React.memo(function ChibiHead({ gender }: ChibiHeadProps) {
  // Soft, warm anime skin tone
  const skinColor = '#ffedd5'; // Warm peach chibi skin
  const blushColor = '#fb7185'; // Soft rose anime blush

  const eyeColor = gender === 'boy' ? '#0284c7' : '#7c3aed'; // Bright anime ocean blue / amethyst purple

  return (
    <group position={[0, 0.46, 0]}>
      {/* 1. Main Chibi Skull (Large, soft rounded anime head) */}
      <mesh castShadow>
        <sphereGeometry args={[0.31, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.45} />
      </mesh>

      {/* Cute Anime Cheeks (Slightly plumper at lower jaw) */}
      <mesh position={[-0.14, -0.06, 0.16]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.45} />
      </mesh>
      <mesh position={[0.14, -0.06, 0.16]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.45} />
      </mesh>

      {/* Cute Anime Cheek Blush Ovals */}
      <mesh position={[-0.16, -0.05, 0.25]} rotation={[0, -0.2, 0]}>
        <circleGeometry args={[0.045, 16]} />
        <meshBasicMaterial color={blushColor} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0.16, -0.05, 0.25]} rotation={[0, 0.2, 0]}>
        <circleGeometry args={[0.045, 16]} />
        <meshBasicMaterial color={blushColor} transparent opacity={0.45} />
      </mesh>

      {/* 2. Expressive Big Anime Eyes */}
      {/* Left Eye Assembly */}
      <group position={[-0.11, 0.02, 0.27]} rotation={[0, -0.15, 0]}>
        {/* Eye White (Sclera) */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.085, 0.11]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Colorful Anime Iris */}
        <mesh position={[0, -0.005, 0.002]}>
          <planeGeometry args={[0.065, 0.09]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        {/* Deep Pupil */}
        <mesh position={[0, -0.005, 0.003]}>
          <circleGeometry args={[0.025, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        {/* Upper Anime Sparkle Highlight (Primary) */}
        <mesh position={[-0.015, 0.025, 0.004]}>
          <circleGeometry args={[0.014, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Lower Anime Sparkle Highlight (Secondary) */}
        <mesh position={[0.015, -0.02, 0.004]}>
          <circleGeometry args={[0.008, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Cute Upper Eyelash Trim */}
        <mesh position={[0, 0.055, 0.005]} rotation={[0, 0, 0.05]}>
          <planeGeometry args={[0.095, 0.016]} />
          <meshBasicMaterial color="#1e1b4b" />
        </mesh>
      </group>

      {/* Right Eye Assembly */}
      <group position={[0.11, 0.02, 0.27]} rotation={[0, 0.15, 0]}>
        {/* Eye White (Sclera) */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.085, 0.11]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Colorful Anime Iris */}
        <mesh position={[0, -0.005, 0.002]}>
          <planeGeometry args={[0.065, 0.09]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        {/* Deep Pupil */}
        <mesh position={[0, -0.005, 0.003]}>
          <circleGeometry args={[0.025, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        {/* Upper Anime Sparkle Highlight (Primary) */}
        <mesh position={[-0.015, 0.025, 0.004]}>
          <circleGeometry args={[0.014, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Lower Anime Sparkle Highlight (Secondary) */}
        <mesh position={[0.015, -0.02, 0.004]}>
          <circleGeometry args={[0.008, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Cute Upper Eyelash Trim */}
        <mesh position={[0, 0.055, 0.005]} rotation={[0, 0, -0.05]}>
          <planeGeometry args={[0.095, 0.016]} />
          <meshBasicMaterial color="#1e1b4b" />
        </mesh>
      </group>

      {/* 3. Friendly Anime Eyebrows */}
      <mesh position={[-0.11, 0.12, 0.27]} rotation={[0, -0.1, 0.08]}>
        <boxGeometry args={[0.075, 0.014, 0.01]} />
        <meshBasicMaterial color="#332014" />
      </mesh>
      <mesh position={[0.11, 0.12, 0.27]} rotation={[0, 0.1, -0.08]}>
        <boxGeometry args={[0.075, 0.014, 0.01]} />
        <meshBasicMaterial color="#332014" />
      </mesh>

      {/* 4. Cute Petite Chibi Button Nose Hint */}
      <mesh position={[0, -0.03, 0.31]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.4} />
      </mesh>

      {/* 5. Friendly Cheerful Anime Smile */}
      <mesh position={[0, -0.11, 0.29]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.035, 0.007, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#be185d" />
      </mesh>

      {/* Cute Anime Ears */}
      <mesh position={[-0.3, 0.0, 0.02]} rotation={[0, -0.3, 0]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.5} />
      </mesh>
      <mesh position={[0.3, 0.0, 0.02]} rotation={[0, 0.3, 0]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.5} />
      </mesh>
    </group>
  );
});
