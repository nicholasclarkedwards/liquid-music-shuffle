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
    <div className="mt-6 flex flex-col gap-3">
      <button 
        onClick={onLaunch}
        disabled={!hasAlbum || isLoading}
        className="glass-button group w-full py-4 bg-white text-black font-black text-[11px] uppercase tracking-[0.25em] shadow-[0_15px_40px_rgba(255,255,255,0.1)] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
      >
        <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        Launch Library
      </button>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onShuffle(DiscoveryMode.LIBRARY)}
          disabled={isLoading}
          className="glass-button py-4 bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Shuffle
        </button>
        <button 
          onClick={() => onShuffle(DiscoveryMode.TASTE)}
          disabled={isLoading}
          className="glass-button py-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-500/20 active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Discover
        </button>
      </div>
    </div>
  );
};

export default ShuffleControls;