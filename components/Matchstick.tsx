
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
      className={`absolute cursor-pointer transition-all duration-300 z-10 
        ${className} 
        ${vertical ? 'w-6 h-20 -ml-1' : 'w-20 h-6 -mt-1'} 
        flex items-center justify-center group
      `}
    >
      {/* Hitbox visualization for debugging (opacity-0 usually) */}
      <div className={`w-full h-full absolute opacity-0 group-hover:opacity-10 transition-opacity bg-white rounded-full`} />

      {/* The Visible Stick */}
      <div 
        className={`
          relative rounded-sm shadow-sm transition-all duration-300 overflow-hidden
          ${vertical ? 'w-2 h-16' : 'w-16 h-2'}
          ${active 
            ? 'shadow-[2px_2px_4px_rgba(0,0,0,0.4)] translate-y-0 opacity-100' 
            : 'bg-gray-800/20 shadow-none opacity-10 hover:opacity-30'
          }
        `}
        style={active ? {
          background: 'linear-gradient(90deg, #d4a373 0%, #8b4513 100%)',
        } : {}}
      >
        {/* Wood Texture Detail (CSS generated) */}
        {active && (
          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
        )}

        {/* Match Head */}
        {active && (
          <div 
            className={`absolute bg-gradient-to-br from-red-500 to-red-800 rounded-full shadow-inner
              ${vertical 
                ? 'w-3 h-4 -top-1 left-1/2 -translate-x-1/2' 
                : 'w-4 h-3 -right-1 top-1/2 -translate-y-1/2'
              }
            `}
          >
            {/* Highlight on head */}
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/40 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
