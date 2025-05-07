
import React, { useState } from 'react';

interface TouchPosition {
  x: number | null;
  y: number | null;
}

interface TouchControlsProps {
  setPressedKeys: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const TouchControls = ({ setPressedKeys }: TouchControlsProps) => {
  const [touchPosition, setTouchPosition] = useState<TouchPosition>({ x: null, y: null });
  const [touchStartPosition, setTouchStartPosition] = useState<TouchPosition>({ x: null, y: null });

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

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

export default TouchControls;
