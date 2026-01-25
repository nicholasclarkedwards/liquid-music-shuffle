import React from 'react';
import { Album, Filters, DiscoveryMode } from '../../types';

export interface DiscoveryViewProps {
  currentAlbum: Album | null;
  isLoading: boolean;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onShuffle: (mode: DiscoveryMode) => void;
  onRefreshMetadata: () => void;
  onLaunchAlbum: () => void;
  onResetFilters: () => void;
}