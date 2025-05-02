
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGameContext } from '@/context/GameContext';
import { Card } from '@/components/ui/card';
import { VolumeX, Volume2, Flag, Settings, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MainMenu = () => {
  const { setGameState, toggleSound, isSoundOn, highScores } = useGameContext();
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [buttonHover, setButtonHover] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {/* Logo/Title */}
      <div className="mb-12">
        <h1 className="text-7xl md:text-8xl font-racing text-racing-red text-glow animate-bounce-subtle">
          PIXEL SPEED
        </h1>
        <p className="text-2xl text-racing-blue font-racing tracking-wide mt-2">SURGE RACE</p>
      </div>

      {/* Main Menu Buttons */}
      <div className="space-y-5 w-full max-w-md">
        <Button 
          onClick={() => setGameState('carSelect')}
          className={`w-full py-6 text-xl font-racing bg-racing-red hover:bg-racing-red/80 transition-all duration-300 shadow-lg
            ${buttonHover === 'start' ? 'animate-pulse-glow scale-105' : ''}`}
          onMouseEnter={() => setButtonHover('start')}
          onMouseLeave={() => setButtonHover('')}
        >
          <Flag className="mr-2" /> START GAME
        </Button>
        
        <Button 
          onClick={() => setShowHighScores(true)}
          className={`w-full py-6 text-xl font-racing bg-racing-blue hover:bg-racing-blue/80 transition-all duration-300
            ${buttonHover === 'scores' ? 'animate-pulse-glow scale-105' : ''}`}
          onMouseEnter={() => setButtonHover('scores')}
          onMouseLeave={() => setButtonHover('')}
        >
          <Trophy className="mr-2" /> HIGH SCORES
        </Button>
        
        <Button 
          onClick={() => setShowSettings(true)}
          className={`w-full py-6 text-xl font-racing bg-racing-purple hover:bg-racing-purple/80 transition-all duration-300
            ${buttonHover === 'settings' ? 'animate-pulse-glow scale-105' : ''}`}
          onMouseEnter={() => setButtonHover('settings')}
          onMouseLeave={() => setButtonHover('')}
        >
          <Settings className="mr-2" /> SETTINGS
        </Button>

        <Button 
          onClick={toggleSound}
          variant="outline" 
          className="w-full border-2 border-racing-gray text-racing-gray hover:bg-racing-gray/20 py-4"
        >
          {isSoundOn ? <Volume2 className="mr-2" /> : <VolumeX className="mr-2" />}
          {isSoundOn ? 'Sound: ON' : 'Sound: OFF'}
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-gray-800 border-racing-blue text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-racing text-racing-blue mb-4">Game Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-lg mb-2">Controls</label>
              <p className="text-sm text-gray-300">
                Use arrow keys or WASD to control your car.
                <br />Space bar for nitro boost.
              </p>
            </div>
            
            <div>
              <label className="block text-lg mb-2">Sound</label>
              <Button 
                onClick={toggleSound} 
                variant="outline" 
                className="w-full border-racing-gray"
              >
                {isSoundOn ? <Volume2 className="mr-2" /> : <VolumeX className="mr-2" />}
                {isSoundOn ? 'Sound: ON' : 'Sound: OFF'}
              </Button>
            </div>
            
            <Button 
              onClick={() => setShowSettings(false)}
              className="w-full bg-racing-red hover:bg-racing-red/80"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* High Scores Dialog */}
      <Dialog open={showHighScores} onOpenChange={setShowHighScores}>
        <DialogContent className="bg-gray-800 border-racing-blue text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-racing text-racing-blue mb-4">High Scores</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {highScores.length > 0 ? (
              <ul className="space-y-2">
                {highScores.map((score, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                    <span className="font-racing">{index + 1}. {score.name}</span>
                    <span className="text-racing-red font-bold">{score.score}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-300">No high scores yet!</p>
            )}
            <Button 
              onClick={() => setShowHighScores(false)}
              className="w-full bg-racing-red hover:bg-racing-red/80"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainMenu;
