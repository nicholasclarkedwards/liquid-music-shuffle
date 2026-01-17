
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
      <GlassCard className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
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
      <GlassCard className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
        <div className="text-white/20 text-center px-10">
          <svg className="w-16 h-16 mx-auto mb-6 opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V7h2v9zm4 0h-2V7h2v9z"/></svg>
          <p className="font-bold uppercase tracking-[0.2em] text-xs leading-loose">Select your filters and hit shuffle to pull an album from the Apple Music cloud.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex-1 flex flex-col items-center justify-center relative overflow-hidden group min-h-[450px]">
      <div 
        className="absolute inset-0 bg-center bg-cover opacity-30 blur-3xl scale-150 transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${album.artworkUrl})` }}
      ></div>
      <div className="relative z-10 w-full flex flex-col items-center p-4">
        <div className="w-full aspect-square max-w-[320px] mb-8 relative">
          <div className="absolute -inset-6 bg-blue-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <img 
            key={album.artworkUrl}
            src={album.artworkUrl} 
            alt={album.name}
            className="w-full h-full object-cover rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transform transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('picsum')) {
                target.src = `https://picsum.photos/seed/${encodeURIComponent(album.name + album.artist)}/600/600`;
              }
            }}
          />
        </div>
        <div className="text-center w-full max-w-sm">
          <h2 className="text-3xl font-black mb-2 leading-tight tracking-tight line-clamp-2 drop-shadow-lg">{album.name}</h2>
          <p className="text-blue-400 font-bold text-xl mb-4 tracking-tight uppercase text-sm">{album.artist}</p>
          <div className="flex items-center justify-center gap-4 py-2 px-4 rounded-full bg-white/5 border border-white/5 backdrop-blur-md inline-flex mx-auto">
            <span className="text-white/60 text-[11px] font-black uppercase tracking-widest">{album.releaseYear}</span>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <span className="text-white/60 text-[11px] font-black uppercase tracking-widest">{album.genre}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtwork;
