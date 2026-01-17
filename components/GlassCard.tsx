
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`liquid-glass rounded-[2.5rem] p-8 transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
