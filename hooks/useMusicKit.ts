
import { useState, useEffect } from 'react';

// Declare MusicKit on the window object to fix TypeScript errors
declare global {
  interface Window {
    MusicKit: any;
  }
}

export const useMusicKit = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [musicKit, setMusicKit] = useState<any>(null);

  useEffect(() => {
    const initMusicKit = async () => {
      try {
        if (window.MusicKit) {
          const mk = window.MusicKit.getInstance();
          setMusicKit(mk);
          setIsAuthorized(mk?.isAuthorized || false);
        }
      } catch (err) {
        console.warn("MusicKit initialization requires a Developer Token.");
      }
    };
    
    const interval = setInterval(() => {
      if (window.MusicKit) {
        clearInterval(interval);
        initMusicKit();
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleAuthorize = async () => {
    if (!musicKit) {
      alert("Apple Music integration requires a Developer Token. In this preview, we are using AI-powered search to browse the catalog.");
      return;
    }
    try {
      await musicKit.authorize();
      setIsAuthorized(true);
    } catch (err) {
      console.error("Authorization failed", err);
    }
  };

  const handleUnauthorize = async () => {
    if (musicKit) {
      await musicKit.unauthorize();
      setIsAuthorized(false);
    }
  };

  return { isAuthorized, handleAuthorize, handleUnauthorize };
};
