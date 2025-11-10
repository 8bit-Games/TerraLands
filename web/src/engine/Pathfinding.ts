/**
 * A* Pathfinding for Hexagonal Grid
 * Implements pathfinding for workers and units
 */

import type { FieldCoords, GameMap } from '../types/game';
import { HexGrid } from '../utils/hexGrid';
import { TerrainType } from '../types/game';

interface PathNode {
  coords: FieldCoords;
  gCost: number; // Cost from start to this node
  hCost: number; // Heuristic cost from this node to goal
  fCost: number; // Total cost (g + h)
  parent: PathNode | null;
}

export class Pathfinder {
  private map: GameMap;

  constructor(map: GameMap) {
    this.map = map;
  }

  /**
   * Find path from start to goal using A* algorithm
   * Returns array of coordinates, or null if no path exists
   */
  public findPath(start: FieldCoords, goal: FieldCoords): FieldCoords[] | null {
    // Quick bounds check
    if (!this.isValidCoord(start) || !this.isValidCoord(goal)) {
      return null;
    }

    // If start equals goal, return empty path
    if (start.x === goal.x && start.y === goal.y) {
      return [start];
    }

    const openList: PathNode[] = [];
    const closedSet = new Set<string>();

    // Create start node
    const startNode: PathNode = {
      coords: start,
      gCost: 0,
      hCost: this.heuristic(start, goal),
      fCost: 0,
      parent: null,
    };
    startNode.fCost = startNode.gCost + startNode.hCost;
    openList.push(startNode);

    let iterations = 0;
    const maxIterations = 10000; // Prevent infinite loops

    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;

      // Find node with lowest fCost
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].fCost < openList[currentIndex].fCost) {
          currentIndex = i;
        }
      }

      const current = openList[currentIndex];

      // Check if we've reached the goal
      if (current.coords.x === goal.x && current.coords.y === goal.y) {
        return this.reconstructPath(current);
      }

      // Move current from open to closed
      openList.splice(currentIndex, 1);
      closedSet.add(this.coordToKey(current.coords));

      // Check all neighbors
      const neighbors = HexGrid.getNeighbors(current.coords);

      for (const neighborCoord of neighbors) {
        // Skip if invalid or already evaluated
        if (!this.isValidCoord(neighborCoord) || closedSet.has(this.coordToKey(neighborCoord))) {
          continue;
        }

        // Skip if not walkable
        if (!this.isWalkable(neighborCoord)) {
          continue;
        }

        const movementCost = this.getMovementCost(current.coords, neighborCoord);
        const gCost = current.gCost + movementCost;

        // Check if neighbor is already in open list
        let neighborNode = openList.find(
          (node) => node.coords.x === neighborCoord.x && node.coords.y === neighborCoord.y
        );

        if (neighborNode) {
          // If we found a better path to this neighbor, update it
          if (gCost < neighborNode.gCost) {
            neighborNode.gCost = gCost;
            neighborNode.fCost = gCost + neighborNode.hCost;
            neighborNode.parent = current;
          }
        } else {
          // Add new node to open list
          neighborNode = {
            coords: neighborCoord,
            gCost: gCost,
            hCost: this.heuristic(neighborCoord, goal),
            fCost: 0,
            parent: current,
          };
          neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
          openList.push(neighborNode);
        }
      }
    }

    // No path found
    return null;
  }

  /**
   * Reconstruct the path from goal to start by following parent pointers
   */
  private reconstructPath(goalNode: PathNode): FieldCoords[] {
    const path: FieldCoords[] = [];
    let current: PathNode | null = goalNode;

    while (current !== null) {
      path.unshift(current.coords);
      current = current.parent;
    }

    return path;
  }

  /**
   * Heuristic function (Manhattan distance on hex grid)
   */
  private heuristic(a: FieldCoords, b: FieldCoords): number {
    return HexGrid.hexDistance(a, b);
  }

  /**
   * Get movement cost between two adjacent hexes
   */
  private getMovementCost(from: FieldCoords, to: FieldCoords): number {
    const field = this.getField(to);
    if (!field) return Infinity;

    // Base cost
    let cost = 1;

    // Terrain-based cost modifiers
    switch (field.terrain) {
      case TerrainType.Water:
        return Infinity; // Can't walk on water (without ships)
      case TerrainType.Grass:
        cost = 1;
        break;
      case TerrainType.Desert:
        cost = 1.2;
        break;
      case TerrainType.Mountain:
        cost = 2;
        break;
      case TerrainType.Snow:
        cost = 1.5;
        break;
      case TerrainType.Swamp:
        cost = 1.8;
        break;
    }

    // Height difference cost
    const fromField = this.getField(from);
    if (fromField) {
      const heightDiff = Math.abs(field.height - fromField.height);
      cost += heightDiff * 0.5;
    }

    return cost;
  }

  /**
   * Check if a coordinate is walkable
   */
  private isWalkable(coords: FieldCoords): boolean {
    const field = this.getField(coords);
    if (!field) return false;

    // Water is not walkable (for now - ships will change this)
    if (field.terrain === TerrainType.Water) {
      return false;
    }

    // TODO: Check for blocking buildings/objects

    return true;
  }

  /**
   * Check if coordinates are within map bounds
   */
  private isValidCoord(coords: FieldCoords): boolean {
    // Convert axial to offset to check bounds
    const { col, row } = HexGrid.axialToOffset(coords);
    return (
      col >= 0 &&
      row >= 0 &&
      row < this.map.dimensions.height &&
      col < this.map.dimensions.width
    );
  }

  /**
   * Get field at coordinates
   */
  private getField(coords: FieldCoords) {
    const { col, row } = HexGrid.axialToOffset(coords);
    if (row >= 0 && row < this.map.fields.length && col >= 0 && col < this.map.fields[row].length) {
      return this.map.fields[row][col];
    }
    return null;
  }

  /**
   * Convert coordinates to string key for Set/Map
   */
  private coordToKey(coords: FieldCoords): string {
    return `${coords.x},${coords.y}`;
  }

  /**
   * Get distance between two coordinates (for range checking)
   */
  public getDistance(a: FieldCoords, b: FieldCoords): number {
    return HexGrid.hexDistance(a, b);
  }

  /**
   * Find all reachable hexes within a certain range
   * Useful for showing movement range, attack range, etc.
   */
  public getReachableHexes(start: FieldCoords, maxCost: number): FieldCoords[] {
    const reachable: FieldCoords[] = [];
    const visited = new Map<string, number>();
    const queue: Array<{ coords: FieldCoords; cost: number }> = [{ coords: start, cost: 0 }];

    visited.set(this.coordToKey(start), 0);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.cost <= maxCost) {
        reachable.push(current.coords);
      }

      // Check neighbors
      const neighbors = HexGrid.getNeighbors(current.coords);

      for (const neighbor of neighbors) {
        if (!this.isValidCoord(neighbor) || !this.isWalkable(neighbor)) {
          continue;
        }

        const moveCost = this.getMovementCost(current.coords, neighbor);
        const newCost = current.cost + moveCost;

        const key = this.coordToKey(neighbor);
        const previousCost = visited.get(key);

        if (newCost <= maxCost && (previousCost === undefined || newCost < previousCost)) {
          visited.set(key, newCost);
          queue.push({ coords: neighbor, cost: newCost });
        }
      }
    }

    return reachable;
  }
}
