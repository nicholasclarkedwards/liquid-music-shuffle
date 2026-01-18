import React, { useState, useEffect } from 'react';
import { Album } from '../../types';
import GlassCard from '../Common/GlassCard';

interface AlbumArtworkProps {
  album: Album | null;
  isLoading: boolean;
  onLaunch: () => void;
}

const AlbumArtwork: React.FC<AlbumArtworkProps> = ({ album, isLoading, onLaunch }) => {
  const [showBg, setShowBg] = useState(false);

  useEffect(() => {
    if (album && !isLoading) {
      setShowBg(false);
      const timer = setTimeout(() => setShowBg(true), 1500); 
      return () => clearTimeout(timer);
    } else {
      setShowBg(false);
    }
  }, [album, isLoading]);

  if (isLoading) {
    return (
      <GlassCard className="flex flex-col items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-b-indigo-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
          </div>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest animate-pulse">Scanning Library...</p>
        </div>
      </GlassCard>
    );
  }

  if (!album) {
    return (
      <GlassCard className="flex flex-col items-center justify-center min-h-[320px]">
        <div className="text-white/20 text-center px-10">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V7h2v9zm4 0h-2V7h2v9z"/></svg>
          <p className="font-bold uppercase tracking-[0.2em] text-[9px] leading-loose">Select criteria and trigger shuffle</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col items-center justify-center relative !overflow-visible">
      <div 
        key={`bg-${album.id}`}
        className={`absolute inset-0 bg-center bg-cover blur-3xl scale-125 transition-opacity duration-1000 pointer-events-none rounded-[2rem] overflow-hidden ${showBg ? 'opacity-25' : 'opacity-0'}`}
        style={{ backgroundImage: `url(${album.artworkUrl})` }}
      ></div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div 
          key={album.id} 
          className="w-full max-w-[300px] aspect-square mb-6 relative group/art animate-album-plunge"
        >
          <div className="w-full h-full relative overflow-hidden rounded-[2rem] border border-white/10 transition-transform duration-500 ease-out group-hover/art:scale-[1.02]">
            <img 
              src={album.artworkUrl} 
              alt={album.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover/art:brightness-[0.4] group-hover/art:blur-[2px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('picsum')) {
                  target.src = `https://picsum.photos/seed/${encodeURIComponent(album.name + album.artist)}/600/600`;
                }
              }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/art:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/art:translate-y-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunch();
                }}
                className="play-button-glass w-16 h-16 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center w-full max-w-sm px-4">
          <h2 className="text-xl md:text-2xl font-black mb-1 leading-tight tracking-tight line-clamp-2 drop-shadow-2xl uppercase italic">{album.name}</h2>
          <p className="text-blue-400 font-bold mb-4 tracking-wider uppercase text-[10px] md:text-xs opacity-90">{album.artist}</p>
          <div className="flex items-center justify-center gap-3 py-1.5 px-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl inline-flex mx-auto">
            <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest">{album.releaseYear}</span>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest">{album.genre}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtwork;