/**
 * Asset Loading and Caching System
 * Manages game assets (sprites, audio, data files)
 */

import * as PIXI from 'pixi.js';

export interface AssetManifest {
  sprites: Record<string, string>;
  audio: Record<string, string>;
  data: Record<string, string>;
}

export type LoadProgressCallback = (progress: number, asset: string) => void;

export class AssetLoader {
  private static instance: AssetLoader;
  private loadedSprites: Map<string, PIXI.Texture>;
  private loadedAudio: Map<string, HTMLAudioElement>;
  private loadedData: Map<string, unknown>;
  private isLoading: boolean = false;

  private constructor() {
    this.loadedSprites = new Map();
    this.loadedAudio = new Map();
    this.loadedData = new Map();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  /**
   * Load assets from manifest
   */
  public async loadManifest(
    manifest: AssetManifest,
    onProgress?: LoadProgressCallback
  ): Promise<void> {
    if (this.isLoading) {
      throw new Error('Asset loading already in progress');
    }

    this.isLoading = true;

    try {
      const totalAssets =
        Object.keys(manifest.sprites).length +
        Object.keys(manifest.audio).length +
        Object.keys(manifest.data).length;

      let loadedCount = 0;

      // Load sprites
      for (const [key, path] of Object.entries(manifest.sprites)) {
        await this.loadSprite(key, path);
        loadedCount++;
        onProgress?.(loadedCount / totalAssets, `sprite: ${key}`);
      }

      // Load audio
      for (const [key, path] of Object.entries(manifest.audio)) {
        await this.loadAudio(key, path);
        loadedCount++;
        onProgress?.(loadedCount / totalAssets, `audio: ${key}`);
      }

      // Load data files (JSON, etc.)
      for (const [key, path] of Object.entries(manifest.data)) {
        await this.loadData(key, path);
        loadedCount++;
        onProgress?.(loadedCount / totalAssets, `data: ${key}`);
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load a single sprite/texture
   */
  public async loadSprite(key: string, path: string): Promise<PIXI.Texture> {
    if (this.loadedSprites.has(key)) {
      return this.loadedSprites.get(key)!;
    }

    try {
      const texture = await PIXI.Assets.load<PIXI.Texture>(path);
      this.loadedSprites.set(key, texture);
      return texture;
    } catch (error) {
      console.error(`Failed to load sprite ${key} from ${path}:`, error);
      // Return a placeholder texture
      return PIXI.Texture.WHITE;
    }
  }

  /**
   * Load a sprite sheet with frame data
   */
  public async loadSpriteSheet(
    key: string,
    jsonPath: string
  ): Promise<PIXI.Spritesheet> {
    try {
      const spritesheet = await PIXI.Assets.load<PIXI.Spritesheet>(jsonPath);
      // Store individual textures
      for (const [frameName, texture] of Object.entries(spritesheet.textures)) {
        this.loadedSprites.set(`${key}_${frameName}`, texture as PIXI.Texture);
      }
      return spritesheet;
    } catch (error) {
      console.error(`Failed to load spritesheet ${key}:`, error);
      throw error;
    }
  }

  /**
   * Load audio file
   */
  public async loadAudio(key: string, path: string): Promise<HTMLAudioElement> {
    if (this.loadedAudio.has(key)) {
      return this.loadedAudio.get(key)!;
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(path);
      audio.preload = 'auto';

      audio.addEventListener('canplaythrough', () => {
        this.loadedAudio.set(key, audio);
        resolve(audio);
      });

      audio.addEventListener('error', (error) => {
        console.error(`Failed to load audio ${key} from ${path}:`, error);
        reject(error);
      });

      audio.load();
    });
  }

  /**
   * Load JSON data file
   */
  public async loadData(key: string, path: string): Promise<unknown> {
    if (this.loadedData.has(key)) {
      return this.loadedData.get(key)!;
    }

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.loadedData.set(key, data);
      return data;
    } catch (error) {
      console.error(`Failed to load data ${key} from ${path}:`, error);
      throw error;
    }
  }

  /**
   * Get loaded sprite texture
   */
  public getSprite(key: string): PIXI.Texture | undefined {
    return this.loadedSprites.get(key);
  }

  /**
   * Get loaded audio
   */
  public getAudio(key: string): HTMLAudioElement | undefined {
    return this.loadedAudio.get(key);
  }

  /**
   * Get loaded data
   */
  public getData<T = unknown>(key: string): T | undefined {
    return this.loadedData.get(key) as T | undefined;
  }

  /**
   * Play audio with optional volume and loop
   */
  public playAudio(key: string, volume: number = 1.0, loop: boolean = false): void {
    const audio = this.loadedAudio.get(key);
    if (audio) {
      audio.volume = volume;
      audio.loop = loop;
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(`Failed to play audio ${key}:`, error);
      });
    } else {
      console.warn(`Audio ${key} not loaded`);
    }
  }

  /**
   * Stop audio
   */
  public stopAudio(key: string): void {
    const audio = this.loadedAudio.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Create sprite from loaded texture
   */
  public createSprite(key: string): PIXI.Sprite | null {
    const texture = this.loadedSprites.get(key);
    if (texture) {
      return new PIXI.Sprite(texture);
    }
    console.warn(`Texture ${key} not loaded`);
    return null;
  }

  /**
   * Unload specific asset
   */
  public unload(key: string): void {
    this.loadedSprites.delete(key);
    this.loadedAudio.delete(key);
    this.loadedData.delete(key);
  }

  /**
   * Unload all assets
   */
  public unloadAll(): void {
    this.loadedSprites.clear();
    this.loadedAudio.clear();
    this.loadedData.clear();
  }

  /**
   * Get loading status
   */
  public isAssetLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Check if asset is loaded
   */
  public isLoaded(key: string): boolean {
    return (
      this.loadedSprites.has(key) ||
      this.loadedAudio.has(key) ||
      this.loadedData.has(key)
    );
  }

  /**
   * Get memory usage estimate (in MB)
   */
  public getMemoryUsage(): number {
    let size = 0;

    // Estimate sprite memory
    for (const texture of this.loadedSprites.values()) {
      const resource = texture.source;
      if (resource.width && resource.height) {
        // Rough estimate: width * height * 4 bytes per pixel
        size += resource.width * resource.height * 4;
      }
    }

    // Convert bytes to MB
    return size / (1024 * 1024);
  }
}

// Export singleton instance
export const assetLoader = AssetLoader.getInstance();
