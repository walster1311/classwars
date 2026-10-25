# CLASSVERSE — 3D Asset Manifest & Geometry Reference

CLASSVERSE features stylized, low-poly procedural 3D classroom geometry constructed using Three.js and React Three Fiber primitives with soft shadows, realistic architectural dimensions, and physically-based materials.

## Asset Design Principles

1. **Self-Contained & Resilient**:
   - All classroom models, props, and avatars are generated with native Three.js procedural geometries and materials.
   - **Zero external URL dependencies**: The classroom never fails to load due to broken remote CDNs or expired asset URLs.

2. **Stylized Low-Poly Aesthetic & Architectural Realism**:
   - Palette inspired by miniature isometric classroom dioramas.
   - Warm ambient lighting, directional window sunlight with soft shadow maps, suspended ceiling lighting, and beveled trims.

---

## Detailed Geometry & Component Inventory

| Category | Component / Asset | Description | Materials & Colors |
| :--- | :--- | :--- | :--- |
| **Interactive Board** | `SmartBoard` | 11.6m wide hybrid presentation center with 16:9 smart digital display, left/right slate chalkboard wings, chalk & marker tray, and overhead spotlight bar | `#451a03` oak outer mount, `#334155` aluminum bezel, `#090d16` glass screen with `#0284c7` glow, `#0f172a` slate wings |
| | `SmartBoardProps` | Multicolored chalk sticks, felt chalkboard erasers, dry-erase markers, and 4 overhead angled spotlight lamps | `#f8fafc` chalks, `#78350f` eraser backs, `#fef08a` warm lamp bulbs |
| **Student Seating** | `StudentChairMesh` | Ergonomically molded school chair shell with lumbar contour, waterfall front seat lip, backrest ventilation slots, tubular steel legs, and rubber foot glides | `#10B981` / `#6366F1` shell, `#1e293b` tubular steel, `#0f172a` rubber feet |
| | `StudentDeskMesh` | Curved beveled maple laminate top with recessed pencil groove, under-desk wire mesh book basket holding textbook/binder, welded tubular frame, side backpack hook with canvas bag, notebook, and stainless steel flask | `#e2b17a` maple desktop, `#78350f` edge trim, `#334155` wire basket, `#0369a1` backpack, `#0284c7` water bottle |
| **Teacher Suite** | `TeacherDeskMesh` | Grand executive double-pedestal desk in rich dark walnut, front architectural modesty panel, 6 drawers with brushed brass pull handles | `#451a03` dark walnut, `#1c1917` leather desk blotter, `#fbbf24` brass handles |
| | `TeacherProps` | Modern laptop with glowing attendance screen, brass articulated architect lamp with warm glow, ceramic coffee mug, fresh red apple, pen organizer cup, and paper in-tray | `#64748b` aluminum laptop, `#d97706` brass lamp, `#dc2626` mug, `#ef4444` apple |
| | `TeacherChairMesh` | Executive high-back leather swivel chair, contoured headrest and lumbar cushions, padded chrome armrests, and 5-star chrome base with dual-wheel nylon rollers | `#0f172a` leather cushions, `#e2e8f0` chrome star base & brackets, `#0f172a` castors |
| **Classroom Props** | `DetailedBookshelf` | Deep stained oak bookshelf unit with 4 tiers, 40+ individually rendered book spines of various widths and colors, desktop globe on brass gimbal, and chemistry flasks with glowing fluids | `#451a03` oak case, vibrant book spines (`#1d4ed8`, `#b91c1c`, `#047857`, `#7c3aed`), `#d97706` brass globe |
| | `BulletinBoardMesh` | Wall-mounted natural cork board with oak frame, pushpins, class schedule, and colorful sticky notes | `#78350f` oak frame, `#d4a373` cork, `#fef08a` / `#bae6fd` notes |
| | `SuspendedCeilingLamps` | 4 suspended architectural pendant box lamps with dual steel suspension cables and warm downward diffusers | `#1e293b` pendant housing, `#fffbeb` diffuser with point light |
| | `ClassroomWindows` | Dual large sunlight windows with mullions, wood sill, Venetian horizontal blinds, and terra cotta potted plants | `#f8fafc` frame, `#bae6fd` glass, `#c2410c` terra cotta, `#15803d` foliage |
| | `ClassroomDoor` | Back wall wood slab door with frosted vision glass and commercial brass lever handle | `#582f0e` frame, `#78350f` slab, `#fbbf24` brass lever |
| | `WallClock` | High-precision circular wall clock with black casing, white face, dials, and red second-hand pin | `#0f172a` casing, `#ffffff` dial, `#ef4444` pin |
| **Characters** | `AvatarMesh` | Low-poly humanoid avatar with head, eyes, hair/cap, torso, arms, legs, nameplate, role badge, hand wave, and audio visualizer rings | Customizable palette (`#10B981`, `#6366F1`, `#F59E0B`, etc.) |

---

## Legal & Licensing Compliance

- **Procedural Geometries**: Custom MIT / Open Source procedural primitives created directly for CLASSVERSE.
- **Reference Assets**: Fully compliant with open-source specifications and zero external CDN vulnerabilities.
