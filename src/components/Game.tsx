
import React from 'react';
import { useGameContext } from '@/context/GameContext';
import MainMenu from './MainMenu';
import CarSelection from './CarSelection';
import GameCanvas from './game/GameCanvas';
import GameOver from './game/GameOver';

const Game = () => {
  const { gameState } = useGameContext();

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: 'url("/assets/racing-bg.jpg")',
          filter: 'brightness(0.7)'
        }}
      ></div>
      
      {/* Content container */}
      <div className="relative z-10 w-full h-full">
        {gameState === 'menu' && <MainMenu />}
        {gameState === 'carSelect' && <CarSelection />}
        {gameState === 'playing' && <GameCanvas />}
        {gameState === 'gameOver' && <GameOver />}
      </div>
    </div>
  );
};

export default Game;
