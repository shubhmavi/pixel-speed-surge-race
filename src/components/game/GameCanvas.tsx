
import React, { useRef, useEffect, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import Speedometer from './Speedometer';
import { Button } from '@/components/ui/button';
import { Flag, Music, VolumeX, Volume2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type Position = { x: number; y: number };
type Obstacle = { x: number; y: number; type: 'cone' | 'oil' | 'tree' };
type TouchPosition = { x: number | null; y: number | null };

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
  const [carPosition, setCarPosition] = useState<Position>({ x: 400, y: 500 });
  const [roadOffset, setRoadOffset] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameLoopId, setGameLoopId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  
  // Touch gesture handling
  const [touchPosition, setTouchPosition] = useState<TouchPosition>({ x: null, y: null });
  const [touchStartPosition, setTouchStartPosition] = useState<TouchPosition>({ x: null, y: null });
  // Auto-drive on mobile
  const [autoAccelerate, setAutoAccelerate] = useState(false);

  // Game audio
  const engineSoundRef = useRef<HTMLAudioElement | null>(null);
  const crashSoundRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoadError, setAudioLoadError] = useState<boolean>(false);

  // Game configs
  const carWidth = 50;
  const carHeight = 100;
  const roadWidth = 300;
  const roadSpeed = 5;
  const maxObstacles = 10;
  const acceleration = selectedCar?.acceleration || 8;
  const maxSpeed = selectedCar?.speed || 200;
  const handling = selectedCar?.handling || 8;

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

  // Start music playback manually
  const handleStartMusic = () => {
    setMusicStarted(true);
  };

  // Touch gesture handlers - simplified for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      setTouchStartPosition({
        x: touch.clientX,
        y: touch.clientY
      });
      setTouchPosition({
        x: touch.clientX,
        y: touch.clientY
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      setTouchPosition({
        x: touch.clientX,
        y: touch.clientY
      });

      // Mobile controls focus only on left/right steering
      if (touchStartPosition.x !== null) {
        const deltaX = touch.clientX - touchStartPosition.x;
        const threshold = 10; // More sensitive threshold for steering

        // Clear previous touch directions for steering only
        setPressedKeys(prev => ({
          ...prev,
          ArrowLeft: false,
          ArrowRight: false,
        }));

        // Set new steering direction based on touch movement
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > threshold) {
            setPressedKeys(prev => ({ ...prev, ArrowRight: true }));
          } else if (deltaX < -threshold) {
            setPressedKeys(prev => ({ ...prev, ArrowLeft: true }));
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    // Reset touch positions
    setTouchPosition({ x: null, y: null });
    
    // Reset pressed keys from touch, but only steering
    setPressedKeys(prev => ({
      ...prev,
      ArrowLeft: false,
      ArrowRight: false,
    }));
  };

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

  // Create obstacles
  useEffect(() => {
    const createObstacle = () => {
      if (obstacles.length < maxObstacles) {
        const lanePosition = Math.random() > 0.5 ? 
          350 + Math.random() * 100 : // right lane
          250 - Math.random() * 100;  // left lane
          
        const obstacleTypes = ['cone', 'oil', 'tree'] as const;
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        const newObstacle: Obstacle = {
          x: lanePosition,
          y: -100 - Math.random() * 500, // Start above the canvas
          type
        };
        
        setObstacles(prev => [...prev, newObstacle]);
      }
    };
    
    const obstacleInterval = setInterval(createObstacle, 2000);
    return () => clearInterval(obstacleInterval);
  }, [obstacles.length]);

  // Main game loop - updated for auto-accelerate
  useEffect(() => {
    if (isPaused) {
      if (engineSoundRef.current && isSoundOn) {
        engineSoundRef.current.pause();
      }
      return;
    }

    const gameLoop = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw road
      drawRoad(ctx);
      
      // Move car based on input
      let speed = currentSpeed;
      
      // Auto-accelerate on mobile, otherwise use keyboard controls
      if (isMobile && autoAccelerate) {
        // Gradually increase speed to 70% of max speed
        const targetSpeed = maxSpeed * 0.7;
        if (speed < targetSpeed) {
          speed = Math.min(speed + acceleration * 0.05, targetSpeed);
        } else if (speed > targetSpeed) {
          speed = Math.max(speed - acceleration * 0.05, targetSpeed);
        }
      } else {
        // Regular keyboard controls for non-mobile
        if (pressedKeys['ArrowUp'] || pressedKeys['w']) {
          speed = Math.min(speed + acceleration * 0.1, maxSpeed);
        } else if (pressedKeys['ArrowDown'] || pressedKeys['s']) {
          speed = Math.max(speed - acceleration * 0.2, 0);
        } else {
          // Slow down gradually if no keys are pressed
          speed = Math.max(speed - acceleration * 0.05, 0);
        }
      }
      
      // Adjust engine sound based on speed
      if (engineSoundRef.current && isSoundOn) {
        engineSoundRef.current.playbackRate = 0.5 + (speed / maxSpeed);
      }
      
      let newX = carPosition.x;
      const turnSpeed = 2 + (handling * 0.2) * (speed / maxSpeed);
      
      if ((pressedKeys['ArrowLeft'] || pressedKeys['a']) && speed > 0) {
        newX -= turnSpeed;
      }
      
      if ((pressedKeys['ArrowRight'] || pressedKeys['d']) && speed > 0) {
        newX += turnSpeed;
      }
      
      // Nitro boost (keep for non-mobile)
      if (!isMobile && pressedKeys[' '] && speed < maxSpeed) {
        speed = Math.min(speed + acceleration * 0.2, maxSpeed * 1.2);
      }
      
      // Set current speed
      setCurrentSpeed(speed);
      
      // Road boundaries
      const roadLeft = canvasRef.current.width / 2 - roadWidth / 2;
      const roadRight = canvasRef.current.width / 2 + roadWidth / 2;
      
      // Keep car within road bounds
      newX = Math.max(Math.min(newX, roadRight - carWidth / 2), roadLeft + carWidth / 2);
      
      setCarPosition(prev => ({ ...prev, x: newX }));
      
      // Road movement
      const roadMovement = (speed / maxSpeed) * roadSpeed;
      setRoadOffset(prev => (prev + roadMovement) % 50);
      
      // Move obstacles
      const newObstacles = obstacles.map(obstacle => ({
        ...obstacle,
        y: obstacle.y + roadMovement
      }));
      
      // Remove obstacles that are off-screen
      const filteredObstacles = newObstacles.filter(o => o.y < canvasRef.current!.height + 100);
      setObstacles(filteredObstacles);
      
      // Draw car
      drawCar(ctx, carPosition.x, carPosition.y);
      
      // Check for collisions and draw obstacles
      checkCollisionsAndDrawObstacles(ctx, filteredObstacles);
      
      // Check for lap completion
      const lapPosition = -500 + (roadOffset % 2000);
      if (lapPosition > 0 && lapPosition - roadMovement <= 0) {
        setLapCount(lapCount + 1);
        setScore(score + Math.floor(speed) * 10);
      }
      
      // Update score based on speed
      setScore(score + Math.floor(speed / 20));
    };
    
    const loopId = window.requestAnimationFrame(gameLoop);
    setGameLoopId(loopId);
    
    return () => {
      if (gameLoopId) {
        window.cancelAnimationFrame(gameLoopId);
      }
    };
  }, [pressedKeys, carPosition, roadOffset, obstacles, isPaused, isSoundOn, currentSpeed, lapCount, score, isMobile, autoAccelerate]);

  const drawRoad = (ctx: CanvasRenderingContext2D) => {
    const canvasWidth = canvasRef.current!.width;
    const canvasHeight = canvasRef.current!.height;
    
    // Draw grass
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw road
    const roadLeft = canvasWidth / 2 - roadWidth / 2;
    ctx.fillStyle = '#333333';
    ctx.fillRect(roadLeft, 0, roadWidth, canvasHeight);
    
    // Draw road lines (dashed middle line)
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.setLineDash([20, 30]);
    const middleX = canvasWidth / 2;
    
    for (let y = roadOffset % 50 - 50; y < canvasHeight; y += 50) {
      ctx.moveTo(middleX, y);
      ctx.lineTo(middleX, y + 30);
    }
    ctx.stroke();
    
    // Draw road edges
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.setLineDash([]);
    ctx.moveTo(roadLeft, 0);
    ctx.lineTo(roadLeft, canvasHeight);
    ctx.moveTo(roadLeft + roadWidth, 0);
    ctx.lineTo(roadLeft + roadWidth, canvasHeight);
    ctx.stroke();
    
    // Draw lap marker
    ctx.setLineDash([]);
    const lapPosition = -500 + (roadOffset % 2000);
    if (lapPosition > -canvasHeight && lapPosition < canvasHeight) {
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.fillRect(roadLeft, lapPosition, roadWidth, 20);
      
      // Checkerboard pattern
      ctx.fillStyle = 'black';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(roadLeft + i * (roadWidth / 6), lapPosition, roadWidth / 12, 20);
        ctx.fillRect(roadLeft + roadWidth / 12 + i * (roadWidth / 6), lapPosition, roadWidth / 12, 20);
      }
      
      // Draw flag
      ctx.fillStyle = 'red';
      ctx.fillRect(roadLeft - 50, lapPosition - 100, 50, 50);
      ctx.fillStyle = 'white';
      ctx.fillRect(roadLeft - 50, lapPosition - 50, 50, 50);
    }
  };

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const carColor = selectedCar?.color || 'red';
    
    // Car body
    ctx.fillStyle = carColor === 'red' ? '#F97316' : carColor === 'blue' ? '#0EA5E9' : '#22C55E';
    ctx.fillRect(x - carWidth / 2, y - carHeight / 2, carWidth, carHeight);
    
    // Car details (windshield, lights, etc.)
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(x - carWidth / 2 + 10, y - carHeight / 2 + 15, carWidth - 20, 20);
    
    // Wheels
    ctx.fillStyle = 'black';
    ctx.fillRect(x - carWidth / 2 - 5, y - carHeight / 4, 5, 20);
    ctx.fillRect(x + carWidth / 2, y - carHeight / 4, 5, 20);
    ctx.fillRect(x - carWidth / 2 - 5, y + carHeight / 4 - 20, 5, 20);
    ctx.fillRect(x + carWidth / 2, y + carHeight / 4 - 20, 5, 20);
  };

  const checkCollisionsAndDrawObstacles = (ctx: CanvasRenderingContext2D, obstacles: Obstacle[]) => {
    const carLeft = carPosition.x - carWidth / 2;
    const carRight = carPosition.x + carWidth / 2;
    const carTop = carPosition.y - carHeight / 2;
    const carBottom = carPosition.y + carHeight / 2;
    
    for (const obstacle of obstacles) {
      let obstacleWidth = 30;
      let obstacleHeight = 30;
      
      // Different sizes for different obstacles
      if (obstacle.type === 'cone') {
        obstacleWidth = 20;
        obstacleHeight = 30;
        ctx.fillStyle = 'orange';
      } else if (obstacle.type === 'oil') {
        obstacleWidth = 60;
        obstacleHeight = 40;
        ctx.fillStyle = 'black';
      } else if (obstacle.type === 'tree') {
        obstacleWidth = 40;
        obstacleHeight = 40;
        ctx.fillStyle = 'darkgreen';
      }
      
      ctx.fillRect(
        obstacle.x - obstacleWidth / 2,
        obstacle.y - obstacleHeight / 2,
        obstacleWidth,
        obstacleHeight
      );
      
      // Check for collision
      const obstacleLeft = obstacle.x - obstacleWidth / 2;
      const obstacleRight = obstacle.x + obstacleWidth / 2;
      const obstacleTop = obstacle.y - obstacleHeight / 2;
      const obstacleBottom = obstacle.y + obstacleHeight / 2;
      
      if (
        carRight > obstacleLeft &&
        carLeft < obstacleRight &&
        carBottom > obstacleTop &&
        carTop < obstacleBottom
      ) {
        if (crashSoundRef.current && isSoundOn && !audioLoadError) {
          crashSoundRef.current.play().catch(error => {
            console.error('Error playing crash sound:', error);
          });
        }
        handleCrash();
      }
    }
  };

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
      
      {/* Game UI overlay */}
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
      </div>
      
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

export default GameCanvas;
