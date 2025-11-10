# TerraLands Web

Modern web and mobile implementation of TerraLands real-time strategy game.

## Technology Stack

- **TypeScript 5.6** - Type-safe game development
- **React 18** - UI framework
- **PixiJS 8** - WebGL 2D rendering engine
- **Zustand** - Lightweight state management
- **Vite 5** - Fast build tooling
- **TailwindCSS** - Utility-first styling

## Project Structure

```
web/
├── src/
│   ├── components/      # React UI components
│   │   ├── GameCanvas.tsx
│   │   └── GameUI.tsx
│   ├── engine/          # Core game engine
│   │   ├── GameEngine.ts     # Main game loop + ECS integration
│   │   ├── Renderer.ts       # PixiJS hex grid renderer
│   │   ├── MapGenerator.ts   # Procedural map generation
│   │   ├── Pathfinding.ts    # A* pathfinding for hex grids
│   │   ├── ECS.ts            # Entity Component System
│   │   └── AssetLoader.ts    # Asset loading and caching
│   ├── game/            # Game logic
│   │   └── gameStore.ts      # Zustand store
│   ├── types/           # TypeScript definitions
│   │   └── game.ts
│   ├── utils/           # Utility functions
│   │   └── hexGrid.ts        # Hexagonal grid utilities
│   ├── assets/          # Game assets
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

Opens at http://localhost:3000

### Build

```bash
npm run build
```

Outputs to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Current Features (v0.2.0)

### Core Engine
- ✅ Game engine with 30 Hz tick-based simulation
- ✅ Entity Component System (ECS) architecture
- ✅ Movement and Production systems
- ✅ Hexagonal grid system (flat-top orientation)
- ✅ A* pathfinding algorithm for hex grids
- ✅ Asset loading and caching system

### Graphics & Rendering
- ✅ PixiJS WebGL hexagonal grid rendering
- ✅ Terrain rendering with proper hex tiles
- ✅ Height-based shading for elevation
- ✅ Resource indicators on tiles
- ✅ Camera controls (pan, zoom, touch support)

### Map System
- ✅ Procedural terrain generation (64x64 tiles)
- ✅ 6 terrain types (water, grass, desert, mountain, snow, swamp)
- ✅ Resource placement (coal, iron, gold, granite)
- ✅ Hex coordinate system utilities
- ✅ Neighbor finding and distance calculations

### Game Systems
- ✅ Entity creation (workers, buildings)
- ✅ Component-based entities (position, movement, inventory, etc.)
- ✅ Pathfinding with terrain cost modifiers
- ✅ Reachable hex calculation (for movement range)

### UI & Controls
- ✅ Touch-optimized game UI
- ✅ Game speed controls (0.5x - 4x)
- ✅ Pause/play functionality
- ✅ Responsive design for mobile/desktop
- ✅ Mouse and touch input support

### Development
- ✅ TypeScript with strict type checking
- ✅ Vite fast build system
- ✅ Code splitting for optimal loading
- ✅ Development server with hot reload

## Roadmap

### Phase 1: Core Engine (90% Complete)
- [x] Project setup
- [x] Basic rendering engine
- [x] Map generation
- [x] Proper hex grid rendering
- [x] Asset loading system
- [x] Pathfinding (A*)
- [x] Entity Component System (ECS)
- [ ] Sprite rendering for entities
- [ ] Animation system

### Phase 2: Game Logic
- [ ] Economy simulation
- [ ] Building placement
- [ ] Worker management
- [ ] Resource gathering
- [ ] Production chains

### Phase 3: Multiplayer
- [ ] WebSocket server
- [ ] Client-server sync
- [ ] Matchmaking
- [ ] Replay system

### Phase 4: Content
- [ ] Original factions
- [ ] Tutorial campaign
- [ ] Skirmish maps
- [ ] UI polish

### Phase 5: Mobile
- [ ] React Native/Capacitor
- [ ] Touch controls
- [ ] Performance optimization
- [ ] App store deployment

## Architecture

### Game Engine

The game uses a tick-based simulation running at 30 ticks per second (configurable). The main game loop:

1. **Game Tick** (30 Hz) - Updates game state
   - Economy simulation
   - Worker AI
   - Building production
   - Military/combat

2. **Rendering** (60 FPS) - Visual updates
   - PixiJS WebGL rendering
   - Camera transformations
   - UI updates

### Rendering Pipeline

```
GameEngine → GameState → Zustand Store → React Components → PixiJS Renderer
```

The renderer uses PixiJS for high-performance WebGL rendering:
- Field-based terrain rendering
- Sprite batching for objects
- Camera system with pan/zoom
- Touch gesture support

### State Management

Zustand provides lightweight state management:
- Game engine instance
- UI state (selection, camera, menus)
- Actions for game control

## Performance Targets

- **Load Time**: < 5 seconds
- **FPS**: 60 FPS on mid-range devices
- **Mobile**: Smooth on iPhone 11+, Pixel 5+
- **Bundle Size**: < 5MB initial, lazy-load content

## Porting from Widelands C++

This web version ports core concepts from the Widelands C++ codebase:

- **Map system**: Hex grid with fields (terrain, resources, height)
- **Game objects**: Buildings, workers (bobs), ships
- **Economy**: Warehouses, production, supply chains
- **Tick system**: Deterministic game simulation

Key differences:
- Modern TypeScript instead of C++17
- PixiJS WebGL instead of OpenGL
- Browser APIs instead of SDL2
- React UI instead of custom C++ UI framework

## License

This web implementation is licensed under GPL v2+, consistent with the Widelands source.

Original game assets and new content may have different licenses - see individual asset directories.

## Contributing

See [../MODERNIZATION_PLAN.md](../MODERNIZATION_PLAN.md) for the full modernization roadmap.

## Attribution

Based on [Widelands](https://github.com/widelands/widelands), an open-source RTS game.

---

**Status**: Early Development (v0.1.0)
**Last Updated**: November 9, 2025
