import { Album } from '../../../types';

export interface AlbumArtworkProperties {
  album: Album | null;
  isLoading: boolean;
  onLaunch: () => void;
}

export interface AlbumArtworkViewProperties extends AlbumArtworkProperties {
  // Extend here if view-specific properties are needed in the future
}
