'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ClassroomClockProps {
  position?: [number, number, number];
}

export function ClassroomClock({ position = [0, 3.85, -6.86] }: ClassroomClockProps) {
  const hourHandRef = useRef<THREE.Group>(null);
  const minuteHandRef = useRef<THREE.Group>(null);
  const secondHandRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);
  const [digitalTime, setDigitalTime] = useState<string>('');

  // Update digital time tooltip every 500ms when hovered
  useEffect(() => {
    if (!hovered) return;
    const updateTime = () => {
      try {
        const str = new Intl.DateTimeFormat('en-PH', {
          timeZone: 'Asia/Manila',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date());
        setDigitalTime(str);
      } catch {
        // Fallback calculation for UTC+8
        const now = new Date();
        const phtHours24 = (now.getUTCHours() + 8) % 24;
        const phtMinutes = now.getUTCMinutes();
        const phtSeconds = now.getUTCSeconds();
        const ampm = phtHours24 >= 12 ? 'PM' : 'AM';
        const h12 = phtHours24 % 12 || 12;
        const pad = (n: number) => n.toString().padStart(2, '0');
        setDigitalTime(`${h12}:${pad(phtMinutes)}:${pad(phtSeconds)} ${ampm}`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 500);
    return () => clearInterval(interval);
  }, [hovered]);

  // Real-time animation loop synchronized to Philippine Standard Time (UTC+8)
  useFrame(() => {
    const now = new Date();
    // Philippine Standard Time (PST / UTC+8, no daylight saving time)
    const phtHours = (now.getUTCHours() + 8) % 24;
    const phtMinutes = now.getUTCMinutes();
    const phtSeconds = now.getUTCSeconds();
    const phtMillis = now.getUTCMilliseconds();

    // Authentic quartz tick with snappy snap on the second mark
    let effectiveSecond = phtSeconds;
    if (phtMillis < 120) {
      const progress = phtMillis / 120;
      // Cubic ease-out snap
      const ease = 1 - Math.pow(1 - progress, 3);
      const prevSecond = (phtSeconds - 1 + 60) % 60;
      effectiveSecond = prevSecond + ease;
    }

    const secondAngle = -(effectiveSecond / 60) * Math.PI * 2;
    const minuteAngle = -((phtMinutes + phtSeconds / 60) / 60) * Math.PI * 2;
    const hourAngle = -(((phtHours % 12) + phtMinutes / 60 + phtSeconds / 3600) / 12) * Math.PI * 2;

    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = secondAngle;
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = minuteAngle;
    }
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = hourAngle;
    }
  });

  // Generate 12 hour tick marks and 60 minute tick dots
  const hourTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isCardinal = i % 3 === 0; // 12, 3, 6, 9
      const radius = 0.27;
      const x = Math.sin(angle) * radius;
      const y = Math.cos(angle) * radius;
      const length = isCardinal ? 0.046 : 0.026;
      const width = isCardinal ? 0.014 : 0.007;
      const color = isCardinal ? '#0f172a' : '#475569';

      ticks.push(
        <mesh
          key={`tick-${i}`}
          position={[x, y, 0.03]}
          rotation={[0, 0, -angle]}
        >
          <boxGeometry args={[width, length, 0.006]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    }
    return ticks;
  }, []);

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Outer Casing / Rim */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 48]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Inner Bezel Ring */}
      <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.355, 0.355, 0.04, 48]} />
        <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Dial Face Bed */}
      <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.345, 0.345, 0.01, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Hour Ticks */}
      {hourTicks}

      {/* Dial Face Typography */}
      <Text
        position={[0, 0.14, 0.032]}
        fontSize={0.026}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        PST (UTC+8)
      </Text>

      <Text
        position={[0, -0.14, 0.032]}
        fontSize={0.030}
        color="#2563eb"
        anchorX="center"
        anchorY="middle"
      >
        CLASSVERSE
      </Text>

      {/* Hour Hand Group (Pivoted at base) */}
      <group ref={hourHandRef} position={[0, 0, 0.036]}>
        {/* Main Hour Hand */}
        <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[0.02, 0.15, 0.006]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        {/* Counterweight */}
        <mesh position={[0, -0.025, 0]}>
          <boxGeometry args={[0.024, 0.05, 0.006]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Minute Hand Group (Pivoted at base) */}
      <group ref={minuteHandRef} position={[0, 0, 0.043]}>
        {/* Main Minute Hand */}
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[0.012, 0.22, 0.005]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        {/* Counterweight */}
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[0.016, 0.06, 0.005]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Second Hand Group (Pivoted at base with red needle & counterweight) */}
      <group ref={secondHandRef} position={[0, 0, 0.050]}>
        {/* Needle */}
        <mesh position={[0, 0.115, 0]}>
          <boxGeometry args={[0.005, 0.25, 0.004]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Tail Counterweight */}
        <mesh position={[0, -0.045, 0]}>
          <boxGeometry args={[0.01, 0.09, 0.004]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Center Pivot Cap (Red Rivet) */}
      <mesh position={[0, 0, 0.054]}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Protective Glass Cover */}
      <mesh position={[0, 0, 0.057]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.002, 32]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.12}
          roughness={0.05}
          transmission={0.9}
          thickness={0.01}
          color="#ffffff"
        />
      </mesh>

      {/* Interactive Live PST Readout Tooltip on Hover */}
      {hovered && (
        <Html position={[0, -0.48, 0.06]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-900/95 border border-sky-500/50 text-white px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-sky-400 uppercase">
              <span>🇵🇭</span> Philippine Standard Time
            </div>
            <div className="text-sm font-mono font-bold text-amber-300">
              {digitalTime || 'Syncing PST...'}
            </div>
            <div className="text-[9px] text-slate-400">PAGASA • UTC+8 (No DST)</div>
          </div>
        </Html>
      )}
    </group>
  );
}
