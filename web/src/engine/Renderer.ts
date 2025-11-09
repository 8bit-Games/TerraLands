/**
 * PixiJS-based Renderer for TerraLands
 * Handles all game rendering using WebGL
 */

import * as PIXI from 'pixi.js';
import type { GameMap, Field, CameraState, FieldCoords } from '../types/game';
import { TerrainType } from '../types/game';
import { HexGrid } from '../utils/hexGrid';
import type { Entity } from './ECS';
import { PositionComponent, SpriteComponent } from './ECS';

export type HexClickCallback = (coords: FieldCoords) => void;

export class Renderer {
  private app: PIXI.Application;
  private mapContainer: PIXI.Container;
  private entitiesContainer: PIXI.Container;
  private overlayContainer: PIXI.Container;
  private camera: CameraState;
  private terrainColors: Map<TerrainType, number>;
  private hexSize: number = 24;
  private currentMap: GameMap | null = null;
  private entitySprites: Map<string, PIXI.Graphics> = new Map();
  private selectedHex: FieldCoords | null = null;
  private hexClickCallback: HexClickCallback | null = null;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    // Initialize PixiJS application
    this.app = new PIXI.Application();
    this.mapContainer = new PIXI.Container();
    this.entitiesContainer = new PIXI.Container();
    this.overlayContainer = new PIXI.Container();

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

    // Add containers in order (bottom to top)
    this.app.stage.addChild(this.mapContainer);
    this.app.stage.addChild(this.entitiesContainer);
    this.app.stage.addChild(this.overlayContainer);

    // Enable interactivity for map
    this.mapContainer.eventMode = 'static';
    this.mapContainer.hitArea = new PIXI.Rectangle(0, 0, width, height);

    // Set up camera controls
    this.setupCameraControls();

    // Set up hex click detection
    this.setupHexClickDetection();
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
    // Apply camera to all containers
    this.mapContainer.position.set(-this.camera.x, -this.camera.y);
    this.mapContainer.scale.set(this.camera.zoom);

    this.entitiesContainer.position.set(-this.camera.x, -this.camera.y);
    this.entitiesContainer.scale.set(this.camera.zoom);

    this.overlayContainer.position.set(-this.camera.x, -this.camera.y);
    this.overlayContainer.scale.set(this.camera.zoom);
  }

  /**
   * Set up hex click detection
   */
  private setupHexClickDetection(): void {
    let dragStartPos = { x: 0, y: 0 };
    let hasDragged = false;

    this.mapContainer.on('pointerdown', (event) => {
      dragStartPos = { x: event.globalX, y: event.globalY };
      hasDragged = false;
    });

    this.mapContainer.on('pointermove', (event) => {
      const dx = Math.abs(event.globalX - dragStartPos.x);
      const dy = Math.abs(event.globalY - dragStartPos.y);
      if (dx > 5 || dy > 5) {
        hasDragged = true;
      }
    });

    this.mapContainer.on('pointerup', (event) => {
      // Only register as click if not dragging
      if (!hasDragged && this.currentMap) {
        const localPos = this.mapContainer.toLocal(event.global);
        const hexCoords = HexGrid.pixelToHex(localPos, this.hexSize);

        // Check if hex is within map bounds
        const { col, row } = HexGrid.axialToOffset(hexCoords);
        if (
          row >= 0 &&
          row < this.currentMap.dimensions.height &&
          col >= 0 &&
          col < this.currentMap.dimensions.width
        ) {
          this.selectedHex = hexCoords;
          this.renderOverlay();

          // Call callback if set
          if (this.hexClickCallback) {
            this.hexClickCallback(hexCoords);
          }
        }
      }
    });
  }

  /**
   * Render the game map
   */
  public renderMap(map: GameMap): void {
    this.currentMap = map;

    // Clear existing map
    this.mapContainer.removeChildren();

    const { width, height } = map.dimensions;

    // Render all fields as hexagons
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const field = map.fields[y][x];
        this.renderHexField(field, this.hexSize);
      }
    }
  }

  /**
   * Render a single hexagonal field
   */
  private renderHexField(field: Field, hexSize: number): void {
    const graphics = new PIXI.Graphics();

    // Convert hex coordinates to pixel position
    const center = HexGrid.hexToPixel(field.coords, hexSize);

    // Get terrain color
    const color = this.terrainColors.get(field.terrain) || 0xFFFFFF;

    // Get hex corners
    const corners = HexGrid.hexCorners(center, hexSize);

    // Draw the hexagon
    graphics.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      graphics.lineTo(corners[i].x, corners[i].y);
    }
    graphics.closePath();
    graphics.fill(color);

    // Add height-based shading for elevation
    if (field.height > 0) {
      const alpha = Math.min(0.3, field.height * 0.03);
      graphics.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        graphics.lineTo(corners[i].x, corners[i].y);
      }
      graphics.closePath();
      graphics.fill({ color: 0xFFFFFF, alpha });
    }

    // Draw hex border
    graphics.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      graphics.lineTo(corners[i].x, corners[i].y);
    }
    graphics.closePath();
    graphics.stroke({ color: 0x000000, width: 0.5, alpha: 0.2 });

    // Add resource indicator
    if (field.resourceAmount > 0) {
      graphics.circle(center.x, center.y, 3);
      graphics.fill({ color: 0xFFD700, alpha: 0.8 });
    }

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
   * Render entities from ECS world
   */
  public renderEntities(entities: Entity[]): void {
    // Clear existing entities
    this.entitiesContainer.removeChildren();
    this.entitySprites.clear();

    for (const entity of entities) {
      const position = entity.getComponent<PositionComponent>('position');
      const sprite = entity.getComponent<SpriteComponent>('sprite');

      if (!position || !sprite || !sprite.visible) {
        continue;
      }

      // For now, render entities as colored circles
      // TODO: Replace with actual sprites when asset loading is implemented
      const graphics = this.renderEntityPlaceholder(position.coords, sprite.textureKey);
      this.entitySprites.set(entity.id, graphics);
      this.entitiesContainer.addChild(graphics);
    }
  }

  /**
   * Render entity placeholder (until sprites are loaded)
   */
  private renderEntityPlaceholder(coords: FieldCoords, type: string): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    const center = HexGrid.hexToPixel(coords, this.hexSize);

    // Different colors for different entity types
    let color = 0xFFFFFF;
    let size = 8;

    if (type.includes('worker')) {
      color = 0x00FF00; // Green for workers
      size = 6;
    } else if (type.includes('building')) {
      color = 0xFF0000; // Red for buildings
      size = 12;
    } else if (type.includes('soldier')) {
      color = 0x0000FF; // Blue for soldiers
      size = 6;
    }

    // Draw circle for entity
    graphics.circle(center.x, center.y, size);
    graphics.fill({ color, alpha: 0.8 });

    // Draw border
    graphics.circle(center.x, center.y, size);
    graphics.stroke({ color: 0xFFFFFF, width: 1 });

    return graphics;
  }

  /**
   * Render overlay (selected hex, highlighted areas, etc.)
   */
  private renderOverlay(): void {
    this.overlayContainer.removeChildren();

    if (this.selectedHex) {
      const graphics = new PIXI.Graphics();
      const center = HexGrid.hexToPixel(this.selectedHex, this.hexSize);
      const corners = HexGrid.hexCorners(center, this.hexSize);

      // Draw selection highlight
      graphics.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        graphics.lineTo(corners[i].x, corners[i].y);
      }
      graphics.closePath();
      graphics.stroke({ color: 0xFFFF00, width: 2, alpha: 0.8 });

      // Optional fill for selected hex
      graphics.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        graphics.lineTo(corners[i].x, corners[i].y);
      }
      graphics.closePath();
      graphics.fill({ color: 0xFFFF00, alpha: 0.1 });

      this.overlayContainer.addChild(graphics);
    }
  }

  /**
   * Highlight multiple hexes (for movement range, etc.)
   */
  public highlightHexes(hexes: FieldCoords[], color: number = 0x00FF00): void {
    const graphics = new PIXI.Graphics();

    for (const hex of hexes) {
      const center = HexGrid.hexToPixel(hex, this.hexSize);
      const corners = HexGrid.hexCorners(center, this.hexSize);

      graphics.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        graphics.lineTo(corners[i].x, corners[i].y);
      }
      graphics.closePath();
      graphics.fill({ color, alpha: 0.2 });
    }

    this.overlayContainer.addChild(graphics);
  }

  /**
   * Set hex click callback
   */
  public setHexClickCallback(callback: HexClickCallback): void {
    this.hexClickCallback = callback;
  }

  /**
   * Get selected hex
   */
  public getSelectedHex(): FieldCoords | null {
    return this.selectedHex ? { ...this.selectedHex } : null;
  }

  /**
   * Clear selection
   */
  public clearSelection(): void {
    this.selectedHex = null;
    this.renderOverlay();
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.app.destroy(true);
  }
}
