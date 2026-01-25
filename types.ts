
export interface Track {
  id: string;
  name: string;
  durationMs: number;
  trackNumber: number;
}

export interface Album {
  id: string;
  name: string;
  originalName: string; // The exact string from albums.json
  artist: string;
  artworkUrl: string;
  releaseYear: number;
  genre: string;
  appleMusicUrl: string;
  description?: string; // Optional description from iTunes
  sources?: Array<{ title: string; uri: string }>;
  tracks?: Track[];
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

export enum AppView {
  HOME = 'home',
  EXPLORER = 'explorer',
  LIBRARY = 'library',
  ALBUM_DETAILS = 'album_details'
}
