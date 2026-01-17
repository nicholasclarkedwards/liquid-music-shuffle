
import React from 'react';

interface InfoIconProps {
  text: string;
  className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ text, className = "" }) => {
  return (
    <span className={`has-tooltip inline-flex items-center justify-center ml-1.5 cursor-help ${className}`}>
      <svg className="w-3 h-3 opacity-30 hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <div className="tooltip">{text}</div>
    </span>
  );
};

export default InfoIcon;
