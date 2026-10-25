'use client';

import React from 'react';
import * as THREE from 'three';

interface RealisticWindowProps {
  index: number;
  position: [number, number, number];
}

export function RealisticClassroomWindow({ index, position }: RealisticWindowProps) {
  return (
    <group position={position}>
      {/* ================= 1. ARCHITECTURAL WALL REVEAL / EMBRASURE ================= */}
      {/* Top Header Reveal Lining */}
      <mesh position={[0, 1.29, 0]}>
        <boxGeometry args={[0.22, 0.04, 3.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Left Jamb Reveal Lining */}
      <mesh position={[0, 0, -1.59]}>
        <boxGeometry args={[0.22, 2.58, 0.04]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Right Jamb Reveal Lining */}
      <mesh position={[0, 0, 1.59]}>
        <boxGeometry args={[0.22, 2.58, 0.04]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* ================= 2. MASTER WINDOW CASING & ARCHITECTURAL FRAME ================= */}
      {/* Outer Perimeter Frame (Matte Off-White Trim) */}
      <group position={[0.08, 0, 0]}>
        {/* Top Trim */}
        <mesh position={[0, 1.28, 0]} castShadow>
          <boxGeometry args={[0.06, 0.08, 3.26]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Bottom Trim */}
        <mesh position={[0, -1.28, 0]} castShadow>
          <boxGeometry args={[0.06, 0.08, 3.26]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Left Side Trim */}
        <mesh position={[0, 0, -1.58]} castShadow>
          <boxGeometry args={[0.06, 2.56, 0.08]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Right Side Trim */}
        <mesh position={[0, 0, 1.58]} castShadow>
          <boxGeometry args={[0.06, 2.56, 0.08]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>

        {/* --- Architectural Mullions & Transoms --- */}
        {/* Horizontal Transom Rail (separating upper transom lights from lower casements) */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[0.05, 0.06, 3.12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
        </mesh>

        {/* Upper Transom Vertical Dividers (Creates 3 upper square transom panes) */}
        {[-0.52, 0.52].map((zOffset, i) => (
          <mesh key={`transom-mullion-${i}`} position={[0, 0.89, zOffset]} castShadow>
            <boxGeometry args={[0.045, 0.68, 0.04]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
          </mesh>
        ))}

        {/* Lower Main Central Mullion (Divides lower casement into 2 grand viewing panes) */}
        <mesh position={[0, -0.38, 0]} castShadow>
          <boxGeometry args={[0.045, 1.74, 0.05]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
        </mesh>
      </group>

      {/* ================= 3. DOUBLE-PANE PHYSICAL GLASS ================= */}
      {/* Realistic architectural glass with high transmission and subtle sky reflection */}
      <mesh position={[0.06, 0, 0]}>
        <boxGeometry args={[0.015, 2.52, 3.12]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.92}
          roughness={0.05}
          ior={1.52}
          thickness={0.08}
          transparent
          opacity={0.35}
          reflectivity={0.9}
        />
      </mesh>

      {/* ================= 4. OUTDOOR CAMPUS VISTA & SUNBEAMS ================= */}
      {/* Exterior vista backdrop outside the building (X < 0 in local space) */}
      <group position={[-2.2, 0, 0]}>
        {/* Scenic Sky Horizon Backdrop */}
        <mesh position={[-0.2, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[6.5, 4.5]} />
          <meshBasicMaterial color="#bae6fd" />
        </mesh>

        {/* Distant Sunny Horizon Glow */}
        <mesh position={[-0.15, -0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[6.5, 1.8]} />
          <meshBasicMaterial color="#fef08a" transparent opacity={0.6} />
        </mesh>

        {/* Campus Tree Foliage Cluster 1 (Lush Green Canopy) */}
        <group position={[0.4, -0.4, -0.8]}>
          {/* Tree Trunk */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1.2, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          {/* Foliage Puffs */}
          <mesh position={[0, 0.3, 0]}>
            <dodecahedronGeometry args={[0.75, 1]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
          <mesh position={[0.2, 0.6, 0.2]}>
            <dodecahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
          </mesh>
          <mesh position={[-0.2, 0.5, -0.2]}>
            <dodecahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} />
          </mesh>
        </group>

        {/* Campus Tree Foliage Cluster 2 */}
        <group position={[0.2, -0.6, 0.9]}>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 1.0, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <dodecahedronGeometry args={[0.65, 1]} />
            <meshStandardMaterial color="#166534" roughness={0.7} />
          </mesh>
          <mesh position={[-0.15, 0.7, 0.1]}>
            <dodecahedronGeometry args={[0.45, 1]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
        </group>

        {/* Campus Green Lawn Hedge */}
        <mesh position={[0.5, -1.3, 0]}>
          <boxGeometry args={[1.2, 0.6, 4.8]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
      </group>

      {/* Warm Volumetric Sunbeam Streaming into Classroom */}
      <mesh
        position={[1.2, -0.5, 0]}
        rotation={[0.3, -0.4, -0.5]}
      >
        <planeGeometry args={[2.8, 3.4]} />
        <meshBasicMaterial
          color="#fffbeb"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ================= 5. PARTIALLY DRAWN MODERN VENETIAN BLINDS ================= */}
      {/* Sleek Aluminum Valance Headrail Cassette */}
      <group position={[0.13, 1.18, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.07, 3.16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Bottom Hem Bar */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <boxGeometry args={[0.06, 0.03, 3.12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Partially drawn horizontal micro-slats (drawn only 20% down, leaving 80% open!) */}
        {Array.from({ length: 6 }).map((_, bIdx) => (
          <mesh
            key={`slat-${bIdx}`}
            position={[0, -bIdx * 0.065 - 0.05, 0]}
            rotation={[0.35, 0, 0]}
          >
            <boxGeometry args={[0.05, 0.016, 3.1]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        ))}

        {/* Draped Silver Beaded Pull Chain */}
        <mesh position={[0.02, -0.55, -1.48]}>
          <cylinderGeometry args={[0.004, 0.004, 0.7, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.02, -0.92, -1.48]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ================= 6. POLISHED BEVELED WINDOW SILL & BRACKETS ================= */}
      {/* Thick Polished Hardwood / Light Marble Window Sill */}
      <group position={[0.16, -1.31, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.07, 3.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.05} />
        </mesh>
        {/* Polished Edge Bullnose Trim */}
        <mesh position={[0.17, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 3.4, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
        </mesh>
        {/* Architectural Sill Apron Trim underneath */}
        <mesh position={[0.02, -0.06, 0]}>
          <boxGeometry args={[0.04, 0.06, 3.32]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>

        {/* Decorative Classical Corbels / Wall Brackets Under Sill */}
        {[-1.2, 1.2].map((zOffset, i) => (
          <group key={`corbel-${i}`} position={[0.02, -0.16, zOffset]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.16, 0.07]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ================= 7. CURATED SILL BOTANICALS & SCIENCE PROPS ================= */}
      {index === 0 && (
        /* Window 0: Fluted Terracotta Planter with Layered Leafy Houseplant */
        <group position={[0.22, -1.18, 0.7]}>
          {/* Terracotta Pot */}
          <mesh castShadow>
            <cylinderGeometry args={[0.16, 0.11, 0.22, 24]} />
            <meshStandardMaterial color="#c2410c" roughness={0.75} />
          </mesh>
          {/* Pot Rim */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.03, 24]} />
            <meshStandardMaterial color="#9a3412" roughness={0.7} />
          </mesh>
          {/* Dark Potting Soil */}
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.01, 16]} />
            <meshStandardMaterial color="#271c19" roughness={0.9} />
          </mesh>
          {/* Layered Monstera Leaves with Organic Tilts */}
          {[
            { pos: [0.08, 0.22, 0.06], rot: [0.3, 0.4, -0.2], size: [0.18, 0.26] },
            { pos: [-0.07, 0.24, -0.05], rot: [-0.2, -0.5, 0.3], size: [0.17, 0.24] },
            { pos: [0.02, 0.32, -0.08], rot: [-0.4, 0.2, -0.1], size: [0.19, 0.28] },
            { pos: [-0.05, 0.18, 0.08], rot: [0.4, -0.3, 0.2], size: [0.16, 0.22] },
          ].map((leaf, lIdx) => (
            <mesh
              key={`leaf-${lIdx}`}
              position={leaf.pos as [number, number, number]}
              rotation={leaf.rot as [number, number, number]}
              castShadow
            >
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color={lIdx % 2 === 0 ? '#15803d' : '#16a34a'} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {index === 1 && (
        /* Window 1: Chemistry & Biology Glassware with Glowing Solution */
        <group position={[0.22, -1.24, -0.6]}>
          {/* Glass Erlenmeyer Flask */}
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.14, 0.24, 20]} />
            <meshPhysicalMaterial
              transmission={0.92}
              roughness={0.08}
              transparent
              opacity={0.4}
              color="#e0f2fe"
            />
          </mesh>
          {/* Cobalt Blue Chemical Liquid inside Flask */}
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 0.11, 20]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0369a1"
              emissiveIntensity={0.4}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Graduated Glass Cylinder */}
          <mesh position={[0, 0.15, 0.28]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.28, 16]} />
            <meshPhysicalMaterial
              transmission={0.92}
              roughness={0.08}
              transparent
              opacity={0.4}
              color="#e0f2fe"
            />
          </mesh>
          {/* Emerald Green Liquid inside Cylinder */}
          <mesh position={[0, 0.11, 0.28]}>
            <cylinderGeometry args={[0.03, 0.03, 0.18, 16]} />
            <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}

      {index === 2 && (
        /* Window 2: Stack of 3 Academic Hardcover Textbooks & Succulent */
        <group position={[0.22, -1.24, 0.5]}>
          {/* Bottom Book (Biology) */}
          <mesh position={[0, 0.025, 0]} castShadow>
            <boxGeometry args={[0.24, 0.045, 0.32]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
          </mesh>
          {/* Middle Book (Organic Chemistry) */}
          <mesh position={[0.01, 0.065, 0.02]} rotation={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.22, 0.04, 0.30]} />
            <meshStandardMaterial color="#991b1b" roughness={0.4} />
          </mesh>
          {/* Top Book (Physics) */}
          <mesh position={[-0.01, 0.10, -0.01]} rotation={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.20, 0.035, 0.28]} />
            <meshStandardMaterial color="#065f46" roughness={0.4} />
          </mesh>

          {/* Small White Ceramic Succulent Pot */}
          <group position={[0, 0.07, -0.36]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <dodecahedronGeometry args={[0.09, 0]} />
              <meshStandardMaterial color="#10b981" roughness={0.5} />
            </mesh>
          </group>
        </group>
      )}

      {index === 3 && (
        /* Window 3: Modern Ceramic Planter with Upright Variegated Snake Plant */
        <group position={[0.22, -1.20, -0.5]}>
          {/* Modern White Matte Cylinder Pot */}
          <mesh castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.22, 24]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
          </mesh>
          {/* Dark Soil */}
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.01, 16]} />
            <meshStandardMaterial color="#271c19" roughness={0.9} />
          </mesh>
          {/* Upright Variegated Blades */}
          {[
            { pos: [0, 0.26, 0], rot: [0, 0, 0], h: 0.38, w: 0.04 },
            { pos: [0.03, 0.22, 0.04], rot: [0.1, 0.2, 0.05], h: 0.32, w: 0.035 },
            { pos: [-0.03, 0.24, -0.03], rot: [-0.1, -0.2, -0.05], h: 0.34, w: 0.035 },
            { pos: [0.04, 0.18, -0.04], rot: [-0.1, 0.3, 0.1], h: 0.26, w: 0.03 },
            { pos: [-0.04, 0.19, 0.03], rot: [0.15, -0.3, -0.1], h: 0.28, w: 0.03 },
          ].map((blade, bIdx) => (
            <mesh
              key={`blade-${bIdx}`}
              position={blade.pos as [number, number, number]}
              rotation={blade.rot as [number, number, number]}
              castShadow
            >
              <boxGeometry args={[0.01, blade.h, blade.w]} />
              <meshStandardMaterial color={bIdx % 2 === 0 ? '#15803d' : '#84cc16'} roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
