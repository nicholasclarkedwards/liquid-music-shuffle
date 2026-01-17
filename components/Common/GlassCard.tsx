
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  bgImageUrl?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", bgImageUrl }) => {
  return (
    <div className={`liquid-glass rounded-[2.5rem] p-8 transition-all duration-700 relative overflow-hidden ${className}`}>
      {/* Background layer with high performance hardware acceleration */}
      <div 
        className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out pointer-events-none blur-3xl scale-125 transform-gpu ${bgImageUrl ? 'opacity-20' : 'opacity-0'}`}
        style={{ backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none' }}
      ></div>
      
      {/* Default internal light sources - fade out when actual artwork background is present */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${bgImageUrl ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 bg-blue-500/10 blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-indigo-500/5 blur-[120px]"></div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
