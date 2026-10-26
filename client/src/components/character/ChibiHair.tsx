'use client';

import React from 'react';
import * as THREE from 'three';
import { CharacterType } from '@classverse/shared';

interface ChibiHairProps {
  gender: CharacterType;
  hairstyleId: string;
  hairColor?: string;
}

export const ChibiHair = React.memo(function ChibiHair({
  gender,
  hairstyleId,
  hairColor
}: ChibiHairProps) {
  // Default stylish anime hair colors
  const boyDefaultColor = '#2d1b0d'; // Deep Chestnut Brown
  const girlDefaultColor = '#4a2810'; // Warm Amber Brown
  const color = hairColor || (gender === 'boy' ? boyDefaultColor : girlDefaultColor);

  return (
    <group position={[0, 0.46, 0]}>
      {/* Base Hair Cap Fitted to Chibi Skull */}
      <mesh position={[0, 0.05, -0.03]} castShadow>
        <sphereGeometry args={[0.315, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* ========================================================
          BOY HAIRSTYLES (6 Distinct Modular Cuts)
         ======================================================== */}

      {/* 1. Classic Short */}
      {hairstyleId === 'boy_classic_short' && (
        <group>
          {/* Front Neat Fringe */}
          {[-0.14, -0.07, 0, 0.07, 0.14].map((x, i) => (
            <mesh key={`cs-bang-${i}`} position={[x, 0.22, 0.24]} rotation={[0.4, 0, 0.1 * (i - 2)]} castShadow>
              <coneGeometry args={[0.07, 0.18, 6]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          ))}
          {/* Sideburns */}
          <mesh position={[-0.28, 0.02, 0.08]} rotation={[0, 0, 0.2]} castShadow>
            <coneGeometry args={[0.06, 0.22, 5]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0.28, 0.02, 0.08]} rotation={[0, 0, -0.2]} castShadow>
            <coneGeometry args={[0.06, 0.22, 5]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Tapered Crown Volume */}
          <mesh position={[0, 0.26, 0.02]} castShadow>
            <sphereGeometry args={[0.24, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* 2. Spiky Anime */}
      {hairstyleId === 'boy_spiky_anime' && (
        <group>
          {/* Central Crest Spikes */}
          {[
            { pos: [0, 0.36, 0.08], rot: [0.35, 0, 0], scale: [0.09, 0.26, 0.09] },
            { pos: [0, 0.42, -0.04], rot: [0.1, 0, 0], scale: [0.085, 0.28, 0.085] },
            { pos: [0, 0.38, -0.16], rot: [-0.25, 0, 0], scale: [0.08, 0.24, 0.08] },
          ].map((sp, i) => (
            <mesh key={`spike-center-${i}`} position={sp.pos as [number, number, number]} rotation={sp.rot as [number, number, number]} castShadow>
              <coneGeometry args={[sp.scale[0], sp.scale[1], 6]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          ))}
          {/* Left Wing Spikes */}
          {[
            { pos: [-0.14, 0.34, 0.1], rot: [0.25, -0.2, 0.35], scale: [0.08, 0.24, 0.08] },
            { pos: [-0.18, 0.36, -0.06], rot: [0, -0.2, 0.4], scale: [0.08, 0.26, 0.08] },
            { pos: [-0.22, 0.24, 0.14], rot: [0.3, -0.3, 0.5], scale: [0.07, 0.2, 0.07] }
          ].map((sp, i) => (
            <mesh key={`spike-left-${i}`} position={sp.pos as [number, number, number]} rotation={sp.rot as [number, number, number]} castShadow>
              <coneGeometry args={[sp.scale[0], sp.scale[1], 6]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          ))}
          {/* Right Wing Spikes */}
          {[
            { pos: [0.14, 0.34, 0.1], rot: [0.25, 0.2, -0.35], scale: [0.08, 0.24, 0.08] },
            { pos: [0.18, 0.36, -0.06], rot: [0, 0.2, -0.4], scale: [0.08, 0.26, 0.08] },
            { pos: [0.22, 0.24, 0.14], rot: [0.3, 0.3, -0.5], scale: [0.07, 0.2, 0.07] }
          ].map((sp, i) => (
            <mesh key={`spike-right-${i}`} position={sp.pos as [number, number, number]} rotation={sp.rot as [number, number, number]} castShadow>
              <coneGeometry args={[sp.scale[0], sp.scale[1], 6]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          ))}
          {/* Angled Front Bangs */}
          {[-0.1, 0.04, 0.12].map((x, i) => (
            <mesh key={`sp-bang-${i}`} position={[x, 0.24, 0.25]} rotation={[0.5, 0.2, 0.1 * i]} castShadow>
              <coneGeometry args={[0.07, 0.19, 5]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          ))}
        </group>
      )}

      {/* 3. Side Part */}
      {hairstyleId === 'boy_side_part' && (
        <group>
          {/* Swept Front Wave */}
          <mesh position={[-0.06, 0.24, 0.23]} rotation={[0.2, 0.3, -0.35]} castShadow>
            <boxGeometry args={[0.28, 0.12, 0.14]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Accent Parting Line Tuft */}
          <mesh position={[0.16, 0.26, 0.18]} rotation={[0.3, -0.2, 0.3]} castShadow>
            <boxGeometry args={[0.16, 0.1, 0.12]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Sleek Side Locks */}
          <mesh position={[-0.26, 0.1, 0.1]} rotation={[0, 0, 0.18]} castShadow>
            <boxGeometry args={[0.08, 0.24, 0.16]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0.26, 0.1, 0.1]} rotation={[0, 0, -0.18]} castShadow>
            <boxGeometry args={[0.08, 0.24, 0.16]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* 4. Messy Hair */}
      {hairstyleId === 'boy_messy' && (
        <group>
          {/* Varied Organic Tufts */}
          {[
            { pos: [-0.1, 0.32, 0.16], rot: [0.4, -0.3, 0.2], r: 0.11 },
            { pos: [0.08, 0.34, 0.14], rot: [0.35, 0.2, -0.3], r: 0.12 },
            { pos: [-0.18, 0.28, -0.04], rot: [0.1, -0.4, 0.4], r: 0.12 },
            { pos: [0.18, 0.3, -0.02], rot: [0.1, 0.4, -0.4], r: 0.12 },
            { pos: [0, 0.36, -0.1], rot: [-0.2, 0, 0.1], r: 0.13 },
            { pos: [-0.12, 0.18, 0.26], rot: [0.6, -0.2, 0.1], r: 0.08 },
            { pos: [0.06, 0.19, 0.27], rot: [0.55, 0.3, -0.15], r: 0.09 },
          ].map((tuf, i) => (
            <mesh key={`messy-tuft-${i}`} position={tuf.pos as [number, number, number]} rotation={tuf.rot as [number, number, number]} castShadow>
              <dodecahedronGeometry args={[tuf.r, 0]} />
              <meshStandardMaterial color={color} roughness={0.65} />
            </mesh>
          ))}
        </group>
      )}

      {/* 5. Bowl Cut */}
      {hairstyleId === 'boy_bowl_cut' && (
        <group>
          {/* Smooth Symmetrical Visor / Bowl Ring */}
          <mesh position={[0, 0.18, 0.04]} castShadow>
            <cylinderGeometry args={[0.33, 0.34, 0.16, 24]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Rounded Cap Fill */}
          <mesh position={[0, 0.28, 0.02]} castShadow>
            <sphereGeometry args={[0.28, 20, 20]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Straight Horizontal Fringe Edge */}
          <mesh position={[0, 0.11, 0.26]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.42, 0.04, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
        </group>
      )}

      {/* 6. Wavy Hair */}
      {hairstyleId === 'boy_wavy' && (
        <group>
          {/* Tiered Undulating Waves */}
          {[
            { pos: [-0.12, 0.26, 0.2], rot: [0.3, 0.4, -0.2], args: [0.16, 0.1, 0.14] },
            { pos: [0.12, 0.27, 0.19], rot: [0.3, -0.4, 0.2], args: [0.16, 0.1, 0.14] },
            { pos: [-0.22, 0.16, 0.1], rot: [0.1, 0.2, -0.3], args: [0.12, 0.16, 0.12] },
            { pos: [0.22, 0.16, 0.1], rot: [0.1, -0.2, 0.3], args: [0.12, 0.16, 0.12] },
            { pos: [0, 0.34, 0.06], rot: [0.2, 0, 0], args: [0.22, 0.12, 0.18] },
          ].map((w, i) => (
            <mesh key={`wave-${i}`} position={w.pos as [number, number, number]} rotation={w.rot as [number, number, number]} castShadow>
              <sphereGeometry args={[w.args[0], 12, 12]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}

      {/* ========================================================
          GIRL HAIRSTYLES (6 Distinct Modular Cuts)
         ======================================================== */}

      {/* 1. Long Straight */}
      {hairstyleId === 'girl_long_straight' && (
        <group>
          {/* Cute Straight Bangs with Part */}
          {[-0.14, -0.06, 0.06, 0.14].map((x, i) => (
            <mesh key={`ls-bang-${i}`} position={[x, 0.2, 0.25]} rotation={[0.3, 0, 0.05 * (i - 1.5)]} castShadow>
              <boxGeometry args={[0.08, 0.14, 0.04]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          ))}
          {/* Left Flowing Tresses (Past Shoulders) */}
          <mesh position={[-0.26, -0.16, 0.02]} rotation={[0, 0, 0.08]} castShadow>
            <cylinderGeometry args={[0.07, 0.05, 0.58, 12]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Right Flowing Tresses */}
          <mesh position={[0.26, -0.16, 0.02]} rotation={[0, 0, -0.08]} castShadow>
            <cylinderGeometry args={[0.07, 0.05, 0.58, 12]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Back Flowing Curtain */}
          <mesh position={[0, -0.18, -0.22]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.48, 0.62, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
        </group>
      )}

      {/* 2. Bob Cut */}
      {hairstyleId === 'girl_bob_cut' && (
        <group>
          {/* Rounded Eyebrow Bangs */}
          <mesh position={[0, 0.2, 0.24]} rotation={[0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.38, 0.12, 0.06]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Left Inward Incurved Bob Lock */}
          <mesh position={[-0.28, 0.02, 0.04]} rotation={[0, 0, -0.18]} castShadow>
            <boxGeometry args={[0.09, 0.32, 0.22]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Right Inward Incurved Bob Lock */}
          <mesh position={[0.28, 0.02, 0.04]} rotation={[0, 0, 0.18]} castShadow>
            <boxGeometry args={[0.09, 0.32, 0.22]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Back Incurved Bob Shell */}
          <mesh position={[0, 0.04, -0.2]} rotation={[-0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.48, 0.32, 0.12]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
        </group>
      )}

      {/* 3. Ponytail */}
      {hairstyleId === 'girl_ponytail' && (
        <group>
          {/* Soft Face-Framing Bangs */}
          {[-0.12, 0, 0.12].map((x, i) => (
            <mesh key={`pt-bang-${i}`} position={[x, 0.21, 0.25]} rotation={[0.32, 0, 0]} castShadow>
              <coneGeometry args={[0.07, 0.16, 6]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          ))}
          {/* Side Strands */}
          <mesh position={[-0.26, 0.06, 0.16]} rotation={[0.2, 0, 0.1]} castShadow>
            <coneGeometry args={[0.04, 0.24, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0.26, 0.06, 0.16]} rotation={[0.2, 0, -0.1]} castShadow>
            <coneGeometry args={[0.04, 0.24, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Cute Scrunchie Hair Tie (Bright Red Ribbon) */}
          <mesh position={[0, 0.32, -0.28]} rotation={[0.7, 0, 0]} castShadow>
            <torusGeometry args={[0.07, 0.03, 12, 24]} />
            <meshStandardMaterial color="#f43f5e" roughness={0.4} />
          </mesh>
          {/* High Cascading Ponytail Body */}
          <mesh position={[0, 0.22, -0.42]} rotation={[0.8, 0, 0]} castShadow>
            <coneGeometry args={[0.13, 0.44, 16]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* 4. Twin Tails */}
      {hairstyleId === 'girl_twin_tails' && (
        <group>
          {/* Center Sweet Bangs */}
          <mesh position={[0, 0.22, 0.24]} rotation={[0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.34, 0.11, 0.05]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Left Ribbon Tie */}
          <mesh position={[-0.28, 0.26, -0.1]} rotation={[0, 0, 0.6]} castShadow>
            <torusGeometry args={[0.06, 0.024, 12, 24]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.3} />
          </mesh>
          {/* Left Pigtail Falling Down */}
          <mesh position={[-0.38, 0.04, -0.12]} rotation={[0, 0, 0.35]} castShadow>
            <cylinderGeometry args={[0.065, 0.035, 0.46, 12]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Right Ribbon Tie */}
          <mesh position={[0.28, 0.26, -0.1]} rotation={[0, 0, -0.6]} castShadow>
            <torusGeometry args={[0.06, 0.024, 12, 24]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.3} />
          </mesh>
          {/* Right Pigtail Falling Down */}
          <mesh position={[0.38, 0.04, -0.12]} rotation={[0, 0, -0.35]} castShadow>
            <cylinderGeometry args={[0.065, 0.035, 0.46, 12]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
        </group>
      )}

      {/* 5. Short Wavy */}
      {hairstyleId === 'girl_short_wavy' && (
        <group>
          {/* Side-Swept Curls */}
          {[
            { pos: [-0.14, 0.22, 0.22], rot: [0.2, 0.3, -0.25], r: 0.11 },
            { pos: [0.08, 0.23, 0.23], rot: [0.25, -0.2, 0.2], r: 0.12 },
            { pos: [-0.28, 0.1, 0.08], rot: [0, 0.2, -0.35], r: 0.13 },
            { pos: [0.28, 0.1, 0.08], rot: [0, -0.2, 0.35], r: 0.13 },
            { pos: [-0.26, -0.06, 0.04], rot: [0, 0.2, -0.2], r: 0.11 },
            { pos: [0.26, -0.06, 0.04], rot: [0, -0.2, 0.2], r: 0.11 },
            { pos: [0, 0.08, -0.22], rot: [-0.1, 0, 0], r: 0.16 },
          ].map((c, i) => (
            <mesh key={`sw-curl-${i}`} position={c.pos as [number, number, number]} rotation={c.rot as [number, number, number]} castShadow>
              <sphereGeometry args={[c.r, 12, 12]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}

      {/* 6. Braided Hair */}
      {hairstyleId === 'girl_braided' && (
        <group>
          {/* Neat Parted Front Hair */}
          <mesh position={[-0.1, 0.22, 0.23]} rotation={[0.3, 0.2, -0.1]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.06]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          <mesh position={[0.1, 0.22, 0.23]} rotation={[0.3, -0.2, 0.1]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.06]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* Left Braided Segments Over Shoulder */}
          {[
            { y: 0.08, x: -0.24, z: 0.1 },
            { y: -0.02, x: -0.23, z: 0.14 },
            { y: -0.12, x: -0.21, z: 0.16 },
            { y: -0.22, x: -0.19, z: 0.18 }
          ].map((seg, i) => (
            <mesh key={`braid-l-${i}`} position={[seg.x, seg.y, seg.z]} rotation={[0.2, 0, -0.15 * (i % 2 === 0 ? 1 : -1)]} castShadow>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          ))}
          {/* Left Braid End Ribbon */}
          <mesh position={[-0.19, -0.28, 0.18]} castShadow>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#ec4899" roughness={0.4} />
          </mesh>
          {/* Right Braided Segments Over Shoulder */}
          {[
            { y: 0.08, x: 0.24, z: 0.1 },
            { y: -0.02, x: 0.23, z: 0.14 },
            { y: -0.12, x: 0.21, z: 0.16 },
            { y: -0.22, x: 0.19, z: 0.18 }
          ].map((seg, i) => (
            <mesh key={`braid-r-${i}`} position={[seg.x, seg.y, seg.z]} rotation={[0.2, 0, 0.15 * (i % 2 === 0 ? 1 : -1)]} castShadow>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          ))}
          {/* Right Braid End Ribbon */}
          <mesh position={[0.19, -0.28, 0.18]} castShadow>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#ec4899" roughness={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
});
