
import React from 'react';
import { AlbumArtworkViewProperties } from './albumArtworkProps';
import { GlassCard, InfoIcon } from '../../Common';
import { RefreshCw } from 'lucide-react';

const AlbumArtworkView: React.FC<AlbumArtworkViewProperties> = (props) => {
  if (props.isLoading) {
    return (
      <GlassCard className="artwork-card-base">
        <div className="artwork-loading-wrapper">
          <div className="w-12 h-1 bg-blue-500/20 rounded-full overflow-hidden">
            <div className="w-full h-full bg-blue-500 animate-[pulse_1s_infinite]"></div>
          </div>
          <p className="artwork-loading-text">Resolving Metadata...</p>
        </div>
      </GlassCard>
    );
  }

  if (!props.album) {
    return (
      <GlassCard className="artwork-card-base">
        <div className="artwork-empty-wrapper">
          <svg className="artwork-empty-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <p className="artwork-empty-text">Initialize Shuffle Engine</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      className="artwork-card-active"
      imageUrl={props.album.artworkUrl}
    >
      <div className="artwork-main-layout">
        <div 
          key={props.album.id} 
          className="artwork-image-container"
        >
          <div className="artwork-image-glow"></div>
          <div className="artwork-image-shadow"></div>
          
          <div className="artwork-image-inner-wrapper">
            <img 
              src={props.album.artworkUrl} 
              alt={props.album.name}
              className="artwork-image-element"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('picsum') && props.album) {
                  target.src = `https://picsum.photos/seed/${encodeURIComponent(props.album.name + props.album.artist)}/800/800`;
                }
              }}
            />
            
            <div className="artwork-play-button-overlay">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  props.onLaunch();
                }}
                className="artwork-play-button"
              >
                <svg className="artwork-play-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="artwork-meta-layout">
          <h2 className="artwork-title">{props.album.name}</h2>
          <p className="artwork-artist">{props.album.artist}</p>
          
          <div className="flex items-center justify-center gap-3">
            <div className="artwork-badge-container">
              <span className="artwork-badge-text">{props.album.releaseYear}</span>
              <div className="artwork-badge-dot"></div>
              <span className="artwork-badge-text">{props.album.genre}</span>
            </div>

            <button 
              onClick={(e) => {
                  e.stopPropagation();
                  props.onRefresh();
              }}
              className={`artwork-meta-refresh-btn has-tooltip tooltip-right-align ${props.isLoading ? 'is-loading' : ''}`}
              title="Refresh Metadata"
            >
              <RefreshCw size={12} className={`refresh-icon ${props.isLoading ? 'animate-spin' : ''}`} />
              <div className="tooltip">Sync artwork & info with current filter context</div>
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtworkView;
