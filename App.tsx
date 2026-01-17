import React, { useState, useEffect } from 'react';
import { Filters, DiscoveryMode } from './types';
import { useAlbumDiscovery } from './hooks/useAlbumDiscovery';
import GlassCard from './components/Common/GlassCard';
import Background from './components/Common/Background';
import FilterPanel from './components/FilterPanel';
import AlbumArtwork from './components/Album/AlbumArtwork';
import ShuffleControls from './components/Controls/ShuffleControls';
import InfoIcon from './components/Common/InfoIcon';
import { Toaster, toast } from 'react-hot-toast';

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    decade: '',
    year: '',
    month: '',
    genre: '',
    artist: '',
  });

  const [persistentBg, setPersistentBg] = useState<string | undefined>(undefined);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { fetchRandomAlbum, currentAlbum, isLoading, error } = useAlbumDiscovery(filters);

  useEffect(() => {
    fetchRandomAlbum(DiscoveryMode.LIBRARY);
  }, []);

  // Sync Global Background Fade with the Plunge animation
  useEffect(() => {
    if (isLoading) {
      setIsTransitioning(true);
      setPersistentBg(undefined);
    } else if (currentAlbum?.artworkUrl) {
      // Keep background hidden until plunge is well underway
      const timer = setTimeout(() => {
        setPersistentBg(currentAlbum.artworkUrl);
        setIsTransitioning(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentAlbum, isLoading]);

  // Trigger glassy toast when errors occur
  useEffect(() => {
    if (error) {
      toast.error(error, {
        className: 'glass-toast',
        duration: 4000,
        position: 'bottom-center'
      });
    }
  }, [error]);

  const openAppleMusic = () => {
    if (currentAlbum?.appleMusicUrl) {
      window.open(currentAlbum.appleMusicUrl, '_blank');
    }
  };

  const resetFilters = () => {
    setFilters({ decade: '', year: '', month: '', genre: '', artist: '' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 relative overflow-x-hidden">
      <Toaster />
      <div className="w-full max-w-md z-10 animate-fade-in py-4">
        <div className="flex flex-col gap-4 w-full">
          
          {/* Top: Album Artwork Card */}
          <div className="w-full">
            <AlbumArtwork 
              album={currentAlbum} 
              isLoading={isLoading} 
              onLaunch={openAppleMusic} 
            />
          </div>

          {/* Bottom: Filters Card */}
          <div className="w-full">
            <GlassCard 
              className="w-full" 
              bgImageUrl={isTransitioning ? undefined : persistentBg}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-black tracking-tight flex items-center gap-2 text-white uppercase leading-none">
                    Filters
                    <InfoIcon text="Refine your projects shuffle from your verified library." />
                  </h3>
                  <p className="text-[7px] text-white/30 font-bold uppercase tracking-widest leading-none">Pool Configuration</p>
                </div>
                <button 
                  onClick={resetFilters}
                  className="text-[7px] font-black text-white/40 hover:text-white transition-all tracking-[0.2em] px-2.5 py-1 rounded-full hover:bg-white/10 border border-white/5 active:scale-95"
                >
                  RESET
                </button>
              </div>

              <FilterPanel filters={filters} setFilters={setFilters} />

              <div className="mt-5 pt-4 border-t border-white/5">
                <ShuffleControls 
                  onShuffle={fetchRandomAlbum}
                  isLoading={isLoading}
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
      <Background />
    </div>
  );
};

export default App;