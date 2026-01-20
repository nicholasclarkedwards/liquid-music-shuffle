import React from 'react';
import { IntegrationStatusProps } from './integrationStatusProps';
import { InfoIcon } from '../../Common';

const IntegrationStatusView: React.FC<IntegrationStatusProps> = ({ 
  isAuthorized, 
  onAuthorize, 
  onUnauthorize 
}) => {
  return (
    <div className="integration-panel">
      <div className="integration-text-content">
        <h4 className="integration-title">
          Integration Engine
          <InfoIcon text="Manage your connection between this explorer and your Apple Music account." />
        </h4>
        <p className="integration-description">
          {isAuthorized 
            ? "Apple Music Cloud synced. Your picks are enhanced with real-time library data."
            : "Local Library Detected. Shuffling will prioritize your 'albums.json' export file."}
        </p>
      </div>
      
      <div className="has-tooltip">
        {isAuthorized ? (
          <button 
            onClick={onUnauthorize}
            className="integration-button integration-button-disconnect glass-button-base"
          >
            DISCONNECT
          </button>
        ) : (
          <button 
            onClick={onAuthorize}
            className="integration-button integration-button-connect glass-button-base"
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

export default IntegrationStatusView;