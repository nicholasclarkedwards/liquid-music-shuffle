
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  bgImageUrl?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", bgImageUrl }) => {
  return (
    <div className={`liquid-glass rounded-[2.5rem] p-8 transition-all duration-700 relative overflow-hidden ${className}`}>
      {/* Background layer if image is provided */}
      {bgImageUrl && (
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-20 blur-3xl scale-125 transition-all duration-1000 ease-in-out pointer-events-none"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
        ></div>
      )}
      
      {/* Internal "light" source to make the glass visible */}
      {!bgImageUrl && (
        <>
          <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
        </>
      )}
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;