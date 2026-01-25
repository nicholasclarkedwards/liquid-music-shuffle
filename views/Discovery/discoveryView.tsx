
import React from 'react';
import { DiscoveryViewProps } from './discoveryViewProps';
import { AlbumArtwork, GlassCard, InfoIcon, FilterPanel } from '../../components';
import './discoveryView.css';

const DiscoveryView: React.FC<DiscoveryViewProps> = (props) => {
  return (
    <div className="discovery-view-container">
      <div className="discovery-layout-grid">
        {/* Left Side: Artwork Hero */}
        <div className="discovery-column artwork-col">
          <AlbumArtwork 
            album={props.currentAlbum} 
            isLoading={props.isLoading} 
            onLaunch={props.onLaunchAlbum} 
            onRefresh={props.onRefreshMetadata}
          />
        </div>

        {/* Right Side: Discovery Controls */}
        <div className="discovery-column controls-col">
          <GlassCard 
            className="discovery-config-card" 
            imageUrl={props.isLoading ? undefined : props.currentAlbum?.artworkUrl}
          >
            <div className="discovery-card-inner">
              <div className="discovery-card-header">
                <div className="discovery-header-labels">
                  <h3 className="discovery-header-title">
                    Filters
                    <InfoIcon text="Refine your library pool for the next shuffle." />
                  </h3>
                  <p className="discovery-header-subtitle">Configuration</p>
                </div>
                <button 
                  onClick={props.onResetFilters}
                  className="discovery-reset-btn"
                >
                  Reset Filters
                </button>
              </div>

              <FilterPanel filters={props.filters} setFilters={props.setFilters} />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryView;
