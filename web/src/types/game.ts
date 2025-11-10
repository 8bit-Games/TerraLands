/**
 * Core game types for TerraLands
 * Ported and modernized from Widelands C++ codebase
 */

// Basic coordinate system
export interface Coordinate {
  x: number;
  y: number;
}

// Field coordinates (hex grid)
export interface FieldCoords extends Coordinate {
  // Hex grid uses axial coordinates
}

// Map dimensions
export interface MapDimensions {
  width: number;
  height: number;
}

// Terrain types
export enum TerrainType {
  Water = 'water',
  Grass = 'grass',
  Desert = 'desert',
  Mountain = 'mountain',
  Snow = 'snow',
  Swamp = 'swamp',
}

// Resource types
export enum ResourceType {
  None = 'none',
  Coal = 'coal',
  Iron = 'iron',
  Gold = 'gold',
  Granite = 'granite',
  Water = 'water',
}

// Field (map tile) representation
export interface Field {
  coords: FieldCoords;
  terrain: TerrainType;
  resource: ResourceType;
  resourceAmount: number;
  height: number;
  owner: number | null; // Player ID or null
}

// Player data
export interface Player {
  id: number;
  name: string;
  tribe: TribeType;
  color: string;
  team: number;
  isAI: boolean;
}

// Tribe/faction types
export enum TribeType {
  Barbarians = 'barbarians',
  Empire = 'empire',
  Atlanteans = 'atlanteans',
  Frisians = 'frisians',
  Amazons = 'amazons',
}

// Game object base
export interface GameObject {
  id: string;
  type: GameObjectType;
  position: FieldCoords;
  owner: number;
}

// Game object types
export enum GameObjectType {
  Building = 'building',
  Worker = 'worker',
  Soldier = 'soldier',
  Ship = 'ship',
  Resource = 'resource',
}

// Building representation
export interface Building extends GameObject {
  type: GameObjectType.Building;
  buildingType: string; // e.g., 'headquarters', 'farm', 'mine'
  size: 'small' | 'medium' | 'big';
  health: number;
  maxHealth: number;
  production: ProductionStatus | null;
}

// Production status
export interface ProductionStatus {
  producing: string; // Ware type being produced
  progress: number; // 0-1
  paused: boolean;
}

// Worker/Bob representation
export interface Worker extends GameObject {
  type: GameObjectType.Worker;
  workerType: string; // e.g., 'carrier', 'builder', 'miner'
  task: WorkerTask | null;
  inventory: Map<string, number>;
}

// Worker task
export interface WorkerTask {
  type: 'move' | 'build' | 'mine' | 'deliver';
  target: FieldCoords;
  progress: number;
}

// Map representation
export interface GameMap {
  dimensions: MapDimensions;
  fields: Field[][];
  objects: Map<string, GameObject>;
}

// Game state
export interface GameState {
  map: GameMap;
  players: Player[];
  currentTick: number;
  speed: number; // Game speed multiplier
  paused: boolean;
}

// Economy - Ware types
export interface WareType {
  name: string;
  tribe: TribeType;
  icon: string;
}

// UI State
export interface UIState {
  selectedObject: GameObject | null;
  hoveredField: FieldCoords | null;
  camera: CameraState;
  menuOpen: boolean;
}

// Camera/viewport
export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}
