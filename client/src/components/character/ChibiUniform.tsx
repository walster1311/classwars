'use client';

import React from 'react';
import * as THREE from 'three';
import { CharacterType } from '@classverse/shared';

interface ChibiUniformProps {
  gender: CharacterType;
}

export const ChibiUniform = React.memo(function ChibiUniform({ gender }: ChibiUniformProps) {
  const shirtColor = '#ffffff'; // Crisp white uniform shirt/blouse
  const navyColor = '#1e3a8a';  // Classic school navy blue
  const goldColor = '#fbbf24';  // School emblem crest gold
  const skinColor = '#ffedd5';  // Exposed arms/knees skin tone
  const sockColor = '#f8fafc';  // Clean white uniform socks
  const shoeColor = '#0f172a';  // Polished black school shoes

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. TORSO / UNIFORM SHIRT & EMBLEM
         ======================================================== */}
      {/* Torso Base */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.38, 0.42, 0.24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} />
      </mesh>

      {/* Shirt Collar (Boy: Polo lapels, Girl: Sailor / Peter Pan collar) */}
      {gender === 'boy' ? (
        <group position={[0, 0.19, 0.11]}>
          {/* Left Polo Collar Flap */}
          <mesh position={[-0.07, 0, 0]} rotation={[0.3, 0.2, -0.2]}>
            <boxGeometry args={[0.1, 0.06, 0.02]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
          </mesh>
          {/* Right Polo Collar Flap */}
          <mesh position={[0.07, 0, 0]} rotation={[0.3, -0.2, 0.2]}>
            <boxGeometry args={[0.1, 0.06, 0.02]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
          </mesh>
          {/* Polo Button Placket */}
          <mesh position={[0, -0.06, 0.012]}>
            <boxGeometry args={[0.04, 0.12, 0.005]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      ) : (
        <group position={[0, 0.18, 0.1]}>
          {/* Sailor / Rounded Blouse Collar */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.26, 0.05, 0.04]} />
            <meshStandardMaterial color={navyColor} roughness={0.4} />
          </mesh>
          {/* Cute School Ribbon / Bow Tie */}
          <mesh position={[0, -0.04, 0.02]}>
            <coneGeometry args={[0.035, 0.06, 4]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      )}

      {/* Golden School Emblem / Crest on Left Chest */}
      <mesh position={[-0.1, 0.08, 0.123]}>
        <circleGeometry args={[0.022, 8]} />
        <meshStandardMaterial color={goldColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ========================================================
          2. LOWER UNIFORM: BOY TROUSERS/SHORTS vs GIRL PLEATED SKIRT
         ======================================================== */}
      {gender === 'boy' ? (
        /* Boy Navy School Shorts / Trousers waistband */
        <group position={[0, -0.21, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.39, 0.14, 0.25]} />
            <meshStandardMaterial color={navyColor} roughness={0.6} />
          </mesh>
          {/* Small belt detail */}
          <mesh position={[0, 0.05, 0.126]}>
            <boxGeometry args={[0.06, 0.025, 0.006]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
        </group>
      ) : (
        /* Girl Navy Pleated School Skirt */
        <group position={[0, -0.22, 0]}>
          {/* Flared Pleated Skirt Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.26, 0.18, 16]} />
            <meshStandardMaterial color={navyColor} roughness={0.6} />
          </mesh>
          {/* Skirt Hem Line Detail */}
          <mesh position={[0, -0.07, 0]}>
            <cylinderGeometry args={[0.255, 0.255, 0.012, 16]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
});
