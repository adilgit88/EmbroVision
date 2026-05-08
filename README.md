# Embroidery Design Viewer Pro - Technical Specification

## Core Architecture
The application uses a modular layering approach to ensure performance and portability.

### 1. Presentation Layer (React + Tailwind)
- **State Management**: React Context / Hooks for library state.
- **Rendering**: HTML5 Canvas for high-performance stitch rendering.
- **Animation**: Framer Motion (Motion.js) for fluid UI transitions.

### 2. Logic Layer (TypeScript)
- **Parser Engine**: Abstract interface supporting multiple format plugins (DST, PES, JEF, etc.).
- **Simulation Engine**: Frame-based playback for stitch sequences.
- **Analysis Engine**: Background metadata extraction (stitch limits, color bounds, etc.).

### 3. Data Layer (Local Persistence)
- **Library Index**: SQLite (Recommended for production) or IndexedDB (Web implementation).
- **Blob Storage**: Local file system (Native) or Blob Storage (Web).
- **Settings**: JSON-based local configuration.

---

## Recommended Desktop Tech Stack
To build this for Windows first with future Mac support:

1.  **Framework**: **Tauri (v2)**
    - **Why**: Uses Rust for the backend (high performance for binary parsing) and React for the frontend. Significant performance and security advantages over Electron.
    - **Portability**: Native binaries for Windows (.msi/.exe) and Mac (.app/.dmg).
2.  **Language**: **Rust** (Backend) / **TypeScript** (Frontend)
    - Rust is ideal for the byte-level manipulation required for embroidery formats.
3.  **Database**: **SQLite** via Tauri-Plugin-SQL.
    - Low-footprint, zero-config local database.
4.  **Graphics**: **WGPU** or **Skia** (via Canvas)
    - If extreme complexity is needed, but HTML5 Canvas is sufficient for most embroidery views.

---

## Roadmap

### Phase 1: Core Foundation (Current)
- [x] Basic UI Shell & Navigation
- [x] DST Parser Prototype
- [x] Canvas Rendering Engine
- [x] Stitch Simulation

### Phase 2: Performance & Scale
- [ ] Implement Rust-based parsers for 20+ formats.
- [ ] Background indexing service for large directories (10k+ files).
- [ ] Persistent SQLite database.
- [ ] Disk-based thumbnail cache.

### Phase 3: Advanced Features
- [ ] Thread Palette Mapping (SVG/Robinson-Anton/Madeira).
- [ ] Batch Format Conversion.
- [ ] Printing & PDF Exporting.
- [ ] 3D Thread Shading (Bump maps for realistic texture).

### Phase 4: Mac Support
- [ ] Configure GitHub Actions for Macos-latest runners.
- [ ] Entitlements setup for Apple Silicon/Intel.
- [ ] Menu-bar parity (Apple Global Menu).

---

## How to Test this Preview
1. The app initializes with 8 sample designs.
2. Search for "Floral" or "Logo" in the sidebar search.
3. Click any card to open the **Precision Viewer**.
4. Use the bottom simulator to watch the design "stitch out".
5. Toggle **Realistic Mode** for thread-texture rendering.
