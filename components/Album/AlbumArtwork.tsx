import React from 'react';
import { Album } from '../../types';
import GlassCard from '../Common/GlassCard';

interface AlbumArtworkProps {
  album: Album | null;
  isLoading: boolean;
  onLaunch: () => void;
}

const AlbumArtwork: React.FC<AlbumArtworkProps> = ({ album, isLoading, onLaunch }) => {
  if (isLoading) {
    return (
      <GlassCard className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-b-indigo-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing catalog...</p>
        </div>
      </GlassCard>
    );
  }

  if (!album) {
    return (
      <GlassCard className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-white/20 text-center px-10">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V7h2v9zm4 0h-2V7h2v9z"/></svg>
          <p className="font-bold uppercase tracking-[0.2em] text-[9px] leading-loose">Select criteria and trigger shuffle</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col items-center justify-center relative overflow-hidden group">
      <div 
        className="absolute inset-0 bg-center bg-cover opacity-30 blur-3xl scale-150 transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${album.artworkUrl})` }}
      ></div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full max-w-[340px] aspect-square mb-8 relative group">
          <img 
            key={album.artworkUrl}
            src={album.artworkUrl} 
            alt={album.name}
            className="w-full h-full object-cover rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-white/10 transform transition-all duration-700 group-hover:scale-[1.03]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('picsum')) {
                target.src = `https://picsum.photos/seed/${encodeURIComponent(album.name + album.artist)}/600/600`;
              }
            }}
          />
          
          <button 
            onClick={onLaunch}
            className="absolute bottom-6 right-6 p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 has-tooltip"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            <div className="tooltip">Launch Apple Music</div>
          </button>
        </div>

        <div className="text-center w-full max-w-sm px-4">
          <h2 className="text-2xl md:text-3xl font-black mb-1 leading-tight tracking-tight line-clamp-2 drop-shadow-2xl">{album.name}</h2>
          <p className="text-blue-400 font-bold mb-4 tracking-wide uppercase text-xs md:text-sm">{album.artist}</p>
          <div className="flex items-center justify-center gap-4 py-2 px-5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md inline-flex mx-auto">
            <span className="text-white/60 text-[9px] font-black uppercase tracking-widest">{album.releaseYear}</span>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <span className="text-white/60 text-[9px] font-black uppercase tracking-widest">{album.genre}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtwork;