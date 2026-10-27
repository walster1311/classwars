'use client';

import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CLASSROOM_SEATS } from '@classverse/shared';
import { SeatStation } from './SeatStation';
import { Avatar } from './Avatar';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';
import { SmartBoard } from './props/SmartBoard';
import { ClassroomClock } from './props/ClassroomClock';
import {
  TeacherDeskMesh,
  DetailedBookshelf,
  BulletinBoardMesh
} from './props/ClassroomFurniture';
import { ProjectilesManager } from './props/ProjectilesManager';

// Isolated PlayerAvatars component to prevent re-rendering the entire 100-seat classroom scene on movement
function PlayerAvatars() {
  const players = useClassroomStore((s) => s.players);
  const mySessionId = useClassroomStore((s) => s.mySessionId);

  return (
    <group>
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

export function ClassroomScene() {
  const { camera } = useThree();

  const wallCutoffMode = useClassroomStore((s) => s.wallCutoffMode);

  // Four upper wall refs for dynamic cutaway
  const frontWallRef = useRef<THREE.Group>(null);
  const backWallRef = useRef<THREE.Group>(null);
  const leftWallRef = useRef<THREE.Group>(null);
  const rightWallRef = useRef<THREE.Group>(null);

  // Initial scale values for perimeter walls (Full height 1.0 by default)
  const frontScale = useRef(1.0);
  const backScale = useRef(1.0);
  const leftScale = useRef(1.0);
  const rightScale = useRef(1.0);

  // Dynamic Camera Orbit Wall Cutoff System
  useFrame((_, delta) => {
    const camX = camera.position.x;
    const camZ = camera.position.z;
    const dist = Math.hypot(camX, camZ) || 1;
    const dirX = camX / dist;
    const dirZ = camZ / dist;

    // The Front Wall (blackboard, clock, and front architecture) NEVER disappears
    const targetFront = 1.0;
    let targetBack = 1.0;
    let targetLeft = 1.0;
    let targetRight = 1.0;

    if (wallCutoffMode === 'cutoff') {
      // Cut off side and back walls into low architectural knee-walls (Front wall remains fully standing)
      targetBack = 0.001;
      targetLeft = 0.001;
      targetRight = 0.001;
    } else if (wallCutoffMode === 'raised') {
      // Full height walls all around
      targetBack = 1.0;
      targetLeft = 1.0;
      targetRight = 1.0;
    } else {
      // 'auto': dynamic cutaway based on camera orbit angle for side/back walls
      // Back wall is at +Z: if camera is on +Z side (looking inward), cut it off
      targetBack = dirZ > 0.08 ? 0.001 : 1.0;

      // Right wall is at +X: if camera is on +X side (looking inward), cut it off
      targetRight = dirX > 0.08 ? 0.001 : 1.0;

      // Left wall is at -X: if camera is on -X side (looking inward), cut it off
      targetLeft = dirX < -0.08 ? 0.001 : 1.0;
    }

    const lerpSpeed = Math.min(1.0, delta * 9);

    frontScale.current = 1.0;
    backScale.current = THREE.MathUtils.lerp(backScale.current, targetBack, lerpSpeed);
    leftScale.current = THREE.MathUtils.lerp(leftScale.current, targetLeft, lerpSpeed);
    rightScale.current = THREE.MathUtils.lerp(rightScale.current, targetRight, lerpSpeed);

    if (frontWallRef.current) {
      frontWallRef.current.scale.y = 1.0;
      frontWallRef.current.visible = true;
    }
    if (backWallRef.current) {
      backWallRef.current.scale.y = backScale.current;
      backWallRef.current.visible = backScale.current > 0.03;
    }
    if (leftWallRef.current) {
      leftWallRef.current.scale.y = leftScale.current;
      leftWallRef.current.visible = leftScale.current > 0.03;
    }
    if (rightWallRef.current) {
      rightWallRef.current.scale.y = rightScale.current;
      rightWallRef.current.visible = rightScale.current > 0.03;
    }
  });

  return (
    <group>
      {/* ================= LIGHTING & ATMOSPHERE ================= */}
      {/* Soft, even ambient classroom lighting */}
      <ambientLight intensity={1.0} color="#f8fafc" />

      {/* Main Overhead Ceiling Downlight (Natural direct downlighting, zero wall cast shadows) */}
      <directionalLight
        position={[2, 24, 2]}
        intensity={0.7}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0006}
      />
      {/* Soft ambient fill lights (No shadow casting) */}
      <directionalLight position={[-12, 16, -12]} intensity={0.25} color="#e0f2fe" />
      <directionalLight position={[12, 16, 12]} intensity={0.25} color="#fef3c7" />

      {/* ================= FLOOR ARCHITECTURE ================= */}
      {/* Polished Hardwood Plank Classroom Floor (Expanded 26.4m x 29.4m) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[26.4, 29.4]} />
        <meshStandardMaterial color="#c29b69" roughness={0.3} metalness={0.06} />
      </mesh>

      {/* ================= ARCHITECTURAL PERIMETER CURBS (ALWAYS VISIBLE) ================= */}
      {/* Front Wall Curb (Z = -14.0) */}
      <group position={[0, 0, -14.0]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[26.4, 0.56, 0.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Hardwood Curb Cap */}
        <mesh position={[0, 0.57, 0]}>
          <boxGeometry args={[26.48, 0.04, 0.26]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      </group>

      {/* Back Wall Curb (Z = 14.5) */}
      <group position={[0, 0, 14.5]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[26.4, 0.56, 0.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Hardwood Curb Cap */}
        <mesh position={[0, 0.57, 0]}>
          <boxGeometry args={[26.48, 0.04, 0.26]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      </group>

      {/* Left Wall Curb (X = -13.1) */}
      <group position={[-13.1, 0, 0]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.2, 0.56, 29.4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Hardwood Curb Cap */}
        <mesh position={[0, 0.57, 0]}>
          <boxGeometry args={[0.26, 0.04, 29.48]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      </group>

      {/* Right Wall Curb (X = 13.1) */}
      <group position={[13.1, 0, 0]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.2, 0.56, 29.4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Hardwood Curb Cap */}
        <mesh position={[0, 0.57, 0]}>
          <boxGeometry args={[0.26, 0.04, 29.48]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      </group>

      {/* ================= DYNAMIC UPPER WALLS (ORBIT CUTOFF SYSTEM) ================= */}

      {/* 1. FRONT UPPER WALL & PROPS (Z = -14.0) */}
      <group ref={frontWallRef} position={[0, 0.58, 0]}>
        {/* Upper Wall Structure */}
        <mesh position={[0, 2.21, -14.0]}>
          <boxGeometry args={[26.4, 4.42, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {/* Wainscoting upper portion */}
        <mesh position={[0, 0.35, -13.89]}>
          <boxGeometry args={[26.4, 0.7, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>

        {/* Smart Hybrid Blackboard & Screen */}
        <group position={[0, -0.58, 0]}>
          <SmartBoard position={[0, 2.45, -13.85]} />
        </group>

        {/* Real-time Philippine Standard Time (PST/UTC+8) Clock - Raised clear of blackboard */}
        <ClassroomClock position={[0, 3.85, -13.86]} />
      </group>

      {/* 2. BACK UPPER WALL & PROPS (Z = 14.5) */}
      <group ref={backWallRef} position={[0, 0.58, 0]}>
        <mesh position={[-7.4, 2.21, 14.5]}>
          <boxGeometry args={[11.6, 4.42, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[7.4, 2.21, 14.5]}>
          <boxGeometry args={[11.6, 4.42, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[0, 3.72, 14.5]}>
          <boxGeometry args={[3.2, 1.4, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>

        {/* Classroom Double Entrance Door Frame & Doors */}
        <group position={[0, 1.12, 14.4]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3.0, 3.4, 0.16]} />
            <meshStandardMaterial color="#582f0e" roughness={0.4} />
          </mesh>
          {/* Left Door Leaf */}
          <mesh position={[-0.72, 0, 0.02]}>
            <boxGeometry args={[1.38, 3.2, 0.08]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
          <mesh position={[-0.72, 0.65, 0.04]}>
            <boxGeometry args={[0.55, 1.1, 0.04]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.15} transparent opacity={0.75} />
          </mesh>
          {/* Left Door Brass Handle */}
          <mesh position={[-0.12, -0.05, 0.08]}>
            <boxGeometry args={[0.12, 0.03, 0.06]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Right Door Leaf */}
          <mesh position={[0.72, 0, 0.02]}>
            <boxGeometry args={[1.38, 3.2, 0.08]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
          <mesh position={[0.72, 0.65, 0.04]}>
            <boxGeometry args={[0.55, 1.1, 0.04]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.15} transparent opacity={0.75} />
          </mesh>
          {/* Right Door Brass Handle */}
          <mesh position={[0.12, -0.05, 0.08]}>
            <boxGeometry args={[0.12, 0.03, 0.06]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      </group>

      {/* 3. LEFT UPPER WALL (SOLID ARCHITECTURAL WALL) (X = -13.1) */}
      <group ref={leftWallRef} position={[0, 0.58, 0]}>
        {/* Full Solid Structural Wall */}
        <mesh position={[-13.1, 2.21, 0]}>
          <boxGeometry args={[0.2, 4.42, 29.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {/* Architectural Wainscoting */}
        <mesh position={[-12.99, 0.35, 0]}>
          <boxGeometry args={[0.04, 0.7, 29.4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>

        {/* Cork Bulletin Board Mounted on Center Left Wall */}
        <group position={[0, -0.58, 0]}>
          <BulletinBoardMesh position={[-12.95, 2.5, 0.0]} />
        </group>
      </group>

      {/* 4. RIGHT UPPER WALL & PROPS (X = 13.1) */}
      <group ref={rightWallRef} position={[0, 0.58, 0]}>
        <mesh position={[13.1, 2.21, 0]}>
          <boxGeometry args={[0.2, 4.42, 29.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[12.99, 0.35, 0]}>
          <boxGeometry args={[0.04, 0.7, 29.4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>

        {/* Dual Detailed Bookshelf Units */}
        <group position={[0, -0.58, 0]}>
          <DetailedBookshelf position={[12.8, 1.8, -4.5]} />
          <DetailedBookshelf position={[12.8, 1.8, 4.5]} />
        </group>

        {/* Periodic Table Science Poster */}
        <group position={[12.95, 2.02, -9.5]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[1.7, 2.1, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
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

        {/* Classverse Campus Science Charter Poster */}
        <group position={[12.95, 2.02, 9.5]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[1.7, 2.1, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[1.6, 2.0, 0.01]} />
            <meshStandardMaterial color="#059669" roughness={0.6} />
          </mesh>
          <Text position={[0, 0.7, 0.03]} fontSize={0.16} color="#ffffff" anchorX="center">
            SCIENTIFIC METHOD
          </Text>
          <Text
            position={[0, 0.1, 0.03]}
            fontSize={0.09}
            color="#d1fae5"
            anchorX="center"
            maxWidth={1.4}
            lineHeight={1.3}
          >
            {"1. Observe Phenomenon\n2. Form Hypothesis\n3. Conduct Experiment\n4. Analyze Data\n5. Draw Conclusions"}
          </Text>
        </group>
      </group>

      {/* ================= EXECUTIVE TEACHER DESK ================= */}
      <TeacherDeskMesh position={[0, 0, -10.25]} />

      {/* ================= ALL SEATS (1 Teacher Swivel Chair + 12 Student Desks & Chairs) ================= */}
      {CLASSROOM_SEATS.map((seat) => (
        <SeatStation key={seat.id} seat={seat} />
      ))}

      {/* ================= SYNCHRONIZED PLAYER AVATARS ================= */}
      <PlayerAvatars />

      {/* ================= DYNAMIC 3D PROJECTILES & SOCIAL PARTICLES ================= */}
      <ProjectilesManager />
    </group>
  );
}
