
import React from 'react';
import { useGameContext, CarStats } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gauge, ChevronRight, ChevronLeft } from 'lucide-react';

const CarSelection = () => {
  const { cars, setSelectedCar, setGameState } = useGameContext();
  const [currentCarIndex, setCurrentCarIndex] = React.useState(0);
  const currentCar = cars[currentCarIndex];

  const handlePrevious = () => {
    setCurrentCarIndex((prev) => (prev === 0 ? cars.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentCarIndex((prev) => (prev === cars.length - 1 ? 0 : prev + 1));
  };

  const handleSelectCar = () => {
    setSelectedCar(currentCar);
    setGameState('playing');
  };

  const getStatBars = (value: number) => {
    // Convert the stat value (1-10) to a width percentage (10-100%)
    const percentage = (value / 10) * 100;
    let barColor = 'bg-racing-red';
    
    if (value < 6) barColor = 'bg-racing-red';
    else if (value < 8) barColor = 'bg-racing-blue';
    else barColor = 'bg-racing-green';

    return (
      <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-5xl mb-8 text-racing-red text-glow">Select Your Car</h1>
      
      <div className="flex items-center justify-center w-full gap-4 mb-8">
        <Button 
          onClick={handlePrevious}
          variant="ghost" 
          className="text-white text-4xl p-8 hover:bg-racing-red/30"
        >
          <ChevronLeft size={40} />
        </Button>
        
        <Card className="w-96 h-[450px] bg-gray-800/80 border-racing-red border-2 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-pulse-glow">
          <h2 className="text-3xl mb-2 text-white">{currentCar.name}</h2>
          
          <div className="w-64 h-40 bg-gray-700 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
            <div className={`absolute inset-0 bg-racing-${currentCar.color}/20`}></div>
            <img 
              src={currentCar.image} 
              alt={currentCar.name} 
              className="w-56 h-auto object-contain transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center">
                <Gauge className="mr-2" /> Speed
              </span>
              {getStatBars(currentCar.speed / 30)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Acceleration</span>
              {getStatBars(currentCar.acceleration)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Handling</span>
              {getStatBars(currentCar.handling)}
            </div>
          </div>
        </Card>
        
        <Button 
          onClick={handleNext} 
          variant="ghost" 
          className="text-white text-4xl p-8 hover:bg-racing-red/30"
        >
          <ChevronRight size={40} />
        </Button>
      </div>
      
      <Button 
        onClick={handleSelectCar} 
        className="px-8 py-6 bg-racing-red hover:bg-racing-red/80 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all"
      >
        Start Racing
      </Button>
      
      <Button 
        onClick={() => setGameState('menu')} 
        variant="outline" 
        className="mt-4 border-racing-gray text-racing-gray hover:bg-racing-gray/20"
      >
        Back to Menu
      </Button>
    </div>
  );
};

export default CarSelection;
