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
  const animationFrameRef = useRef<number | null>(null);
  const engine = useGameStore((state) => state.engine);
  const hoverField = useGameStore((state) => state.hoverField);

  useEffect(() => {
    if (!canvasRef.current || !engine) return;

    // Initialize renderer
    const renderer = new Renderer(
      canvasRef.current,
      window.innerWidth,
      window.innerHeight
    );
    rendererRef.current = renderer;

    // Render initial map
    const gameState = engine.getState();
    renderer.renderMap(gameState.map);

    // Set up hex click callback
    renderer.setHexClickCallback((coords) => {
      hoverField(coords);
      console.log('Clicked hex:', coords);
    });

    // Render loop for entities
    const renderLoop = () => {
      const world = engine.getWorld();
      const entities = world.getAllEntities();
      renderer.renderEntities(entities);

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // Handle window resize
    const handleResize = () => {
      renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.destroy();
    };
  }, [engine, hoverField]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
