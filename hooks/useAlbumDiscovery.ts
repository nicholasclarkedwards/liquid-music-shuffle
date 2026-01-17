
import { useState, useCallback } from 'react';
import { Album, Filters, DiscoveryMode } from '../types';
import { getRandomLibraryAlbum, discoverAlbumViaAI } from '../services/musicService';

export const useAlbumDiscovery = (filters: Filters) => {
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomAlbum = useCallback(async (mode: DiscoveryMode = DiscoveryMode.LIBRARY) => {
    setIsLoading(true);
    setError(null);
    try {
      let album: Album;
      if (mode === DiscoveryMode.LIBRARY) {
        album = await getRandomLibraryAlbum();
      } else {
        album = await discoverAlbumViaAI(filters, mode);
      }
      setCurrentAlbum(album);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to find an album. Try again!");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  return { currentAlbum, isLoading, error, fetchRandomAlbum };
};
