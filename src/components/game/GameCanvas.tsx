
import React, { useRef, useEffect, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useIsMobile } from '@/hooks/use-mobile';
import AudioManager from './AudioManager';
import TouchControls from './TouchControls';
import GameLoop from './GameLoop';
import GameUI from './GameUI';

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const { 
    selectedCar, 
    setGameState,
    score,
    setScore,
    isSoundOn,
    toggleSound,
    lapCount,
    setLapCount,
    currentSpeed,
    setCurrentSpeed
  } = useGameContext();

  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  
  // Auto-drive on mobile
  const [autoAccelerate, setAutoAccelerate] = useState(false);

  // Audio manager initialization
  const { audioLoadError, playCrashSound, handleStartMusic } = AudioManager({
    isSoundOn,
    isPaused,
    musicStarted,
    setMusicStarted
  });

  // Touch controls
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = TouchControls({
    setPressedKeys
  });

  // Auto-accelerate on mobile
  useEffect(() => {
    if (isMobile) {
      setAutoAccelerate(true);
    }
  }, [isMobile]);

  // Key press listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', ' '].includes(e.key)) {
        e.preventDefault();
        setPressedKeys(prev => ({ ...prev, [e.key]: true }));
      }
      
      // Escape key to pause
      if (e.key === 'Escape') {
        setIsPaused(prev => !prev);
      }
      
      // M key to toggle music
      if (e.key === 'm') {
        setMusicStarted(prev => !prev);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => ({ ...prev, [e.key]: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleCrash = () => {
    setGameState('gameOver');
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };
  
  const handleQuit = () => {
    setGameState('menu');
  };

  return (
    <div 
      className="relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        className="w-full h-full bg-gray-800"
      />
      
      {/* Game Logic Component */}
      <GameLoop
        canvasRef={canvasRef}
        isPaused={isPaused}
        pressedKeys={pressedKeys}
        selectedCar={selectedCar}
        isSoundOn={isSoundOn}
        autoAccelerate={autoAccelerate}
        setCurrentSpeed={setCurrentSpeed}
        currentSpeed={currentSpeed}
        setScore={setScore}
        score={score}
        setLapCount={setLapCount}
        lapCount={lapCount}
        onCrash={handleCrash}
        playCrashSound={playCrashSound}
      />
      
      {/* Game UI Component */}
      <GameUI 
        score={score}
        lapCount={lapCount}
        isSoundOn={isSoundOn}
        toggleSound={toggleSound}
        musicStarted={musicStarted}
        handleStartMusic={handleStartMusic}
        audioLoadError={audioLoadError}
        isMobile={isMobile}
        isPaused={isPaused}
        handlePause={handlePause}
        handleQuit={handleQuit}
      />
    </div>
  );
};

export default GameCanvas;
