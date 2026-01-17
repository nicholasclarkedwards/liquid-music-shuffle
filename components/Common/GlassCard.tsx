import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  bgImageUrl?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", bgImageUrl }) => {
  return (
    <div className={`liquid-glass rounded-[2rem] p-5 md:p-6 transition-all duration-700 relative ${className}`}>
      {/* Background layer container with its own clipping to prevent blur bleed */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
        <div 
          className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out blur-3xl scale-125 transform-gpu ${bgImageUrl ? 'opacity-20' : 'opacity-0'}`}
          style={{ backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none' }}
        ></div>
        
        <div className={`absolute inset-0 transition-opacity duration-1000 ${bgImageUrl ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 bg-blue-500/10 blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-indigo-500/5 blur-[120px]"></div>
        </div>
      </div>
      
      {/* Content layer - NO overflow-hidden here to allow dropdowns to pop out */}
      <div className="relative z-10 h-full flex flex-col isolate">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;