'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { SeatInfo } from '@classverse/shared';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

interface SeatStationProps {
  seat: SeatInfo;
}

export function SeatStation({ seat }: SeatStationProps) {
  const [hovered, setHovered] = useState(false);
  const occupancy = useClassroomStore((s) => s.seats[seat.id]);
  const mySessionId = useClassroomStore((s) => s.mySessionId);
  const mySeatId = useClassroomStore((s) => s.mySeatId);
  const showToast = useClassroomStore((s) => s.showToast);

  const isOccupied = Boolean(occupancy?.occupiedBy);
  const isOccupiedByMe = occupancy?.occupiedBy === mySessionId;

  const handlePointerDown = (e: any) => {
    e.stopPropagation();

    if (isOccupiedByMe) {
      showToast('You are currently sitting in this seat. Use the "Stand Up" button to leave.', 'info');
      return;
    }

    if (isOccupied) {
      showToast(`Seat occupied by ${occupancy.occupiedByName || 'another student'}.`, 'error');
      return;
    }

    // Attempt to sit
    colyseusService.sendSit(seat.id);
  };

  const chairColor = hovered
    ? (isOccupied ? '#EF4444' : '#10B981')
    : (isOccupied ? (isOccupiedByMe ? '#3B82F6' : '#94A3B8') : '#475569');

  return (
    <group position={[seat.x, 0, seat.z]} rotation={[0, seat.rotY, 0]}>
      {/* Interactive Chair Click Target */}
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = isOccupied ? 'not-allowed' : 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onPointerDown={handlePointerDown}
      >
        {/* Chair Legs */}
        <mesh position={[-0.22, 0.22, -0.2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.44]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        <mesh position={[0.22, 0.22, -0.2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.44]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        <mesh position={[-0.22, 0.22, 0.2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.44]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        <mesh position={[0.22, 0.22, 0.2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.44]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>

        {/* Chair Seat Cushion */}
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.52, 0.07, 0.48]} />
          <meshStandardMaterial
            color={chairColor}
            roughness={0.4}
            emissive={hovered ? (isOccupied ? '#EF4444' : '#10B981') : '#000000'}
            emissiveIntensity={hovered ? 0.35 : 0}
          />
        </mesh>

        {/* Chair Backrest */}
        <mesh position={[0, 0.76, 0.22]} castShadow>
          <boxGeometry args={[0.5, 0.42, 0.06]} />
          <meshStandardMaterial
            color={chairColor}
            roughness={0.4}
            emissive={hovered ? (isOccupied ? '#EF4444' : '#10B981') : '#000000'}
            emissiveIntensity={hovered ? 0.35 : 0}
          />
        </mesh>

        {/* Floating Tooltip on Hover */}
        {hovered && (
          <Html position={[0, 1.15, 0]} center distanceFactor={12}>
            <div className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none transition-all ${
              isOccupied
                ? 'bg-rose-900/90 text-rose-200 border border-rose-600'
                : 'bg-emerald-900/90 text-emerald-200 border border-emerald-500'
            }`}>
              {isOccupied
                ? (isOccupiedByMe ? 'Your Seat' : `Occupied by ${occupancy.occupiedByName}`)
                : `Click to sit: ${seat.name}`}
            </div>
          </Html>
        )}
      </group>

      {/* Desk associated with this seat */}
      {!seat.isTeacherSeat ? (
        <group position={[0, 0, -0.65]}>
          {/* Desk Surface */}
          <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.05, 0.06, 0.65]} />
            <meshStandardMaterial color="#d4a373" roughness={0.4} />
          </mesh>

          {/* Desk Metal Legs */}
          <mesh position={[-0.45, 0.36, -0.25]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.72]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.45, 0.36, -0.25]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.72]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-0.45, 0.36, 0.25]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.72]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.45, 0.36, 0.25]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.72]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* Desk Accessories: Notebook & Pencil */}
          <mesh position={[-0.2, 0.76, 0]} rotation={[0, 0.1, 0]}>
            <boxGeometry args={[0.26, 0.02, 0.34]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0.22, 0.76, 0.05]} rotation={[0, -0.2, 0]}>
            <boxGeometry args={[0.28, 0.015, 0.2]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}
