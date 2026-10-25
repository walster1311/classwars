'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { SeatInfo } from '@classverse/shared';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';
import {
  StudentChairMesh,
  StudentDeskMesh,
  TeacherChairMesh
} from './props/ClassroomFurniture';

interface SeatStationProps {
  seat: SeatInfo;
}

export function SeatStation({ seat }: SeatStationProps) {
  const [hovered, setHovered] = useState(false);
  const occupancy = useClassroomStore((s) => s.seats[seat.id]);
  const mySessionId = useClassroomStore((s) => s.mySessionId);
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
    : (isOccupied ? (isOccupiedByMe ? '#3B82F6' : '#64748b') : '#334155');

  return (
    <group position={[seat.x, 0, seat.z]} rotation={[0, seat.isTeacherSeat ? seat.rotY : 0, 0]}>
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
        {seat.isTeacherSeat ? (
          <TeacherChairMesh isOccupied={isOccupied} />
        ) : (
          <StudentChairMesh
            color={chairColor}
            isHovered={hovered}
            isOccupied={isOccupied}
          />
        )}

        {/* Floating Tooltip on Hover */}
        {hovered && (
          <Html position={[0, 1.25, 0]} center distanceFactor={12}>
            <div
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none transition-all flex items-center gap-1.5 ${
                isOccupied
                  ? 'bg-rose-950/90 text-rose-200 border border-rose-500/80 backdrop-blur-sm'
                  : 'bg-emerald-950/90 text-emerald-200 border border-emerald-500/80 backdrop-blur-sm'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-rose-400' : 'bg-emerald-400 animate-ping'}`} />
              <span>
                {isOccupied
                  ? (isOccupiedByMe ? 'Your Current Seat' : `Occupied by ${occupancy.occupiedByName}`)
                  : `Click to Sit: ${seat.name}`}
              </span>
            </div>
          </Html>
        )}
      </group>

      {/* Desk associated with this student seat */}
      {!seat.isTeacherSeat && (
        <StudentDeskMesh hasLaptop={seat.col % 2 === 0} />
      )}
    </group>
  );
}
