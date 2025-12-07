import React from 'react';

interface MatchstickProps {
  active: boolean;
  onClick: () => void;
  vertical?: boolean;
  className?: string;
}

export const Matchstick: React.FC<MatchstickProps> = ({ active, onClick, vertical = false, className = '' }) => {
  return (
    <div 
      onClick={onClick}
      className={`absolute cursor-pointer transition-all duration-300 ${className} ${vertical ? 'w-4 h-16' : 'w-16 h-4'}`}
      style={{ zIndex: 10 }}
    >
      {/* Hitbox area for easier clicking */}
      <div className={`w-full h-full flex items-center justify-center`}>
        {/* The Visible Stick */}
        <div 
          className={`
            relative rounded-full shadow-md transition-all duration-300
            ${vertical ? 'w-2 h-full' : 'w-full h-2'}
            ${active ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-gray-800 opacity-20 hover:opacity-50'}
          `}
        >
          {/* Match Head */}
          {active && (
            <div 
              className={`absolute bg-red-600 rounded-full
                ${vertical ? 'w-3 h-4 top-0 -left-0.5' : 'w-4 h-3 right-0 -top-0.5'}
              `}
            />
          )}
        </div>
      </div>
    </div>
  );
};
