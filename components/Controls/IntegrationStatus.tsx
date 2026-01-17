
import React from 'react';

interface IntegrationStatusProps {
  isAuthorized: boolean;
  onAuthorize: () => void;
  onUnauthorize: () => void;
}

const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ isAuthorized, onAuthorize, onUnauthorize }) => {
  return (
    <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-auto transition-all duration-500">
      <div className="flex-1">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-2">Integration Engine</h4>
        <p className="text-sm text-white/60 leading-relaxed font-medium">
          {isAuthorized 
            ? "Apple Music Cloud synced. Your picks are enhanced with real-time library data."
            : "Local Library Detected. Shuffling will prioritize your 'library.json' export file."}
        </p>
      </div>
      
      {isAuthorized ? (
        <button 
          onClick={onUnauthorize}
          className="whitespace-nowrap glass-button py-4 px-8 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:border-red-400/20 transition-all active:scale-95"
        >
          DISCONNECT
        </button>
      ) : (
        <button 
          onClick={onAuthorize}
          className="whitespace-nowrap glass-button py-4 px-8 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95"
        >
          CONNECT CLOUD
        </button>
      )}
    </div>
  );
};

export default IntegrationStatus;
