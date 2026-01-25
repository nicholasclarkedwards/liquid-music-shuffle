
import React, { useState, useEffect } from 'react';
import { Album } from '../../types';
import { hydrateAlbum, getHeartedIds, toggleHearted, getRating, setRating } from '../../services/musicService';
import { GlassCard } from '../../components/Common';
import { Heart, Star } from 'lucide-react';

interface LibraryItemProps { 
  entry: any; 
  layout?: 'grid' | 'list';
  onClick?: (album: Album) => void;
}

const StarRating = ({ rating, onRate }: { rating: number, onRate: (r: number) => void }) => {
  const [hover, setHover] = useState(0);
  const [animatingRating, setAnimatingRating] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  const handleClick = (e: React.MouseEvent, s: number) => {
    e.stopPropagation();
    onRate(s);
    setAnimatingRating(s);
    setIsBusy(true);
    // Wait for the full stagger animation cycle to finish before clearing busy state
    setTimeout(() => {
      setIsBusy(false);
      setAnimatingRating(0);
    }, 1000);
  };

  return (
    <div className="flex gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map((s) => {
        // Only show persistent yellow if NOT busy with animation
        const isActive = !isBusy && (s <= rating || s <= hover);
        const isAnimating = isBusy && s <= animatingRating;
        
        return (
          <button
            key={s}
            onClick={(e) => handleClick(e, s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className={`star-btn transform active:scale-150 ${isActive ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-white/20'} ${isAnimating ? 'star-sequence-anim' : ''}`}
            style={{ 
              animationDelay: isAnimating ? `${s * 50}ms` : '0ms'
            }}
          >
            <Star 
              size={8} 
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

const LibraryItem: React.FC<LibraryItemProps> = ({ entry, layout = 'grid', onClick }) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHearted, setIsHearted] = useState(false);
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
          setLoading(false);
        }
      } catch (e) { if (isMounted) setLoading(false); }
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

  const handleRate = (r: number) => {
    if (!album) return;
    setRating(album.id, r);
    setLocalRating(r);
  };

  const isList = layout === 'list';

  if (isList) {
    return (
      <div 
        className="library-list-row group relative animate-fade-in-up cursor-pointer"
        onClick={() => album && onClick?.(album)}
      >
        <GlassCard className="list-row-card p-2 !min-h-0" imageUrl={album?.artworkUrl}>
          <div className="flex items-center gap-3 w-full">
             <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-white/5">
                {album?.artworkUrl ? (
                  <img src={album.artworkUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><div className="w-4 h-[1px] bg-white/10 animate-pulse"></div></div>
                )}
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center min-w-0">
                    <h4 className="item-title truncate text-[12px] font-bold uppercase italic leading-tight text-white flex items-center">
                      {album?.name || entry.Title || "Unknown"}
                      <button 
                        onClick={handleHeartClick}
                        className={`heart-btn ml-1.5 flex-shrink-0 ${isHearted ? 'is-active scale-110' : 'opacity-30 group-hover:opacity-100'} ${isPopping ? 'heart-pop-anim' : ''}`}
                      >
                        <Heart 
                          size={12} 
                          fill={isHearted ? "currentColor" : "rgba(255,255,255,0.05)"} 
                          className={isHearted ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-white/60"} 
                          strokeWidth={2.5}
                        />
                      </button>
                    </h4>
                  </div>
                  <StarRating rating={rating} onRate={handleRate} />
                </div>
                <div className="flex items-center gap-2 opacity-50 text-[9px] font-bold">
                  <span className="text-blue-400 truncate">{album?.artist || "Resolving..."}</span>
                  {album && <><span className="w-0.5 h-0.5 bg-white/40 rounded-full"></span><span>{album.releaseYear}</span></>}
                </div>
             </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div 
      className="library-grid-tile group relative animate-fade-in-up has-tooltip cursor-pointer"
      onClick={() => album && onClick?.(album)}
    >
      <div className="artwork-aspect-box relative aspect-square w-full rounded-2xl overflow-hidden mb-3 shadow-2xl bg-white/5 border border-white/5">
         {album?.artworkUrl ? (
            <img src={album.artworkUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-[1px] bg-white/10 animate-pulse"></div></div>
          )}
      </div>

      <div className="meta-wrapper px-1 min-h-[3rem]">
        <div className="flex items-start">
          <h4 className="item-title text-[11px] font-black uppercase italic leading-tight text-white line-clamp-2 flex-1">
            {album?.name || entry.Title || "Unknown"}
            <button 
              onClick={handleHeartClick}
              className={`heart-btn ml-1.5 flex-shrink-0 ${isHearted ? 'is-active' : 'opacity-30 group-hover:opacity-100'} ${isPopping ? 'heart-pop-anim' : ''}`}
            >
              <Heart 
                size={10} 
                fill={isHearted ? "currentColor" : "rgba(255,255,255,0.05)"} 
                className={isHearted ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-white/60"} 
                strokeWidth={2.5}
              />
            </button>
          </h4>
        </div>
        <p className="item-artist truncate text-[9px] font-bold text-blue-400/80">
          {album?.artist || "Resolving..."}
        </p>
        <StarRating rating={rating} onRate={handleRate} />
      </div>

      {album?.description && (
        <div className="tooltip !normal-case !text-[9px] !font-medium !text-left !max-w-[200px] !tracking-normal">
          {album.description}
        </div>
      )}
    </div>
  );
};

export default LibraryItem;
