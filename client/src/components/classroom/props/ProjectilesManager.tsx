'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProjectileEventData } from '@classverse/shared';
import { useClassroomStore } from '@/lib/store';
import { soundEffects } from '@/lib/soundFx';

// -------------------------------------------------------------
// 1. Paper Ball 3D Mesh & Trajectory Component
// -------------------------------------------------------------
function PaperBallMesh({ projectile }: { projectile: ProjectileEventData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3(projectile.startPos.x, projectile.startPos.y, projectile.startPos.z));
  const currentVel = useRef(new THREE.Vector3(projectile.velocity.x, projectile.velocity.y, projectile.velocity.z));
  const isGrounded = useRef(false);
  const hasTriggeredSound = useRef(false);

  // Procedural crumpled paper geometry with slight randomness
  const geometry = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(0.12, 1);
    const posAttr = geo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const factor = 0.85 + Math.random() * 0.3;
      posAttr.setXYZ(i, vx * factor, vy * factor, vz * factor);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (!isGrounded.current) {
      // Ballistic gravity simulation
      currentVel.current.y -= 9.8 * delta;
      currentPos.current.x += currentVel.current.x * delta;
      currentPos.current.y += currentVel.current.y * delta;
      currentPos.current.z += currentVel.current.z * delta;

      // Rotation while tumbling in air
      meshRef.current.rotation.x += 8 * delta;
      meshRef.current.rotation.y += 12 * delta;

      // Floor / desk collision
      const floorLevel = 0.06;
      if (currentPos.current.y <= floorLevel) {
        currentPos.current.y = floorLevel;
        isGrounded.current = true;
        if (!hasTriggeredSound.current) {
          hasTriggeredSound.current = true;
          soundEffects.playPaperHit();
        }
      }
    }

    meshRef.current.position.copy(currentPos.current);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#f8fafc" roughness={0.9} />
    </mesh>
  );
}

// -------------------------------------------------------------
// 2. Paper Airplane 3D Origami Mesh & Aerodynamic Glide
// -------------------------------------------------------------
function PaperAirplaneMesh({ projectile }: { projectile: ProjectileEventData }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(projectile.startPos.x, projectile.startPos.y, projectile.startPos.z));
  const currentVel = useRef(new THREE.Vector3(projectile.velocity.x, projectile.velocity.y, projectile.velocity.z));
  const isGrounded = useRef(false);
  const hasReportedDistance = useRef(false);

  // Aerodynamic folded paper plane shape
  const planeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Triangular dart vertices
    const vertices = new Float32Array([
      // Nose to left wingtip to center fold
      0, 0, 0.45,
      -0.35, 0.08, -0.35,
      0, 0, -0.35,

      // Nose to center fold to right wingtip
      0, 0, 0.45,
      0, 0, -0.35,
      0.35, 0.08, -0.35,

      // Central keel fold bottom
      0, 0, 0.45,
      0, -0.09, -0.35,
      0, 0, -0.35
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!isGrounded.current) {
      // Aerodynamic gentle descent with air resistance
      currentVel.current.y -= 1.6 * delta; // gentle lift resistance
      currentVel.current.x *= 0.992;
      currentVel.current.z *= 0.992;

      currentPos.current.x += currentVel.current.x * delta;
      currentPos.current.y += currentVel.current.y * delta;
      currentPos.current.z += currentVel.current.z * delta;

      // Orient forward along velocity direction with gentle bank roll
      const horizSpeed = Math.hypot(currentVel.current.x, currentVel.current.z);
      if (horizSpeed > 0.1) {
        const yaw = Math.atan2(currentVel.current.x, currentVel.current.z);
        const pitch = -Math.atan2(currentVel.current.y, horizSpeed);
        groupRef.current.rotation.set(pitch, yaw, Math.sin(Date.now() * 0.004) * 0.18);
      }

      // Landing check
      if (currentPos.current.y <= 0.05) {
        currentPos.current.y = 0.05;
        isGrounded.current = true;

        if (!hasReportedDistance.current) {
          hasReportedDistance.current = true;
          const flightDist = Math.hypot(
            currentPos.current.x - projectile.startPos.x,
            currentPos.current.z - projectile.startPos.z
          );
          const roundedDist = Math.round(flightDist * 10) / 10;
          useClassroomStore.getState().setAirplanePersonalBest(roundedDist);
          if (projectile.ownerSessionId === useClassroomStore.getState().mySessionId) {
            useClassroomStore.getState().showToast(`✈️ Flight Distance: ${roundedDist}m!`, 'success');
          }
        }
      }
    }

    groupRef.current.position.copy(currentPos.current);
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={planeGeo}>
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3. High Five Sparkles Burst
// -------------------------------------------------------------
function SparklesBurst({ sparkle }: { sparkle: { x: number; y: number; z: number; createdAt: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  const age = (Date.now() - sparkle.createdAt) / 1000;
  const progress = Math.min(1.0, age / 1.5);
  const scale = 1.0 + progress * 2.0;
  const opacity = Math.max(0, 1.0 - progress);

  return (
    <group ref={groupRef} position={[sparkle.x, sparkle.y, sparkle.z]} scale={[scale, scale, scale]}>
      {[-0.15, 0, 0.15].map((dx, i) =>
        [-0.15, 0, 0.15].map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[dx * scale, ((i + j) % 2) * 0.15 * scale, dz * scale]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#fbbf24' : '#38bdf8'} transparent opacity={opacity} />
          </mesh>
        ))
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 4. Master Projectiles & Particles Scene Manager
// -------------------------------------------------------------
export function ProjectilesManager() {
  const activeProjectiles = useClassroomStore((s) => s.activeProjectiles);
  const sparkles = useClassroomStore((s) => s.sparkles);

  // Auto-cleanup projectiles older than 6 seconds
  const now = Date.now();
  const visibleProjectiles = activeProjectiles.filter((p) => now - p.timestamp < 6500);
  const visibleSparkles = sparkles.filter((s) => now - s.createdAt < 2000);

  return (
    <group>
      {visibleProjectiles.map((p) =>
        p.type === 'paper_ball' ? (
          <PaperBallMesh key={p.id} projectile={p} />
        ) : (
          <PaperAirplaneMesh key={p.id} projectile={p} />
        )
      )}

      {visibleSparkles.map((sp) => (
        <SparklesBurst key={sp.id} sparkle={sp} />
      ))}
    </group>
  );
}
