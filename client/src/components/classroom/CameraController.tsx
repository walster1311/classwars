'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useClassroomStore } from '@/lib/store';

const DEFAULT_CAMERA_POS = new THREE.Vector3(24, 26, 26);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const cameraResetNonce = useClassroomStore((s) => s.cameraResetNonce);
  const isResetting = useRef(false);

  useEffect(() => {
    camera.position.copy(DEFAULT_CAMERA_POS);
    camera.lookAt(DEFAULT_CAMERA_TARGET);
  }, [camera]);

  // Handle Camera Reset request from UI
  useEffect(() => {
    if (cameraResetNonce > 0) {
      isResetting.current = true;
    }
  }, [cameraResetNonce]);

  useFrame(() => {
    if (isResetting.current && controlsRef.current) {
      camera.position.lerp(DEFAULT_CAMERA_POS, 0.08);
      controlsRef.current.target.lerp(DEFAULT_CAMERA_TARGET, 0.08);
      controlsRef.current.update();

      if (camera.position.distanceTo(DEFAULT_CAMERA_POS) < 0.1) {
        camera.position.copy(DEFAULT_CAMERA_POS);
        controlsRef.current.target.copy(DEFAULT_CAMERA_TARGET);
        isResetting.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={4}
      maxDistance={65}
      maxPolarAngle={Math.PI / 2.2}
      target={DEFAULT_CAMERA_TARGET}
    />
  );
}
