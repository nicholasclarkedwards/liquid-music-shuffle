import React, { useState, useEffect } from 'react';
import { Filters, DiscoveryMode } from './types';
import { useAlbumDiscovery } from './hooks/useAlbumDiscovery';
import GlassCard from './components/Common/GlassCard';
import Background from './components/Common/Background';
import FilterPanel from './components/FilterPanel';
import AlbumArtwork from './components/Album/AlbumArtwork';
import ShuffleControls from './components/Controls/ShuffleControls';
import InfoIcon from './components/Common/InfoIcon';
import LoadingScreen from './components/Common/LoadingScreen';
import { Toaster, toast } from 'react-hot-toast';

// Custom SVG Icons for Toasts
const IconError = () => (
  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
  </svg>
);

const IconMessage = () => (
  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);

const IconShuffleAnimated = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path className="animate-icon-shuffle-flow" d="M2 18c3 0 5-1 7-3 4-4 4-4 8-8 2-2 4-3 7-3" />
    <path d="M17 4l3 3-3 3" />
    <path className="animate-icon-shuffle-flow" style={{ animationDelay: '-0.75s' }} d="M2 6c3 0 5 1 7 3 4 4 4 4 8 8 2 2 4 3 7 3" />
    <path d="M17 20l3-3-3-3" />
  </svg>
);

const IconDiscoverAnimated = () => (
  <svg className="w-5 h-5 text-blue-400 animate-icon-discover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    decade: '',
    year: '',
    month: '',
    genre: '',
    artist: '',
  });

  const [persistentBg, setPersistentBg] = useState<string | undefined>(undefined);
  const { fetchRandomAlbum, currentAlbum, isLoading, error } = useAlbumDiscovery(filters);

  useEffect(() => {
    const boot = async () => {
      try {
        await fetchRandomAlbum(DiscoveryMode.LIBRARY);
        setTimeout(() => setIsBooting(false), 2000);
      } catch (e) {
        setIsBooting(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (!isLoading && currentAlbum?.artworkUrl) {
      setPersistentBg(currentAlbum.artworkUrl);
    }
  }, [currentAlbum, isLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        icon: <IconError />,
        className: 'glass-toast-base glass-toast-error',
        duration: 4000,
        position: 'top-center'
      });
    }
  }, [error]);

  const handleShuffleAction = async (mode: DiscoveryMode) => {
    const toastId = mode === DiscoveryMode.LIBRARY 
      ? toast("Shuffling...", { 
          icon: <IconShuffleAnimated />,
          className: 'glass-toast-base glass-toast-info',
          position: 'top-center',
          duration: 10000 
        })
      : toast("Finding new album...", { 
          icon: <IconDiscoverAnimated />,
          className: 'glass-toast-base glass-toast-info',
          position: 'top-center',
          duration: 10000 
        });

    await fetchRandomAlbum(mode);
    toast.dismiss(toastId);
  };

  const openAppleMusic = () => {
    if (currentAlbum?.appleMusicUrl) {
      window.open(currentAlbum.appleMusicUrl, '_blank');
    }
  };

  const resetFilters = () => {
    setFilters({ decade: '', year: '', month: '', genre: '', artist: '' });
    toast.success("Pool reset. Configuration cleared.", {
      icon: <IconMessage />,
      className: 'glass-toast-base glass-toast-success',
      position: 'top-center'
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-start p-4 relative overflow-x-hidden">
      <LoadingScreen isComplete={!isBooting} />
      <Toaster />
      <Background imageUrl={persistentBg} />
      
      {!isBooting && (
        <div className="w-full max-w-md z-10 animate-fade-in-up py-4">
          <div className="flex flex-col gap-4 w-full">
            
            <div className="w-full">
              <AlbumArtwork 
                album={currentAlbum} 
                isLoading={isLoading} 
                onLaunch={openAppleMusic} 
              />
            </div>

            <div className="w-full">
              {/* Filter Panel gets the same color theme as the artwork card */}
              <GlassCard 
                className="w-full" 
                imageUrl={isLoading ? undefined : currentAlbum?.artworkUrl}
              >
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-black tracking-tight flex items-center gap-2 text-white uppercase leading-none">
                      Filter Engine
                      <InfoIcon text="Refine your library pool for the next shuffle." />
                    </h3>
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em] leading-none">Discovery Config</p>
                  </div>
                  <button 
                    onClick={resetFilters}
                    className="text-[8px] font-black text-white/40 hover:text-white transition-all tracking-[0.2em] px-3 py-1.5 rounded-full glass-button-base"
                  >
                    RESET
                  </button>
                </div>

                <FilterPanel filters={filters} setFilters={setFilters} />

                <div className="mt-6 pt-5 border-t border-white/5">
                  <ShuffleControls 
                    onShuffle={handleShuffleAction}
                    isLoading={isLoading}
                  />
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;