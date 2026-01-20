
import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataBySearch, fetchMetadataById } from "./itunesService";
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
  console.log("[LibrarySync] Loading local data files...");

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
    console.log(`[LibrarySync] Data loaded. ${rawAlbumsPool.length} entries ready for on-demand hydration.`);
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
export const hydrateAlbum = async (entry: any): Promise<Album> => {
  const catalogId = entry["Catalog Identifiers - Album"];
  const title = entry.Title || "Unknown Title";
  const artist = entry.Artist || "Unknown Artist";
  
  const cache = loadPersistentCache();
  const cacheId = catalogId ? catalogId.split(',')[0].trim() : `${normalizeString(title)}_${normalizeString(artist)}`;
  
  const cached = cache[cacheId] || Object.values(cache).find(a => a.id === cacheId);
  if (cached) {
    console.log(`[Cache] Hit: "${cached.name}"`);
    return cached;
  }

  console.log(`[Hydration] Miss: Fetching "${title}" from iTunes...`);
  let album: Album;
  if (catalogId) {
    try {
      album = await fetchMetadataById(catalogId);
    } catch {
      album = await fetchMetadataBySearch(title, artist);
    }
  } else {
    album = await fetchMetadataBySearch(title, artist);
  }

  saveToPersistentCache(album);
  return album;
};

export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  if (!isLibraryReady) throw new Error("Library is still booting...");

  // 1. Initial filter based on Artist (since it's in the raw JSON)
  let pool = [...rawAlbumsPool];
  if (filters.artist && filters.artist.trim() !== "") {
    const nFilter = normalizeString(filters.artist);
    pool = pool.filter(entry => 
      normalizeString(entry.Artist).includes(nFilter) || 
      normalizeString(entry.Title).includes(nFilter)
    );
  }

  if (pool.length === 0) throw new Error("No albums match the artist filter.");

  // 2. Pick and Hydrate until metadata filters match
  let attempts = 0;
  const maxAttempts = 30; // Safety to prevent infinite loops if no match is possible

  while (attempts < maxAttempts) {
    attempts++;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const entry = pool[randomIndex];
    
    try {
      const album = await hydrateAlbum(entry);
      if (matchesMetadataFilters(album, filters)) {
        return album;
      }
      // If doesn't match, remove from local loop pool and try again
      pool.splice(randomIndex, 1);
      if (pool.length === 0) break;
    } catch (e) {
      console.warn("[Shuffle] Hydration failed for an entry, skipping...");
      pool.splice(randomIndex, 1);
      if (pool.length === 0) break;
    }
  }

  throw new Error("No albums match your metadata criteria (Genre/Year). Try different filters.");
};

export const refreshAlbumMetadata = async (currentAlbum: Album, filters: Filters): Promise<Album> => {
  console.log(`[Refresh] Manually re-fetching metadata for "${currentAlbum.name}"`);
  
  // Use filter overrides if provided
  const searchTitle = currentAlbum.name;
  const searchArtist = filters.artist && filters.artist.trim() !== "" 
    ? filters.artist 
    : currentAlbum.artist;

  const refreshed = await fetchMetadataBySearch(searchTitle, searchArtist);
  saveToPersistentCache(refreshed);
  return refreshed;
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode, retryCount = 0): Promise<Album> => {
  console.log(`[AI Discovery] Mode: ${mode}`);
  // Use a snapshot of cache or raw pool for context
  const contextPool = rawAlbumsPool.slice(0, 50).map(a => a.Artist).join(", ");
  const seed = Math.random().toString(36).substring(7);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Recommend ONE Album. Mode: ${mode.toUpperCase()} Decade: ${filters.decade || 'any'} Genre: ${filters.genre || 'any'} Context: [${contextPool}] Entropy: ${seed}. Return JSON with "albumName" and "artistName".`,
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
    sessionSuggestions.add(`${album.name} - ${album.artist}`);
    return album;
  } catch (err: any) {
    console.error("[AI Discovery] Error:", err);
    throw new Error("Discovery engine unreachable. Use Library Shuffle.");
  }
};
