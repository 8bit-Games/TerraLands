/**
 * Map Generator for TerraLands
 * Creates procedural or preset maps
 */

import type { GameMap, Field, MapDimensions, FieldCoords } from '../types/game';
import { TerrainType, ResourceType } from '../types/game';

export class MapGenerator {
  /**
   * Generate a simple test map
   */
  public static generateTestMap(width: number = 64, height: number = 64): GameMap {
    const dimensions: MapDimensions = { width, height };
    const fields: Field[][] = [];

    // Initialize field grid
    for (let y = 0; y < height; y++) {
      fields[y] = [];
      for (let x = 0; x < width; x++) {
        fields[y][x] = this.createField({ x, y });
      }
    }

    return {
      dimensions,
      fields,
      objects: new Map(),
    };
  }

  /**
   * Create a single field with procedural terrain
   */
  private static createField(coords: FieldCoords): Field {
    // Simple procedural terrain generation
    const noise = this.simpleNoise(coords.x, coords.y);

    let terrain: TerrainType;
    let height: number;

    if (noise < 0.2) {
      terrain = TerrainType.Water;
      height = 0;
    } else if (noise < 0.5) {
      terrain = TerrainType.Grass;
      height = Math.floor(noise * 10);
    } else if (noise < 0.7) {
      terrain = TerrainType.Desert;
      height = Math.floor(noise * 15);
    } else {
      terrain = TerrainType.Mountain;
      height = Math.floor(noise * 20);
    }

    // Add resources based on terrain
    let resource = ResourceType.None;
    let resourceAmount = 0;

    if (terrain === TerrainType.Mountain && Math.random() > 0.7) {
      const rand = Math.random();
      if (rand > 0.7) {
        resource = ResourceType.Gold;
        resourceAmount = Math.floor(Math.random() * 10 + 5);
      } else if (rand > 0.4) {
        resource = ResourceType.Iron;
        resourceAmount = Math.floor(Math.random() * 15 + 10);
      } else {
        resource = ResourceType.Coal;
        resourceAmount = Math.floor(Math.random() * 20 + 10);
      }
    }

    return {
      coords,
      terrain,
      resource,
      resourceAmount,
      height,
      owner: null,
    };
  }

  /**
   * Simple noise function for terrain generation
   * (In production, use a proper noise library like simplex-noise)
   */
  private static simpleNoise(x: number, y: number): number {
    // Very basic pseudo-random noise
    const seed = x * 374761393 + y * 668265263;
    const hash = (seed ^ (seed >> 13)) * 1274126177;
    return ((hash ^ (hash >> 16)) & 0xFFFFFF) / 0xFFFFFF;
  }

  /**
   * Convert map coordinates to axial hex coordinates
   */
  public static toHexCoords(x: number, y: number): FieldCoords {
    // For now, just return as-is
    // TODO: Implement proper hex grid conversion
    return { x, y };
  }

  /**
   * Get neighboring fields (6 neighbors in hex grid)
   */
  public static getNeighbors(coords: FieldCoords): FieldCoords[] {
    // Hex grid neighbors (using axial coordinates)
    const { x, y } = coords;
    return [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
    ];
  }
}
