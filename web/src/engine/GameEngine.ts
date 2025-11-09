/**
 * Core Game Engine for TerraLands
 * Manages game loop, state, and simulation
 */

import type { GameState, GameMap, Player } from '../types/game';

export class GameEngine {
  private gameState: GameState;
  private isRunning: boolean = false;
  private lastTickTime: number = 0;
  private tickInterval: number = 1000 / 30; // 30 ticks per second (like Widelands)
  private animationFrameId: number | null = null;

  constructor(map: GameMap, players: Player[]) {
    this.gameState = {
      map,
      players,
      currentTick: 0,
      speed: 1.0,
      paused: false,
    };
  }

  /**
   * Start the game engine
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTickTime = performance.now();
    this.gameLoop();
  }

  /**
   * Stop the game engine
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTickTime;

    // Run game tick if enough time has passed
    if (deltaTime >= this.tickInterval / this.gameState.speed) {
      if (!this.gameState.paused) {
        this.tick();
      }
      this.lastTickTime = currentTime;
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * Single game tick - updates all game logic
   */
  private tick(): void {
    this.gameState.currentTick++;

    // Update all game objects
    this.updateEconomy();
    this.updateWorkers();
    this.updateBuildings();
    this.updateMilitary();

    // Notify listeners of state change
    this.notifyStateChange();
  }

  /**
   * Update economy simulation
   */
  private updateEconomy(): void {
    // TODO: Implement economy update logic
    // - Calculate production
    // - Route wares
    // - Update supply chains
  }

  /**
   * Update all workers (movement, tasks)
   */
  private updateWorkers(): void {
    // TODO: Implement worker update logic
    // - Move workers along paths
    // - Execute tasks
    // - Handle deliveries
  }

  /**
   * Update all buildings (production, training)
   */
  private updateBuildings(): void {
    // TODO: Implement building update logic
    // - Process production
    // - Train units
    // - Consume resources
  }

  /**
   * Update military (battles, territory)
   */
  private updateMilitary(): void {
    // TODO: Implement military update logic
    // - Resolve battles
    // - Update territory control
    // - Handle soldier training
  }

  /**
   * Notify listeners of state change
   */
  private notifyStateChange(): void {
    // TODO: Implement event system
    // This will notify React components to re-render
  }

  /**
   * Get current game state (read-only)
   */
  public getState(): Readonly<GameState> {
    return this.gameState;
  }

  /**
   * Set game speed
   */
  public setSpeed(speed: number): void {
    this.gameState.speed = Math.max(0.1, Math.min(10, speed));
  }

  /**
   * Pause/unpause game
   */
  public setPaused(paused: boolean): void {
    this.gameState.paused = paused;
  }

  /**
   * Toggle pause
   */
  public togglePause(): void {
    this.gameState.paused = !this.gameState.paused;
  }
}
