
import React, { useState, useEffect } from 'react';
import { AlbumArtworkViewProperties } from './albumArtworkProps';
import { GlassCard } from '../../Common';
import { Heart, Shuffle } from 'lucide-react';
import { getHeartedIds, toggleHearted } from '../../../services/musicService';

const AlbumArtworkView: React.FC<AlbumArtworkViewProperties> = (props) => {
  const [isHearted, setIsHearted] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    if (props.album) {
      setIsHearted(getHeartedIds().has(props.album.id));
    }
  }, [props.album]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!props.album) return;
    const newState = toggleHearted(props.album.id);
    setIsHearted(newState);
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 450);
  };

  const handleShuffleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShuffling) return;
    setIsShuffling(true);
    props.onRefresh();
    setTimeout(() => setIsShuffling(false), 600);
  };

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
          <h2 className="artwork-title">
            {props.album.name}
            <button 
              onClick={handleHeartClick}
              className={`heart-btn inline-flex ml-2 align-middle ${isHearted ? 'is-active' : 'opacity-40'} ${isPopping ? 'heart-pop-anim' : ''}`}
            >
              <Heart 
                size={26} 
                fill={isHearted ? "currentColor" : "rgba(255,255,255,0.05)"} 
                className={`${isHearted ? "text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" : "text-white/80"}`} 
                strokeWidth={2.5}
              />
            </button>
          </h2>
          <p className="artwork-artist">{props.album.artist}</p>
          
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="artwork-badge-container">
                <span className="artwork-badge-text">{props.album.releaseYear}</span>
                <div className="artwork-badge-dot"></div>
                <span className="artwork-badge-text">{props.album.genre}</span>
              </div>

              <button 
                onClick={handleShuffleClick}
                className={`heart-btn flex-shrink-0 ${isShuffling ? 'shuffle-pop-anim opacity-100' : 'opacity-40 hover:opacity-80'}`}
              >
                <Shuffle 
                  size={22} 
                  className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]" 
                  strokeWidth={3}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtworkView;
