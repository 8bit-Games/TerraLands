/**
 * Game UI Overlay
 * Touch-optimized controls and HUD
 */

import { useGameStore } from '@game/gameStore';
import type { PositionComponent, SpriteComponent, BuildingComponent, WorkerComponent } from '@engine/ECS';

export function GameUI() {
  const { startGame, pauseGame, setGameSpeed } = useGameStore();
  const engine = useGameStore((state) => state.engine);
  const hoveredField = useGameStore((state) => state.ui.hoveredField);

  const gameState = engine?.getState();
  const world = engine?.getWorld();
  const entityCount = world?.getEntityCount() || 0;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
        <div className="bg-black/70 text-white rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">TerraLands</h1>
              {gameState && (
                <div className="text-sm">
                  Tick: {gameState.currentTick} | Speed: {gameState.speed.toFixed(1)}x
                  {gameState.paused && ' | PAUSED'} | Entities: {entityCount}
                </div>
              )}
            </div>

            {/* Game Controls */}
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Start
              </button>
              <button
                onClick={pauseGame}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              >
                Pause
              </button>

              {/* Speed Controls */}
              <select
                onChange={(e) => setGameSpeed(parseFloat(e.target.value))}
                defaultValue="1.0"
                className="px-3 py-2 bg-gray-700 rounded-lg"
              >
                <option value="0.5">0.5x</option>
                <option value="1.0">1.0x</option>
                <option value="2.0">2.0x</option>
                <option value="4.0">4.0x</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto md:hidden">
        <div className="bg-black/70 text-white rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm text-center">
            Pinch to zoom • Drag to pan
          </div>
        </div>
      </div>

      {/* Side Panel (for selected hexes/objects) */}
      <div className="absolute right-0 top-20 bottom-0 w-80 p-4 pointer-events-auto hidden lg:block">
        <div className="bg-black/70 text-white rounded-lg p-4 backdrop-blur-sm h-full overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Information</h2>

          {hoveredField ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-400 mb-2">Selected Hex</h3>
                <div className="text-sm space-y-1">
                  <div>Coords: ({hoveredField.x}, {hoveredField.y})</div>
                  {gameState && (() => {
                    const { col, row } = {
                      col: hoveredField.x + (hoveredField.y - (hoveredField.y & 1)) / 2,
                      row: hoveredField.y
                    };
                    const field = gameState.map.fields[row]?.[col];
                    if (!field) return null;
                    return (
                      <>
                        <div>Terrain: {field.terrain}</div>
                        <div>Height: {field.height}</div>
                        {field.resourceAmount > 0 && (
                          <div className="text-yellow-400">
                            Resource: {field.resource} ({field.resourceAmount})
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Entities Here</h3>
                {world && (() => {
                  const entities = world.queryEntities('position');
                  const entitiesHere = entities.filter((e) => {
                    const pos = e.getComponent<PositionComponent>('position');
                    return pos?.coords.x === hoveredField.x && pos?.coords.y === hoveredField.y;
                  });

                  if (entitiesHere.length === 0) {
                    return <div className="text-sm text-gray-400">No entities</div>;
                  }

                  return (
                    <div className="text-sm space-y-2">
                      {entitiesHere.map((entity) => {
                        const sprite = entity.getComponent<SpriteComponent>('sprite');
                        const building = entity.getComponent<BuildingComponent>('building');
                        const worker = entity.getComponent<WorkerComponent>('worker');

                        return (
                          <div key={entity.id} className="bg-gray-800/50 p-2 rounded">
                            <div className="font-medium">
                              {building ? `Building: ${building.buildingType}` : ''}
                              {worker ? `Worker: ${worker.workerType}` : ''}
                            </div>
                            {sprite && (
                              <div className="text-xs text-gray-400">{sprite.textureKey}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Click on a hex to see details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
