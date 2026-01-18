import { GoogleGenAI } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataBySearch, fetchMetadataById } from "./itunesService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let cachedArtists: any[] | null = null;
let cachedAlbums: any[] | null = null;
let libraryPromise: Promise<any> | null = null;

// Track previously suggested albums to minimize exact repetition in the current session
const sessionSuggestions = new Set<string>();

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

export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  const { albums } = await getLibraryData();
  
  if (!albums || albums.length === 0) {
    throw new Error("No visible projects found in library.");
  }

  const pool = [...albums].sort(() => Math.random() - 0.5);
  const MAX_ATTEMPTS = Math.min(pool.length, 40);
  
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      const targetEntry = pool[i];
      const catalogId = targetEntry["Catalog Identifiers - Album"];
      const album = await fetchMetadataById(catalogId);
      if (matchesFilters(album, filters)) return album;
    } catch (e) {
      continue;
    }
  }

  throw new Error("No library matches for these filters.");
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
  const { artists } = await getLibraryData();
  
  // High entropy sampling of user's artist context
  const artistPool = artists.sort(() => Math.random() - 0.5);
  const artistContext = artistPool
    .slice(0, 25)
    .map((a: any) => a["Artist Name"])
    .join(", ");

  const seed = Math.random().toString(36).substring(2, 15) + Date.now().toString();
  const previouslySeen = Array.from(sessionSuggestions).slice(-10).join(", ");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Recommend ONE unique, real, critically acclaimed music Album or EP.
               User context (loves these artists): [${artistContext}].
               Required criteria: Era must be ${filters.decade || 'Any era'} and Genre should be ${filters.genre || 'Any genre'}.
               Randomization Entropy: ${seed}
               Avoid these recent suggestions: [${previouslySeen}].
               
               Strict Rules:
               - Must have at least 4 tracks. 
               - NO singles, NO remixes, NO live recordings.
               - Pick something defining or a hidden gem of the requested era.
               - DO NOT repeat the same artists.
               
               Return ONLY valid JSON with fields: "albumName" and "artistName".`,
    config: { 
      responseMimeType: "application/json",
      temperature: 1.0, // Maximum randomness
    },
  });

  try {
    const recommendation = JSON.parse(response.text);
    const album = await fetchMetadataBySearch(recommendation.albumName, recommendation.artistName);
    
    // Track suggestions to avoid repetition
    sessionSuggestions.add(`${album.name} - ${album.artist}`);
    
    return album;
  } catch (err) {
    console.error("AI Discovery Error:", err);
    throw new Error("Discovery engine stalled. Please try again.");
  }
};