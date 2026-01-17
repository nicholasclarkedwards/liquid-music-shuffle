import React from 'react';
import { DiscoveryMode } from '../../types';

interface ShuffleControlsProps {
  onShuffle: (mode: DiscoveryMode) => void;
  onLaunch: () => void;
  isLoading: boolean;
  hasAlbum: boolean;
}

const ShuffleControls: React.FC<ShuffleControlsProps> = ({ onShuffle, onLaunch, isLoading, hasAlbum }) => {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <button 
        onClick={onLaunch}
        disabled={!hasAlbum || isLoading}
        className="glass-button primary w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        Launch in Apple Music
      </button>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onShuffle(DiscoveryMode.LIBRARY)}
          disabled={isLoading}
          className="glass-button secondary py-5 rounded-[2rem] text-white font-bold text-[10px] uppercase tracking-[0.2em]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Shuffle Library
        </button>
        <button 
          onClick={() => onShuffle(DiscoveryMode.TASTE)}
          disabled={isLoading}
          className="glass-button accent py-5 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.2em]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Taste Match
        </button>
      </div>
    </div>
  );
};

export default ShuffleControls;