import React, { useRef, useState, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Obstacle {
  x: number;
  y: number;
  type: 'cone' | 'oil' | 'tree';
}

interface GameLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isPaused: boolean;
  pressedKeys: Record<string, boolean>;
  selectedCar: any;
  isSoundOn: boolean;
  autoAccelerate: boolean;
  setCurrentSpeed: (speed: number) => void;
  currentSpeed: number;
  setScore: (score: number) => void;
  score: number;
  setLapCount: (count: number) => void;
  lapCount: number;
  onCrash: () => void;
  playCrashSound: () => void;
}

const GameLoop = ({
  canvasRef,
  isPaused,
  pressedKeys,
  selectedCar,
  isSoundOn,
  autoAccelerate,
  setCurrentSpeed,
  currentSpeed,
  setScore,
  score,
  setLapCount,
  lapCount,
  onCrash,
  playCrashSound
}: GameLoopProps) => {
  const [carPosition, setCarPosition] = useState<Position>({ x: 400, y: 500 });
  const [roadOffset, setRoadOffset] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameLoopId, setGameLoopId] = useState<number | null>(null);
  
  const carWidth = 50;
  const carHeight = 100;
  const roadWidth = 300;
  const roadSpeed = 5;
  const maxObstacles = 10;
  const acceleration = selectedCar?.acceleration || 8;
  const maxSpeed = selectedCar?.speed || 200;
  const handling = selectedCar?.handling || 8;
  
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
  
  // Main game loop
  useEffect(() => {
    if (isPaused) return;

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
      if (autoAccelerate) {
        // Gradually increase speed to 70% of max speed
        const targetSpeed = maxSpeed * 0.7;
        if (speed < targetSpeed) {
          speed = Math.min(speed + acceleration * 0.05, targetSpeed);
        } else if (speed > targetSpeed) {
          speed = Math.max(speed - acceleration * 0.05, targetSpeed);
        }
      } else {
        // Regular keyboard controls
        if (pressedKeys['ArrowUp'] || pressedKeys['w']) {
          speed = Math.min(speed + acceleration * 0.1, maxSpeed);
        } else if (pressedKeys['ArrowDown'] || pressedKeys['s']) {
          speed = Math.max(speed - acceleration * 0.2, 0);
        } else {
          // Slow down gradually if no keys are pressed
          speed = Math.max(speed - acceleration * 0.05, 0);
        }
      }
      
      let newX = carPosition.x;
      const turnSpeed = 2 + (handling * 0.2) * (speed / maxSpeed);
      
      if ((pressedKeys['ArrowLeft'] || pressedKeys['a']) && speed > 0) {
        newX -= turnSpeed;
      }
      
      if ((pressedKeys['ArrowRight'] || pressedKeys['d']) && speed > 0) {
        newX += turnSpeed;
      }
      
      // Nitro boost (for non-mobile)
      if (!autoAccelerate && pressedKeys[' '] && speed < maxSpeed) {
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
  }, [
    pressedKeys, carPosition, roadOffset, obstacles, isPaused, 
    isSoundOn, currentSpeed, lapCount, score, autoAccelerate, 
    canvasRef, selectedCar, maxSpeed, acceleration, handling
  ]);

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
        playCrashSound();
        onCrash();
      }
    }
  };

  return null; // This is a logic component, no UI to render
};

export default GameLoop;
