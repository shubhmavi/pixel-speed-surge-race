
import React from 'react';
import { Flag, Music, VolumeX, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Speedometer from './Speedometer';

interface GameUIProps {
  score: number;
  lapCount: number;
  isSoundOn: boolean;
  toggleSound: () => void;
  musicStarted: boolean;
  handleStartMusic: () => void;
  audioLoadError: boolean;
  isMobile: boolean;
  isPaused: boolean;
  handlePause: () => void;
  handleQuit: () => void;
}

const GameUI = ({
  score,
  lapCount,
  isSoundOn,
  toggleSound,
  musicStarted,
  handleStartMusic,
  audioLoadError,
  isMobile,
  isPaused,
  handlePause,
  handleQuit
}: GameUIProps) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4">
      {/* Top bar */}
      <div className="flex justify-between items-center">
        <div className="bg-racing-black/70 px-4 py-2 rounded-lg flex items-center">
          <Flag className="mr-2 text-racing-red" />
          <span className="text-xl text-white">Lap: {lapCount}</span>
        </div>
        
        <div className="bg-racing-black/70 px-4 py-2 rounded-lg">
          <span className="text-xl text-white">Score: {score}</span>
        </div>
        
        <div className="bg-racing-black/70 px-4 py-2 rounded-lg flex items-center gap-2">
          <Button 
            onClick={toggleSound}
            variant="ghost" 
            className="text-white p-0 h-auto pointer-events-auto"
          >
            {isSoundOn ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button
            onClick={handleStartMusic}
            variant="ghost"
            className="text-white p-0 h-auto pointer-events-auto"
            disabled={!isSoundOn || musicStarted || audioLoadError}
          >
            <Music className={musicStarted ? "text-racing-green" : "text-white"} />
          </Button>
        </div>
      </div>
      
      {/* Music start notification */}
      {isSoundOn && !musicStarted && !audioLoadError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-racing-black/70 px-6 py-3 rounded-lg pointer-events-auto">
          <p className="text-white text-center mb-2">Click the music icon or press M key to start background music</p>
          <Button
            onClick={handleStartMusic}
            variant="default"
            className="bg-racing-green hover:bg-racing-green/80 mx-auto block"
          >
            <Music className="mr-2" /> Play Music
          </Button>
        </div>
      )}
      
      {/* Sound error message */}
      {audioLoadError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-racing-black/70 px-6 py-3 rounded-lg pointer-events-auto">
          <p className="text-white text-center mb-2">Sound could not be loaded. Playing without sound.</p>
        </div>
      )}
      
      {/* Bottom bar */}
      <div className="absolute bottom-4 left-4">
        <Speedometer />
      </div>

      {/* Mobile instructions */}
      {isMobile && !isPaused && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-racing-black/70 px-4 py-2 rounded-lg pointer-events-none">
          <p className="text-white text-center text-sm">Swipe left or right to steer</p>
        </div>
      )}
      
      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-racing-black/90 p-8 rounded-lg border-2 border-racing-red max-w-md w-full">
            <h2 className="text-4xl font-racing text-racing-red mb-6 text-center">PAUSED</h2>
            <div className="space-y-4">
              <Button 
                onClick={handlePause}
                className="w-full bg-racing-blue hover:bg-racing-blue/80 text-xl py-6"
              >
                Resume Game
              </Button>
              <Button 
                onClick={handleQuit}
                variant="outline"
                className="w-full border-racing-red text-racing-red hover:bg-racing-red/20 text-xl py-6"
              >
                Quit Game
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Only show pause button on mobile */}
      {isMobile && !isPaused && (
        <div className="absolute bottom-4 right-4 opacity-70 hover:opacity-100 transition-opacity">
          <Button
            onClick={handlePause}
            variant="outline"
            className="bg-racing-black/50 border-white/20 text-white p-3 pointer-events-auto"
          >
            Pause
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameUI;
