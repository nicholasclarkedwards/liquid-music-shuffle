import React, { useState, useEffect } from 'react';
import { AlbumArtworkViewProperties } from './albumArtworkProps';
import { GlassCard } from '../../Common';
import { Heart, RefreshCw } from 'lucide-react';
import { getHeartedIds, toggleHearted } from '../../../services/musicService';

const AlbumArtworkView: React.FC<AlbumArtworkViewProperties> = (props) => {
  const [isHearted, setIsHearted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRefreshing || props.isLoading) return;
    setIsRefreshing(true);
    requestAnimationFrame(() => {
      props.onRefresh();
      setTimeout(() => setIsRefreshing(false), 800);
    });
  };

  if (props.isLoading && !isRefreshing) {
    return (
      <GlassCard className="artwork-card-base">
        <div className="artwork-loading-wrapper">
          <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="w-full h-full bg-white animate-[pulse_1s_infinite]"></div>
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
          <svg className="artwork-empty-icon text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <p className="artwork-empty-text">Initialize Shuffle Engine</p>
        </div>
      </GlassCard>
    );
  }

  const titleWords = props.album.name.split(' ');
  const lastWord = titleWords.pop() || '';
  const leadingText = titleWords.length > 0 ? titleWords.join(' ') + ' ' : '';
  const heartActive = isHearted || isHovered;

  return (
    <GlassCard className="artwork-card-active" imageUrl={props.album.artworkUrl}>
      <div className="artwork-main-layout">
        <div key={props.album.id} className="artwork-image-container">
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
              <button onClick={(e) => { e.stopPropagation(); props.onLaunch(); }} className="artwork-play-button">
                <svg className="artwork-play-svg text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="artwork-meta-layout">
          <h2 className="artwork-title">
            {leadingText}
            <span className="heart-wrap-prevention">
              {lastWord}
              <button 
                onClick={handleHeartClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`heart-btn inline-flex ml-2 align-middle transition-all duration-300 ${heartActive ? 'scale-110' : 'opacity-40'} ${isPopping ? 'heart-pop-anim' : ''}`}
              >
                <Heart 
                  size={24} 
                  fill={heartActive ? "currentColor" : "none"} 
                  className={heartActive ? "text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" : "text-white"} 
                  strokeWidth={2.5}
                />
              </button>
            </span>
          </h2>
          <p className="artwork-artist">{props.album.artist}</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="artwork-badge-container">
              <span className="artwork-badge-text">{props.album.releaseYear}</span>
              <div className="artwork-badge-dot"></div>
              <span className="artwork-badge-text">{props.album.genre}</span>
            </div>
            <button onClick={handleRefreshClick} disabled={props.isLoading} className={`heart-btn flex-shrink-0 ${isRefreshing ? 'animate-spin opacity-100' : 'opacity-40 hover:opacity-100'}`}>
              <RefreshCw size={20} className="text-white transition-colors" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtworkView;