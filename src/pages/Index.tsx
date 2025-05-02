
import React from 'react';
import { GameProvider } from '@/context/GameContext';
import Game from '@/components/Game';

const Index = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <GameProvider>
        <Game />
      </GameProvider>
    </div>
  );
};

export default Index;
