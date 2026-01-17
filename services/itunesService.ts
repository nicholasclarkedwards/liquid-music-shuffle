import { Album } from "../types";

/**
 * Hard-gate for project quality.
 * Rejects anything marked 'Single' by iTunes or having < 3 tracks.
 */
export const isValidAlbum = (result: any): boolean => {
  if (!result) return false;
  
  const name = (result.collectionName || "").toLowerCase();
  const type = (result.collectionType || "").toLowerCase();
  const trackCount = result.trackCount || 0;
  
  // 1. Explicit type check from Apple's database
  if (type === 'single') return false;
  
  // 2. Track count check: Albums/EPs are generally 3+ tracks.
  // Singles are 1-2.
  if (trackCount > 0 && trackCount < 3) return false;

  // 3. String-based safety net
  const badMarkers = [
    /\b-\s*single\b/i,
    /\(single\)/i,
    /\b-\s*remix\b/i,
    /\(remix\)/i,
    /\b-\s*edit\b/i,
    /\(edit\)/i,
    /\b-\s*mix\b/i,
    /\b-\s*radio\s*edit\b/i
  ];

  if (badMarkers.some(regex => regex.test(name))) return false;

  return true;
};

export const fetchMetadataById = async (catalogId: string): Promise<Album> => {
  const response = await fetch(`https://itunes.apple.com/lookup?id=${catalogId}&entity=album`);
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("ID lookup failed.");
  }
  
  const result = data.results.find((r: any) => r.wrapperType === 'collection');
  if (!result || !isValidAlbum(result)) throw new Error("ID refers to a Single or invalid project.");
  
  return mapItunesToAlbum(result);
};

export const fetchMetadataByIds = async (catalogIds: string[]): Promise<Album[]> => {
  if (catalogIds.length === 0) return [];
  const response = await fetch(`https://itunes.apple.com/lookup?id=${catalogIds.join(',')}&entity=album`);
  const data = await response.json();
  return (data.results || [])
    .filter((r: any) => r.wrapperType === "collection" && isValidAlbum(r))
    .map(mapItunesToAlbum);
};

export const fetchMetadataBySearch = async (title: string, artist?: string): Promise<Album> => {
  // Clean search term to avoid matching singles of the same name
  const cleanTitle = title.replace(/\b-\s*single\b/i, "").replace(/\(single\)/i, "").trim();
  const term = artist ? `${artist} ${cleanTitle}` : cleanTitle;
  const searchQuery = encodeURIComponent(term);
  
  const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=album&attribute=albumTerm&limit=10`);
  const data = await response.json();

  const results = data.results || [];
  const validResults = results.filter(isValidAlbum);

  if (validResults.length === 0) {
    throw new Error(`No valid album found for "${cleanTitle}".`);
  }

  // Choose the result that matches the artist most closely
  const sortedResults = validResults.sort((a: any, b: any) => {
    if (!artist) return 0;
    const aMatch = a.artistName.toLowerCase().includes(artist.toLowerCase()) ? 1 : 0;
    const bMatch = b.artistName.toLowerCase().includes(artist.toLowerCase()) ? 1 : 0;
    return bMatch - aMatch;
  });
  
  return mapItunesToAlbum(sortedResults[0]);
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