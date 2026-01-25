
import React, { useState, useEffect } from 'react';
import { Album, Track } from '../../types';
import { ArrowLeft, Heart, Star, Music } from 'lucide-react';
import { getTrackHeartedIds, toggleTrackHearted, getRating, setRating, getHeartedIds, toggleHearted } from '../../services/musicService';
import { GlassCard } from '../../components/Common';
import './albumDetailView.css';

interface AlbumDetailViewProps {
  album: Album;
  onBack: () => void;
}

const StarRating = ({ rating, onRate }: { rating: number, onRate: (r: number) => void }) => {
  const [hover, setHover] = useState(0);
  const [animatingRating, setAnimatingRating] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  const handleClick = (s: number) => {
    onRate(s);
    setAnimatingRating(s);
    setIsBusy(true);
    setTimeout(() => {
      setIsBusy(false);
      setAnimatingRating(0);
    }, 1200);
  };

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => {
        // Show persistent yellow only when not busy animating
        const isActive = !isBusy && (s <= rating || s <= hover);
        const isAnimating = isBusy && s <= animatingRating;
        
        return (
          <button
            key={s}
            onClick={() => handleClick(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className={`star-btn transform active:scale-150 ${isActive ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]' : 'text-white/30'} ${isAnimating ? 'star-sequence-anim' : ''}`}
            style={{ 
              animationDelay: isAnimating ? `${s * 70}ms` : '0ms'
            }}
          >
            <Star 
              size={18} 
              fill={isActive || isAnimating ? "currentColor" : "rgba(255,255,255,0.05)"} 
              strokeWidth={2.5} 
              className="will-change-transform"
            />
          </button>
        );
      })}
    </div>
  );
};

const TrackItem = ({ track }: { track: Track }) => {
  const [isHearted, setIsHearted] = useState(getTrackHeartedIds().has(track.id));
  const [isPopping, setIsPopping] = useState(false);
  const [rating, setLocalRating] = useState(getRating(track.id));

  const handleHeart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHearted(toggleTrackHearted(track.id));
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 450);
  };

  const handleRate = (r: number) => {
    setRating(track.id, r);
    setLocalRating(r);
  };

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = ((ms % 60000) / 1000).toFixed(0);
    return `${mins}:${Number(secs) < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="track-row group">
      <div className="track-number">{track.trackNumber}</div>
      <div className="track-info">
        <span className="track-name">{track.name}</span>
        <span className="track-duration">{formatTime(track.durationMs)}</span>
      </div>
      <div className="track-actions">
        <div className="track-stars">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => handleRate(s)} className={`star-btn p-0.5 transition-all active:scale-150 ${s <= rating ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]' : 'text-white/20'}`}>
              <Star size={10} fill={s <= rating ? "currentColor" : "rgba(255,255,255,0.05)"} strokeWidth={2.5} />
            </button>
          ))}
        </div>
        <button 
          onClick={handleHeart}
          className={`heart-btn ${isHearted ? 'is-active' : 'opacity-40 group-hover:opacity-100'} ${isPopping ? 'heart-pop-anim' : ''}`}
        >
          <Heart 
            size={14} 
            fill={isHearted ? "currentColor" : "rgba(255,255,255,0.05)"} 
            className={isHearted ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-white/60"} 
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
};

const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ album, onBack }) => {
  const [albumRating, setAlbumRating] = useState(getRating(album.id));
  const [isHearted, setIsHearted] = useState(getHeartedIds().has(album.id));
  const [isPopping, setIsPopping] = useState(false);

  const handleAlbumRate = (r: number) => {
    setRating(album.id, r);
    setAlbumRating(r);
  };

  const handleHeartClick = () => {
    setIsHearted(toggleHearted(album.id));
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 450);
  };

  return (
    <div className="album-detail-container custom-glass-scrollbar">
      <header className="detail-header">
        <button onClick={onBack} className="detail-back-btn glass-button-base">
          <ArrowLeft size={14} />
          <span>Collection</span>
        </button>
      </header>

      <main className="detail-main">
        <div className="detail-hero">
          <div className="detail-artwork-wrapper">
            <img src={album.artworkUrl} alt={album.name} className="detail-artwork" />
          </div>
          <div className="detail-info">
            <div className="detail-meta-top">
              <span className="detail-year">{album.releaseYear}</span>
              <span className="detail-genre">{album.genre}</span>
            </div>
            <div className="mb-2">
              <h1 className="detail-title">
                {album.name}
                <button 
                  onClick={handleHeartClick}
                  className={`heart-btn inline-flex ml-3 align-middle ${isHearted ? 'is-active' : 'opacity-40'} ${isPopping ? 'heart-pop-anim' : ''}`}
                >
                  <Heart 
                    size={28} 
                    fill={isHearted ? "currentColor" : "rgba(255,255,255,0.05)"} 
                    className={isHearted ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "text-white/80"} 
                    strokeWidth={2.5}
                  />
                </button>
              </h1>
            </div>
            <p className="detail-artist">{album.artist}</p>
            
            <div className="detail-rating-section">
              <p className="detail-rating-label">Album Rating</p>
              <StarRating rating={albumRating} onRate={handleAlbumRate} />
            </div>

            {album.description && (
              <div className="detail-description-wrapper custom-glass-scrollbar">
                <p className="detail-description">{album.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="tracklist-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="tracklist-title">
              <Music size={14} />
              Tracklist
            </h3>
          </div>
          <div className="tracklist-container">
            {album.tracks ? album.tracks.map(track => (
              <TrackItem key={track.id} track={track} />
            )) : (
              <div className="tracklist-empty">
                <p>No tracklist metadata available.</p>
                <button 
                  onClick={() => window.open(album.appleMusicUrl, '_blank')}
                  className="mt-4 glass-button-base px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
                >
                  View on Apple Music
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlbumDetailView;
