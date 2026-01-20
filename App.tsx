import React, { useState, useEffect } from 'react';
import { Filters, DiscoveryMode } from './types';
import { useAlbumDiscovery } from './hooks/useAlbumDiscovery';
import { 
  GlassCard, 
  Background, 
  FilterPanel, 
  AlbumArtwork, 
  ShuffleControls, 
  InfoIcon, 
  LoadingScreen 
} from './components';
import { Toaster, toast } from 'react-hot-toast';
import { Shuffle, Search, AlertCircle, Info } from 'lucide-react';

// Custom SVG Icons for Toasts
const IconError = () => (
  <AlertCircle size={20} className="text-red-500" strokeWidth={3} />
);

const IconMessage = () => (
  <Info size={20} className="text-blue-500" strokeWidth={3} />
);

const IconShuffleAnimated = () => (
  <Shuffle size={18} className="icon-shuffle-animated text-white" />
);

const IconDiscoverAnimated = () => (
  <Search size={18} className="icon-discover-animated text-white" />
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
                    className="text-[8px] font-black text-white/60 hover:text-white transition-all tracking-[0.2em] px-3 py-1.5 rounded-full glass-button-base"
                  >
                    Reset
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