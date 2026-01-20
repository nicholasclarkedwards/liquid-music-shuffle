
import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataBySearch, fetchMetadataById, mapItunesToAlbum } from "./itunesService";
import { loadPersistentCache, saveToPersistentCache } from "./cacheService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let cachedArtists: any[] | null = null;
let rawAlbumsPool: any[] = [];
let isLibraryReady = false;

const sessionSuggestions = new Set<string>();

const normalizeString = (str: any): string => {
  if (!str || typeof str !== 'string') return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const getLibraryStatus = () => ({
  isReady: isLibraryReady,
  poolSize: rawAlbumsPool.length
});

/**
 * Boots the library data only. No metadata fetching until needed.
 */
export const syncFullLibrary = async (onProgress?: (current: number, total: number) => void): Promise<void> => {
  try {
    const [artistsRes, albumsRes] = await Promise.all([
      fetch('./artists.json'),
      fetch('./albums.json')
    ]);
    if (!artistsRes.ok || !albumsRes.ok) throw new Error("Unable to fetch library files.");

    const [artistsData, albumsData] = await Promise.all([
      artistsRes.json(),
      albumsRes.json()
    ]);
    
    const isVisible = (item: any) => item.Visible === true || item.Visible === "true";
    cachedArtists = (artistsData || []).filter(isVisible);
    
    // Store raw entries from JSON
    rawAlbumsPool = (albumsData || []).filter((item: any) => {
      return isVisible(item) && (item.Title || item["Catalog Identifiers - Album"]);
    });

    isLibraryReady = true;
    if (onProgress) onProgress(rawAlbumsPool.length, rawAlbumsPool.length);
  } catch (err) {
    console.error("[LibrarySync] Boot failure:", err);
    throw new Error("Failed to initialize data pool.");
  }
};

export const getArtistSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 1 || !cachedArtists) return [];
  const normalizedQuery = normalizeString(query);
  return cachedArtists
    .filter((a: any) => normalizeString(a["Artist Name"] || a.Artist).includes(normalizedQuery))
    .map((a: any) => a["Artist Name"] || a.Artist)
    .slice(0, 10);
};

const matchesMetadataFilters = (album: Album, filters: Filters): boolean => {
  if (filters.year && filters.year !== "Any" && filters.year.trim() !== "") {
    if (album.releaseYear.toString() !== filters.year.trim()) return false;
  }
  if (filters.decade && filters.decade !== "Any") {
    const decadeStart = parseInt(filters.decade.substring(0, 4));
    if (album.releaseYear < decadeStart || album.releaseYear >= decadeStart + 10) return false;
  }
  if (filters.genre && filters.genre !== "Any") {
    const nGenre = normalizeString(filters.genre);
    if (!normalizeString(album.genre).includes(nGenre)) return false;
  }
  return true;
};

/**
 * Hydrates a single entry, checking cache first.
 */
export const hydrateAlbum = async (entry: any, filters?: Filters): Promise<Album> => {
  const catalogId = entry["Catalog Identifiers - Album"];
  const originalTitle = entry.Title || "Unknown Title";
  
  const cache = loadPersistentCache();
  // Cache key is the ID or the normalized original title to ensure we don't duplicate
  const cacheId = catalogId ? catalogId.split(',')[0].trim() : normalizeString(originalTitle);
  
  const cached = cache[cacheId];
  if (cached) {
    console.log(`[Cache] Hit: "${cached.name}"`);
    return cached;
  }

  console.log(`[Hydration] Miss: Resolving "${originalTitle}"...`);
  let album: Album;
  const searchArtist = filters?.artist || undefined;

  if (catalogId) {
    try {
      album = await fetchMetadataById(catalogId);
    } catch {
      album = await fetchMetadataBySearch(originalTitle, searchArtist);
    }
  } else {
    album = await fetchMetadataBySearch(originalTitle, searchArtist);
  }

  // FORCE originalName to be the string from the library file
  album.originalName = originalTitle;
  
  saveToPersistentCache(album);
  return album;
};

export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  if (!isLibraryReady) throw new Error("Library is still booting...");

  let pool = [...rawAlbumsPool];
  
  if (filters.artist && filters.artist.trim() !== "") {
    const nFilter = normalizeString(filters.artist);
    // Loose matching on title if artist isn't in JSON
    pool = pool.filter(entry => normalizeString(entry.Title).includes(nFilter));
    if (pool.length === 0) pool = [...rawAlbumsPool];
  }

  if (pool.length === 0) throw new Error("No albums match your search.");

  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    attempts++;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const entry = pool[randomIndex];
    
    try {
      const album = await hydrateAlbum(entry, filters);
      
      if (matchesMetadataFilters(album, filters)) {
        if (filters.artist && filters.artist.trim() !== "") {
           const nFilter = normalizeString(filters.artist);
           if (!normalizeString(album.artist).includes(nFilter)) {
              pool.splice(randomIndex, 1);
              continue;
           }
        }
        return album;
      }
      pool.splice(randomIndex, 1);
    } catch (e) {
      pool.splice(randomIndex, 1);
    }
    if (pool.length === 0) break;
  }

  throw new Error("Could not find a match within your criteria. Try loosening your filters.");
};

export const refreshAlbumMetadata = async (currentAlbum: Album, filters: Filters): Promise<Album> => {
  // Use the original source file name + current filter context for the most accurate re-lookup
  const sourceName = currentAlbum.originalName || currentAlbum.name;
  console.log(`[Refresh] Re-resolving "${sourceName}" with artist filter: "${filters.artist}"`);
  
  const refreshed = await fetchMetadataBySearch(sourceName, filters.artist);
  
  // Re-pin the original name to the refreshed object
  refreshed.originalName = sourceName;
  
  saveToPersistentCache(refreshed);
  return refreshed;
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
  const contextPool = rawAlbumsPool.slice(0, 20).map(a => a.Title).join(", ");
  const seed = Math.random().toString(36).substring(7);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Recommend ONE real music album. Mode: ${mode.toUpperCase()} Decade: ${filters.decade || 'any'} Genre: ${filters.genre || 'any'} User Library Samples: [${contextPool}] Randomizer: ${seed}. Return JSON with "albumName" and "artistName".`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { albumName: { type: Type.STRING }, artistName: { type: Type.STRING } },
          required: ["albumName", "artistName"]
        }
      },
    });

    const rec = JSON.parse(response.text.trim());
    const album = await fetchMetadataBySearch(rec.albumName, rec.artistName);
    album.originalName = rec.albumName; 
    return album;
  } catch (err: any) {
    console.error("[AI Discovery] Error:", err);
    throw new Error("Discovery engine unreachable.");
  }
};
