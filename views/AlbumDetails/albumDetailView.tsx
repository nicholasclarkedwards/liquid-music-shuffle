import React, { useState, useEffect } from 'react';
import { Album, Track } from '../../types';
import { ArrowLeft, Heart, Music, MessageSquareText, Save } from 'lucide-react';
import { getTrackHeartedIds, toggleTrackHearted, getRating, setRating, getHeartedIds, toggleHearted, getAlbumReview, setAlbumReview, getTrackReview, setTrackReview } from '../../services/musicService';
import { GlassCard, StarRating, ThoughtModal } from '../../components/Common';
import { toast } from 'react-hot-toast';
import './albumDetailView.css';

interface AlbumDetailViewProps {
  album: Album;
  onBack: () => void;
}

const TrackItem: React.FC<{ track: Track; artworkUrl: string }> = ({ track, artworkUrl }) => {
  const [isHearted, setIsHearted] = useState(getTrackHeartedIds().has(track.id));
  const [isHovered, setIsHovered] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [rating, setLocalRating] = useState(getRating(track.id));
  const [isThoughtModalOpen, setIsThoughtModalOpen] = useState(false);
  const [trackThoughts, setLocalTrackThoughts] = useState(getTrackReview(track.id));

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

  const handleSaveThoughts = (newThoughts: string) => {
    setTrackReview(track.id, newThoughts);
    setLocalTrackThoughts(newThoughts);
    toast.success("Track perspective archived.", {
      className: 'glass-toast-base glass-toast-success',
      position: 'top-center'
    });
    setIsThoughtModalOpen(false);
  };

  const heartActive = isHearted || isHovered;

  return (
    <div className="track-row group">
      <div className="track-number">{track.trackNumber}</div>
      <div className="track-info">
        <span className="track-name">{track.name}</span>
        <span className="track-duration">{Math.floor(track.durationMs / 60000)}:{( (track.durationMs % 60000) / 1000).toFixed(0).padStart(2, '0')}</span>
      </div>
      <div className="track-actions">
        <StarRating rating={rating} onRate={handleRate} size="sm" />
        <div className="flex items-center gap-1.5 ml-2">
          <button onClick={() => setIsThoughtModalOpen(true)} className={`heart-btn opacity-40 hover:opacity-100 transition-opacity ${trackThoughts ? 'text-white' : 'text-white/60'}`}>
            <MessageSquareText size={16} strokeWidth={2.5} fill={trackThoughts ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleHeart}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`heart-btn transition-all duration-300 ${heartActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100'} ${isPopping ? 'heart-pop-anim' : ''}`}
          >
            <Heart size={16} fill={heartActive ? "currentColor" : "none"} className={heartActive ? "text-red-500" : "text-white"} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <ThoughtModal isOpen={isThoughtModalOpen} title={track.name} initialThoughts={trackThoughts} artworkUrl={artworkUrl} onSave={handleSaveThoughts} onClose={() => setIsThoughtModalOpen(false)} />
    </div>
  );
};

const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ album, onBack }) => {
  const [albumRating, setAlbumRating] = useState(getRating(album.id));
  const [isHearted, setIsHearted] = useState(getHeartedIds().has(album.id));
  const [isHovered, setIsHovered] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [review, setReview] = useState(getAlbumReview(album.id));
  const [isSaving, setIsSaving] = useState(false);

  const handleHeartClick = () => {
    setIsHearted(toggleHearted(album.id));
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 450);
  };

  const heartActive = isHearted || isHovered;

  return (
    <div className="album-detail-container custom-glass-scrollbar">
      <header className="detail-header">
        <button onClick={onBack} className="detail-back-btn glass-button-base group">
          <ArrowLeft size={16} className="text-white/40 group-hover:text-white transition-colors" strokeWidth={2.5} />
          <span>Collection</span>
        </button>
      </header>
      <main className="detail-main">
        <div className="detail-hero">
          <div className="detail-artwork-wrapper">
            <img src={album.artworkUrl} alt={album.name} className="detail-artwork" />
          </div>
          <div className="detail-info">
            <div className="detail-meta-top"><span className="detail-year">{album.releaseYear}</span><span className="detail-genre">{album.genre}</span></div>
            <h1 className="detail-title">
              {album.name}
              <button 
                onClick={handleHeartClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`heart-btn inline-flex ml-3 align-middle transition-all duration-300 ${heartActive ? 'scale-110' : 'opacity-40'} ${isPopping ? 'heart-pop-anim' : ''}`}
              >
                <Heart size={32} fill={heartActive ? "currentColor" : "none"} className={heartActive ? "text-red-500" : "text-white"} strokeWidth={2.5} />
              </button>
            </h1>
            <p className="detail-artist">{album.artist}</p>
            <div className="detail-rating-section"><p className="detail-rating-label">Album Rating</p><StarRating rating={albumRating} onRate={(r) => { setRating(album.id, r); setAlbumRating(r); }} size="lg" /></div>
            <div className="detail-review-section mt-6">
              <div className="flex items-center justify-between mb-3"><p className="detail-rating-label !mb-0 flex items-center gap-2"><MessageSquareText size={12} className="text-white/40" strokeWidth={2.5} />Album Thoughts</p>
                <button onClick={() => { setIsSaving(true); setAlbumReview(album.id, review); setTimeout(() => { setIsSaving(false); toast.success("Analysis Archived."); }, 600); }} disabled={isSaving} className={`detail-save-review-btn ${isSaving ? 'opacity-40' : 'opacity-100 hover:text-white'}`}>
                  <Save size={14} className="text-white/40" strokeWidth={2.5} /><span>{isSaving ? 'Archiving...' : 'Save Notes'}</span>
                </button>
              </div>
              <div className="review-textarea-wrapper liquid-glass"><textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Type your thoughts..." className="detail-review-textarea custom-glass-scrollbar" /></div>
            </div>
            {album.description && (<div className="detail-description-wrapper custom-glass-scrollbar mt-8"><p className="detail-rating-label">Editorial Perspective</p><p className="detail-description">{album.description}</p></div>)}
          </div>
        </div>
        <div className="tracklist-section">
          <div className="flex items-center justify-between mb-4"><h3 className="tracklist-title"><Music size={16} className="text-white/40" strokeWidth={2.5} />Tracklist</h3></div>
          <div className="tracklist-container">{album.tracks?.map(track => (<TrackItem key={track.id} track={track} artworkUrl={album.artworkUrl} />)) || <div className="tracklist-empty"><p>No tracklist metadata available.</p></div>}</div>
        </div>
      </main>
    </div>
  );
};

export default AlbumDetailView;