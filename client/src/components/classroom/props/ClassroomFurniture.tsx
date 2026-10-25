'use client';

import React from 'react';
import * as THREE from 'three';

// ==========================================
// 1. ERGONOMIC STUDENT CHAIR COMPONENT
// ==========================================
interface StudentChairProps {
  color: string;
  isHovered: boolean;
  isOccupied: boolean;
}

export function StudentChairMesh({ color, isHovered, isOccupied }: StudentChairProps) {
  return (
    <group position={[0, isHovered ? 0.04 : 0, 0]}>
      {/* --- Tubular Steel Leg Frame & Glides --- */}
      {/* Front Left Leg */}
      <mesh position={[-0.22, 0.22, -0.18]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.44, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Front Right Leg */}
      <mesh position={[0.22, 0.22, -0.18]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.44, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Rear Left Leg */}
      <mesh position={[-0.22, 0.22, 0.18]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.44, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Rear Right Leg */}
      <mesh position={[0.22, 0.22, 0.18]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.44, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Rubber Foot Glide Caps */}
      {[-0.22, 0.22].map((x) =>
        [-0.18, 0.18].map((z) => (
          <mesh key={`glide-${x}-${z}`} position={[x, 0.012, z]}>
            <cylinderGeometry args={[0.024, 0.024, 0.024, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Under-Seat Crossbar Supports */}
      <mesh position={[0, 0.41, -0.18]}>
        <boxGeometry args={[0.42, 0.02, 0.02]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.41, 0.18]}>
        <boxGeometry args={[0.42, 0.02, 0.02]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      <mesh position={[-0.22, 0.41, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.36]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      <mesh position={[0.22, 0.41, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.36]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>

      {/* --- Ergonomic Molded Shell Seat --- */}
      {/* Waterfall Front Seat Pan */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.045, 0.46]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.05}
          emissive={isHovered ? (isOccupied ? '#ef4444' : '#10b981') : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>
      {/* Curved front bevel lip */}
      <mesh position={[0, 0.425, -0.23]} rotation={[Math.PI / 4, 0, 0]}>
        <boxGeometry args={[0.49, 0.03, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>

      {/* --- Ergonomic Curved Backrest --- */}
      {/* Backrest Uprights (Steel tube) */}
      <mesh position={[-0.18, 0.65, 0.2]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.42, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.65, 0.2]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.42, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Contoured Backrest Cushion */}
      <group position={[0, 0.74, 0.21]}>
        <mesh castShadow>
          <boxGeometry args={[0.46, 0.36, 0.035]} />
          <meshStandardMaterial
            color={color}
            roughness={0.35}
            emissive={isHovered ? (isOccupied ? '#ef4444' : '#10b981') : '#000000'}
            emissiveIntensity={isHovered ? 0.3 : 0}
          />
        </mesh>
        {/* Lumbar Ventilation Slots */}
        {[-0.08, 0, 0.08].map((y, i) => (
          <mesh key={`slot-${i}`} position={[0, y, 0.005]}>
            <boxGeometry args={[0.28, 0.02, 0.04]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))}
      </group>

      {/* Subtle Ground Focus Ring when hovered */}
      {isHovered && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.42, 32]} />
          <meshBasicMaterial color={isOccupied ? '#ef4444' : '#10b981'} transparent opacity={0.65} />
        </mesh>
      )}
    </group>
  );
}

// ==========================================
// 2. PREMIUM STUDENT DESK COMPONENT
// ==========================================
interface StudentDeskProps {
  hasLaptop?: boolean;
}

export function StudentDeskMesh({ hasLaptop = false }: StudentDeskProps) {
  return (
    <group position={[0, 0, -0.65]}>
      {/* --- Maple Laminated Desktop --- */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.08, 0.05, 0.68]} />
        <meshStandardMaterial color="#e2b17a" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Dark Walnut Edge Banding Trim */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.09, 0.048, 0.69]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} wireframe={false} />
      </mesh>
      {/* Recessed Pencil Groove along top edge */}
      <mesh position={[0, 0.746, -0.24]}>
        <boxGeometry args={[0.7, 0.006, 0.03]} />
        <meshStandardMaterial color="#92400e" roughness={0.6} />
      </mesh>

      {/* --- Under-Desk Wire Mesh Book Basket --- */}
      <group position={[0, 0.58, 0]}>
        {/* Basket Bottom Wire Mesh */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.82, 0.015, 0.48]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Basket Wire Guard Rails */}
        <mesh position={[0, 0.05, -0.24]}>
          <boxGeometry args={[0.82, 0.1, 0.015]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.05, 0.24]}>
          <boxGeometry args={[0.82, 0.1, 0.015]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Stored Textbook inside basket */}
        <mesh position={[-0.15, 0.04, 0]} rotation={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.38, 0.06, 0.3]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
        </mesh>
        {/* Stored Binder */}
        <mesh position={[0.2, 0.03, 0]} rotation={[0, -0.05, 0]} castShadow>
          <boxGeometry args={[0.3, 0.04, 0.34]} />
          <meshStandardMaterial color="#047857" roughness={0.5} />
        </mesh>
      </group>

      {/* --- Welded Tubular Steel Frame --- */}
      {/* 4 Tubular Legs */}
      {[-0.46, 0.46].map((x) =>
        [-0.26, 0.26].map((z) => (
          <group key={`leg-${x}-${z}`}>
            <mesh position={[x, 0.36, z]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.72, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
            </mesh>
            {/* Rubber Feet */}
            <mesh position={[x, 0.015, z]}>
              <cylinderGeometry args={[0.026, 0.026, 0.03, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          </group>
        ))
      )}

      {/* Side Horizontal Stretcher Rails */}
      <mesh position={[-0.46, 0.18, 0]}>
        <boxGeometry args={[0.025, 0.025, 0.52]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0.46, 0.18, 0]}>
        <boxGeometry args={[0.025, 0.025, 0.52]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Side Backpack Hook & Canvas Backpack (Left Leg) */}
      <group position={[-0.48, 0.55, 0]}>
        {/* Metal Hook */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.05, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        <mesh position={[-0.03, 0.02, 0]}>
          <boxGeometry args={[0.015, 0.04, 0.015]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        {/* Hanging Canvas Backpack */}
        <mesh position={[-0.08, -0.22, 0]} castShadow>
          <boxGeometry args={[0.16, 0.34, 0.24]} />
          <meshStandardMaterial color="#0369a1" roughness={0.8} />
        </mesh>
        <mesh position={[-0.14, -0.22, 0]}>
          <boxGeometry args={[0.04, 0.18, 0.18]} />
          <meshStandardMaterial color="#0284c7" roughness={0.8} />
        </mesh>
      </group>

      {/* --- Desktop Learning Accessories --- */}
      {/* 1. Spiral Notebook */}
      <group position={[-0.24, 0.75, 0.04]} rotation={[0, 0.08, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.02, 0.38]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Colored notebook cover strip */}
        <mesh position={[-0.14, 0.012, 0]}>
          <boxGeometry args={[0.03, 0.005, 0.38]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
      </group>

      {/* 2. Stainless Steel Insulated Flask / Water Bottle */}
      <group position={[0.38, 0.84, -0.16]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.042, 0.042, 0.22, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.2} />
        </mesh>
        {/* Steel Cap */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.04, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 3. Highlighter & Pen in Pencil Groove */}
      <mesh position={[-0.08, 0.755, -0.24]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.007, 0.007, 0.16, 8]} />
        <meshStandardMaterial color="#facc15" roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.755, -0.24]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.15, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>

      {/* 4. Student Slim Laptop (Optional on some desks) */}
      {hasLaptop && (
        <group position={[0.08, 0.75, 0.02]} rotation={[0, -0.1, 0]}>
          {/* Base */}
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.015, 0.24]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Open Screen */}
          <mesh position={[0, 0.12, -0.11]} rotation={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.32, 0.22, 0.012]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Screen Light */}
          <mesh position={[0, 0.12, -0.104]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.004]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ==========================================
// 3. EXECUTIVE TEACHER DESK COMPONENT
// ==========================================
export function TeacherDeskMesh() {
  return (
    <group position={[0, 0, -4.5]}>
      {/* Heavy Beveled Walnut Desktop */}
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.08, 1.25]} />
        <meshStandardMaterial color="#451a03" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Inset Leather Desk Blotter */}
      <mesh position={[0, 0.822, 0.05]}>
        <boxGeometry args={[1.3, 0.006, 0.75]} />
        <meshStandardMaterial color="#1c1917" roughness={0.8} />
      </mesh>

      {/* Left Drawer Pedestal */}
      <group position={[-1.02, 0.39, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.48, 0.78, 1.1]} />
          <meshStandardMaterial color="#361500" roughness={0.4} />
        </mesh>
        {/* 3 Drawer Panels & Brass Pull Handles */}
        {[-0.24, 0, 0.24].map((y, i) => (
          <group key={`drawer-left-${i}`} position={[0, y, 0.555]}>
            <mesh>
              <boxGeometry args={[0.44, 0.21, 0.015]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
            {/* Brass Handle */}
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.12, 0.02, 0.02]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Right Drawer Pedestal */}
      <group position={[1.02, 0.39, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.48, 0.78, 1.1]} />
          <meshStandardMaterial color="#361500" roughness={0.4} />
        </mesh>
        {/* 3 Drawer Panels & Brass Pull Handles */}
        {[-0.24, 0, 0.24].map((y, i) => (
          <group key={`drawer-right-${i}`} position={[0, y, 0.555]}>
            <mesh>
              <boxGeometry args={[0.44, 0.21, 0.015]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
            {/* Brass Handle */}
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.12, 0.02, 0.02]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Front Architectural Modesty Panel */}
      <mesh position={[0, 0.45, -0.48]} castShadow>
        <boxGeometry args={[1.56, 0.58, 0.04]} />
        <meshStandardMaterial color="#361500" roughness={0.4} />
      </mesh>

      {/* --- Teacher Desk Props --- */}
      {/* 1. Sleek Teacher Laptop */}
      <group position={[-0.32, 0.83, 0.06]} rotation={[0, -0.15, 0]}>
        {/* Aluminum Chassis */}
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.018, 0.3]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Keyboard Bay */}
        <mesh position={[0, 0.01, 0.02]}>
          <boxGeometry args={[0.36, 0.002, 0.16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Upright Screen */}
        <mesh position={[0, 0.17, -0.14]} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.3, 0.015]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        {/* Screen Display */}
        <mesh position={[0, 0.17, -0.131]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.39, 0.27, 0.004]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* 2. Brass Architect Desk Lamp with Warm Glow */}
      <group position={[-0.95, 0.82, -0.22]}>
        {/* Base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.03, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Articulated Brass Arm */}
        <mesh position={[0.04, 0.16, 0.06]} rotation={[0.4, 0, -0.2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.32, 8]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Shade */}
        <group position={[0.1, 0.32, 0.12]} rotation={[-0.7, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.1, 0.14, 16]} />
            <meshStandardMaterial color="#15803d" roughness={0.3} />
          </mesh>
          {/* Bulb */}
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} />
          </mesh>
          <pointLight color="#fef08a" intensity={0.8} distance={2.5} />
        </group>
      </group>

      {/* 3. Ceramic Teacher Coffee Mug & Apple */}
      <group position={[0.45, 0.88, 0.18]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} />
        </mesh>
        {/* Mug Handle */}
        <mesh position={[0.075, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.04, 0.012, 8, 16]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>
      {/* Fresh Red Apple */}
      <mesh position={[0.35, 0.87, 0.28]} castShadow>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.25} />
      </mesh>

      {/* 4. Desktop Pen Organizer & Paper Tray */}
      <group position={[0.95, 0.82, -0.15]}>
        {/* Pen Cup */}
        <mesh position={[-0.12, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.6} />
        </mesh>
        {/* Pens / Scissors in cup */}
        <mesh position={[-0.12, 0.14, 0]} rotation={[0.2, 0, 0.1]}>
          <cylinderGeometry args={[0.005, 0.005, 0.14, 8]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[-0.14, 0.14, -0.01]} rotation={[-0.15, 0, -0.2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.15, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>

        {/* Paper In-Tray */}
        <mesh position={[0.1, 0.025, 0]} castShadow>
          <boxGeometry args={[0.28, 0.05, 0.36]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.1, 0.04, 0]}>
          <boxGeometry args={[0.25, 0.03, 0.33]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
    </group>
  );
}

// ==========================================
// 4. EXECUTIVE TEACHER SWIVEL CHAIR
// ==========================================
export function TeacherChairMesh({ isOccupied }: { isOccupied: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* 5-Star Chrome Castor Base */}
      <group position={[0, 0.05, 0]}>
        {/* Center Chrome Hub */}
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.06, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* 5 Legs radiating out */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5;
          return (
            <group key={`star-leg-${i}`} rotation={[0, angle, 0]}>
              <mesh position={[0, 0, 0.16]} rotation={[0.1, 0, 0]} castShadow>
                <boxGeometry args={[0.04, 0.03, 0.3]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Dual Wheel Castor */}
              <mesh position={[0, -0.025, 0.3]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.024, 0.024, 0.03, 12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Pneumatic Gas Lift Cylinder */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.32, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Seat Cushion (Deep Black Leather) */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.09, 0.54]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Padded High-Back Lumbar Backrest */}
      <mesh position={[0, 0.82, 0.22]} rotation={[-0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.52, 0.65, 0.07]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Contoured Headrest */}
      <mesh position={[0, 1.18, 0.2]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} />
      </mesh>

      {/* Padded Armrests */}
      {[-0.29, 0.29].map((x, i) => (
        <group key={`armrest-${i}`} position={[x, 0.64, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.07, 0.03, 0.32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          {/* Chrome bracket */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ==========================================
// 5. DETAILED BOOKSHELVES UNIT
// ==========================================
export function DetailedBookshelf() {
  const bookColors = ['#1d4ed8', '#b91c1c', '#047857', '#d97706', '#7c3aed', '#0284c7', '#be123c', '#334155'];

  return (
    <group position={[7.8, 1.8, 0]}>
      {/* Solid Hardwood Case */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.48, 3.4, 4.4]} />
        <meshStandardMaterial color="#451a03" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* 4 Shelves */}
      {[-1.1, -0.3, 0.5, 1.3].map((yOff, i) => (
        <mesh key={`shelf-slab-${i}`} position={[-0.05, yOff, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.06, 4.2]} />
          <meshStandardMaterial color="#582f0e" roughness={0.4} />
        </mesh>
      ))}

      {/* Individual Book Spines with realistic variations */}
      {/* Shelf 1 Books */}
      <group position={[-0.08, -0.85, -1.8]}>
        {Array.from({ length: 28 }).map((_, idx) => {
          const width = 0.07 + (idx % 4) * 0.02;
          const height = 0.38 + (idx % 3) * 0.05;
          const col = bookColors[idx % bookColors.length];
          return (
            <mesh key={`b1-${idx}`} position={[0, height / 2 - 0.2, idx * 0.13]} castShadow>
              <boxGeometry args={[0.26, height, width]} />
              <meshStandardMaterial color={col} roughness={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* Shelf 2 Books & Globe */}
      <group position={[-0.08, -0.05, -1.8]}>
        {Array.from({ length: 18 }).map((_, idx) => {
          const width = 0.08 + (idx % 3) * 0.02;
          const height = 0.4 + (idx % 4) * 0.04;
          const col = bookColors[(idx + 3) % bookColors.length];
          return (
            <mesh key={`b2-${idx}`} position={[0, height / 2 - 0.2, idx * 0.13]} castShadow>
              <boxGeometry args={[0.26, height, width]} />
              <meshStandardMaterial color={col} roughness={0.5} />
            </mesh>
          );
        })}

        {/* Brass Gimbal Desktop Globe */}
        <group position={[0.02, 0.08, 3.1]}>
          {/* Base */}
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.04, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Gimbal Ring */}
          <mesh rotation={[0.4, 0, 0]}>
            <torusGeometry args={[0.22, 0.015, 8, 24]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Globe Sphere */}
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Shelf 3 Chemistry Flasks & Specimen Jars */}
      <group position={[-0.08, 0.75, 0]}>
        {/* Erlenmeyer Flasks with Glowing Chemical Fluids */}
        {[-0.8, -0.4, 0.2, 0.6].map((z, idx) => {
          const fluidColor = ['#38bdf8', '#a855f7', '#34d399', '#f59e0b'][idx];
          return (
            <group key={`flask-${idx}`} position={[0, -0.15, z]}>
              {/* Glass body */}
              <mesh castShadow>
                <cylinderGeometry args={[0.03, 0.1, 0.2, 16]} />
                <meshStandardMaterial color="#e0f2fe" transparent opacity={0.55} roughness={0.1} />
              </mesh>
              {/* Fluid inside */}
              <mesh position={[0, -0.04, 0]}>
                <cylinderGeometry args={[0.025, 0.09, 0.1, 16]} />
                <meshStandardMaterial color={fluidColor} roughness={0.2} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Potted Trailing Ivy on Top */}
      <group position={[-0.05, 1.85, 1.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.12, 0.22, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#15803d" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// ==========================================
// 6. CORK BULLETIN BOARD COMPONENT
// ==========================================
export function BulletinBoardMesh() {
  return (
    <group position={[-7.95, 2.5, 3.8]} rotation={[0, Math.PI / 2, 0]}>
      {/* Natural Oak Frame */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 1.5, 0.05]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} />
      </mesh>
      {/* Textured Cork Field */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.08, 1.38, 0.015]} />
        <meshStandardMaterial color="#d4a373" roughness={0.9} />
      </mesh>

      {/* Colorful Push-Pinned Notes and Notices */}
      {[
        { x: -0.6, y: 0.3, col: '#fef08a', rot: 0.05, text: 'CLASS SCHEDULE' },
        { x: 0.0, y: 0.35, col: '#bae6fd', rot: -0.04, text: 'CAMPUS MAP' },
        { x: 0.6, y: 0.25, col: '#fbcfe8', rot: 0.02, text: 'EXAM DATES' },
        { x: -0.5, y: -0.28, col: '#bbf7d0', rot: -0.06, text: 'LAB SAFETY' },
        { x: 0.3, y: -0.3, col: '#fed7aa', rot: 0.08, text: 'HONOR CODE' }
      ].map((note, idx) => (
        <group key={`pin-note-${idx}`} position={[note.x, note.y, 0.03]} rotation={[0, 0, note.rot]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.35, 0.005]} />
            <meshStandardMaterial color={note.col} roughness={0.7} />
          </mesh>
          {/* Push Pin */}
          <mesh position={[0, 0.14, 0.01]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ==========================================
// 7. SUSPENDED ARCHITECTURAL CEILING LAMPS
// ==========================================
export function SuspendedCeilingLamps() {
  const lampPositions: [number, number, number][] = [
    [-3.0, 4.4, -2.5],
    [3.0, 4.4, -2.5],
    [-3.0, 4.4, 2.5],
    [3.0, 4.4, 2.5]
  ];

  return (
    <group>
      {lampPositions.map(([x, y, z], idx) => (
        <group key={`lamp-${idx}`} position={[x, y, z]}>
          {/* Dual Suspension Cables */}
          <mesh position={[-0.6, 0.3, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.6]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} />
          </mesh>
          <mesh position={[0.6, 0.3, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.6]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} />
          </mesh>

          {/* Pendant Housing Box */}
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.08, 0.28]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Diffuser Panel */}
          <mesh position={[0, -0.045, 0]}>
            <boxGeometry args={[1.42, 0.01, 0.24]} />
            <meshStandardMaterial color="#fffbeb" emissive="#fffbeb" emissiveIntensity={0.8} />
          </mesh>

          {/* Soft Downward Warm Light */}
          <pointLight color="#fffbeb" intensity={0.5} distance={8} />
        </group>
      ))}
    </group>
  );
}
