import React, { useState, useEffect } from 'react';
import { Album } from '../../types';
import { hydrateAlbum, getHeartedIds, toggleHearted, getRating, setRating } from '../../services/musicService';
import { GlassCard, StarRating } from '../../components/Common';
import { Heart } from 'lucide-react';

interface LibraryItemProps { 
  entry: any; 
  layout?: 'grid' | 'list';
  onClick?: (album: Album) => void;
}

const LibraryItem: React.FC<LibraryItemProps> = ({ entry, layout = 'grid', onClick }) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [isHearted, setIsHearted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [rating, setLocalRating] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await hydrateAlbum(entry);
        if (isMounted) {
          setAlbum(data);
          setIsHearted(getHeartedIds().has(data.id));
          setLocalRating(getRating(data.id));
        }
      } catch (e) {}
    };
    load();
    return () => { isMounted = false; };
  }, [entry]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!album) return;
    setIsHearted(toggleHearted(album.id));
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 450);
  };

  const heartActive = isHearted || isHovered;

  if (layout === 'list') {
    return (
      <div className="library-list-row group relative animate-fade-in-up cursor-pointer" onClick={() => album && onClick?.(album)}>
        <GlassCard className="list-row-card p-2 !min-h-0" imageUrl={album?.artworkUrl}>
          <div className="flex items-center gap-3 w-full">
             <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-white/5">
                {album?.artworkUrl && <img src={album.artworkUrl} alt="" className="w-full h-full object-cover" />}
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="item-title truncate text-[12px] font-bold uppercase italic text-white flex items-center">
                    {album?.name || entry.Title || "Unknown"}
                    <button 
                      onClick={handleHeartClick}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className={`heart-btn ml-1.5 flex-shrink-0 transition-all ${heartActive ? 'scale-110 opacity-100' : 'opacity-30 group-hover:opacity-100'} ${isPopping ? 'heart-pop-anim' : ''}`}
                    >
                      <Heart size={14} fill={heartActive ? "currentColor" : "none"} className={heartActive ? "text-red-500" : "text-white"} strokeWidth={2.5} />
                    </button>
                  </h4>
                  <StarRating rating={rating} onRate={(r) => { if (album) { setRating(album.id, r); setLocalRating(r); } }} size="sm" />
                </div>
                <div className="flex items-center gap-2 opacity-50 text-[9px] font-bold">
                  <span className="text-white/60 truncate">{album?.artist || "Resolving..."}</span>
                </div>
             </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="library-grid-tile group relative animate-fade-in-up has-tooltip cursor-pointer" onClick={() => album && onClick?.(album)}>
      <div className="artwork-aspect-box relative aspect-square w-full rounded-2xl overflow-hidden mb-3 shadow-2xl bg-white/5 border border-white/5">
         {album?.artworkUrl && <img src={album.artworkUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
      </div>
      <div className="meta-wrapper px-1 min-h-[3rem]">
        <div className="flex items-start">
          <h4 className="item-title text-[11px] font-black uppercase italic leading-tight text-white line-clamp-2 flex-1">
            {album?.name || entry.Title || "Unknown"}
            <button 
              onClick={handleHeartClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`heart-btn ml-1.5 flex-shrink-0 transition-all ${heartActive ? 'scale-110 opacity-100' : 'opacity-30 group-hover:opacity-100'} ${isPopping ? 'heart-pop-anim' : ''}`}
            >
              <Heart size={12} fill={heartActive ? "currentColor" : "none"} className={heartActive ? "text-red-500" : "text-white"} strokeWidth={2.5} />
            </button>
          </h4>
        </div>
        <p className="item-artist truncate text-[9px] font-bold text-white/40 group-hover:text-white/80 transition-colors">{album?.artist || "Resolving..."}</p>
        <StarRating rating={rating} onRate={(r) => { if (album) { setRating(album.id, r); setLocalRating(r); } }} size="sm" className="mt-1" />
      </div>
    </div>
  );
};

export default LibraryItem;