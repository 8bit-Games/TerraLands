/**
 * Main TerraLands Application Component
 */

import { useEffect } from 'react';
import { GameCanvas } from '@components/GameCanvas';
import { GameUI } from '@components/GameUI';
import { useGameStore } from '@game/gameStore';

export function App() {
  const initializeGame = useGameStore((state) => state.initializeGame);

  useEffect(() => {
    // Initialize game on mount
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {/* Game Canvas */}
      <GameCanvas />

      {/* UI Overlay */}
      <GameUI />

      {/* Loading/Splash Screen would go here */}
    </div>
  );
}
