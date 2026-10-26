'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterType } from '@classverse/shared';
import { ChibiModel } from './ChibiModel';

interface ChibiPreviewCanvasProps {
  gender: CharacterType;
  hairstyleId: string;
  hairColor?: string;
  animation?: 'idle' | 'walk' | 'sit' | 'raise_hand' | 'wave' | 'celebrate';
}

function StudioScene({
  gender,
  hairstyleId,
  hairColor,
  animation
}: ChibiPreviewCanvasProps) {
  const modelGroupRef = useRef<THREE.Group>(null);

  // Subtle auto-rotation when idle
  useFrame((_, delta) => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <>
      {/* Studio Lighting */}
      <ambientLight intensity={0.9} color="#f8fafc" />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.6} color="#93c5fd" />
      <pointLight position={[0, 3, 2]} intensity={0.4} color="#fef08a" />

      {/* Decorative Pedestal Podium */}
      <group position={[0, -0.04, 0]}>
        {/* Upper Platform */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.9, 0.95, 0.08, 36]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Glowing Rim Ring */}
        <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.82, 0.88, 36]} />
          <meshBasicMaterial color={gender === 'boy' ? '#38bdf8' : '#ec4899'} />
        </mesh>
        {/* Soft Ground Shadow Disc */}
        <mesh position={[0, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.4, 32]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Rotating Chibi Character */}
      <group ref={modelGroupRef} position={[0, 0, 0]}>
        <ChibiModel
          gender={gender}
          hairstyleId={hairstyleId}
          hairColor={hairColor}
          animation={animation}
          scale={1.25}
        />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2.0}
        maxDistance={4.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.75, 0]}
        dampingFactor={0.05}
      />
    </>
  );
}

export function ChibiPreviewCanvas(props: ChibiPreviewCanvasProps) {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.1, 2.8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <StudioScene {...props} />
      </Canvas>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] text-slate-400 pointer-events-none whitespace-nowrap backdrop-blur-sm">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
