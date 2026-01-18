import React from 'react';

interface BackgroundProps {
  imageUrl?: string;
}

const Background: React.FC<BackgroundProps> = ({ imageUrl }) => {
  return (
    <div className="fixed inset-0 -z-20 bg-[#040406] overflow-hidden">
      {/* Primary Album Color Layer */}
      <div 
        className={`absolute inset-0 bg-center bg-cover transition-all duration-[1200ms] ease-in-out blur-[120px] scale-150 transform-gpu opacity-70 ${imageUrl ? 'opacity-70' : 'opacity-0'}`}
        style={{ 
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          willChange: 'opacity, transform'
        }}
      ></div>

      {/* Fallback/Base Glows */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${imageUrl ? 'opacity-20' : 'opacity-100'}`}>
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-600/20 blur-[180px] rounded-full animate-[pulse_12s_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-600/20 blur-[180px] rounded-full animate-[pulse_18s_infinite]"></div>
        <div className="absolute top-[25%] left-[30%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full"></div>
      </div>
      
      {/* Contrast Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
    </div>
  );
};

export default Background;