import React from 'react';
import { Matchstick } from './Matchstick';

interface OperatorProps {
  type: '+' | '-' | '=';
  activeSticks: boolean[]; // [vertical, horizontal] for +, [top, bottom] for =, [middle] for -
  onToggle: (index: number) => void;
}

export const Operator: React.FC<OperatorProps> = ({ type, activeSticks, onToggle }) => {
  // We normalize the internal state indices for the generic parent handler
  // For simplicity, let's map them to specific visual positions
  
  return (
    <div className="relative w-16 h-36 mx-1 flex items-center justify-center">
      {/* + Plus Sign */}
      {type === '+' && (
        <>
          {/* Vertical Stick (Index 0 for operator state) */}
          <Matchstick 
            vertical 
            active={activeSticks[0]} 
            onClick={() => onToggle(0)} 
            className="top-[2.5rem]" // Centered vertically roughly
          />
          {/* Horizontal Stick (Index 1) */}
          <Matchstick 
            active={activeSticks[1]} 
            onClick={() => onToggle(1)} 
            className="top-[4.2rem] left-0" 
          />
        </>
      )}

      {/* - Minus Sign */}
      {type === '-' && (
         <Matchstick 
         active={activeSticks[0]} 
         onClick={() => onToggle(0)} 
         className="top-[4.2rem] left-0" 
       />
      )}

      {/* = Equal Sign */}
      {type === '=' && (
        <>
          {/* Top Stick */}
          <Matchstick 
            active={activeSticks[0]} 
            onClick={() => onToggle(0)} 
            className="top-[3.5rem] left-0" 
          />
           {/* Bottom Stick */}
           <Matchstick 
            active={activeSticks[1]} 
            onClick={() => onToggle(1)} 
            className="top-[5.0rem] left-0" 
          />
        </>
      )}
    </div>
  );
};
