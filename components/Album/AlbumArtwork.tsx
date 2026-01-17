import React from 'react';
import { Album } from '../../types';
import GlassCard from '../Common/GlassCard';

interface AlbumArtworkProps {
  album: Album | null;
  isLoading: boolean;
}

const AlbumArtwork: React.FC<AlbumArtworkProps> = ({ album, isLoading }) => {
  if (isLoading) {
    return (
      <GlassCard className="album-display">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-b-indigo-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
          </div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing catalog...</p>
        </div>
      </GlassCard>
    );
  }

  if (!album) {
    return (
      <GlassCard className="album-display">
        <div className="text-white/20 text-center px-10">
          <svg className="w-16 h-16 mx-auto mb-6 opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V7h2v9zm4 0h-2V7h2v9z"/></svg>
          <p className="font-bold uppercase tracking-[0.2em] text-xs leading-loose">Select your filters and hit shuffle to pull an album from the Apple Music cloud.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="album-display" bgImageUrl={album.artworkUrl}>
      <div className="artwork-container">
        <div className="artwork-glow"></div>
        <img 
          key={album.artworkUrl}
          src={album.artworkUrl} 
          alt={album.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('picsum')) {
              target.src = `https://picsum.photos/seed/${encodeURIComponent(album.name + album.artist)}/600/600`;
            }
          }}
        />
      </div>
      
      <div className="text-center w-full max-w-sm relative z-10">
        <h2 className="text-3xl font-black mb-2 leading-tight tracking-tight line-clamp-2 drop-shadow-lg">{album.name}</h2>
        <p className="text-blue-400 font-bold text-xl mb-4 tracking-tight uppercase text-sm">{album.artist}</p>
        
        <div className="meta-badges">
          <span>{album.releaseYear}</span>
          <div className="dot"></div>
          <span>{album.genre}</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtwork;