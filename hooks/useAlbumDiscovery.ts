
import { useState, useCallback } from 'react';
import { Album, Filters, DiscoveryMode } from '../types';
import { discoverAlbum } from '../services/geminiService';

export const useAlbumDiscovery = (filters: Filters) => {
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomAlbum = useCallback(async (mode: DiscoveryMode = DiscoveryMode.LIBRARY) => {
    setIsLoading(true);
    setError(null);
    try {
      const album = await discoverAlbum(filters, mode);
      setCurrentAlbum(album);
    } catch (err: any) {
      setError(err.message || "Failed to find an album. Try broadening your filters.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  return { currentAlbum, isLoading, error, fetchRandomAlbum };
};
