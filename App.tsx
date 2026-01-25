import React, { useState, useEffect } from 'react';
import { Filters, DiscoveryMode, AppView, Album } from './types';
import { useAlbumDiscovery } from './hooks/useAlbumDiscovery';
import { Background, LoadingScreen } from './components';
import { DiscoveryView } from './views/Discovery';
import { HomeView } from './views/Home';
import { LibraryView } from './views/Library';
import { AlbumDetailView } from './views/AlbumDetails';
import { syncFullLibrary } from './services/musicService';
import { Toaster, toast } from 'react-hot-toast';
import { Info, Shuffle, ArrowLeft, Search, AlertCircle } from 'lucide-react';

const IconMessage = () => (
  <Info size={20} className="text-white/40" strokeWidth={2.5} />
);

const IconShuffleAnimated = () => (
  <Shuffle size={18} className="icon-shuffle-animated text-white/40" strokeWidth={2.5} />
);

const IconDiscoverAnimated = () => (
  <Search size={18} className="icon-discover-animated text-white/40" strokeWidth={2.5} />
);

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [previousView, setPreviousView] = useState<AppView>(AppView.HOME);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [filters, setFilters] = useState<Filters>({
    decade: '',
    year: '',
    month: '',
    genre: '',
    artist: '',
  });

  const [persistentBg, setPersistentBg] = useState<string | undefined>(undefined);
  const { fetchRandomAlbum, currentAlbum, isLoading, refreshCurrent, error } = useAlbumDiscovery(filters);

  useEffect(() => {
    const boot = async () => {
      try {
        await syncFullLibrary((current, total) => {
          setSyncProgress({ current, total });
        });
        
        await fetchRandomAlbum(DiscoveryMode.LIBRARY);
        setTimeout(() => setIsBooting(false), 500);
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

  const handleShuffleAction = async (mode: DiscoveryMode) => {
    const isDiscovery = mode === DiscoveryMode.TASTE;
    const toastId = toast(isDiscovery ? "AI is selecting a project..." : "Shuffling library pool...", { 
      icon: isDiscovery ? <IconDiscoverAnimated /> : <IconShuffleAnimated />,
      className: 'glass-toast-base glass-toast-info',
      position: 'top-center',
      duration: 15000 
    });

    try {
      await fetchRandomAlbum(mode);
      toast.dismiss(toastId);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Discovery error", {
        icon: <AlertCircle size={18} className="text-white" />,
        className: 'glass-toast-base glass-toast-error',
        position: 'top-center'
      });
    }
  };

  const handleRefreshMetadata = async () => {
    const toastId = toast("Syncing with store...", { 
        className: 'glass-toast-base glass-toast-info',
        position: 'top-center',
        duration: 5000 
      });
    try {
      await refreshCurrent();
      toast.dismiss(toastId);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error("Sync failed", {
        className: 'glass-toast-base glass-toast-error',
        position: 'top-center'
      });
    }
  };

  const handleLaunchAlbum = () => {
    if (currentAlbum?.appleMusicUrl) {
      window.open(currentAlbum.appleMusicUrl, '_blank');
      handleOpenAlbumDetails(currentAlbum);
    }
  };

  const resetFilters = () => {
    setFilters({ decade: '', year: '', month: '', genre: '', artist: '' });
    toast.success("Filters reset.", {
      icon: <IconMessage />,
      className: 'glass-toast-base glass-toast-success',
      position: 'top-center'
    });
  };

  const handleOpenAlbumDetails = (album: Album) => {
    setSelectedAlbum(album);
    setPreviousView(currentView);
    setCurrentView(AppView.ALBUM_DETAILS);
    setPersistentBg(album.artworkUrl);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <HomeView 
            onEnterExplorer={() => setCurrentView(AppView.EXPLORER)}
            onEnterLibrary={() => setCurrentView(AppView.LIBRARY)}
          />
        );
      case AppView.EXPLORER:
        return (
          <>
            <button 
              onClick={() => setCurrentView(AppView.HOME)}
              className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] glass-button-base px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 md:gap-2 active:scale-95 transition-transform"
              style={{ top: 'calc(env(safe-area-inset-top, 24px) + 8px)' }}
            >
              <ArrowLeft size={12} className="text-white/40 hover:text-white" strokeWidth={2.5} />
              <span className="hidden xs:inline">Back Home</span>
              <span className="xs:hidden">Back</span>
            </button>
            <DiscoveryView 
              currentAlbum={currentAlbum}
              isLoading={isLoading}
              filters={filters}
              setFilters={setFilters}
              onShuffle={handleShuffleAction}
              onRefreshMetadata={handleRefreshMetadata}
              onLaunchAlbum={handleLaunchAlbum}
              onResetFilters={resetFilters}
            />
          </>
        );
      case AppView.LIBRARY:
        return (
          <LibraryView 
            onBack={() => setCurrentView(AppView.HOME)}
            onSelectAlbum={handleOpenAlbumDetails}
          />
        );
      case AppView.ALBUM_DETAILS:
        return selectedAlbum ? (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => setCurrentView(previousView === AppView.ALBUM_DETAILS ? AppView.HOME : previousView)} 
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      <LoadingScreen isComplete={!isBooting} progress={syncProgress} />
      <Toaster />
      <Background imageUrl={persistentBg} />
      
      {!isBooting && renderView()}
    </div>
  );
};

export default App;