import { Album } from "../types";

/**
 * Validates if a result is a proper project (3+ tracks).
 */
export const isValidAlbum = (result: any): boolean => {
  if (!result) return false;
  const trackCount = result.trackCount || 0;
  const primaryGenre = (result.primaryGenreName || "").toLowerCase();
  
  if (primaryGenre.includes("karaoke") || primaryGenre.includes("fitness")) return false;

  // Enforce project status (EP/Album usually 3+ tracks)
  return trackCount >= 3;
};

export const fetchMetadataBySearch = async (title: string, artist?: string): Promise<Album> => {
  const term = artist ? `${artist} ${title}` : title;
  const searchQuery = encodeURIComponent(term);
  
  const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=10`);
  const data = await response.json();
  const results = data.results || [];
  
  // Find first result that looks like a project
  const bestMatch = results.find(isValidAlbum) || results[0];

  if (!bestMatch) {
    throw new Error(`Catalog miss: "${title}" not found.`);
  }

  return mapItunesToAlbum(bestMatch);
};

export const fetchArtistAlbum = async (artistName: string): Promise<Album> => {
  const searchQuery = encodeURIComponent(artistName);
  const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=album&attribute=artistTerm&limit=50`);
  const data = await response.json();

  const results = (data.results || []).filter(isValidAlbum);

  if (results.length === 0) {
    throw new Error(`No projects found for artist "${artistName}".`);
  }

  const randomIndex = Math.floor(Math.random() * results.length);
  return mapItunesToAlbum(results[randomIndex]);
};

export const fetchMetadataById = async (catalogId: string): Promise<Album> => {
  const response = await fetch(`https://itunes.apple.com/lookup?id=${catalogId}&entity=album`);
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("Catalog ID not found.");
  }
  return mapItunesToAlbum(data.results[0]);
};

export const mapItunesToAlbum = (result: any): Album => ({
  id: result.collectionId.toString(),
  name: result.collectionName,
  artist: result.artistName,
  artworkUrl: result.artworkUrl100 ? result.artworkUrl100.replace('100x100bb', '1200x1200bb') : `https://picsum.photos/seed/${result.collectionId}/1200/1200`,
  releaseYear: new Date(result.releaseDate).getFullYear(),
  genre: result.primaryGenreName,
  appleMusicUrl: result.collectionViewUrl,
});
