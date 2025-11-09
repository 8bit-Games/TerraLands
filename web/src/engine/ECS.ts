/**
 * Entity Component System (ECS) for TerraLands
 * Modern game architecture for managing game objects
 */

import type { FieldCoords } from '../types/game';

// Entity ID type
export type EntityId = string;

// Component base interface
export interface Component {
  type: string;
}

// Common Components

export interface PositionComponent extends Component {
  type: 'position';
  coords: FieldCoords;
}

export interface SpriteComponent extends Component {
  type: 'sprite';
  textureKey: string;
  visible: boolean;
  zIndex: number;
}

export interface MovementComponent extends Component {
  type: 'movement';
  speed: number; // Tiles per second
  path: FieldCoords[] | null;
  currentPathIndex: number;
  isMoving: boolean;
}

export interface HealthComponent extends Component {
  type: 'health';
  current: number;
  maximum: number;
}

export interface InventoryComponent extends Component {
  type: 'inventory';
  items: Map<string, number>; // item type -> quantity
  capacity: number;
}

export interface WorkerComponent extends Component {
  type: 'worker';
  workerType: string;
  currentTask: string | null;
  efficiency: number; // 0-1
}

export interface BuildingComponent extends Component {
  type: 'building';
  buildingType: string;
  size: 'small' | 'medium' | 'big';
  isConstructed: boolean;
  constructionProgress: number; // 0-1
}

export interface ProductionComponent extends Component {
  type: 'production';
  producing: string | null;
  progress: number; // 0-1
  inputWares: Map<string, number>;
  outputWares: Map<string, number>;
}

export interface OwnerComponent extends Component {
  type: 'owner';
  playerId: number;
}

// Entity class
export class Entity {
  public readonly id: EntityId;
  private components: Map<string, Component>;

  constructor(id: EntityId) {
    this.id = id;
    this.components = new Map();
  }

  /**
   * Add a component to this entity
   */
  public addComponent(component: Component): void {
    this.components.set(component.type, component);
  }

  /**
   * Get a component by type
   */
  public getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  /**
   * Check if entity has a component
   */
  public hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * Remove a component
   */
  public removeComponent(type: string): void {
    this.components.delete(type);
  }

  /**
   * Get all components
   */
  public getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }
}

// System base interface
export interface System {
  update(entities: Entity[], deltaTime: number): void;
}

// Movement System
export class MovementSystem implements System {
  update(entities: Entity[], _deltaTime: number): void {
    // deltaTime will be used for smooth interpolation in future
    for (const entity of entities) {
      const movement = entity.getComponent<MovementComponent>('movement');
      const position = entity.getComponent<PositionComponent>('position');

      if (!movement || !position || !movement.isMoving || !movement.path) {
        continue;
      }

      // Check if we've reached the current path target
      const target = movement.path[movement.currentPathIndex];
      if (!target) {
        movement.isMoving = false;
        movement.path = null;
        continue;
      }

      // Check if we're at the target
      if (position.coords.x === target.x && position.coords.y === target.y) {
        movement.currentPathIndex++;

        // Check if we've completed the path
        if (movement.currentPathIndex >= movement.path.length) {
          movement.isMoving = false;
          movement.path = null;
          movement.currentPathIndex = 0;
        }

        continue;
      }

      // TODO: Implement smooth movement interpolation
      // For now, just snap to next position
      position.coords = { ...target };
    }
  }
}

// Production System
export class ProductionSystem implements System {
  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const production = entity.getComponent<ProductionComponent>('production');
      const building = entity.getComponent<BuildingComponent>('building');

      if (!production || !building || !building.isConstructed || !production.producing) {
        continue;
      }

      // Update production progress
      production.progress += deltaTime * 0.1; // Adjust production speed

      // Check if production is complete
      if (production.progress >= 1.0) {
        production.progress = 0;

        // Add output wares to building's inventory
        // TODO: Implement ware transfer to warehouse
        console.log(`Produced: ${production.producing}`);

        // Continue producing or stop
        // production.producing = null; // For one-time production
      }
    }
  }
}

// ECS World - manages all entities and systems
export class World {
  private entities: Map<EntityId, Entity>;
  private systems: System[];
  private nextEntityId: number;

  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.nextEntityId = 0;
  }

  /**
   * Create a new entity
   */
  public createEntity(): Entity {
    const id = `entity_${this.nextEntityId++}`;
    const entity = new Entity(id);
    this.entities.set(id, entity);
    return entity;
  }

  /**
   * Remove an entity
   */
  public removeEntity(id: EntityId): void {
    this.entities.delete(id);
  }

  /**
   * Get entity by ID
   */
  public getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Get all entities
   */
  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Query entities by component types
   */
  public queryEntities(...componentTypes: string[]): Entity[] {
    const results: Entity[] = [];

    for (const entity of this.entities.values()) {
      const hasAll = componentTypes.every((type) => entity.hasComponent(type));
      if (hasAll) {
        results.push(entity);
      }
    }

    return results;
  }

  /**
   * Add a system
   */
  public addSystem(system: System): void {
    this.systems.push(system);
  }

  /**
   * Update all systems
   */
  public update(deltaTime: number): void {
    const entities = this.getAllEntities();

    for (const system of this.systems) {
      system.update(entities, deltaTime);
    }
  }

  /**
   * Clear all entities
   */
  public clear(): void {
    this.entities.clear();
    this.nextEntityId = 0;
  }

  /**
   * Get entity count
   */
  public getEntityCount(): number {
    return this.entities.size;
  }
}

// Entity factory functions

export class EntityFactory {
  /**
   * Create a worker entity
   */
  public static createWorker(
    world: World,
    coords: FieldCoords,
    workerType: string,
    playerId: number
  ): Entity {
    const entity = world.createEntity();

    entity.addComponent({
      type: 'position',
      coords,
    } as PositionComponent);

    entity.addComponent({
      type: 'sprite',
      textureKey: `worker_${workerType}`,
      visible: true,
      zIndex: 10,
    } as SpriteComponent);

    entity.addComponent({
      type: 'movement',
      speed: 2.0,
      path: null,
      currentPathIndex: 0,
      isMoving: false,
    } as MovementComponent);

    entity.addComponent({
      type: 'worker',
      workerType,
      currentTask: null,
      efficiency: 1.0,
    } as WorkerComponent);

    entity.addComponent({
      type: 'inventory',
      items: new Map(),
      capacity: 1,
    } as InventoryComponent);

    entity.addComponent({
      type: 'owner',
      playerId,
    } as OwnerComponent);

    return entity;
  }

  /**
   * Create a building entity
   */
  public static createBuilding(
    world: World,
    coords: FieldCoords,
    buildingType: string,
    size: 'small' | 'medium' | 'big',
    playerId: number
  ): Entity {
    const entity = world.createEntity();

    entity.addComponent({
      type: 'position',
      coords,
    } as PositionComponent);

    entity.addComponent({
      type: 'sprite',
      textureKey: `building_${buildingType}`,
      visible: true,
      zIndex: 5,
    } as SpriteComponent);

    entity.addComponent({
      type: 'building',
      buildingType,
      size,
      isConstructed: false,
      constructionProgress: 0,
    } as BuildingComponent);

    entity.addComponent({
      type: 'health',
      current: 100,
      maximum: 100,
    } as HealthComponent);

    entity.addComponent({
      type: 'owner',
      playerId,
    } as OwnerComponent);

    return entity;
  }
}
