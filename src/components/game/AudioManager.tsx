
import React, { useEffect, useRef, useState } from 'react';

interface AudioManagerProps {
  isSoundOn: boolean;
  isPaused: boolean;
  musicStarted: boolean;
  setMusicStarted: (started: boolean) => void;
}

const AudioManager = ({ isSoundOn, isPaused, musicStarted, setMusicStarted }: AudioManagerProps) => {
  const engineSoundRef = useRef<HTMLAudioElement | null>(null);
  const crashSoundRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoadError, setAudioLoadError] = useState<boolean>(false);

  // Initialize audio elements
  useEffect(() => {
    try {
      engineSoundRef.current = new Audio('/assets/engine.mp3');
      engineSoundRef.current.loop = true;
      
      crashSoundRef.current = new Audio('/assets/crash.mp3');
      
      musicRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      musicRef.current.loop = true;
      musicRef.current.volume = 0.3;
      
      // Add error handlers
      engineSoundRef.current.addEventListener('error', () => {
        console.log('Engine sound failed to load');
        setAudioLoadError(true);
      });
      
      crashSoundRef.current.addEventListener('error', () => {
        console.log('Crash sound failed to load');
        setAudioLoadError(true);
      });
      
      musicRef.current.addEventListener('error', () => {
        console.log('Music failed to load');
        setAudioLoadError(true);
      });
      
      return () => {
        if (engineSoundRef.current) {
          engineSoundRef.current.pause();
          engineSoundRef.current.removeEventListener('error', () => {});
        }
        if (crashSoundRef.current) {
          crashSoundRef.current.pause();
          crashSoundRef.current.removeEventListener('error', () => {});
        }
        if (musicRef.current) {
          musicRef.current.pause();
          musicRef.current.removeEventListener('error', () => {});
        }
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioLoadError(true);
    }
  }, []);

  // Handle music playback separately
  useEffect(() => {
    if (isSoundOn && musicStarted && musicRef.current && !audioLoadError) {
      musicRef.current.play()
        .then(() => console.log("Music playback started successfully"))
        .catch(error => {
          console.log("Music play failed:", error);
          setAudioLoadError(true);
        });
    } else if (musicRef.current) {
      try {
        musicRef.current.pause();
      } catch (error) {
        console.error('Error pausing music:', error);
      }
    }
  }, [isSoundOn, musicStarted, audioLoadError]);

  // Handle engine sound separately
  useEffect(() => {
    if (isSoundOn && !isPaused && engineSoundRef.current && !audioLoadError) {
      engineSoundRef.current.volume = 0.2;
      engineSoundRef.current.play()
        .then(() => console.log("Engine sound started successfully"))
        .catch(error => {
          console.log("Engine sound play failed:", error);
          setAudioLoadError(true);
        });
    } else if (engineSoundRef.current) {
      try {
        engineSoundRef.current.pause();
      } catch (error) {
        console.error('Error pausing engine sound:', error);
      }
    }
  }, [isSoundOn, isPaused, audioLoadError]);

  const playCrashSound = () => {
    if (crashSoundRef.current && isSoundOn && !audioLoadError) {
      crashSoundRef.current.play().catch(error => {
        console.error('Error playing crash sound:', error);
      });
    }
  };

  return { 
    audioLoadError, 
    playCrashSound,
    handleStartMusic: () => setMusicStarted(true)
  };
};

export default AudioManager;
