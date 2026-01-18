import { GoogleGenAI } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataBySearch, fetchArtistAlbum, fetchMetadataById } from "./itunesService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let cachedArtists: any[] | null = null;
let cachedAlbums: any[] | null = null;
let libraryPromise: Promise<any> | null = null;

export const getLibraryData = async () => {
  if (cachedArtists && cachedAlbums) {
    return { artists: cachedArtists, albums: cachedAlbums };
  }

  if (!libraryPromise) {
    libraryPromise = (async () => {
      try {
        const [artistsRes, albumsRes] = await Promise.all([
          fetch('./artists.json'),
          fetch('./albums.json')
        ]);
        
        const [artistsData, albumsData] = await Promise.all([
          artistsRes.json(),
          albumsRes.json()
        ]);
        
        cachedArtists = artistsData.filter((item: any) => item.Visible === true);
        // Only include albums that are marked Visible: true in the source file
        cachedAlbums = albumsData.filter((item: any) => 
          item.Visible === true && item["Catalog Identifiers - Album"]
        );
        
        return { artists: cachedArtists, albums: cachedAlbums };
      } catch (err) {
        libraryPromise = null;
        throw err;
      }
    })();
  }
  
  return libraryPromise;
};

export const getArtistSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 1) return [];
  try {
    const { artists } = await getLibraryData();
    const normalizedQuery = query.toLowerCase().trim();
    return artists
      .filter((a: any) => (a["Artist Name"] || "").toLowerCase().includes(normalizedQuery))
      .map((a: any) => a["Artist Name"])
      .slice(0, 10);
  } catch (e) {
    return [];
  }
};

const matchesFilters = (album: Album, filters: Filters): boolean => {
  if (filters.year && album.releaseYear.toString() !== filters.year) return false;
  if (filters.decade) {
    const decadeStart = parseInt(filters.decade.substring(0, 4));
    if (album.releaseYear < decadeStart || album.releaseYear >= decadeStart + 10) return false;
  }
  if (filters.genre && !album.genre.toLowerCase().includes(filters.genre.toLowerCase())) return false;
  if (filters.artist && !album.artist.toLowerCase().includes(filters.artist.toLowerCase()) && !filters.artist.toLowerCase().includes(album.artist.toLowerCase())) return false;
  return true;
};

/**
 * Picks a random album from the verified library pool.
 * Only considers Visible: true entries with valid Catalog IDs.
 */
export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  const { albums } = await getLibraryData();
  
  if (!albums || albums.length === 0) {
    throw new Error("No visible projects found in your library file.");
  }

  // Shuffle the pool of visible albums
  const pool = [...albums].sort(() => Math.random() - 0.5);
  
  const MAX_ATTEMPTS = Math.min(pool.length, 50);
  
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      const targetEntry = pool[i];
      const catalogId = targetEntry["Catalog Identifiers - Album"];

      // Fetch metadata ONLY by exact ID to ensure 100% accuracy
      const album = await fetchMetadataById(catalogId);

      // Apply UI filters to the result
      if (matchesFilters(album, filters)) {
        return album;
      }
    } catch (e) {
      // If a specific ID is no longer in the store, just move to next index
      continue;
    }
  }

  throw new Error("No visible projects in your library match the current filters.");
};

export const scoutNewArtists = async (filters: Filters): Promise<string> => {
  const { artists } = await getLibraryData();
  const sample = artists.slice(0, 10).map((a: any) => a["Artist Name"]).join(", ");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on a library containing [${sample}], recommend 15 new diverse artists. 
               Filters: ${filters.genre || 'Any'} in the ${filters.decade || 'current era'}.
               Return ONLY a JSON array of objects with keys: "Artist Name", "Artist Identifier", "Visible" (true).`,
    config: { responseMimeType: "application/json" },
  });

  return response.text;
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
  const { artists } = await getLibraryData();
  const artistContext = artists
    .sort(() => Math.random() - 0.5)
    .slice(0, 20)
    .map((a: any) => a["Artist Name"])
    .join(", ");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Recommend one real music Album or EP.
               User context: likes [${artistContext}].
               Criteria: ${filters.genre} ${filters.decade}.
               IMPORTANT: Min 4 tracks. No singles. No remixes. No live. 
               Return ONLY JSON with albumName and artistName.`,
    config: { responseMimeType: "application/json" },
  });

  const recommendation = JSON.parse(response.text);
  return await fetchMetadataBySearch(recommendation.albumName, recommendation.artistName);
};
