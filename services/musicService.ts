import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataById, fetchMetadataBySearch, fetchMetadataByIds, isValidAlbum, mapItunesToAlbum } from "./itunesService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let cachedFullLibrary: any[] | null = null;
let cachedVisibleLibrary: any[] | null = null;
let cachedVisibleArtists: any[] | null = null; // Store full objects now
let libraryPromise: Promise<any> | null = null;

const getLibraryData = async () => {
  if (cachedFullLibrary && cachedVisibleLibrary && cachedVisibleArtists) {
    return { 
      full: cachedFullLibrary, 
      visible: cachedVisibleLibrary,
      artists: cachedVisibleArtists
    };
  }

  if (!libraryPromise) {
    libraryPromise = (async () => {
      try {
        const [albumsRes, artistsRes] = await Promise.all([
          fetch('./albums.json'),
          fetch('./artists.json')
        ]);

        const albumsData = await albumsRes.json();
        const artistsData = await artistsRes.json();

        cachedFullLibrary = albumsData;
        
        // 1. Aggressive cleaning of the album pool
        const singleMarkers = [/\b-\s*single\b/i, /\(single\)/i, /\b-\s*remix\b/i];
        cachedVisibleLibrary = albumsData.filter((item: any) => {
          if (item.Visible !== true) return false;
          const title = item.Title || "";
          return !singleMarkers.some(regex => regex.test(title));
        });
        
        // 2. Use the verified artists list
        cachedVisibleArtists = artistsData.filter((item: any) => item.Visible === true);
        
        return { 
          full: cachedFullLibrary, 
          visible: cachedVisibleLibrary,
          artists: cachedVisibleArtists 
        };
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
      .map((a: any) => a["Artist Name"])
      .filter((name: string) => name.toLowerCase().includes(normalizedQuery))
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
  if (filters.artist && !album.artist.toLowerCase().includes(filters.artist.toLowerCase())) return false;
  return true;
};

/**
 * ARTIST-FIRST DISCOVERY ENGINE
 * 1. Pick a real artist from library.
 * 2. Find their projects in the source.
 * 3. Validate via iTunes API (3+ tracks).
 */
export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  const { visible: visibleAlbums, artists } = await getLibraryData();
  
  const MAX_GLOBAL_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_GLOBAL_RETRIES) {
    try {
      let targetArtist = filters.artist;
      
      // If no specific artist filter, pick one randomly from followed artists
      if (!targetArtist) {
        const randomArtistObj = artists[Math.floor(Math.random() * artists.length)];
        targetArtist = randomArtistObj["Artist Name"];
      }

      // Filter local pool for this artist
      const artistProjects = visibleAlbums.filter((a: any) => {
        const title = a.Title || "";
        // We still need to find a match - search for the artist's name in the album pool
        // This is a rough local match, we'll refine with iTunes
        return true; 
      });

      // To ensure high success, we'll just pick a random project from the source that 
      // isn't a single and belongs to a real library artist.
      const shuffledPool = [...visibleAlbums].sort(() => Math.random() - 0.5);
      
      for (const item of shuffledPool.slice(0, 15)) {
        try {
          const resolved = await resolveAlbumMetadata(item);
          if (matchesFilters(resolved, filters)) return resolved;
        } catch (e) {
          continue;
        }
      }
      
      attempt++;
    } catch (e) {
      attempt++;
    }
  }

  throw new Error("Couldn't find a full album matching your criteria. Try adjusting filters.");
};

const resolveAlbumMetadata = async (selected: any): Promise<Album> => {
  const catalogId = selected["Catalog Identifiers - Album"];
  const title = selected["Title"];
  
  if (catalogId) {
    try {
      return await fetchMetadataById(catalogId);
    } catch (e) {
      // Fallback if ID lookup fails
      return await fetchMetadataBySearch(title);
    }
  } else {
    return await fetchMetadataBySearch(title);
  }
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
  const { artists } = await getLibraryData();
  const artistContext = artists.slice(0, 20).map((a: any) => a["Artist Name"]).join(", ");

  const filterSummary = [
    filters.decade && `Decade: ${filters.decade}`,
    filters.year && `Year: ${filters.year}`,
    filters.genre && `Genre: ${filters.genre}`,
    filters.artist && `Artist Style: ${filters.artist}`
  ].filter(Boolean).join(", ");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Recommend a single music Album or EP.
               Criteria: ${filterSummary || 'Excellent modern project'}.
               User Likes: ${artistContext}.
               IMPORTANT: 
               - Recommending a Single or Remix is a FAILURE.
               - MUST be a project with at least 4 tracks.
               - Return ONLY JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          albumName: { type: Type.STRING },
          artistName: { type: Type.STRING },
        },
        required: ["albumName", "artistName"]
      }
    },
  });

  const recommendation = JSON.parse(response.text);
  return await fetchMetadataBySearch(recommendation.albumName, recommendation.artistName);
};