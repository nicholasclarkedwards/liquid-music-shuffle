
import React, { useState, useEffect } from 'react';
import { Filters, DiscoveryMode } from './types';
import { useMusicKit } from './hooks/useMusicKit';
import { useAlbumDiscovery } from './hooks/useAlbumDiscovery';
import GlassCard from './components/Common/GlassCard';
import Background from './components/Common/Background';
import FilterPanel from './components/FilterPanel';
import AlbumArtwork from './components/Album/AlbumArtwork';
import ShuffleControls from './components/Controls/ShuffleControls';
import IntegrationStatus from './components/Controls/IntegrationStatus';

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    decade: '',
    year: '',
    month: '',
    genre: '',
    artist: '',
  });

  const { isAuthorized, handleAuthorize, handleUnauthorize } = useMusicKit();
  const { currentAlbum, isLoading, error, fetchRandomAlbum } = useAlbumDiscovery(filters);

  useEffect(() => {
    // Initial random pick from your local library.json
    fetchRandomAlbum(DiscoveryMode.LIBRARY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="w-full max-w-6xl z-10 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Album Artwork & Playback Column */}
          <div className="lg:col-span-5 flex flex-col order-2 lg:order-1 h-full">
            <AlbumArtwork album={currentAlbum} isLoading={isLoading} />
            <ShuffleControls 
              onShuffle={fetchRandomAlbum}
              onLaunch={openAppleMusic}
              isLoading={isLoading}
              hasAlbum={!!currentAlbum}
            />
          </div>

          {/* Filters & Settings Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
            <GlassCard 
              className="flex-1" 
              bgImageUrl={currentAlbum?.artworkUrl}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3 text-white">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    Dynamic Curation
                  </h3>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Adjust criteria for your next spin</p>
                </div>
                <button 
                  onClick={resetFilters}
                  className="text-[9px] font-black text-white/40 hover:text-white transition-all tracking-[0.2em] px-4 py-2 rounded-full hover:bg-white/10 border border-white/5 active:scale-95"
                >
                  RESET
                </button>
              </div>

              <FilterPanel filters={filters} setFilters={setFilters} />

              <div className="mt-4">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <p className="text-[10px] text-red-400 font-bold tracking-tight uppercase leading-relaxed">{error}</p>
                  </div>
                )}
                {!error && !isLoading && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Library Active: Ready for shuffle</p>
                    </div>
                    <span className="text-[9px] text-white/20 font-black group-hover:text-white/40 transition-colors uppercase">v2.1</span>
                  </div>
                )}
              </div>
            </GlassCard>

            <IntegrationStatus 
              isAuthorized={isAuthorized}
              onAuthorize={handleAuthorize}
              onUnauthorize={handleUnauthorize}
            />
          </div>

        </div>
      </div>
      <Background />
    </div>
  );
};

export default App;
