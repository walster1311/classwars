'use client';

import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

interface SlideContent {
  title: string;
  subtitle: string;
  bullets: string[];
  diagramLabel?: string;
  accentColor: string;
}

const SLIDES: Record<string, SlideContent[]> = {
  biology: [
    {
      title: 'CELLULAR BIOLOGY & ORGANELLES',
      subtitle: 'Structure, Energy Production, and Eukaryotic Function',
      bullets: [
        '• Nucleus: Coordinates activities, stores genomic DNA',
        '• Mitochondria: Aerobic respiration and ATP synthesis',
        '• Endoplasmic Reticulum: Protein translation and lipid transport',
        '• Cell Membrane: Phospholipid bilayer with selective permeability'
      ],
      diagramLabel: 'EUKARYOTIC CELL DIAGRAM',
      accentColor: '#38bdf8'
    },
    {
      title: 'MITOSIS: SOMATIC CELL DIVISION',
      subtitle: 'Four Distinct Phases of Chromosomal Segregation',
      bullets: [
        '• Prophase: Chromatin condenses, spindle apparatus nucleates',
        '• Metaphase: Chromosomes align along equatorial metaphase plate',
        '• Anaphase: Sister chromatids cleave and migrate to poles',
        '• Telophase & Cytokinesis: Nuclear envelope reforms, cleavage furrow'
      ],
      diagramLabel: 'CHROMOSOME SEGREGATION AXIS',
      accentColor: '#10b981'
    },
    {
      title: 'MOLECULAR GENETICS & DNA',
      subtitle: 'Double Helix Topology and Nitrogenous Base Pairing',
      bullets: [
        '• Complementary Hydrogen Bonds: Adenine = Thymine (2 H-bonds)',
        '• High Affinity Pairing: Guanine ≡ Cytosine (3 H-bonds)',
        '• Antiparallel Backbone: 5\' to 3\' phosphodiester linkage',
        '• S-Phase Synthesis: DNA Polymerase proofreading (3\' -> 5\')'
      ],
      diagramLabel: 'DOUBLE HELIX NUCLEOTIDE CORE',
      accentColor: '#818cf8'
    }
  ],
  physics: [
    {
      title: 'NEWTONIAN MECHANICS & GRAVITATION',
      subtitle: 'Universal Gravitation and Classical Force Kinematics',
      bullets: [
        '• Universal Law: F_g = G * (m1 * m2) / r^2',
        '• Net Force Equilibrium: ΣF = m * a = 0 in inertial frames',
        '• Conservation of Momentum: Δp = F_net * Δt',
        '• Work-Energy Theorem: W_net = ΔK = (1/2)m(v_f^2 - v_i^2)'
      ],
      diagramLabel: 'ORBITAL GRAVITATIONAL VECTORS',
      accentColor: '#f59e0b'
    },
    {
      title: 'WAVE OPTICS & ELECTROMAGNETISM',
      subtitle: 'Diffraction, Wave-Particle Duality, and Maxwell Equations',
      bullets: [
        '• Speed of Light in Vacuum: c = 1 / √(ε₀ * μ₀) ≈ 3.00 × 10⁸ m/s',
        '• Young\'s Double Slit Interference: d * sin(θ) = m * λ',
        '• Photon Energy Quantization: E = h * f = (h * c) / λ',
        '• Snell\'s Refraction Index: n₁ * sin(θ₁) = n₂ * sin(θ₂)'
      ],
      diagramLabel: 'DIFFRACTION INTERFERENCE PATTERN',
      accentColor: '#ec4899'
    }
  ],
  chemistry: [
    {
      title: 'PERIODICITY & ATOMIC ORBITALS',
      subtitle: 'Quantum Quantum Numbers and Electron Configurations',
      bullets: [
        '• Aufbau Principle & Hund\'s Rule: Fill lowest degenerate states',
        '• Pauli Exclusion: No two electrons share 4 identical quantum numbers',
        '• Electronegativity Trend: Increases toward Fluorine across periods',
        '• Ionization Energy: Threshold energy to remove valence electrons'
      ],
      diagramLabel: 'BOHR ATOMIC ORBITAL SHELLS',
      accentColor: '#06b6d4'
    }
  ]
};

interface SmartBoardProps {
  position?: [number, number, number];
}

export function SmartBoard({ position = [0, 2.45, -13.85] }: SmartBoardProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const myRole = useClassroomStore((s) => s.myRole);
  const isTeacher = myRole === 'teacher';

  const boardTopic = (useClassroomStore((s) => (s as any).boardTopic) || 'biology') as string;
  const boardSlide = (useClassroomStore((s) => (s as any).boardSlide) || 0) as number;

  const slidesForTopic = SLIDES[boardTopic] || SLIDES['biology'];
  const currentSlideIndex = Math.min(boardSlide, slidesForTopic.length - 1);
  const slide = slidesForTopic[currentSlideIndex];

  const handlePrevSlide = (e: any) => {
    e.stopPropagation();
    if (!isTeacher) return;
    const prev = (currentSlideIndex - 1 + slidesForTopic.length) % slidesForTopic.length;
    colyseusService.getRoom()?.send('change_board_slide', { slide: prev });
  };

  const handleNextSlide = (e: any) => {
    e.stopPropagation();
    if (!isTeacher) return;
    const next = (currentSlideIndex + 1) % slidesForTopic.length;
    colyseusService.getRoom()?.send('change_board_slide', { slide: next });
  };

  const handleTopicSwitch = (topic: string) => (e: any) => {
    e.stopPropagation();
    if (!isTeacher) return;
    colyseusService.getRoom()?.send('change_board_topic', { topic });
  };

  return (
    <group position={position}>
      {/* ================= ARCHITECTURAL FRAME & BACKING ================= */}
      {/* Outer Polished Hardwood Mounting Board (Wall mounted, no shadow casting) */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[11.6, 2.8, 0.12]} />
        <meshStandardMaterial color="#451a03" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Brushed Aluminum Inner Casing Bezel */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[11.4, 2.6, 0.04]} />
        <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* ================= LEFT WING: TRADITIONAL CHALKBOARD ================= */}
      <group position={[-4.1, 0, 0.04]}>
        {/* Dark Slate Surface */}
        <mesh>
          <boxGeometry args={[2.8, 2.36, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Chalk Sketches (Diagrams & Mathematics) */}
        <Text
          position={[0, 0.9, 0.02]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          [ LAB NOTES & FORMULAS ]
        </Text>

        <Text
          position={[-1.2, 0.45, 0.02]}
          fontSize={0.1}
          color="#cbd5e1"
          anchorX="left"
          anchorY="top"
        >
          {"ΔG = ΔH - TΔS\npH = -log[H+]\nE = mc²\nPV = nRT"}
        </Text>

        {/* DNA Helix Chalk Sketch Indicator */}
        <group position={[0.4, 0.0, 0.02]}>
          {[-0.6, -0.4, -0.2, 0.0, 0.2, 0.4].map((y, i) => (
            <mesh key={`rung-${i}`} position={[0, y, 0]} rotation={[0, 0, i * 0.4]}>
              <boxGeometry args={[0.65, 0.015, 0.005]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#38bdf8' : '#34d399'} />
            </mesh>
          ))}
        </group>

        <Text
          position={[0, -0.9, 0.02]}
          fontSize={0.09}
          color="#64748b"
          anchorX="center"
        >
          "Science is curiosity in action"
        </Text>
      </group>

      {/* ================= CENTER: DIGITAL SMART PRESENTATION SCREEN ================= */}
      <group position={[0, 0, 0.04]}>
        {/* 16:9 Glowing Screen Glass Bed */}
        <mesh>
          <boxGeometry args={[5.0, 2.36, 0.025]} />
          <meshStandardMaterial
            color="#090d16"
            emissive="#0c1322"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Screen Ambient Glow Rim */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[4.96, 2.32, 0.005]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.12} />
        </mesh>

        {/* --- Top Navigation & Status Bar on Smart Screen --- */}
        <group position={[0, 0.96, 0.035]}>
          {/* Header background bar */}
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[4.8, 0.22, 0.005]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          <Text
            position={[-2.25, 0, 0.01]}
            fontSize={0.09}
            color="#38bdf8"
            anchorX="left"
            anchorY="middle"
          >
            ● CLASSVERSE SMART SCREEN
          </Text>

          {/* Interactive Topic Selector Tabs */}
          <group position={[0.2, 0, 0]}>
            {(['biology', 'physics', 'chemistry'] as const).map((t, idx) => {
              const isSelected = boardTopic === t;
              return (
                <group
                  key={t}
                  position={[idx * 0.82 - 0.75, 0, 0]}
                  onPointerOver={() => isTeacher && setHoveredButton(t)}
                  onPointerOut={() => setHoveredButton(null)}
                  onPointerDown={handleTopicSwitch(t)}
                >
                  <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.76, 0.16, 0.01]} />
                    <meshBasicMaterial
                      color={isSelected ? '#2563eb' : (hoveredButton === t ? '#334155' : '#1e293b')}
                    />
                  </mesh>
                  <Text
                    position={[0, 0, 0.01]}
                    fontSize={0.075}
                    color={isSelected ? '#ffffff' : '#94a3b8'}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {t.toUpperCase()}
                  </Text>
                </group>
              );
            })}
          </group>

          {/* Slide indicator & nav buttons */}
          <group position={[2.0, 0, 0]}>
            {/* Prev button */}
            <group
              position={[-0.32, 0, 0]}
              onPointerDown={handlePrevSlide}
              onPointerOver={() => isTeacher && setHoveredButton('prev')}
              onPointerOut={() => setHoveredButton(null)}
            >
              <mesh>
                <boxGeometry args={[0.18, 0.16, 0.01]} />
                <meshBasicMaterial color={hoveredButton === 'prev' ? '#3b82f6' : '#1e293b'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle">
                ◀
              </Text>
            </group>

            {/* Slide counter */}
            <Text position={[0, 0, 0.01]} fontSize={0.08} color="#94a3b8" anchorX="center" anchorY="middle">
              {`${currentSlideIndex + 1}/${slidesForTopic.length}`}
            </Text>

            {/* Next button */}
            <group
              position={[0.32, 0, 0]}
              onPointerDown={handleNextSlide}
              onPointerOver={() => isTeacher && setHoveredButton('next')}
              onPointerOut={() => setHoveredButton(null)}
            >
              <mesh>
                <boxGeometry args={[0.18, 0.16, 0.01]} />
                <meshBasicMaterial color={hoveredButton === 'next' ? '#3b82f6' : '#1e293b'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle">
                ▶
              </Text>
            </group>
          </group>
        </group>

        {/* --- Main Slide Title & Subtitle --- */}
        <Text
          position={[-2.2, 0.68, 0.035]}
          fontSize={0.16}
          color={slide.accentColor}
          anchorX="left"
          anchorY="middle"
        >
          {slide.title}
        </Text>

        <Text
          position={[-2.2, 0.5, 0.035]}
          fontSize={0.095}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
        >
          {slide.subtitle}
        </Text>

        {/* Divider Line */}
        <mesh position={[0, 0.4, 0.035]}>
          <boxGeometry args={[4.5, 0.01, 0.005]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        {/* --- Slide Bullet Points (Left Column) --- */}
        <group position={[-2.2, 0.28, 0.035]}>
          {slide.bullets.map((bullet, idx) => (
            <Text
              key={idx}
              position={[0, -idx * 0.18, 0]}
              fontSize={0.085}
              color="#e2e8f0"
              anchorX="left"
              anchorY="top"
              maxWidth={2.8}
              lineHeight={1.2}
            >
              {bullet}
            </Text>
          ))}
        </group>

        {/* --- Interactive Educational Diagram Box (Right Column) --- */}
        <group position={[1.25, -0.15, 0.035]}>
          {/* Diagram Container Frame */}
          <mesh>
            <boxGeometry args={[1.9, 1.25, 0.01]} />
            <meshStandardMaterial color="#0b1329" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[1.86, 1.21, 0.005]} />
            <meshBasicMaterial color={slide.accentColor} transparent opacity={0.15} />
          </mesh>

          {/* Diagram Label */}
          <Text position={[0, 0.5, 0.01]} fontSize={0.065} color={slide.accentColor} anchorX="center">
            {slide.diagramLabel || 'DIAGRAM'}
          </Text>

          {/* Biological / Scientific Graphic Primitives */}
          {boardTopic === 'biology' && (
            <group position={[0, -0.05, 0.01]}>
              {/* Outer Cell Membrane */}
              <mesh>
                <ringGeometry args={[0.36, 0.38, 32]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
              {/* Cytoplasm Fill */}
              <mesh position={[0, 0, -0.001]}>
                <circleGeometry args={[0.36, 32]} />
                <meshBasicMaterial color="#0284c7" transparent opacity={0.25} />
              </mesh>
              {/* Nucleus */}
              <mesh position={[0, 0, 0.002]}>
                <circleGeometry args={[0.16, 24]} />
                <meshBasicMaterial color="#a855f7" />
              </mesh>
              {/* Nucleolus */}
              <mesh position={[-0.03, 0.02, 0.004]}>
                <circleGeometry args={[0.06, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Mitochondria Pods */}
              <mesh position={[0.22, 0.16, 0.002]} rotation={[0, 0, 0.5]}>
                <capsuleGeometry args={[0.04, 0.1, 4, 8]} />
                <meshBasicMaterial color="#f97316" />
              </mesh>
              <mesh position={[-0.2, -0.18, 0.002]} rotation={[0, 0, -0.4]}>
                <capsuleGeometry args={[0.04, 0.1, 4, 8]} />
                <meshBasicMaterial color="#f97316" />
              </mesh>
            </group>
          )}

          {boardTopic === 'physics' && (
            <group position={[0, -0.05, 0.01]}>
              {/* Coordinate axis */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.4, 0.01, 0.005]} />
                <meshBasicMaterial color="#64748b" />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.01, 0.7, 0.005]} />
                <meshBasicMaterial color="#64748b" />
              </mesh>
              {/* Sine Wave */}
              {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((x, i) => (
                <mesh key={i} position={[x, Math.sin(x * 6) * 0.22, 0.005]}>
                  <sphereGeometry args={[0.025, 8, 8]} />
                  <meshBasicMaterial color="#f59e0b" />
                </mesh>
              ))}
            </group>
          )}

          {boardTopic === 'chemistry' && (
            <group position={[0, -0.05, 0.01]}>
              {/* Central Nucleus */}
              <mesh>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              {/* Electron Shell Rings */}
              <mesh rotation={[Math.PI / 4, 0, 0]}>
                <ringGeometry args={[0.25, 0.265, 32]} />
                <meshBasicMaterial color="#06b6d4" />
              </mesh>
              <mesh rotation={[-Math.PI / 4, 0, 0]}>
                <ringGeometry args={[0.38, 0.395, 32]} />
                <meshBasicMaterial color="#06b6d4" />
              </mesh>
              {/* Orbiting electrons */}
              <mesh position={[0.25, 0.1, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
              <mesh position={[-0.32, -0.15, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            </group>
          )}

          <Text position={[0, -0.48, 0.01]} fontSize={0.06} color="#64748b" anchorX="center">
            {isTeacher ? 'Teacher: Click [◀] [▶] or tabs to switch' : 'Synchronized Classroom Display'}
          </Text>
        </group>
      </group>

      {/* ================= RIGHT WING: SECONDARY CHALKBOARD ================= */}
      <group position={[4.1, 0, 0.04]}>
        {/* Dark Slate Surface */}
        <mesh>
          <boxGeometry args={[2.8, 2.36, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.05} />
        </mesh>

        <Text
          position={[0, 0.9, 0.02]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          [ ASSIGNMENTS & SCHEDULE ]
        </Text>

        <Text
          position={[-1.2, 0.45, 0.02]}
          fontSize={0.095}
          color="#f8fafc"
          anchorX="left"
          anchorY="top"
          maxWidth={2.4}
          lineHeight={1.3}
        >
          {"• Today: Organelles & Mitosis\n• Reading: Textbook Ch. 4 (pp. 82-105)\n• Lab Report: Due Friday 5:00 PM\n• Office Hours: Tue/Thu 3-4 PM"}
        </Text>

        {/* Small Sticky Notice Pins */}
        <group position={[-0.6, -0.55, 0.02]}>
          <mesh>
            <boxGeometry args={[0.7, 0.4, 0.005]} />
            <meshStandardMaterial color="#fef08a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.16, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.065} color="#854d0e" anchorX="center" anchorY="middle">
            {"QUIZ ON\nFRIDAY!"}
          </Text>
        </group>

        <group position={[0.5, -0.55, 0.02]}>
          <mesh>
            <boxGeometry args={[0.7, 0.4, 0.005]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.16, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.065} color="#0369a1" anchorX="center" anchorY="middle">
            {"LAB TEAMS:\n4 PER DESK"}
          </Text>
        </group>
      </group>

      {/* ================= CHALK & ACCESSORIES TRAY ================= */}
      <group position={[0, -1.24, 0.16]}>
        {/* Heavy Aluminum Tray Lip */}
        <mesh>
          <boxGeometry args={[11.2, 0.06, 0.28]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.035, 0.135]}>
          <boxGeometry args={[11.2, 0.04, 0.02]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Felt Chalk Erasers */}
        {[-3.6, -1.8, 1.8, 3.6].map((x, i) => (
          <group key={`eraser-${i}`} position={[x, 0.04, 0.02]}>
            {/* Wooden Backing */}
            <mesh>
              <boxGeometry args={[0.34, 0.035, 0.14]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
            {/* Felt Pad */}
            <mesh position={[0, 0.025, 0]}>
              <boxGeometry args={[0.33, 0.02, 0.13]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Multicolored Chalk Sticks */}
        {[-4.5, -4.3, -4.1, 4.3, 4.5, 4.7].map((x, i) => {
          const colors = ['#f8fafc', '#fef08a', '#38bdf8', '#4ade80', '#f472b6', '#f8fafc'];
          return (
            <mesh key={`chalk-${i}`} position={[x, 0.03, 0.04]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.14, 8]} />
              <meshStandardMaterial color={colors[i % colors.length]} roughness={0.9} />
            </mesh>
          );
        })}

        {/* Dry Erase Markers for Smart Screen */}
        {[-0.4, -0.2, 0.0, 0.2, 0.4].map((x, i) => {
          const capColors = ['#0f172a', '#2563eb', '#dc2626', '#16a34a', '#7c3aed'];
          return (
            <group key={`marker-${i}`} position={[x, 0.03, 0.04]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.018, 0.018, 0.18, 12]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.07, 0]}>
                <cylinderGeometry args={[0.019, 0.019, 0.04, 12]} />
                <meshStandardMaterial color={capColors[i]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ================= OVERHEAD ARCHITECTURAL LIGHT BAR ================= */}
      <group position={[0, 1.45, 0.25]}>
        {/* Horizontal Steel Mount Bar */}
        <mesh>
          <boxGeometry args={[9.5, 0.05, 0.05]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Support Arms */}
        {[-3.5, 0, 3.5].map((x, i) => (
          <mesh key={`arm-${i}`} position={[x, -0.06, -0.15]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.35]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}
        {/* Downward Angled Spot Lamps */}
        {[-3.2, -1.2, 1.2, 3.2].map((x, i) => (
          <group key={`spot-${i}`} position={[x, -0.05, 0.05]} rotation={[-0.5, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.09, 0.12, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
            {/* Glowing Lamp Bulb */}
            <mesh position={[0, -0.05, 0]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color="#fffbeb" emissive="#fef08a" emissiveIntensity={1.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
