
import React from 'react';
import { GlassCardProps } from './glassCardProps';

const GlassCardView: React.FC<GlassCardProps> = ({ children, className = "", imageUrl, onClick }) => {
  return (
    <div 
      className={`liquid-glass glass-card-outer ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Internal Color Fill Layer */}
      <div className="glass-card-fill-layer">
        {/* Album Color Fill - Secondary soft glow */}
        <div 
          className={`glass-card-album-glow ${imageUrl ? 'is-visible' : ''}`}
          style={{ 
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          }}
        ></div>
        
        {/* Default / Loading Gradient Fill */}
        <div className={`glass-card-default-gradient ${imageUrl ? 'is-hidden' : ''}`}>
          <div className="glass-card-gradient-base"></div>
          <div className="glass-card-gradient-pulse"></div>
          <div className="glass-card-gradient-bottom"></div>
        </div>

        {/* Base Glass Tint */}
        <div className="glass-card-base-tint"></div>
      </div>
      
      {/* Content layer */}
      <div className="glass-card-content">
        {children}
      </div>
    </div>
  );
};

export default GlassCardView;
