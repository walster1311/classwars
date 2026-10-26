'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';
import { screenShareService } from '@/lib/screenshare';

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
      subtitle: 'Quantum Numbers and Electron Configurations',
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

  const isScreenSharing = useClassroomStore((s) => s.isScreenSharing);
  const screenSharePresenterName = useClassroomStore((s) => s.screenSharePresenterName);
  const screenVideoElement = useClassroomStore((s) => s.screenVideoElement);

  // Live Three.js VideoTexture from actual desktop media stream
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (screenVideoElement) {
      const tex = new THREE.VideoTexture(screenVideoElement);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      setVideoTexture(tex);
      return () => {
        tex.dispose();
      };
    } else {
      setVideoTexture(null);
    }
  }, [screenVideoElement]);

  // Fallback high-tech animated canvas stream for viewers without direct video element
  const [canvasTexture, setCanvasTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (!isScreenSharing || screenVideoElement) {
      if (canvasTexture) {
        canvasTexture.dispose();
        setCanvasTexture(null);
      }
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    setCanvasTexture(tex);

    let frameId = 0;
    let cursorX = 350;
    let cursorY = 220;
    let targetX = 640;
    let targetY = 380;

    const renderFrame = () => {
      // Background & desktop frame
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 1280, 720);

      // Top OS menu bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1280, 40);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('💻 CLASSVERSE DESKTOP', 24, 25);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(`Host: ${screenSharePresenterName || 'Teacher'}  •  Biology 101 Lecture  •  1080p 60FPS`, 240, 25);
      ctx.fillText(new Date().toLocaleTimeString(), 1180, 25);

      // Main application window
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(30, 60, 1220, 630);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 60, 1220, 630);

      // Window header
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(30, 60, 1220, 38);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(52, 79, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(72, 79, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(92, 79, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px sans-serif';
      ctx.fillText('Interactive_Presentation_Deck.ts — Classverse Classroom Workspace', 115, 84);

      // Code / Lecture content simulation
      ctx.font = '16px monospace';
      const lines = [
        '// BIO-101: Cellular Respiration & ATP Synthase Kinetics',
        'export function calculateATPYield(glucoseMoles: number) {',
        '  const glycolysis = glucoseMoles * 2;          // Net Cytoplasmic ATP yield',
        '  const citricAcidCycle = glucoseMoles * 2;     // Mitochondrial Matrix substrate phosphorylation',
        '  const oxidativePhosphorylation = glucoseMoles * 28; // Chemiosmotic proton gradient',
        '  return { totalYield: glycolysis + citricAcidCycle + oxidativePhosphorylation };',
        '}',
        '',
        `// Live Teacher Screen Mirroring Active: ${new Date().toLocaleTimeString()}`,
        `// Synchronized to all 100 Classroom Student Desks via WebRTC`
      ];

      lines.forEach((line, idx) => {
        if (line.startsWith('//')) {
          ctx.fillStyle = '#64748b';
        } else if (line.includes('export') || line.includes('function') || line.includes('const') || line.includes('return')) {
          ctx.fillStyle = '#38bdf8';
        } else {
          ctx.fillStyle = '#f8fafc';
        }
        ctx.fillText(line, 60, 140 + idx * 28);
      });

      // Animated presenter cursor
      cursorX += (targetX - cursorX) * 0.04;
      cursorY += (targetY - cursorY) * 0.04;
      if (Math.abs(targetX - cursorX) < 15) {
        targetX = 180 + Math.random() * 850;
        targetY = 160 + Math.random() * 420;
      }

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(cursorX, cursorY);
      ctx.lineTo(cursorX + 16, cursorY + 12);
      ctx.lineTo(cursorX + 8, cursorY + 16);
      ctx.closePath();
      ctx.fill();

      tex.needsUpdate = true;
      frameId = requestAnimationFrame(renderFrame);
    };

    frameId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(frameId);
      tex.dispose();
    };
  }, [isScreenSharing, screenVideoElement, screenSharePresenterName]);

  const activeDisplayTexture = videoTexture || canvasTexture;

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

  const handleToggleScreenShare = (e: any) => {
    e.stopPropagation();
    screenShareService.toggleScreenShare();
  };

  return (
    <group position={position}>
      {/* ================= ARCHITECTURAL FRAME & BACKING (EXPANDED 20.4M) ================= */}
      {/* Outer Polished Hardwood Mounting Board (Wall mounted, no shadow casting) */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[20.4, 2.9, 0.12]} />
        <meshStandardMaterial color="#451a03" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Brushed Aluminum Inner Casing Bezel */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[20.2, 2.7, 0.04]} />
        <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* ================= LEFT WING: TRADITIONAL CHALKBOARD (EXPANDED 5.1M) ================= */}
      <group position={[-7.45, 0, 0.04]}>
        {/* Dark Slate Surface */}
        <mesh>
          <boxGeometry args={[5.1, 2.45, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Chalk Sketches (Diagrams & Mathematics) */}
        <Text
          position={[0, 1.0, 0.02]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          [ LAB NOTES & SCIENTIFIC FORMULAS ]
        </Text>

        <Text
          position={[-2.3, 0.65, 0.02]}
          fontSize={0.1}
          color="#cbd5e1"
          anchorX="left"
          anchorY="top"
          maxWidth={2.6}
          lineHeight={1.4}
        >
          {"ΔG = ΔH - TΔS\npH = -log[H+]\nE = mc²\nPV = nRT\nλ = h / (m · v)"}
        </Text>

        {/* DNA Helix Chalk Sketch Indicator */}
        <group position={[1.2, 0.1, 0.02]}>
          {[-0.8, -0.6, -0.4, -0.2, 0.0, 0.2, 0.4, 0.6, 0.8].map((y, i) => (
            <mesh key={`rung-${i}`} position={[0, y, 0]} rotation={[0, 0, i * 0.35]}>
              <boxGeometry args={[0.9, 0.015, 0.005]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#38bdf8' : '#34d399'} />
            </mesh>
          ))}
          <Text position={[0, -0.95, 0.01]} fontSize={0.075} color="#64748b" anchorX="center">
            DNA B-Form Double Helix
          </Text>
        </group>

        <Text
          position={[0, -0.95, 0.02]}
          fontSize={0.09}
          color="#64748b"
          anchorX="center"
        >
          "Science is curiosity in action"
        </Text>
      </group>

      {/* ================= CENTER: DIGITAL SMART PRESENTATION & SCREEN SHARE DISPLAY (9.6M WIDE) ================= */}
      <group position={[0, 0, 0.04]}>
        {/* 16:9 Glowing Screen Glass Bed */}
        <mesh>
          <boxGeometry args={[9.6, 2.45, 0.025]} />
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
          <boxGeometry args={[9.56, 2.41, 0.005]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.12} />
        </mesh>

        {/* --- Top Navigation & Status Bar on Smart Screen --- */}
        <group position={[0, 1.02, 0.035]}>
          {/* Header background bar */}
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[9.4, 0.24, 0.005]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Left indicator title */}
          <Text
            position={[-4.5, 0, 0.01]}
            fontSize={0.095}
            color={isScreenSharing ? '#ef4444' : '#38bdf8'}
            anchorX="left"
            anchorY="middle"
          >
            {isScreenSharing ? '🔴 LIVE DESKTOP BROADCAST' : '● CLASSVERSE SMART SCREEN'}
          </Text>

          {/* Interactive Topic Selector Tabs (when not screensharing) */}
          {!isScreenSharing && (
            <group position={[-0.8, 0, 0]}>
              {(['biology', 'physics', 'chemistry'] as const).map((t, idx) => {
                const isSelected = boardTopic === t;
                return (
                  <group
                    key={t}
                    position={[idx * 1.05 - 1.0, 0, 0]}
                    onPointerOver={() => isTeacher && setHoveredButton(t)}
                    onPointerOut={() => setHoveredButton(null)}
                    onPointerDown={handleTopicSwitch(t)}
                  >
                    <mesh position={[0, 0, 0]}>
                      <boxGeometry args={[0.96, 0.18, 0.01]} />
                      <meshBasicMaterial
                        color={isSelected ? '#2563eb' : (hoveredButton === t ? '#334155' : '#1e293b')}
                      />
                    </mesh>
                    <Text
                      position={[0, 0, 0.01]}
                      fontSize={0.08}
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
          )}

          {/* Live Desktop Share Trigger Button (Accessible to Teacher) */}
          <group
            position={[isScreenSharing ? 0.8 : 2.1, 0, 0]}
            onPointerDown={isTeacher ? handleToggleScreenShare : undefined}
            onPointerOver={() => isTeacher && setHoveredButton('sharescreen')}
            onPointerOut={() => setHoveredButton(null)}
          >
            <mesh>
              <boxGeometry args={[isScreenSharing ? 2.2 : 1.8, 0.18, 0.01]} />
              <meshBasicMaterial
                color={
                  isScreenSharing
                    ? (hoveredButton === 'sharescreen' ? '#dc2626' : '#b91c1c')
                    : (hoveredButton === 'sharescreen' ? '#4f46e5' : '#312e81')
                }
              />
            </mesh>
            <Text position={[0, 0, 0.01]} fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle">
              {isScreenSharing ? '⏹ STOP PRESENTING' : '💻 PRESENT SCREEN'}
            </Text>
          </group>

          {/* Slide indicator & nav buttons (when not screensharing) */}
          {!isScreenSharing && (
            <group position={[4.1, 0, 0]}>
              {/* Prev button */}
              <group
                position={[-0.35, 0, 0]}
                onPointerDown={handlePrevSlide}
                onPointerOver={() => isTeacher && setHoveredButton('prev')}
                onPointerOut={() => setHoveredButton(null)}
              >
                <mesh>
                  <boxGeometry args={[0.22, 0.18, 0.01]} />
                  <meshBasicMaterial color={hoveredButton === 'prev' ? '#3b82f6' : '#1e293b'} />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.085} color="#ffffff" anchorX="center" anchorY="middle">
                  ◀
                </Text>
              </group>

              {/* Slide counter */}
              <Text position={[0, 0, 0.01]} fontSize={0.085} color="#94a3b8" anchorX="center" anchorY="middle">
                {`${currentSlideIndex + 1}/${slidesForTopic.length}`}
              </Text>

              {/* Next button */}
              <group
                position={[0.35, 0, 0]}
                onPointerDown={handleNextSlide}
                onPointerOver={() => isTeacher && setHoveredButton('next')}
                onPointerOut={() => setHoveredButton(null)}
              >
                <mesh>
                  <boxGeometry args={[0.22, 0.18, 0.01]} />
                  <meshBasicMaterial color={hoveredButton === 'next' ? '#3b82f6' : '#1e293b'} />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.085} color="#ffffff" anchorX="center" anchorY="middle">
                  ▶
                </Text>
              </group>
            </group>
          )}

          {/* Host indicator when sharing */}
          {isScreenSharing && (
            <Text position={[4.2, 0, 0.01]} fontSize={0.08} color="#94a3b8" anchorX="right" anchorY="middle">
              {`Presenter: ${screenSharePresenterName || 'Teacher'}`}
            </Text>
          )}
        </group>

        {/* ================= ACTIVE MODE DISPLAY ================= */}
        {isScreenSharing ? (
          /* ================= LIVE DESKTOP SCREEN SHARE DISPLAY ================= */
          <group position={[0, -0.12, 0.035]}>
            {/* Center Widescreen Desktop Texture Display (Aspect Ratio 16:9) */}
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[6.8, 1.95]} />
              {activeDisplayTexture ? (
                <meshBasicMaterial map={activeDisplayTexture} toneMapped={false} />
              ) : (
                <meshStandardMaterial color="#090d16" roughness={0.3} />
              )}
            </mesh>

            {/* Left Telemetry / Presenter Panel */}
            <group position={[-4.0, 0, 0]}>
              <mesh>
                <boxGeometry args={[1.6, 1.95, 0.005]} />
                <meshBasicMaterial color="#0b1329" />
              </mesh>
              <Text position={[0, 0.75, 0.01]} fontSize={0.08} color="#38bdf8" anchorX="center">
                DESKTOP FEED
              </Text>
              <Text position={[0, 0.45, 0.01]} fontSize={0.065} color="#e2e8f0" anchorX="center" maxWidth={1.4}>
                {`HOST: ${screenSharePresenterName || 'Teacher'}\nRES: 1080P 60FPS\nSTATUS: ACTIVE`}
              </Text>
              <Text position={[0, -0.4, 0.01]} fontSize={0.06} color="#64748b" anchorX="center" maxWidth={1.4}>
                {"Synchronized Real-Time WebRTC Media Stream"}
              </Text>
            </group>

            {/* Right Telemetry / Audience Panel */}
            <group position={[4.0, 0, 0]}>
              <mesh>
                <boxGeometry args={[1.6, 1.95, 0.005]} />
                <meshBasicMaterial color="#0b1329" />
              </mesh>
              <Text position={[0, 0.75, 0.01]} fontSize={0.08} color="#10b981" anchorX="center">
                AUDIENCE VIEW
              </Text>
              <Text position={[0, 0.45, 0.01]} fontSize={0.065} color="#e2e8f0" anchorX="center" maxWidth={1.4}>
                {"100 STUDENTS SEATED\nAUDIO: LOW-LATENCY\nENCRYPTED STREAM"}
              </Text>
              <Text position={[0, -0.4, 0.01]} fontSize={0.06} color="#64748b" anchorX="center" maxWidth={1.4}>
                {isTeacher ? "Click [STOP PRESENTING] to restore slides" : "Viewing Teacher Screen on Blackboard"}
              </Text>
            </group>
          </group>
        ) : (
          /* ================= REGULAR LECTURE SLIDE DISPLAY ================= */
          <group position={[0, 0, 0]}>
            {/* --- Main Slide Title & Subtitle --- */}
            <Text
              position={[-4.4, 0.72, 0.035]}
              fontSize={0.17}
              color={slide.accentColor}
              anchorX="left"
              anchorY="middle"
            >
              {slide.title}
            </Text>

            <Text
              position={[-4.4, 0.52, 0.035]}
              fontSize={0.1}
              color="#94a3b8"
              anchorX="left"
              anchorY="middle"
            >
              {slide.subtitle}
            </Text>

            {/* Divider Line */}
            <mesh position={[0, 0.42, 0.035]}>
              <boxGeometry args={[9.0, 0.01, 0.005]} />
              <meshBasicMaterial color="#334155" />
            </mesh>

            {/* --- Slide Bullet Points (Left Column) --- */}
            <group position={[-4.4, 0.28, 0.035]}>
              {slide.bullets.map((bullet, idx) => (
                <Text
                  key={idx}
                  position={[0, -idx * 0.2, 0]}
                  fontSize={0.095}
                  color="#e2e8f0"
                  anchorX="left"
                  anchorY="top"
                  maxWidth={4.8}
                  lineHeight={1.3}
                >
                  {bullet}
                </Text>
              ))}
            </group>

            {/* --- Interactive Educational Diagram Box (Right Column) --- */}
            <group position={[2.6, -0.15, 0.035]}>
              {/* Diagram Container Frame */}
              <mesh>
                <boxGeometry args={[3.4, 1.4, 0.01]} />
                <meshStandardMaterial color="#0b1329" roughness={0.5} />
              </mesh>
              <mesh position={[0, 0, 0.005]}>
                <boxGeometry args={[3.36, 1.36, 0.005]} />
                <meshBasicMaterial color={slide.accentColor} transparent opacity={0.15} />
              </mesh>

              {/* Diagram Label */}
              <Text position={[0, 0.55, 0.01]} fontSize={0.075} color={slide.accentColor} anchorX="center">
                {slide.diagramLabel || 'DIAGRAM'}
              </Text>

              {/* Biological / Scientific Graphic Primitives */}
              {boardTopic === 'biology' && (
                <group position={[0, -0.05, 0.01]}>
                  {/* Outer Cell Membrane */}
                  <mesh>
                    <ringGeometry args={[0.38, 0.41, 32]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                  {/* Cytoplasm Fill */}
                  <mesh position={[0, 0, -0.001]}>
                    <circleGeometry args={[0.38, 32]} />
                    <meshBasicMaterial color="#0284c7" transparent opacity={0.25} />
                  </mesh>
                  {/* Nucleus */}
                  <mesh position={[0, 0, 0.002]}>
                    <circleGeometry args={[0.18, 24]} />
                    <meshBasicMaterial color="#a855f7" />
                  </mesh>
                  {/* Nucleolus */}
                  <mesh position={[-0.03, 0.02, 0.004]}>
                    <circleGeometry args={[0.07, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                  {/* Mitochondria Pods */}
                  <mesh position={[0.24, 0.18, 0.002]} rotation={[0, 0, 0.5]}>
                    <capsuleGeometry args={[0.045, 0.12, 4, 8]} />
                    <meshBasicMaterial color="#f97316" />
                  </mesh>
                  <mesh position={[-0.22, -0.2, 0.002]} rotation={[0, 0, -0.4]}>
                    <capsuleGeometry args={[0.045, 0.12, 4, 8]} />
                    <meshBasicMaterial color="#f97316" />
                  </mesh>
                </group>
              )}

              {boardTopic === 'physics' && (
                <group position={[0, -0.05, 0.01]}>
                  {/* Coordinate axis */}
                  <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[2.4, 0.01, 0.005]} />
                    <meshBasicMaterial color="#64748b" />
                  </mesh>
                  <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.01, 0.8, 0.005]} />
                    <meshBasicMaterial color="#64748b" />
                  </mesh>
                  {/* Sine Wave */}
                  {[-1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0].map((x, i) => (
                    <mesh key={i} position={[x, Math.sin(x * 5) * 0.28, 0.005]}>
                      <sphereGeometry args={[0.03, 8, 8]} />
                      <meshBasicMaterial color="#f59e0b" />
                    </mesh>
                  ))}
                </group>
              )}

              {boardTopic === 'chemistry' && (
                <group position={[0, -0.05, 0.01]}>
                  {/* Central Nucleus */}
                  <mesh>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                  {/* Electron Shell Rings */}
                  <mesh rotation={[Math.PI / 4, 0, 0]}>
                    <ringGeometry args={[0.28, 0.3, 32]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                  <mesh rotation={[-Math.PI / 4, 0, 0]}>
                    <ringGeometry args={[0.42, 0.44, 32]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                  {/* Orbiting electrons */}
                  <mesh position={[0.28, 0.12, 0]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                  <mesh position={[-0.36, -0.18, 0]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                </group>
              )}

              <Text position={[0, -0.55, 0.01]} fontSize={0.065} color="#64748b" anchorX="center">
                {isTeacher ? 'Teacher: Click [◀] [▶] or tabs to switch • Click [💻 PRESENT SCREEN] to share desktop' : 'Synchronized Classroom Display'}
              </Text>
            </group>
          </group>
        )}
      </group>

      {/* ================= RIGHT WING: SECONDARY CHALKBOARD (EXPANDED 5.1M) ================= */}
      <group position={[7.45, 0, 0.04]}>
        {/* Dark Slate Surface */}
        <mesh>
          <boxGeometry args={[5.1, 2.45, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.05} />
        </mesh>

        <Text
          position={[0, 1.0, 0.02]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          [ ASSIGNMENTS & WEEKLY SCHEDULE ]
        </Text>

        <Text
          position={[-2.3, 0.65, 0.02]}
          fontSize={0.1}
          color="#f8fafc"
          anchorX="left"
          anchorY="top"
          maxWidth={4.6}
          lineHeight={1.4}
        >
          {"• Today: Cellular Respiration & ATP Kinetics\n• Reading: Textbook Ch. 4 (pp. 82-105)\n• Lab Report: Due Friday 5:00 PM (Electronic Portal)\n• Office Hours: Tue/Thu 3:00 - 4:30 PM"}
        </Text>

        {/* Small Sticky Notice Pins */}
        <group position={[-1.6, -0.55, 0.02]}>
          <mesh>
            <boxGeometry args={[0.9, 0.45, 0.005]} />
            <meshStandardMaterial color="#fef08a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.07} color="#854d0e" anchorX="center" anchorY="middle">
            {"QUIZ ON\nFRIDAY!"}
          </Text>
        </group>

        <group position={[-0.5, -0.55, 0.02]}>
          <mesh>
            <boxGeometry args={[0.9, 0.45, 0.005]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.07} color="#0369a1" anchorX="center" anchorY="middle">
            {"LAB TEAMS:\n4 PER DESK"}
          </Text>
        </group>

        <group position={[0.6, -0.55, 0.02]}>
          <mesh>
            <boxGeometry args={[0.9, 0.45, 0.005]} />
            <meshStandardMaterial color="#bbf7d0" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.07} color="#166534" anchorX="center" anchorY="middle">
            {"SUBMIT VIA\nPORTAL"}
          </Text>
        </group>

        <group position={[1.7, -0.55, 0.02]}>
          <mesh>
            <boxGeometry args={[0.9, 0.45, 0.005]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.07} color="#9a3412" anchorX="center" anchorY="middle">
            {"MIDTERM\nTUESDAY"}
          </Text>
        </group>
      </group>

      {/* ================= CHALK & ACCESSORIES TRAY (EXPANDED 20.0M) ================= */}
      <group position={[0, -1.29, 0.16]}>
        {/* Heavy Aluminum Tray Lip */}
        <mesh>
          <boxGeometry args={[20.0, 0.06, 0.28]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.035, 0.135]}>
          <boxGeometry args={[20.0, 0.04, 0.02]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Felt Chalk Erasers (Spaced Across 20m) */}
        {[-8.5, -6.5, -4.5, -2.5, 2.5, 4.5, 6.5, 8.5].map((x, i) => (
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
        {[-9.2, -9.0, -8.8, -5.5, -5.3, -5.1, 5.1, 5.3, 5.5, 9.0, 9.2, 9.4].map((x, i) => {
          const colors = ['#f8fafc', '#fef08a', '#38bdf8', '#4ade80', '#f472b6', '#f8fafc'];
          return (
            <mesh key={`chalk-${i}`} position={[x, 0.03, 0.04]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.14, 8]} />
              <meshStandardMaterial color={colors[i % colors.length]} roughness={0.9} />
            </mesh>
          );
        })}

        {/* Dry Erase Markers for Center Smart Screen */}
        {[-0.6, -0.3, 0.0, 0.3, 0.6].map((x, i) => {
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

      {/* ================= OVERHEAD ARCHITECTURAL LIGHT BAR (EXPANDED 18.8M) ================= */}
      <group position={[0, 1.5, 0.25]}>
        {/* Horizontal Steel Mount Bar */}
        <mesh>
          <boxGeometry args={[18.8, 0.05, 0.05]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Support Arms */}
        {[-8.0, -4.0, 0, 4.0, 8.0].map((x, i) => (
          <mesh key={`arm-${i}`} position={[x, -0.06, -0.15]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.35]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}
        {/* Downward Angled Spot Lamps */}
        {[-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].map((x, i) => (
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
