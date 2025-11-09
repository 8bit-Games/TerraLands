/**
 * Global game state management using Zustand
 */

import { create } from 'zustand';
import type { GameObject, FieldCoords, UIState } from '../types/game';
import { TribeType } from '../types/game';
import { GameEngine } from '@engine/GameEngine';
import { MapGenerator } from '@engine/MapGenerator';

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
