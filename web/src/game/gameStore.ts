/**
 * Global game state management using Zustand
 */

import { create } from 'zustand';
import type { GameObject, FieldCoords, UIState } from '../types/game';
import { TribeType } from '../types/game';
import { GameEngine } from '@engine/GameEngine';
import { MapGenerator } from '@engine/MapGenerator';
import { EntityFactory } from '@engine/ECS';

interface GameStore {
  // Game engine instance
  engine: GameEngine | null;

  // UI state
  ui: UIState;

  // Actions
  initializeGame: () => void;
  startGame: () => void;
  pauseGame: () => void;
  setGameSpeed: (speed: number) => void;
  selectObject: (object: GameObject | null) => void;
  hoverField: (coords: FieldCoords | null) => void;
  updateCamera: (camera: Partial<UIState['camera']>) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  engine: null,

  ui: {
    selectedObject: null,
    hoveredField: null,
    camera: {
      x: 0,
      y: 0,
      zoom: 1.0,
      rotation: 0,
    },
    menuOpen: false,
  },

  initializeGame: () => {
    // Generate a test map
    const map = MapGenerator.generateTestMap(64, 64);

    // Create test players
    const players = [
      {
        id: 1,
        name: 'Player 1',
        tribe: TribeType.Barbarians,
        color: '#FF0000',
        team: 1,
        isAI: false,
      },
    ];

    // Create game engine
    const engine = new GameEngine(map, players);

    // Create demo entities
    const world = engine.getWorld();

    // Add some buildings in the center of the map
    EntityFactory.createBuilding(world, { x: 30, y: 30 }, 'headquarters', 'big', 1);
    EntityFactory.createBuilding(world, { x: 28, y: 32 }, 'farm', 'medium', 1);
    EntityFactory.createBuilding(world, { x: 32, y: 31 }, 'lumberjack', 'small', 1);
    EntityFactory.createBuilding(world, { x: 29, y: 28 }, 'quarry', 'medium', 1);

    // Add some workers around the buildings
    EntityFactory.createWorker(world, { x: 31, y: 29 }, 'carrier', 1);
    EntityFactory.createWorker(world, { x: 29, y: 31 }, 'builder', 1);
    EntityFactory.createWorker(world, { x: 30, y: 32 }, 'lumberjack', 1);
    EntityFactory.createWorker(world, { x: 33, y: 30 }, 'miner', 1);
    EntityFactory.createWorker(world, { x: 28, y: 29 }, 'carrier', 1);

    set({ engine });
  },

  startGame: () => {
    const { engine } = get();
    if (engine) {
      engine.start();
    }
  },

  pauseGame: () => {
    const { engine } = get();
    if (engine) {
      engine.togglePause();
    }
  },

  setGameSpeed: (speed: number) => {
    const { engine } = get();
    if (engine) {
      engine.setSpeed(speed);
    }
  },

  selectObject: (object: GameObject | null) => {
    set((state) => ({
      ui: { ...state.ui, selectedObject: object },
    }));
  },

  hoverField: (coords: FieldCoords | null) => {
    set((state) => ({
      ui: { ...state.ui, hoveredField: coords },
    }));
  },

  updateCamera: (camera: Partial<UIState['camera']>) => {
    set((state) => ({
      ui: {
        ...state.ui,
        camera: { ...state.ui.camera, ...camera },
      },
    }));
  },
}));
