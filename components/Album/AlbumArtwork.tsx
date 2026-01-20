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
      <GlassCard className="flex flex-col items-center justify-center min-h-[420px]">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-14 h-14 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-14 h-14 border-2 border-transparent border-b-indigo-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
          </div>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing catalog...</p>
        </div>
      </GlassCard>
    );
  }

  if (!album) {
    return (
      <GlassCard className="flex flex-col items-center justify-center min-h-[420px]">
        <div className="text-white/10 text-center px-10">
          <svg className="w-14 h-14 mx-auto mb-6 opacity-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <p className="font-black uppercase tracking-[0.3em] text-[8px] leading-loose opacity-30 italic">Initialize Shuffle Engine</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      className="flex flex-col items-center justify-center relative !overflow-visible min-h-[460px]"
      imageUrl={album.artworkUrl}
    >
      <div className="relative z-10 w-full flex flex-col items-center">
        <div 
          key={album.id} 
          className="w-[310px] h-[310px] mb-10 relative group/art animate-album-plunge"
        >
          <div className="absolute -inset-2 bg-black/30 blur-2xl rounded-[2.5rem] -z-10 opacity-70"></div>
          <div className="absolute inset-6 bg-black/50 blur-3xl rounded-[2rem] -z-10"></div>
          
          <div className="w-full h-full relative overflow-hidden rounded-[1.25rem] border border-white/10 transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/art:scale-[1.03] group-hover/art:border-white/20">
            <img 
              src={album.artworkUrl} 
              alt={album.name}
              className="w-full h-full object-cover transition-all duration-400 group-hover/art:brightness-[0.25] group-hover/art:scale-105 group-hover/art:blur-[1px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('picsum')) {
                  target.src = `https://picsum.photos/seed/${encodeURIComponent(album.name + album.artist)}/800/800`;
                }
              }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/art:opacity-100 transition-all duration-500 transform translate-y-6 group-hover/art:translate-y-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunch();
                }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white glass-button-base bg-white/[0.15] border-white/40 hover:bg-white/[0.25] hover:scale-110 active:scale-90"
              >
                <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center w-full max-w-sm px-6">
          <h2 className="text-xl md:text-2xl font-black mb-1.5 leading-tight tracking-tighter line-clamp-2 drop-shadow-2xl text-white uppercase italic">{album.name}</h2>
          <p className="text-blue-400/90 font-black mb-6 tracking-[0.25em] uppercase text-[10px] drop-shadow-lg">{album.artist}</p>
          <div className="flex items-center justify-center gap-4 py-2 px-6 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-[40px] inline-flex mx-auto saturate-[180%]">
            <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">{album.releaseYear}</span>
            <div className="w-0.5 h-0.5 bg-white/10 rounded-full"></div>
            <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">{album.genre}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AlbumArtwork;