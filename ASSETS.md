# CLASSVERSE — 3D Asset Manifest & Geometry Reference

CLASSVERSE features stylized, low-poly procedural 3D classroom geometry constructed using Three.js and React Three Fiber primitives with soft shadows and physically-based materials.

## Asset Design Principles

1. **Self-Contained & Resilient**:
   - All classroom models, props, and avatars are generated with native Three.js procedural geometries and materials.
   - **Zero external URL dependencies**: The classroom never fails to load due to broken remote CDNs or expired asset URLs.

2. **Stylized Low-Poly Aesthetic**:
   - Palette inspired by miniature isometric classroom dioramas.
   - Warm ambient lighting, directional window sunlight with shadow maps, and soft bevels.

## Geometry Inventory

| Category | Component / Asset | Description | Materials & Colors |
| :--- | :--- | :--- | :--- |
| **Room Shell** | `ClassroomFloor` | 16x14 unit wood plank floor with dark border trim | `#d4a373`, roughness: 0.35, metalness: 0.05 |
| | `ClassroomWalls` | Front, left, right, and back walls with wainscoting | `#f1f5f9` wall, `#cbd5e1` trim |
| | `ClassroomDoor` | Back wall wooden door with glass pane and brass handle | `#9a3412` wood, `#fbbf24` brass handle |
| | `ClassroomWindows` | Dual large left-wall sunlight windows with sills & potted plants | `#ffffff` frames, `#bae6fd` glass, `#15803d` foliage |
| **Teacher Area** | `TeacherDesk` | Front executive desk with cabinets and leg room | `#78350f` / `#582f0e` dark walnut |
| | `TeacherPodiumProps` | Laptop with illuminated screen, coffee mug, textbooks, apple | `#64748b` metal, `#ef4444` ceramic, `#dc2626` fruit |
| | `PresentationBoard` | Large slate chalkboard with wooden trim, equations, chalk & eraser | `#1e293b` slate, `#78350f` oak trim |
| | `WallClock` | Circular wall clock with ticking hour & minute hands | `#f8fafc` face, `#0f172a` dials |
| **Student Furniture** | `StudentDesks (x12)` | 3 rows × 4 columns wood-top student desks with notebooks | `#d4a373` wood top, `#1e293b` steel legs |
| | `StudentChairs (x12)` | Interactive chairs with hover highlight and occupancy tooltips | `#475569` base, `#10B981` hover, `#EF4444` occupied |
| **Props & Decor** | `Bookshelves` | Tall multi-tiered bookshelf with books and science props | `#582f0e` oak, multi-colored book spines |
| | `WallPosters` | Periodic table and biology posters | Stylized high-contrast informational boards |
| **Characters** | `AvatarMesh` | Low-poly humanoid with head, eyes, hair, torso, arms, legs | Customizable `#10B981` - `#6366F1` apparel |
| | `AvatarAnimations` | Idle sway, walking cycle, seated pose, hand-raising wave | Procedural sine-wave kinematics in `useFrame` |
| | `AvatarUI` | Floating 2D nameplate, role badge, hand wave icon, audio ring | React Three Fiber `<Html>` + Tailwind CSS |

## Legal & Licensing Compliance

- **Procedural Geometries**: Custom MIT / Open Source procedural primitives created directly for CLASSVERSE.
- **Reference Assets**: Compatible with Kenney Furniture Kit (CC0 1.0 Universal) and Quaternius Universal Free Assets.
