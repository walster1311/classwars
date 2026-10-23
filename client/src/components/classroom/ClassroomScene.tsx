'use client';

import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CLASSROOM_SEATS, CLASSROOM_BOUNDS } from '@classverse/shared';
import { SeatStation } from './SeatStation';
import { Avatar } from './Avatar';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

interface ClassroomSceneProps {
  onFloorClick?: (point: THREE.Vector3) => void;
}

export function ClassroomScene({ onFloorClick }: ClassroomSceneProps) {
  const players = useClassroomStore((s) => s.players);
  const mySessionId = useClassroomStore((s) => s.mySessionId);
  const mySeatId = useClassroomStore((s) => s.mySeatId);

  const handleFloorPointerDown = (e: any) => {
    // Only trigger if click directly hits the floor plane
    e.stopPropagation();
    if (mySeatId) {
      // If sitting, user should click Stand Up first, or auto stand
      colyseusService.sendStand();
    }
    if (e.point && onFloorClick) {
      onFloorClick(e.point);
    }
  };

  return (
    <group>
      {/* ================= LIGHTING ================= */}
      <ambientLight intensity={0.7} color="#f8fafc" />
      <directionalLight
        position={[-12, 18, -6]}
        intensity={1.2}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />
      {/* Front spotlight on presentation board */}
      <spotLight
        position={[0, 7, -2]}
        target-position={[0, 2, -6.8]}
        intensity={0.6}
        angle={0.6}
        penumbra={0.5}
        color="#ffffff"
      />

      {/* ================= FLOOR ================= */}
      {/* Main Wood Plank Classroom Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onPointerDown={handleFloorPointerDown}
      >
        <planeGeometry args={[16.2, 14.2]} />
        <meshStandardMaterial color="#d4a373" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Outer border trim */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[16.5, 0.1, 0.15]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>

      {/* ================= WALLS ================= */}
      {/* Front Wall (Z = -7.0) */}
      <mesh position={[0, 2.5, -7.0]} receiveShadow>
        <boxGeometry args={[16.2, 5.0, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
      </mesh>
      {/* Wainscoting on Front Wall */}
      <mesh position={[0, 0.6, -6.89]}>
        <boxGeometry args={[16.2, 1.2, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>

      {/* Left Wall (X = -8.1) */}
      <mesh position={[-8.1, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5.0, 14.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
      </mesh>

      {/* Right Wall (X = 8.1) */}
      <mesh position={[8.1, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5.0, 14.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
      </mesh>

      {/* Back Wall (Z = 7.1) with doorway cutout */}
      <mesh position={[-4.5, 2.5, 7.1]} receiveShadow>
        <boxGeometry args={[7.2, 5.0, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
      </mesh>
      <mesh position={[4.5, 2.5, 7.1]} receiveShadow>
        <boxGeometry args={[7.2, 5.0, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.2, 7.1]} receiveShadow>
        <boxGeometry args={[2.0, 1.6, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
      </mesh>

      {/* Classroom Door Frame & Door (Back Wall) */}
      <group position={[0, 1.6, 7.0]}>
        {/* Door Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.0, 3.2, 0.15]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Door Panel */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.8, 3.0, 0.08]} />
          <meshStandardMaterial color="#9a3412" roughness={0.4} />
        </mesh>
        {/* Door Window */}
        <mesh position={[0, 0.6, 0.04]}>
          <boxGeometry args={[0.8, 1.0, 0.06]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.1} transparent opacity={0.7} />
        </mesh>
        {/* Brass Door Handle */}
        <mesh position={[0.65, -0.1, 0.08]}>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* ================= FRONT CHALKBOARD / SCREEN ================= */}
      <group position={[0, 2.4, -6.85]}>
        {/* Wooden Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[9.4, 2.6, 0.1]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
        {/* Slate Blackboard */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[9.0, 2.2, 0.02]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Chalk Ledge */}
        <mesh position={[0, -1.15, 0.15]} castShadow>
          <boxGeometry args={[9.0, 0.08, 0.22]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Chalk Sticks & Eraser */}
        <mesh position={[-2.0, -1.08, 0.15]}>
          <boxGeometry args={[0.2, 0.04, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-1.5, -1.08, 0.15]}>
          <boxGeometry args={[0.35, 0.06, 0.12]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Board Title & Educational Text */}
        <Text
          position={[0, 0.7, 0.09]}
          fontSize={0.28}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          BIOLOGY 101: CELL DIVISION & MITOSIS
        </Text>
        <Text
          position={[-3.0, 0.1, 0.09]}
          fontSize={0.17}
          color="#f8fafc"
          anchorX="left"
          anchorY="middle"
        >
          {"• Prophase: Chromatin condenses into chromosomes\n• Metaphase: Chromosomes align along equator\n• Anaphase: Sister chromatids pull apart\n• Telophase: Nuclear membrane reforms"}
        </Text>
      </group>

      {/* Wall Clock above Blackboard */}
      <group position={[0, 4.1, -6.85]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.02, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Clock Hands */}
        <mesh position={[0, 0.1, 0.06]}>
          <boxGeometry args={[0.03, 0.22, 0.02]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.07, 0, 0.06]} rotation={[0, 0, -Math.PI / 2]}>
          <boxGeometry args={[0.02, 0.28, 0.02]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* ================= LEFT WALL WINDOWS (Sunlight) ================= */}
      {[-3.0, 2.0].map((zPos, idx) => (
        <group key={`window-${idx}`} position={[-7.95, 2.6, zPos]} rotation={[0, Math.PI / 2, 0]}>
          {/* Outer Frame */}
          <mesh>
            <boxGeometry args={[3.2, 2.4, 0.1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Glass */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[3.0, 2.2, 0.02]} />
            <meshStandardMaterial color="#bae6fd" transparent opacity={0.65} roughness={0.1} />
          </mesh>
          {/* Window Panes Grid */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[3.0, 0.06, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.06, 2.2, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Window Sill */}
          <mesh position={[0, -1.25, 0.1]} castShadow>
            <boxGeometry args={[3.4, 0.1, 0.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Potted Plant on Sill */}
          <mesh position={[0.9, -1.05, 0.1]} castShadow>
            <cylinderGeometry args={[0.15, 0.1, 0.22, 16]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
          <mesh position={[0.9, -0.85, 0.1]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#15803d" />
          </mesh>
        </group>
      ))}

      {/* ================= RIGHT WALL BOOKSHELVES ================= */}
      <group position={[7.8, 1.8, 0]}>
        {/* Tall Bookshelf Unit */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.45, 3.4, 4.2]} />
          <meshStandardMaterial color="#582f0e" roughness={0.5} />
        </mesh>
        {/* Shelves */}
        {[-1.1, -0.3, 0.5, 1.3].map((yOff, i) => (
          <mesh key={`shelf-${i}`} position={[-0.05, yOff, 0]}>
            <boxGeometry args={[0.4, 0.05, 4.0]} />
            <meshStandardMaterial color="#7f4f24" />
          </mesh>
        ))}
        {/* Books rows */}
        <mesh position={[-0.05, -0.85, 0]}>
          <boxGeometry args={[0.3, 0.45, 3.6]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>
        <mesh position={[-0.05, -0.05, -0.2]}>
          <boxGeometry args={[0.3, 0.45, 3.0]} />
          <meshStandardMaterial color="#b91c1c" />
        </mesh>
        <mesh position={[-0.05, 0.75, 0.3]}>
          <boxGeometry args={[0.3, 0.45, 2.8]} />
          <meshStandardMaterial color="#047857" />
        </mesh>
      </group>

      {/* Wall Posters */}
      <group position={[7.95, 2.6, -3.5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 2.0, 0.02]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <Text position={[0, 0.6, 0.03]} fontSize={0.16} color="#ffffff">
          PERIODIC TABLE
        </Text>
      </group>

      {/* ================= TEACHER DESK & PODIUM ================= */}
      <group position={[0, 0, -4.5]}>
        {/* Large Teacher Desk */}
        <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.08, 1.1]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* Desk Cabinets & Legs */}
        <mesh position={[-0.95, 0.38, 0]} castShadow>
          <boxGeometry args={[0.45, 0.76, 0.95]} />
          <meshStandardMaterial color="#582f0e" />
        </mesh>
        <mesh position={[0.95, 0.38, 0]} castShadow>
          <boxGeometry args={[0.45, 0.76, 0.95]} />
          <meshStandardMaterial color="#582f0e" />
        </mesh>
        <mesh position={[0, 0.55, -0.42]} castShadow>
          <boxGeometry args={[1.5, 0.4, 0.05]} />
          <meshStandardMaterial color="#582f0e" />
        </mesh>

        {/* Teacher Laptop */}
        <group position={[-0.45, 0.81, 0.1]} rotation={[0, -0.2, 0]}>
          {/* Base */}
          <mesh castShadow>
            <boxGeometry args={[0.36, 0.02, 0.28]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} />
          </mesh>
          {/* Screen tilted up */}
          <mesh position={[0, 0.14, -0.12]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.36, 0.26, 0.015]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Glowing screen display */}
          <mesh position={[0, 0.14, -0.11]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.33, 0.23, 0.005]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Teacher Coffee Mug */}
        <mesh position={[0.45, 0.87, 0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} />
        </mesh>

        {/* Stack of Textbooks & Apple */}
        <mesh position={[0.75, 0.86, -0.1]} castShadow>
          <boxGeometry args={[0.3, 0.12, 0.4]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
        {/* Apple on books */}
        <mesh position={[0.75, 0.96, -0.1]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>
      </group>

      {/* ================= ALL SEATS (1 Teacher Desk + 12 Student Desks) ================= */}
      {CLASSROOM_SEATS.map((seat) => (
        <SeatStation key={seat.id} seat={seat} />
      ))}

      {/* ================= ALL CONNECTED AVATARS ================= */}
      {Object.values(players).map((player) => (
        <Avatar
          key={player.sessionId}
          player={player}
          isLocal={player.sessionId === mySessionId}
        />
      ))}
    </group>
  );
}
