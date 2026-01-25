
import React from 'react';
import { MainViewProps } from './mainViewProps';
import { AlbumArtwork } from '../../Album';
import { GlassCard, InfoIcon } from '../../Common';
import { FilterPanel } from '../../Filter';
import { ShuffleControls } from '../../Controls';

const MainViewView: React.FC<MainViewProps> = (props) => {
  return (
    <div className="main-view-wrapper">
      <div className="main-view-content-grid">
        {/* Left/Top Column: The Hero Artwork */}
        <div className="main-view-artwork-column">
          <AlbumArtwork 
            album={props.currentAlbum} 
            isLoading={props.isLoading} 
            onLaunch={props.onLaunchAlbum} 
            onRefresh={props.onRefreshMetadata}
          />
        </div>

        {/* Right/Bottom Column: Configuration & Engine */}
        <div className="main-view-controls-column">
          <GlassCard 
            className="main-view-config-card" 
            imageUrl={props.isLoading ? undefined : props.currentAlbum?.artworkUrl}
          >
            <div className="main-view-card-header">
              <div className="main-view-header-labels">
                <h3 className="main-view-header-title">
                  Filters
                  <InfoIcon text="Refine your library pool for the next shuffle." />
                </h3>
                <p className="main-view-header-subtitle">Configuration</p>
              </div>
              <button 
                onClick={props.onResetFilters}
                className="main-view-reset-btn"
              >
                Reset Filters
              </button>
            </div>

            <FilterPanel filters={props.filters} setFilters={props.setFilters} />

            <div className="main-view-footer">
              <ShuffleControls 
                onShuffle={props.onShuffle}
                isLoading={props.isLoading}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default MainViewView;
