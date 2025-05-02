
import React, { useEffect, useRef } from 'react';
import { useGameContext } from '@/context/GameContext';

const Speedometer = () => {
  const { currentSpeed, maxSpeed } = useGameContext();
  const needleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (needleRef.current) {
      // Convert speed to angle (0-220 degrees)
      const speedPercentage = Math.min(currentSpeed / maxSpeed, 1);
      const angle = -110 + (speedPercentage * 220); 
      needleRef.current.style.transform = `rotate(${angle}deg)`;
    }
  }, [currentSpeed, maxSpeed]);

  return (
    <div className="w-40 h-40 relative flex items-center justify-center">
      {/* Speedometer background */}
      <div className="absolute w-full h-full rounded-full bg-gray-800/80 border-4 border-racing-red flex items-center justify-center">
        {/* Speed readout */}
        <div className="text-center mt-6">
          <div className="text-3xl font-bold text-white">{Math.round(currentSpeed)}</div>
          <div className="text-xs text-gray-300">km/h</div>
        </div>
      </div>
      
      {/* Speedometer ticks */}
      <div className="absolute w-full h-full">
        {[...Array(11)].map((_, i) => {
          const angle = -110 + (i * 22); // -110 to 110 degrees
          const isLargeTick = i % 5 === 0;
          const tickLength = isLargeTick ? 10 : 5;
          const tickWidth = isLargeTick ? 2 : 1;
          const radius = 58;
          const x1 = Math.cos(angle * Math.PI / 180) * radius + 70;
          const y1 = Math.sin(angle * Math.PI / 180) * radius + 70;
          const x2 = Math.cos(angle * Math.PI / 180) * (radius - tickLength) + 70;
          const y2 = Math.sin(angle * Math.PI / 180) * (radius - tickLength) + 70;
          
          return (
            <svg key={i} className="absolute top-0 left-0 w-full h-full">
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isLargeTick ? 'white' : 'grey'}
                strokeWidth={tickWidth}
              />
              {isLargeTick && (
                <text
                  x={Math.cos(angle * Math.PI / 180) * (radius - 15) + 70}
                  y={Math.sin(angle * Math.PI / 180) * (radius - 15) + 70}
                  fontSize="8"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {Math.round((i / 10) * maxSpeed)}
                </text>
              )}
            </svg>
          );
        })}
      </div>
      
      {/* Needle */}
      <div 
        ref={needleRef}
        className="absolute w-1 h-20 bg-racing-red transform -translate-y-5 rounded-t-full speedometer-needle"
        style={{ transformOrigin: 'bottom center', transform: 'rotate(-110deg)' }}
      />
      <div className="absolute w-4 h-4 rounded-full bg-racing-red z-10" />
    </div>
  );
};

export default Speedometer;
