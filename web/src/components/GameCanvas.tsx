/**
 * Main Game Canvas Component
 * Renders the game using PixiJS
 */

import { useEffect, useRef } from 'react';
import { Renderer } from '@engine/Renderer';
import { useGameStore } from '@game/gameStore';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const engine = useGameStore((state) => state.engine);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize renderer
    const renderer = new Renderer(
      canvasRef.current,
      window.innerWidth,
      window.innerHeight
    );
    rendererRef.current = renderer;

    // Render initial map
    if (engine) {
      const gameState = engine.getState();
      renderer.renderMap(gameState.map);
    }

    // Handle window resize
    const handleResize = () => {
      renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.destroy();
    };
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
