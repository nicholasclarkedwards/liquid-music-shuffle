import React from 'react';
import { AlbumArtworkViewProperties } from './albumArtworkProps';
import GlassCard from '../../Common/GlassCard';

const AlbumArtworkView: React.FC<AlbumArtworkViewProperties> = (props) => {
  if (props.isLoading) {
    return (
      <GlassCard className="artwork-card-base">
        <div className="artwork-loading-wrapper">
          <div className="relative">
            <div className="artwork-loading-spinner-outer"></div>
            <div className="artwork-loading-spinner-inner"></div>
          </div>
          <p className="artwork-loading-text">Syncing catalog...</p>
        </div>
      </GlassCard>
    );
  }

  if (!props.album) {
    return (
      <GlassCard className="artwork-card-base">
        <div className="text-white/10 text-center px-10">
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
      <div className="relative z-10 w-full flex flex-col items-center">
        <div 
          key={props.album.id} 
          className="artwork-image-container"
        >
          <div className="artwork-image-glow"></div>
          <div className="absolute inset-6 bg-black/50 blur-3xl rounded-[2rem] -z-10"></div>
          
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
                <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center w-full max-w-sm px-6">
          <h2 className="artwork-title">{props.album.name}</h2>
          <p className="artwork-artist">{props.album.artist}</p>
          <div className="artwork-badge-container">
            <span className="artwork-badge-text">{props.album.releaseYear}</span>
            <div className="artwork-badge-dot"></div>
            <span className="artwork-badge-text">{props.album.genre}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtworkView;