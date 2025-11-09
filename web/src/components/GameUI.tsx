/**
 * Game UI Overlay
 * Touch-optimized controls and HUD
 */

import { useGameStore } from '@game/gameStore';

export function GameUI() {
  const { startGame, pauseGame, setGameSpeed } = useGameStore();
  const engine = useGameStore((state) => state.engine);

  const gameState = engine?.getState();

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
                  {gameState.paused && ' | PAUSED'}
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

      {/* Side Panel (for selected objects) */}
      <div className="absolute right-0 top-20 bottom-0 w-80 p-4 pointer-events-auto hidden lg:block">
        <div className="bg-black/70 text-white rounded-lg p-4 backdrop-blur-sm h-full">
          <h2 className="text-lg font-bold mb-4">Selection</h2>
          <p className="text-sm text-gray-400">
            Click on a building or unit to see details
          </p>
        </div>
      </div>
    </div>
  );
}
