import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  imageUrl?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", imageUrl }) => {
  return (
    <div className={`liquid-glass rounded-[2rem] p-5 md:p-6 relative transition-all duration-700 ${className}`}>
      {/* Internal Color Fill Layer */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none isolate">
        {/* Album Color Fill */}
        <div 
          className={`absolute inset-0 bg-center bg-cover blur-[100px] scale-150 transform-gpu transition-opacity duration-700 ${imageUrl ? 'opacity-50' : 'opacity-0'}`}
          style={{ 
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            willChange: 'opacity'
          }}
        ></div>
        
        {/* Default / Loading Gradient Fill */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${imageUrl ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10"></div>
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 blur-[80px] animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-500/10 blur-[80px]"></div>
        </div>

        {/* Base Glass Tint - Prevents Safari "Black Void" */}
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl shadow-inner"></div>
      </div>
      
      {/* Content layer */}
      <div className="relative z-10 h-full flex flex-col isolate">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;