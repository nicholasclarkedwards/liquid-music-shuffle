import React from 'react';
import { ShuffleControlsProps } from './shuffleControlsProps';
import { DiscoveryMode } from '../../../types';
import { Shuffle, Search } from 'lucide-react';

const ShuffleControlsView: React.FC<ShuffleControlsProps> = ({ onShuffle, isLoading }) => {
  return (
    <div className="controls-grid">
      <div className="has-tooltip control-btn-wrapper">
        <button 
          onClick={() => onShuffle(DiscoveryMode.LIBRARY)}
          disabled={isLoading}
          className="control-btn glass-button-base"
        >
          <Shuffle size={18} className="icon-shuffle-animated" />
          Shuffle
        </button>
        <div className="tooltip">Pick a random album from your pool.</div>
      </div>

      <div className="has-tooltip control-btn-wrapper">
        <button 
          onClick={() => onShuffle(DiscoveryMode.TASTE)}
          disabled={isLoading}
          className="control-btn glass-button-base"
        >
          <Search size={18} className="icon-discover-animated" />
          Discover
        </button>
        <div className="tooltip">Discover a new project using Gemini AI.</div>
      </div>
    </div>
  );
};

export default ShuffleControlsView;