import { Album } from "../types";

/**
 * Validates if a result is a proper project.
 * Loosened trackCount requirement to 1 to capture EPs/Projects with missing metadata.
 */
export const isValidAlbum = (result: any): boolean => {
  if (!result) return false;
  const primaryGenre = (result.primaryGenreName || "").toLowerCase();
  
  // Filter out obvious non-music projects
  if (primaryGenre.includes("karaoke") || primaryGenre.includes("fitness") || primaryGenre.includes("spoken word")) {
    return false;
  }

  // Ensure it's a collection (album/EP) rather than a single track result (though search is set to entity=album)
  return !!result.collectionId;
};

export const fetchMetadataBySearch = async (title: string, artist?: string): Promise<Album> => {
  // Clean the title and artist to remove common AI artifacts like "Album:" or quotes
  const cleanTitle = title.replace(/["']/g, "").trim();
  const cleanArtist = artist ? artist.replace(/["']/g, "").trim() : "";

  const performSearch = async (term: string) => {
    const searchQuery = encodeURIComponent(term);
    const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=5`);
    const data = await response.json();
    return data.results || [];
  };

  // Attempt 1: Artist + Title
  let results = await performSearch(`${cleanArtist} ${cleanTitle}`);
  
  // Attempt 2: Title only (if Attempt 1 failed)
  if (results.length === 0) {
    results = await performSearch(cleanTitle);
  }

  // Attempt 3: Just the start of the title (handling long sub-titled albums)
  if (results.length === 0 && cleanTitle.length > 10) {
    results = await performSearch(cleanTitle.substring(0, 15));
  }

  const bestMatch = results.find(isValidAlbum) || results[0];

  if (!bestMatch) {
    throw new Error(`Catalog miss: "${cleanTitle}" by ${cleanArtist || 'Unknown'} not found.`);
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