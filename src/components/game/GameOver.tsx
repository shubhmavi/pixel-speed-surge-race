
import React, { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const GameOver = () => {
  const { score, setGameState, addHighScore, lapCount } = useGameContext();
  const [playerName, setPlayerName] = useState('');
  
  const handleSaveScore = () => {
    if (playerName.trim()) {
      addHighScore(playerName, score);
    }
    setGameState('menu');
  };
  
  const handlePlayAgain = () => {
    setGameState('carSelect');
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <Card className="p-8 bg-racing-black/90 border-racing-red border-2 max-w-lg w-full animate-fade-in">
        <h1 className="text-5xl text-racing-red font-racing mb-6 text-center text-glow">Game Over</h1>
        
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl text-racing-blue">Final Score</h2>
            <p className="text-4xl font-bold text-white">{score}</p>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl text-racing-blue">Laps Completed</h2>
            <p className="text-4xl font-bold text-white">{lapCount}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
            <label className="text-lg text-gray-300 block mb-2">Enter your name for the high score:</label>
            <Input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-gray-700 border-gray-600 focus:border-racing-blue mb-4"
              placeholder="Your Name"
              maxLength={15}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handlePlayAgain} 
              className="bg-racing-blue hover:bg-racing-blue/80"
            >
              Play Again
            </Button>
            <Button 
              onClick={handleSaveScore} 
              className="bg-racing-red hover:bg-racing-red/80"
              disabled={!playerName.trim()}
            >
              Save & Quit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameOver;
