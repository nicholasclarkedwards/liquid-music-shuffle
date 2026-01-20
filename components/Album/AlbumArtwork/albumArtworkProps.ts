
import { Album } from '../../../types';

export interface AlbumArtworkProperties {
  album: Album | null;
  isLoading: boolean;
  onLaunch: () => void;
  onRefresh: () => void;
}

export interface AlbumArtworkViewProperties extends AlbumArtworkProperties {
}
