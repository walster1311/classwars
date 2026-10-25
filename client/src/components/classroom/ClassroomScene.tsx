'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CLASSROOM_SEATS } from '@classverse/shared';
import { SeatStation } from './SeatStation';
import { Avatar } from './Avatar';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';
import { SmartBoard } from './props/SmartBoard';
import {
  TeacherDeskMesh,
  DetailedBookshelf,
  BulletinBoardMesh,
  SuspendedCeilingLamps
} from './props/ClassroomFurniture';

interface ClassroomSceneProps {
  onFloorClick?: (point: THREE.Vector3) => void;
}

export function ClassroomScene({ onFloorClick }: ClassroomSceneProps) {
  const players = useClassroomStore((s) => s.players);
  const mySessionId = useClassroomStore((s) => s.mySessionId);
  const mySeatId = useClassroomStore((s) => s.mySeatId);

  const handleFloorPointerDown = (e: any) => {
    e.stopPropagation();
    if (mySeatId) {
      colyseusService.sendStand();
    }
    if (e.point && onFloorClick) {
      onFloorClick(e.point);
    }
  };

  return (
    <group>
      {/* ================= LIGHTING & ATMOSPHERE ================= */}
      <ambientLight intensity={0.65} color="#f8fafc" />
      {/* Warm natural sunbeam light casting from windows */}
      <directionalLight
        position={[-14, 18, -4]}
        intensity={1.35}
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
        shadow-bias={-0.0004}
      />
      {/* Fill bounce light from front right */}
      <directionalLight position={[10, 10, 8]} intensity={0.35} color="#93c5fd" />

      {/* Suspended Ceiling Light Fixtures */}
      <SuspendedCeilingLamps />

      {/* ================= FLOOR ARCHITECTURE ================= */}
      {/* Polished Hardwood Plank Classroom Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onPointerDown={handleFloorPointerDown}
      >
        <planeGeometry args={[16.2, 14.2]} />
        <meshStandardMaterial color="#c29b69" roughness={0.3} metalness={0.06} />
      </mesh>

      {/* Architectural Baseboard Molding along Floor Perimeter */}
      <mesh position={[0, 0.08, -6.95]}>
        <boxGeometry args={[16.2, 0.16, 0.08]} />
        <meshStandardMaterial color="#451a03" roughness={0.4} />
      </mesh>
      <mesh position={[-8.05, 0.08, 0]}>
        <boxGeometry args={[0.08, 0.16, 14.2]} />
        <meshStandardMaterial color="#451a03" roughness={0.4} />
      </mesh>
      <mesh position={[8.05, 0.08, 0]}>
        <boxGeometry args={[0.08, 0.16, 14.2]} />
        <meshStandardMaterial color="#451a03" roughness={0.4} />
      </mesh>

      {/* ================= WALL ARCHITECTURE ================= */}
      {/* Front Wall (Z = -7.0) */}
      <mesh position={[0, 2.5, -7.0]} receiveShadow>
        <boxGeometry args={[16.2, 5.0, 0.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      {/* Classic Architectural Wainscoting Panel on Front Wall */}
      <mesh position={[0, 0.65, -6.89]}>
        <boxGeometry args={[16.2, 1.3, 0.04]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>

      {/* Left Wall with Windows (X = -8.1) */}
      <mesh position={[-8.1, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5.0, 14.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      {/* Left Wall Wainscoting */}
      <mesh position={[-7.99, 0.65, 0]}>
        <boxGeometry args={[0.04, 1.3, 14.2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>

      {/* Right Wall with Bookshelves (X = 8.1) */}
      <mesh position={[8.1, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5.0, 14.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      {/* Right Wall Wainscoting */}
      <mesh position={[7.99, 0.65, 0]}>
        <boxGeometry args={[0.04, 1.3, 14.2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>

      {/* Back Wall (Z = 7.1) with Entry Door cutout */}
      <mesh position={[-4.5, 2.5, 7.1]} receiveShadow>
        <boxGeometry args={[7.2, 5.0, 0.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      <mesh position={[4.5, 2.5, 7.1]} receiveShadow>
        <boxGeometry args={[7.2, 5.0, 0.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.3, 7.1]} receiveShadow>
        <boxGeometry args={[2.0, 1.4, 0.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Classroom Door Frame & Paneled Door (Back Wall) */}
      <group position={[0, 1.7, 7.0]}>
        {/* Outer Frame */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 3.4, 0.16]} />
          <meshStandardMaterial color="#582f0e" roughness={0.4} />
        </mesh>
        {/* Door Slab */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.82, 3.2, 0.08]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* Inset Frosted Vision Glass */}
        <mesh position={[0, 0.65, 0.04]}>
          <boxGeometry args={[0.7, 1.1, 0.04]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.15} transparent opacity={0.75} />
        </mesh>
        {/* Brass Commercial Lever Handle */}
        <mesh position={[0.68, -0.05, 0.08]} castShadow>
          <boxGeometry args={[0.14, 0.03, 0.06]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.62, -0.05, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* ================= SMART HYBRID BLACKBOARD & SCREEN ================= */}
      <SmartBoard />

      {/* Wall Clock above SmartBoard */}
      <group position={[0, 4.2, -6.85]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.08, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.02, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Clock Dials & Hands */}
        <mesh position={[0, 0.12, 0.06]}>
          <boxGeometry args={[0.03, 0.24, 0.02]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.08, 0, 0.06]} rotation={[0, 0, -Math.PI / 2]}>
          <boxGeometry args={[0.02, 0.3, 0.02]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* ================= LEFT WALL SUNLIT WINDOWS ================= */}
      {[-3.0, 2.0].map((zPos, idx) => (
        <group key={`win-${idx}`} position={[-7.95, 2.6, zPos]} rotation={[0, Math.PI / 2, 0]}>
          {/* Heavy Architectural Exterior Frame */}
          <mesh castShadow>
            <boxGeometry args={[3.4, 2.5, 0.12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {/* Glass Pane */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[3.2, 2.3, 0.02]} />
            <meshStandardMaterial color="#bae6fd" transparent opacity={0.6} roughness={0.1} />
          </mesh>
          {/* Window Mullions Grid */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[3.2, 0.06, 0.04]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.06, 2.3, 0.04]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Window Sill with Wood Plank Top */}
          <mesh position={[0, -1.3, 0.12]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.12, 0.38]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>

          {/* Venetian Blinds Header & Slats */}
          <group position={[0, 1.15, 0.06]}>
            <mesh>
              <boxGeometry args={[3.2, 0.08, 0.06]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            {/* Partially Tilted Horizontal Blinds */}
            {Array.from({ length: 14 }).map((_, bIdx) => (
              <mesh key={`blind-${bIdx}`} position={[0, -bIdx * 0.15 - 0.08, 0.02]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[3.15, 0.04, 0.005]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
              </mesh>
            ))}
          </group>

          {/* Terra Cotta Potted Plants on Window Sill */}
          <group position={[1.1, -1.08, 0.16]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.16, 0.11, 0.24, 16]} />
              <meshStandardMaterial color="#c2410c" roughness={0.8} />
            </mesh>
            {/* Lush Foliage */}
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#15803d" roughness={0.4} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ================= CORK BULLETIN BOARD ================= */}
      <BulletinBoardMesh />

      {/* ================= DETAILED BOOKSHELVES UNIT ================= */}
      <DetailedBookshelf />

      {/* Framed Science Wall Poster */}
      <group position={[7.95, 2.6, -3.6]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Black Poster Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.7, 2.1, 0.04]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        {/* Poster Paper */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.6, 2.0, 0.01]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>
        <Text position={[0, 0.7, 0.03]} fontSize={0.16} color="#ffffff" anchorX="center">
          PERIODIC TABLE OF ELEMENTS
        </Text>
        <Text
          position={[0, 0.1, 0.03]}
          fontSize={0.09}
          color="#e0f2fe"
          anchorX="center"
          maxWidth={1.4}
          lineHeight={1.3}
        >
          {"H  He  Li  Be  B  C  N  O  F  Ne\nNa  Mg  Al  Si  P  S  Cl  Ar\nK  Ca  Sc  Ti  V  Cr  Mn  Fe"}
        </Text>
      </group>

      {/* ================= EXECUTIVE TEACHER DESK ================= */}
      <TeacherDeskMesh />

      {/* ================= ALL SEATS (1 Teacher Swivel Chair + 12 Student Desks & Chairs) ================= */}
      {CLASSROOM_SEATS.map((seat) => (
        <SeatStation key={seat.id} seat={seat} />
      ))}

      {/* ================= SYNCHRONIZED PLAYER AVATARS ================= */}
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
