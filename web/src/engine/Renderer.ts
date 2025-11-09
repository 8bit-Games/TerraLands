/**
 * PixiJS-based Renderer for TerraLands
 * Handles all game rendering using WebGL
 */

import * as PIXI from 'pixi.js';
import type { GameMap, Field, CameraState } from '../types/game';
import { TerrainType } from '../types/game';

export class Renderer {
  private app: PIXI.Application;
  private mapContainer: PIXI.Container;
  private camera: CameraState;
  private terrainColors: Map<TerrainType, number>;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    // Initialize PixiJS application
    this.app = new PIXI.Application();
    this.mapContainer = new PIXI.Container();
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      rotation: 0,
    };

    // Terrain color mapping
    this.terrainColors = new Map([
      [TerrainType.Water, 0x2E5F8F],
      [TerrainType.Grass, 0x5C8A3A],
      [TerrainType.Desert, 0xD4A574],
      [TerrainType.Mountain, 0x7A7A7A],
      [TerrainType.Snow, 0xF0F0F0],
      [TerrainType.Swamp, 0x4A6741],
    ]);

    this.init(canvas, width, height);
  }

  /**
   * Initialize PixiJS application
   */
  private async init(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
    await this.app.init({
      canvas,
      width,
      height,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.app.stage.addChild(this.mapContainer);

    // Enable interactivity
    this.mapContainer.eventMode = 'static';
    this.mapContainer.hitArea = new PIXI.Rectangle(0, 0, width, height);

    // Set up camera controls
    this.setupCameraControls();
  }

  /**
   * Set up camera pan and zoom controls
   */
  private setupCameraControls(): void {
    let isDragging = false;
    let lastPos = { x: 0, y: 0 };

    // Mouse/touch pan
    this.mapContainer.on('pointerdown', (event) => {
      isDragging = true;
      lastPos = { x: event.globalX, y: event.globalY };
    });

    this.mapContainer.on('pointerup', () => {
      isDragging = false;
    });

    this.mapContainer.on('pointermove', (event) => {
      if (isDragging) {
        const dx = event.globalX - lastPos.x;
        const dy = event.globalY - lastPos.y;
        this.camera.x += dx / this.camera.zoom;
        this.camera.y += dy / this.camera.zoom;
        lastPos = { x: event.globalX, y: event.globalY };
        this.updateCameraTransform();
      }
    });

    // Zoom with mouse wheel
    this.app.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      this.camera.zoom = Math.max(0.5, Math.min(3.0, this.camera.zoom * zoomFactor));
      this.updateCameraTransform();
    });
  }

  /**
   * Update camera transform
   */
  private updateCameraTransform(): void {
    this.mapContainer.position.set(-this.camera.x, -this.camera.y);
    this.mapContainer.scale.set(this.camera.zoom);
  }

  /**
   * Render the game map
   */
  public renderMap(map: GameMap): void {
    // Clear existing map
    this.mapContainer.removeChildren();

    const tileSize = 32; // Pixels per tile
    const { width, height } = map.dimensions;

    // Render all fields
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const field = map.fields[y][x];
        this.renderField(field, x, y, tileSize);
      }
    }
  }

  /**
   * Render a single field (tile)
   */
  private renderField(field: Field, x: number, y: number, tileSize: number): void {
    const graphics = new PIXI.Graphics();

    // Get terrain color
    const color = this.terrainColors.get(field.terrain) || 0xFFFFFF;

    // Draw hex tile as square for now (TODO: proper hex rendering)
    graphics.rect(0, 0, tileSize - 1, tileSize - 1);
    graphics.fill(color);

    // Add height-based shading
    if (field.height > 0) {
      const alpha = Math.min(0.3, field.height * 0.03);
      graphics.rect(0, 0, tileSize - 1, tileSize - 1);
      graphics.fill({ color: 0xFFFFFF, alpha });
    }

    // Position the tile
    graphics.position.set(x * tileSize, y * tileSize);

    this.mapContainer.addChild(graphics);
  }

  /**
   * Update rendering (called each frame)
   */
  public update(): void {
    // PixiJS automatically renders via ticker
    // Additional per-frame updates can go here
  }

  /**
   * Get camera state
   */
  public getCamera(): CameraState {
    return { ...this.camera };
  }

  /**
   * Set camera position
   */
  public setCamera(camera: Partial<CameraState>): void {
    this.camera = { ...this.camera, ...camera };
    this.updateCameraTransform();
  }

  /**
   * Resize renderer
   */
  public resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.app.destroy(true);
  }
}
