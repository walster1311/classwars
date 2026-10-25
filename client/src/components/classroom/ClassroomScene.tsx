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
  const { camera } = useThree();

  const players = useClassroomStore((s) => s.players);
  const mySessionId = useClassroomStore((s) => s.mySessionId);
  const mySeatId = useClassroomStore((s) => s.mySeatId);
  const wallCutoffMode = useClassroomStore((s) => s.wallCutoffMode);

  // Four upper wall refs for dynamic cutaway
  const frontWallRef = useRef<THREE.Group>(null);
  const backWallRef = useRef<THREE.Group>(null);
  const leftWallRef = useRef<THREE.Group>(null);
  const rightWallRef = useRef<THREE.Group>(null);

  // Initial scale values matching default camera angle [14, 16, 16] (+X, +Z)
  const frontScale = useRef(1.0);
  const backScale = useRef(0.001); // cut off when looking from +Z
  const leftScale = useRef(1.0);
  const rightScale = useRef(0.001); // cut off when looking from +X

  const handleFloorPointerDown = (e: any) => {
    e.stopPropagation();
    if (mySeatId) {
      colyseusService.sendStand();
    }
    if (e.point && onFloorClick) {
      onFloorClick(e.point);
    }
  };

  // Dynamic Camera Orbit Wall Cutoff System
  useFrame((_, delta) => {
    const camX = camera.position.x;
    const camZ = camera.position.z;
    const dist = Math.hypot(camX, camZ) || 1;
    const dirX = camX / dist;
    const dirZ = camZ / dist;

    let targetFront = 1.0;
    let targetBack = 1.0;
    let targetLeft = 1.0;
    let targetRight = 1.0;

    if (wallCutoffMode === 'cutoff') {
      // Cut off all walls into low architectural knee-walls
      targetFront = 0.001;
      targetBack = 0.001;
      targetLeft = 0.001;
      targetRight = 0.001;
    } else if (wallCutoffMode === 'raised') {
      // Full height walls all around
      targetFront = 1.0;
      targetBack = 1.0;
      targetLeft = 1.0;
      targetRight = 1.0;
    } else {
      // 'auto': dynamic cutaway based on camera orbit angle
      // Back wall is at +Z: if camera is on +Z side (looking inward), cut it off
      targetBack = dirZ > 0.08 ? 0.001 : 1.0;

      // Right wall is at +X: if camera is on +X side (looking inward), cut it off
      targetRight = dirX > 0.08 ? 0.001 : 1.0;

      // Front wall is at -Z: if camera is on -Z side (looking inward), cut it off
      targetFront = dirZ < -0.08 ? 0.001 : 1.0;

      // Left wall is at -X: if camera is on -X side (looking inward), cut it off
      targetLeft = dirX < -0.08 ? 0.001 : 1.0;
    }

    const lerpSpeed = Math.min(1.0, delta * 9);

    frontScale.current = THREE.MathUtils.lerp(frontScale.current, targetFront, lerpSpeed);
    backScale.current = THREE.MathUtils.lerp(backScale.current, targetBack, lerpSpeed);
    leftScale.current = THREE.MathUtils.lerp(leftScale.current, targetLeft, lerpSpeed);
    rightScale.current = THREE.MathUtils.lerp(rightScale.current, targetRight, lerpSpeed);

    if (frontWallRef.current) {
      frontWallRef.current.scale.y = frontScale.current;
      frontWallRef.current.visible = frontScale.current > 0.03;
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

      {/* ================= ARCHITECTURAL PERIMETER CURBS (ALWAYS VISIBLE) ================= */}
      {/* Front Wall Curb (Z = -7.0) */}
      <group position={[0, 0, -7.0]}>
        <mesh position={[0, 0.28, 0]} receiveShadow>
          <boxGeometry args={[16.2, 0.56, 0.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Hardwood Curb Cap */}
        <mesh position={[0, 0.57, 0]} castShadow receiveShadow>
          <boxGeometry args={[16.28, 0.04, 0.26]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      </group>

      {/* Back Wall Curb (Z = 7.1) */}
      <group position={[0, 0, 7.1]}>
        <mesh position={[0, 0.28, 0]} receiveShadow>
          <boxGeometry args={[16.2, 0.56, 0.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Hardwood Curb Cap */}
        <mesh position={[0, 0.57, 0]} castShadow receiveShadow>
          <boxGeometry args={[16.28, 0.04, 0.26]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      </group>

      {/* Left Wall Curb (X = -8.1) */}
      <group position={[-8.1, 0, 0]}>
        <mesh position={[0, 0.28, 0]} receiveShadow>
          <boxGeometry args={[0.2, 0.56, 14.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Hardwood Curb Cap */}
        <mesh position={[0, 0.57, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.04, 14.28]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      </group>

      {/* Right Wall Curb (X = 8.1) */}
      <group position={[8.1, 0, 0]}>
        <mesh position={[0, 0.28, 0]} receiveShadow>
          <boxGeometry args={[0.2, 0.56, 14.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Hardwood Curb Cap */}
        <mesh position={[0, 0.57, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.04, 14.28]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      </group>

      {/* ================= DYNAMIC UPPER WALLS (ORBIT CUTOFF SYSTEM) ================= */}

      {/* 1. FRONT UPPER WALL & PROPS (Z = -7.0) */}
      <group ref={frontWallRef} position={[0, 0.58, 0]}>
        {/* Upper Wall Structure */}
        <mesh position={[0, 2.21, -7.0]} receiveShadow>
          <boxGeometry args={[16.2, 4.42, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {/* Wainscoting upper portion */}
        <mesh position={[0, 0.35, -6.89]}>
          <boxGeometry args={[16.2, 0.7, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>

        {/* Smart Hybrid Blackboard & Screen */}
        <group position={[0, -0.58, 0]}>
          <SmartBoard />
        </group>

        {/* Wall Clock */}
        <group position={[0, 3.62, -6.85]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.44, 0.44, 0.08, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.02, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
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
      </group>

      {/* 2. BACK UPPER WALL & PROPS (Z = 7.1) */}
      <group ref={backWallRef} position={[0, 0.58, 0]}>
        <mesh position={[-4.5, 2.21, 7.1]} receiveShadow>
          <boxGeometry args={[7.2, 4.42, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[4.5, 2.21, 7.1]} receiveShadow>
          <boxGeometry args={[7.2, 4.42, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[0, 3.72, 7.1]} receiveShadow>
          <boxGeometry args={[2.0, 1.4, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>

        {/* Classroom Door Frame & Paneled Door */}
        <group position={[0, 1.12, 7.0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[2.0, 3.4, 0.16]} />
            <meshStandardMaterial color="#582f0e" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[1.82, 3.2, 0.08]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.65, 0.04]}>
            <boxGeometry args={[0.7, 1.1, 0.04]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.15} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0.68, -0.05, 0.08]} castShadow>
            <boxGeometry args={[0.14, 0.03, 0.06]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0.62, -0.05, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.04, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      </group>

      {/* 3. LEFT UPPER WALL & PROPS (X = -8.1) */}
      <group ref={leftWallRef} position={[0, 0.58, 0]}>
        <mesh position={[-8.1, 2.21, 0]} receiveShadow>
          <boxGeometry args={[0.2, 4.42, 14.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[-7.99, 0.35, 0]}>
          <boxGeometry args={[0.04, 0.7, 14.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>

        {/* Sunlit Windows */}
        {[-3.0, 2.0].map((zPos, idx) => (
          <group key={`win-${idx}`} position={[-7.95, 2.02, zPos]} rotation={[0, Math.PI / 2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[3.4, 2.5, 0.12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[3.2, 2.3, 0.02]} />
              <meshStandardMaterial color="#bae6fd" transparent opacity={0.6} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[3.2, 0.06, 0.04]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.06, 2.3, 0.04]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0, -1.3, 0.12]} castShadow receiveShadow>
              <boxGeometry args={[3.6, 0.12, 0.38]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} />
            </mesh>
            <group position={[0, 1.15, 0.06]}>
              <mesh>
                <boxGeometry args={[3.2, 0.08, 0.06]} />
                <meshStandardMaterial color="#cbd5e1" />
              </mesh>
              {Array.from({ length: 14 }).map((_, bIdx) => (
                <mesh key={`blind-${bIdx}`} position={[0, -bIdx * 0.15 - 0.08, 0.02]} rotation={[0.4, 0, 0]}>
                  <boxGeometry args={[3.15, 0.04, 0.005]} />
                  <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
                </mesh>
              ))}
            </group>
            <group position={[1.1, -1.08, 0.16]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.16, 0.11, 0.24, 16]} />
                <meshStandardMaterial color="#c2410c" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.22, 12, 12]} />
                <meshStandardMaterial color="#15803d" roughness={0.4} />
              </mesh>
            </group>
          </group>
        ))}

        {/* Cork Bulletin Board */}
        <group position={[0, -0.58, 0]}>
          <BulletinBoardMesh />
        </group>
      </group>

      {/* 4. RIGHT UPPER WALL & PROPS (X = 8.1) */}
      <group ref={rightWallRef} position={[0, 0.58, 0]}>
        <mesh position={[8.1, 2.21, 0]} receiveShadow>
          <boxGeometry args={[0.2, 4.42, 14.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[7.99, 0.35, 0]}>
          <boxGeometry args={[0.04, 0.7, 14.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>

        {/* Detailed Bookshelf Unit */}
        <group position={[0, -0.58, 0]}>
          <DetailedBookshelf />
        </group>

        {/* Periodic Table Science Poster */}
        <group position={[7.95, 2.02, -3.6]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh castShadow>
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
