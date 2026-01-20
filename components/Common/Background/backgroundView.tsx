import React from 'react';
import { BackgroundProperties } from './backgroundProps';

const BackgroundView: React.FC<BackgroundProperties> = ({ imageUrl }) => {
  return (
    <div className="bg-main-container">
      {/* Primary Album Color Layer */}
      <div 
        className={`bg-album-layer ${imageUrl ? 'is-active' : ''}`}
        style={{ 
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        }}
      ></div>

      {/* Fallback/Base Glows */}
      <div className={`bg-glow-container ${imageUrl ? 'is-faded' : ''}`}>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        <div className="bg-glow-3"></div>
      </div>
      
      {/* Contrast Overlay */}
      <div className="bg-overlay"></div>
    </div>
  );
};

export default BackgroundView;
