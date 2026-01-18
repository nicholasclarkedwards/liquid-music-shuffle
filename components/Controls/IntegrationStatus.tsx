import React from 'react';
import InfoIcon from '../Common/InfoIcon';

interface IntegrationStatusProps {
  isAuthorized: boolean;
  onAuthorize: () => void;
  onUnauthorize: () => void;
}

const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ isAuthorized, onAuthorize, onUnauthorize }) => {
  return (
    <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-auto transition-all duration-500">
      <div className="flex-1">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center">
          Integration Engine
          <InfoIcon text="Manage your connection between this explorer and your Apple Music account." />
        </h4>
        <p className="text-sm text-white/60 leading-relaxed font-medium">
          {isAuthorized 
            ? "Apple Music Cloud synced. Your picks are enhanced with real-time library data."
            : "Local Library Detected. Shuffling will prioritize your 'albums.json' export file."}
        </p>
      </div>
      
      <div className="has-tooltip">
        {isAuthorized ? (
          <button 
            onClick={onUnauthorize}
            className="whitespace-nowrap glass-button-base py-4 px-8 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 active:scale-95"
          >
            DISCONNECT
          </button>
        ) : (
          <button 
            onClick={onAuthorize}
            className="whitespace-nowrap glass-button-base py-4 px-8 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95"
          >
            CONNECT CLOUD
          </button>
        )}
        <div className="tooltip">
          {isAuthorized 
            ? "Sign out and stop syncing with Apple Music." 
            : "Sign in with your Apple ID to enable full catalog exploration."}
        </div>
      </div>
    </div>
  );
};

export default IntegrationStatus;