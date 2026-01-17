import React from 'react';
import { DiscoveryMode } from '../../types';

interface ShuffleControlsProps {
  onShuffle: (mode: DiscoveryMode) => void;
  isLoading: boolean;
}

const ShuffleControls: React.FC<ShuffleControlsProps> = ({ onShuffle, isLoading }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="has-tooltip">
        <button 
          onClick={() => onShuffle(DiscoveryMode.LIBRARY)}
          disabled={isLoading}
          className="glass-button w-full py-3 bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 disabled:opacity-30 transition-all"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Shuffle
        </button>
        <div className="tooltip">Pick a random album from your library matching your filters.</div>
      </div>

      <div className="has-tooltip">
        <button 
          onClick={() => onShuffle(DiscoveryMode.TASTE)}
          disabled={isLoading}
          className="glass-button w-full py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-black text-[9px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-indigo-500/20 active:scale-95 disabled:opacity-30 transition-all"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Discover
        </button>
        <div className="tooltip">Use Gemini AI to discover a new album matching your style and filters.</div>
      </div>
    </div>
  );
};

export default ShuffleControls;