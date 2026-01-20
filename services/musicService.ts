
import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataBySearch, fetchMetadataById, mapItunesToAlbum } from "./itunesService";
import { loadPersistentCache, saveToPersistentCache } from "./cacheService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let cachedArtists: any[] | null = null;
let rawAlbumsPool: any[] = [];
let isLibraryReady = false;

// Session-level memory (clears on page reload)
const sessionSeenIds = new Set<string>();
const sessionSeenTitles = new Set<string>();

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
  poolSize: rawAlbumsPool.length,
  seenCount: sessionSeenIds.size
});

/**
 * Resets the session memory.
 */
export const resetSessionHistory = () => {
  sessionSeenIds.clear();
  sessionSeenTitles.clear();
  console.log("[SessionMemory] History cleared.");
};

/**
 * Boots the library data only.
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
  const cacheId = catalogId ? catalogId.split(',')[0].trim() : normalizeString(originalTitle);
  
  const cached = cache[cacheId];
  if (cached) return cached;

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

  album.originalName = originalTitle;
  saveToPersistentCache(album);
  return album;
};

export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  if (!isLibraryReady) throw new Error("Library is still booting...");

  let pool = [...rawAlbumsPool];
  
  // Filter for artist specifically if provided
  if (filters.artist && filters.artist.trim() !== "") {
    const nFilter = normalizeString(filters.artist);
    pool = pool.filter(entry => normalizeString(entry.Title).includes(nFilter));
    if (pool.length === 0) pool = [...rawAlbumsPool];
  }

  // EXCLUSION LOGIC: Filter out already seen IDs
  let freshPool = pool.filter(entry => {
    const id = entry["Catalog Identifiers - Album"]?.split(',')[0].trim();
    const title = normalizeString(entry.Title);
    return !sessionSeenIds.has(id) && !sessionSeenTitles.has(title);
  });

  // If we've seen everything in the current filtered view, reset the memory for this filter set
  if (freshPool.length === 0 && pool.length > 0) {
    console.log("[SessionMemory] Current pool exhausted. Refreshing memory to allow repetitions.");
    resetSessionHistory();
    freshPool = [...pool];
  }

  if (freshPool.length === 0) throw new Error("No albums match your search.");

  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    attempts++;
    const randomIndex = Math.floor(Math.random() * freshPool.length);
    const entry = freshPool[randomIndex];
    
    try {
      const album = await hydrateAlbum(entry, filters);
      
      if (matchesMetadataFilters(album, filters)) {
        // Double check artist string if filter is active
        if (filters.artist && filters.artist.trim() !== "") {
           const nFilter = normalizeString(filters.artist);
           if (!normalizeString(album.artist).includes(nFilter)) {
              freshPool.splice(randomIndex, 1);
              continue;
           }
        }
        
        // Add to seen pool
        sessionSeenIds.add(album.id);
        sessionSeenTitles.add(normalizeString(album.originalName));
        return album;
      }
      freshPool.splice(randomIndex, 1);
    } catch (e) {
      freshPool.splice(randomIndex, 1);
    }
    if (freshPool.length === 0) break;
  }

  throw new Error("Could not find a fresh match. Try loosening your filters or resetting the engine.");
};

export const refreshAlbumMetadata = async (currentAlbum: Album, filters: Filters): Promise<Album> => {
  const sourceName = currentAlbum.originalName || currentAlbum.name;
  const refreshed = await fetchMetadataBySearch(sourceName, filters.artist);
  refreshed.originalName = sourceName;
  saveToPersistentCache(refreshed);
  return refreshed;
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
  const contextPool = rawAlbumsPool.slice(0, 20).map(a => a.Title).join(", ");
  const exclusions = Array.from(sessionSeenTitles).slice(-10).join(", ");
  const seed = Math.random().toString(36).substring(7);

  const criteria = [
    filters.decade && filters.decade !== "Any" && `released in the ${filters.decade}`,
    filters.year && filters.year !== "Any" && `released in ${filters.year}`,
    filters.month && filters.month !== "Any" && `released in ${filters.month}`,
    filters.genre && filters.genre !== "Any" && `genre: ${filters.genre}`,
    filters.artist && filters.artist !== "" && `related to "${filters.artist}"`
  ].filter(Boolean).join(", ");

  const prompt = `Recommend ONE real, existing music album.
                  STRICT CRITERIA: ${criteria || 'A critically acclaimed masterpiece'}.
                  EXCLUDE THESE (User just heard them): [${exclusions}].
                  MODE: ${mode === 'taste' ? 'Classic/High-Rated' : 'Obscure/Discovery'}.
                  CONTEXT: User library context: [${contextPool}].
                  RANDOMIZER: ${seed}.
                  
                  IMPORTANT: You MUST respect the filters. If a specific year is given, the album MUST be from that year.
                  Return ONLY JSON: {"albumName": "string", "artistName": "string"}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
    
    // Add AI result to seen memory
    sessionSeenIds.add(album.id);
    sessionSeenTitles.add(normalizeString(rec.albumName));
    
    return album;
  } catch (err: any) {
    console.error("[AI Discovery] Error:", err);
    throw new Error("Discovery engine could not find a new match. Try resetting your session.");
  }
};
