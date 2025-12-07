import React from 'react';
import { Matchstick } from './Matchstick';

interface DigitProps {
  segments: boolean[]; // Array of 7 booleans
  onToggle: (index: number) => void;
}

// Layout coordinates relative to a container
// 0: Top, 1: TopLeft, 2: TopRight, 3: Middle, 4: BottomLeft, 5: BottomRight, 6: Bottom
export const Digit: React.FC<DigitProps> = ({ segments, onToggle }) => {
  return (
    <div className="relative w-20 h-36 mx-1">
      {/* 0: Top */}
      <Matchstick 
        active={segments[0]} 
        onClick={() => onToggle(0)} 
        className="top-0 left-2" 
      />
      
      {/* 1: Top Left */}
      <Matchstick 
        vertical 
        active={segments[1]} 
        onClick={() => onToggle(1)} 
        className="top-2 left-0" 
      />
      
      {/* 2: Top Right */}
      <Matchstick 
        vertical 
        active={segments[2]} 
        onClick={() => onToggle(2)} 
        className="top-2 right-0" 
      />
      
      {/* 3: Middle */}
      <Matchstick 
        active={segments[3]} 
        onClick={() => onToggle(3)} 
        className="top-[4.2rem] left-2" 
      />
      
      {/* 4: Bottom Left */}
      <Matchstick 
        vertical 
        active={segments[4]} 
        onClick={() => onToggle(4)} 
        className="bottom-2 left-0" 
      />
      
      {/* 5: Bottom Right */}
      <Matchstick 
        vertical 
        active={segments[5]} 
        onClick={() => onToggle(5)} 
        className="bottom-2 right-0" 
      />
      
      {/* 6: Bottom */}
      <Matchstick 
        active={segments[6]} 
        onClick={() => onToggle(6)} 
        className="bottom-0 left-2" 
      />
    </div>
  );
};
