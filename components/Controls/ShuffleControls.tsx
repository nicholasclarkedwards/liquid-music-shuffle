import React from 'react';
import { DiscoveryMode } from '../../types';

interface ShuffleControlsProps {
  onShuffle: (mode: DiscoveryMode) => void;
  isLoading: boolean;
}

const ShuffleControls: React.FC<ShuffleControlsProps> = ({ onShuffle, isLoading }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="has-tooltip w-full">
        <button 
          onClick={() => onShuffle(DiscoveryMode.LIBRARY)}
          disabled={isLoading}
          className="w-full py-3.5 rounded-full glass-button-base text-white font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2.5 disabled:opacity-20 shadow-xl"
        >
          <svg className="w-5 h-5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18c3 0 5-1 7-3 4-4 4-4 8-8 2-2 4-3 7-3" />
            <path d="M17 4l3 3-3 3" />
            <path d="M2 6c3 0 5 1 7 3 4 4 4 4 8 8 2 2 4 3 7 3" />
            <path d="M17 20l3-3-3-3" />
          </svg>
          Shuffle
        </button>
        <div className="tooltip">Pick a random album from your pool.</div>
      </div>

      <div className="has-tooltip w-full">
        <button 
          onClick={() => onShuffle(DiscoveryMode.TASTE)}
          disabled={isLoading}
          className="w-full py-3.5 rounded-full glass-button-base text-white font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2.5 disabled:opacity-20 shadow-xl"
        >
          <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          Discover
        </button>
        <div className="tooltip">Discover a new project using Gemini AI.</div>
      </div>
    </div>
  );
};

export default ShuffleControls;