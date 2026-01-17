
import React from 'react';

interface IntegrationStatusProps {
  isAuthorized: boolean;
  onAuthorize: () => void;
  onUnauthorize: () => void;
}

const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ isAuthorized, onAuthorize, onUnauthorize }) => {
  return (
    <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-auto">
      <div className="flex-1">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-2">Integration Status</h4>
        <p className="text-sm text-white/60 leading-relaxed font-medium">
          {isAuthorized 
            ? "Currently synced with your library. Your picks prioritize your personal collection."
            : "Using AI Search. Import your Apple Music account to enable direct library shuffle."}
        </p>
      </div>
      
      {isAuthorized ? (
        <button 
          onClick={onUnauthorize}
          className="whitespace-nowrap glass-button py-3 px-6 rounded-2xl glass-inset text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors"
        >
          DISCONNECT
        </button>
      ) : (
        <button 
          onClick={onAuthorize}
          className="whitespace-nowrap glass-button py-3 px-8 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-500"
        >
          IMPORT
        </button>
      )}
    </div>
  );
};

export default IntegrationStatus;
