import React, { useState, useEffect } from 'react';
import { Album, Track } from '../../types';
import { ArrowLeft, Heart, Music, MessageSquareText, Save } from 'lucide-react';
import { getTrackHeartedIds, toggleTrackHearted, getRating, setRating, getHeartedIds, toggleHearted, getAlbumReview, setAlbumReview } from '../../services/musicService';
import { GlassCard, StarRating } from '../../components/Common';
import { toast } from 'react-hot-toast';
import './albumDetailView.css';

interface AlbumDetailViewProps {
  album: Album;
  onBack: () => void;
}

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
          <StarRating rating={rating} onRate={handleRate} size="sm" />
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
  const [review, setReview] = useState(getAlbumReview(album.id));
  const [isSaving, setIsSaving] = useState(false);

  const handleAlbumRate = (r: number) => {
    setRating(album.id, r);
    setAlbumRating(r);
  };

  const handleHeartClick = () => {
    setIsHearted(toggleHearted(album.id));
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 450);
  };

  const handleSaveReview = () => {
    setIsSaving(true);
    setAlbumReview(album.id, review);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Analysis Archived.", {
        className: 'glass-toast-base glass-toast-success',
        position: 'top-center'
      });
    }, 600);
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
            
            <div className="flex flex-wrap gap-8 items-start">
                <div className="detail-rating-section">
                  <p className="detail-rating-label">Album Rating</p>
                  <StarRating rating={albumRating} onRate={handleAlbumRate} size="lg" />
                </div>
            </div>

            <div className="detail-review-section mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="detail-rating-label !mb-0 flex items-center gap-2">
                    <MessageSquareText size={10} />
                    Album Thoughts
                  </p>
                  <div className="has-tooltip">
                    <button 
                      onClick={handleSaveReview}
                      disabled={isSaving}
                      className={`detail-save-review-btn ${isSaving ? 'opacity-40' : 'opacity-100 hover:text-blue-400'}`}
                    >
                      <Save size={12} className={isSaving ? 'animate-pulse' : ''} />
                      <span>{isSaving ? 'Archiving...' : 'Save Notes'}</span>
                    </button>
                    <div className="tooltip !text-[8px] !max-w-[200px] !tracking-normal">
                      Notes are safely stored in your browser's local storage for your next visit.
                    </div>
                  </div>
                </div>
                <div className="review-textarea-wrapper liquid-glass">
                  <textarea 
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="I really enjoyed... I thought this album was..."
                    className="detail-review-textarea custom-glass-scrollbar"
                  />
                </div>
            </div>

            {album.description && (
              <div className="detail-description-wrapper custom-glass-scrollbar mt-8">
                <p className="detail-rating-label">Editorial Perspective</p>
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