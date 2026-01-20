import React from 'react';
import { InfoIconProps } from './infoIconProps';

const InfoIconView: React.FC<InfoIconProps> = ({ text, className = "" }) => {
  return (
    <span className={`has-tooltip info-icon-container ${className}`}>
      <svg 
        className="info-icon-svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <div className="tooltip">{text}</div>
    </span>
  );
};

export default InfoIconView;