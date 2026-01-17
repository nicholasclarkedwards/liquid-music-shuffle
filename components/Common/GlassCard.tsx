import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  bgImageUrl?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", bgImageUrl }) => {
  return (
    <div className={`liquid-glass rounded-[2.5rem] p-8 ${className}`}>
      {bgImageUrl && (
        <div 
          className="glass-bg-image"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
        ></div>
      )}
      <div className="glass-content">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;