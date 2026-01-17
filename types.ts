
export interface Album {
  id: string;
  name: string;
  artist: string;
  artworkUrl: string;
  releaseYear: number;
  genre: string;
  appleMusicUrl: string;
  sources?: Array<{ title: string; uri: string }>;
}

export interface Filters {
  decade: string;
  year: string;
  month: string;
  genre: string;
  artist: string;
}

export enum DiscoveryMode {
  LIBRARY = 'library',
  DISCOVERY = 'discovery',
  TASTE = 'taste'
}
