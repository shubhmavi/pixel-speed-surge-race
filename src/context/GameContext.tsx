
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CarStats = {
  id: string;
  name: string;
  color: string;
  speed: number; // Max speed
  acceleration: number; // How fast it reaches max speed
  handling: number; // How well it turns
  image: string;
};

export type GameState = 'menu' | 'carSelect' | 'playing' | 'gameOver';

type GameContextType = {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  selectedCar: CarStats | null;
  setSelectedCar: (car: CarStats) => void;
  score: number;
  setScore: (score: number) => void;
  cars: CarStats[];
  isSoundOn: boolean;
  toggleSound: () => void;
  lapCount: number;
  setLapCount: (count: number) => void;
  highScores: { name: string; score: number }[];
  addHighScore: (name: string, score: number) => void;
  currentSpeed: number;
  setCurrentSpeed: (speed: number) => void;
  maxSpeed: number;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedCar, setSelectedCar] = useState<CarStats | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [lapCount, setLapCount] = useState<number>(0);
  const [highScores, setHighScores] = useState<{ name: string; score: number }[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(200);

  // Available cars with their stats
  const cars: CarStats[] = [
    {
      id: 'sports-red',
      name: 'Velocity X',
      color: 'red',
      speed: 220,
      acceleration: 9,
      handling: 7,
      image: '/assets/car-red.png'
    },
    {
      id: 'sports-blue',
      name: 'Turbo GT',
      color: 'blue',
      speed: 200,
      acceleration: 7,
      handling: 9,
      image: '/assets/car-blue.png'
    },
    {
      id: 'sports-green',
      name: 'Eco Racer',
      color: 'green',
      speed: 180,
      acceleration: 8,
      handling: 8,
      image: '/assets/car-green.png'
    }
  ];

  // Load high scores from local storage
  useEffect(() => {
    const savedScores = localStorage.getItem('highScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  // Save high scores to local storage
  const addHighScore = (name: string, score: number) => {
    const newHighScores = [...highScores, { name, score }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setHighScores(newHighScores);
    localStorage.setItem('highScores', JSON.stringify(newHighScores));
  };

  // Toggle sound on/off
  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        selectedCar,
        setSelectedCar,
        score,
        setScore,
        cars,
        isSoundOn,
        toggleSound,
        lapCount,
        setLapCount,
        highScores,
        addHighScore,
        currentSpeed,
        setCurrentSpeed,
        maxSpeed
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
