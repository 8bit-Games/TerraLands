/**
 * Hexagonal Grid Utilities for TerraLands
 * Based on the axial coordinate system
 * Reference: https://www.redblobgames.com/grids/hexagons/
 */

import type { FieldCoords } from '../types/game';

export interface Point {
  x: number;
  y: number;
}

export interface HexOrientation {
  f0: number;
  f1: number;
  f2: number;
  f3: number;
  b0: number;
  b1: number;
  b2: number;
  b3: number;
  startAngle: number;
}

export class HexGrid {
  // Flat-top hex orientation (like Widelands)
  private static readonly FLAT_ORIENTATION: HexOrientation = {
    f0: 3.0 / 2.0,
    f1: 0.0,
    f2: Math.sqrt(3.0) / 2.0,
    f3: Math.sqrt(3.0),
    b0: 2.0 / 3.0,
    b1: 0.0,
    b2: -1.0 / 3.0,
    b3: Math.sqrt(3.0) / 3.0,
    startAngle: 0.0,
  };

  /**
   * Convert hex axial coordinates to pixel position
   */
  public static hexToPixel(coords: FieldCoords, size: number): Point {
    const orientation = this.FLAT_ORIENTATION;
    const x = (orientation.f0 * coords.x + orientation.f1 * coords.y) * size;
    const y = (orientation.f2 * coords.x + orientation.f3 * coords.y) * size;
    return { x, y };
  }

  /**
   * Convert pixel position to hex axial coordinates
   */
  public static pixelToHex(point: Point, size: number): FieldCoords {
    const orientation = this.FLAT_ORIENTATION;
    const pt = { x: point.x / size, y: point.y / size };
    const q = orientation.b0 * pt.x + orientation.b1 * pt.y;
    const r = orientation.b2 * pt.x + orientation.b3 * pt.y;
    return this.hexRound({ x: q, y: r });
  }

  /**
   * Round fractional hex coordinates to nearest hex
   */
  private static hexRound(hex: { x: number; y: number }): FieldCoords {
    let q = Math.round(hex.x);
    let r = Math.round(hex.y);
    const s = Math.round(-hex.x - hex.y);

    const qDiff = Math.abs(q - hex.x);
    const rDiff = Math.abs(r - hex.y);
    const sDiff = Math.abs(s - (-hex.x - hex.y));

    if (qDiff > rDiff && qDiff > sDiff) {
      q = -r - s;
    } else if (rDiff > sDiff) {
      r = -q - s;
    }

    return { x: q, y: r };
  }

  /**
   * Get the 6 corner points of a hexagon in pixel space
   */
  public static hexCorners(center: Point, size: number): Point[] {
    const corners: Point[] = [];
    const orientation = this.FLAT_ORIENTATION;

    for (let i = 0; i < 6; i++) {
      const angle = (2.0 * Math.PI * (orientation.startAngle + i)) / 6.0;
      corners.push({
        x: center.x + size * Math.cos(angle),
        y: center.y + size * Math.sin(angle),
      });
    }

    return corners;
  }

  /**
   * Get hex neighbors in axial coordinates
   */
  public static getNeighbors(coords: FieldCoords): FieldCoords[] {
    const directions = [
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 1 },
    ];

    return directions.map((dir) => ({
      x: coords.x + dir.x,
      y: coords.y + dir.y,
    }));
  }

  /**
   * Calculate distance between two hex coordinates (in hex steps)
   */
  public static hexDistance(a: FieldCoords, b: FieldCoords): number {
    return (
      (Math.abs(a.x - b.x) + Math.abs(a.x + a.y - b.x - b.y) + Math.abs(a.y - b.y)) / 2
    );
  }

  /**
   * Get all hexes in a range around a center hex
   */
  public static hexesInRange(center: FieldCoords, range: number): FieldCoords[] {
    const results: FieldCoords[] = [];

    for (let q = -range; q <= range; q++) {
      const r1 = Math.max(-range, -q - range);
      const r2 = Math.min(range, -q + range);
      for (let r = r1; r <= r2; r++) {
        results.push({ x: center.x + q, y: center.y + r });
      }
    }

    return results;
  }

  /**
   * Get line of hexes from a to b (for pathfinding visualization)
   */
  public static hexLine(a: FieldCoords, b: FieldCoords): FieldCoords[] {
    const distance = this.hexDistance(a, b);
    const results: FieldCoords[] = [];

    for (let i = 0; i <= distance; i++) {
      const t = distance === 0 ? 0 : i / distance;
      results.push(
        this.hexRound({
          x: a.x * (1 - t) + b.x * t,
          y: a.y * (1 - t) + b.y * t,
        })
      );
    }

    return results;
  }

  /**
   * Convert offset coordinates (row/col grid) to axial hex coordinates
   * Used for loading maps from traditional grid format
   */
  public static offsetToAxial(col: number, row: number): FieldCoords {
    const q = col - (row - (row & 1)) / 2;
    const r = row;
    return { x: q, y: r };
  }

  /**
   * Convert axial hex coordinates to offset coordinates
   */
  public static axialToOffset(coords: FieldCoords): { col: number; row: number } {
    const col = coords.x + (coords.y - (coords.y & 1)) / 2;
    const row = coords.y;
    return { col, row };
  }
}
