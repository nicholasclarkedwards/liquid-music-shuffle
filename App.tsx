
import React, { useState, useEffect } from 'react';
import { Filters, DiscoveryMode } from './types';
import { useAlbumDiscovery } from './hooks/useAlbumDiscovery';
import GlassCard from './components/Common/GlassCard';
import Background from './components/Common/Background';
import FilterPanel from './components/FilterPanel';
import AlbumArtwork from './components/Album/AlbumArtwork';
import ShuffleControls from './components/Controls/ShuffleControls';
import InfoIcon from './components/Common/InfoIcon';

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    decade: '',
    year: '',
    month: '',
    genre: '',
    artist: '',
  });

  // Track a persistent background image to keep UI synced
  const [persistentBg, setPersistentBg] = useState<string | undefined>(undefined);

  const { fetchRandomAlbum, currentAlbum, isLoading, error } = useAlbumDiscovery(filters);

  // Initial load
  useEffect(() => {
    fetchRandomAlbum(DiscoveryMode.LIBRARY);
  }, []);

  // Sync background with album artwork, clearing immediately when loading starts
  useEffect(() => {
    if (isLoading) {
      setPersistentBg(undefined);
    } else if (currentAlbum?.artworkUrl) {
      setPersistentBg(currentAlbum.artworkUrl);
    }
  }, [currentAlbum, isLoading]);

  const openAppleMusic = () => {
    if (currentAlbum?.appleMusicUrl) {
      window.open(currentAlbum.appleMusicUrl, '_blank');
    }
  };

  const resetFilters = () => {
    setFilters({ decade: '', year: '', month: '', genre: '', artist: '' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="w-full max-w-6xl z-10 animate-fade-in flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Album Display Column */}
          <div className="lg:col-span-5 flex flex-col">
            <AlbumArtwork 
              album={currentAlbum} 
              isLoading={isLoading} 
              onLaunch={openAppleMusic} 
            />
          </div>

          {/* Filters Column */}
          <div className="lg:col-span-7 flex flex-col justify-start h-full">
            <GlassCard 
              className="w-full" 
              bgImageUrl={persistentBg}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-white uppercase leading-none">
                    Filters
                    <InfoIcon text="Narrow down the search. Discovery mode will prioritize these values." />
                  </h3>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-none">Target specific eras or styles</p>
                </div>
                <div className="has-tooltip">
                  <button 
                    onClick={resetFilters}
                    className="text-[9px] font-black text-white/40 hover:text-white transition-all tracking-[0.2em] px-4 py-2 rounded-full hover:bg-white/10 border border-white/5 active:scale-95"
                  >
                    RESET
                  </button>
                  <div className="tooltip">Clear all current search criteria</div>
                </div>
              </div>

              <FilterPanel filters={filters} setFilters={setFilters} />

              <div className="mt-8 pt-6 border-t border-white/5">
                <ShuffleControls 
                  onShuffle={fetchRandomAlbum}
                  isLoading={isLoading}
                />
              </div>

              {error && (
                <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <p className="text-[10px] text-red-400 font-bold tracking-tight uppercase leading-relaxed">{error}</p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
      <Background />
    </div>
  );
};

export default App;
