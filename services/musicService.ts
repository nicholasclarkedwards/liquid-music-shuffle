import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataBySearch, fetchMetadataById, mapItunesToAlbum } from "./itunesService";
import { loadPersistentCache, saveToPersistentCache } from "./cacheService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const HEARTED_STORAGE_KEY = "liquid_shuffle_hearted_v1";
const TRACK_HEARTED_STORAGE_KEY = "liquid_shuffle_track_hearted_v1";
const RATINGS_STORAGE_KEY = "liquid_shuffle_ratings_v1";
const REVIEWS_STORAGE_KEY = "liquid_shuffle_reviews_v1";

let cachedArtists: any[] | null = null;
let rawAlbumsPool: any[] = [];
let isLibraryReady = false;

let memoryCache: Record<string, Album> = {};
const sessionSeenIds = new Set<string>();
const sessionSeenTitles = new Set<string>();

const normalizeString = (str: any): string => {
  if (!str || typeof str !== 'string') return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// --- Storage Logic ---

export const getHeartedIds = (): Set<string> => {
  try {
    const data = localStorage.getItem(HEARTED_STORAGE_KEY);
    return new Set(data ? JSON.parse(data) : []);
  } catch { return new Set(); }
};

export const toggleHearted = (id: string): boolean => {
  const hearted = getHeartedIds();
  const newState = !hearted.has(id);
  if (hearted.has(id)) hearted.delete(id); else hearted.add(id);
  localStorage.setItem(HEARTED_STORAGE_KEY, JSON.stringify(Array.from(hearted)));
  return newState;
};

export const getTrackHeartedIds = (): Set<string> => {
  try {
    const data = localStorage.getItem(TRACK_HEARTED_STORAGE_KEY);
    return new Set(data ? JSON.parse(data) : []);
  } catch { return new Set(); }
};

export const toggleTrackHearted = (trackId: string): boolean => {
  const hearted = getTrackHeartedIds();
  const newState = !hearted.has(trackId);
  if (hearted.has(trackId)) hearted.delete(trackId); else hearted.add(trackId);
  localStorage.setItem(TRACK_HEARTED_STORAGE_KEY, JSON.stringify(Array.from(hearted)));
  return newState;
};

export const getRating = (id: string): number => {
  try {
    const data = localStorage.getItem(RATINGS_STORAGE_KEY);
    const ratings = data ? JSON.parse(data) : {};
    return ratings[id] || 0;
  } catch { return 0; }
};

export const setRating = (id: string, rating: number) => {
  try {
    const data = localStorage.getItem(RATINGS_STORAGE_KEY);
    const ratings = data ? JSON.parse(data) : {};
    ratings[id] = rating;
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings));
  } catch {}
};

export const getAlbumReview = (id: string): string => {
  try {
    const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const reviews = data ? JSON.parse(data) : {};
    return reviews[id] || "";
  } catch { return ""; }
};

export const setAlbumReview = (id: string, review: string) => {
  try {
    const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const reviews = data ? JSON.parse(data) : {};
    if (!review.trim()) {
      delete reviews[id];
    } else {
      reviews[id] = review;
    }
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch {}
};

// --- Library Logic ---

export const getRawAlbumsPool = () => rawAlbumsPool;

export const resetSessionHistory = () => {
  sessionSeenIds.clear();
  sessionSeenTitles.clear();
};

export const syncFullLibrary = async (onProgress?: (current: number, total: number) => void): Promise<void> => {
  try {
    const [artistsRes, albumsRes] = await Promise.all([
      fetch('./artists.json'),
      fetch('./albums.json')
    ]);
    if (!artistsRes.ok || !albumsRes.ok) throw new Error("Unable to fetch library files.");
    const [artistsData, albumsData] = await Promise.all([artistsRes.json(), albumsRes.json()]);
    cachedArtists = (artistsData || []);
    memoryCache = loadPersistentCache();
    const isVisibleItem = (item: any) => item.Visible === true || item.Visible === "true";
    rawAlbumsPool = (albumsData || []).filter((item: any) => isVisibleItem(item) && (item.Title || item["Catalog Identifiers - Album"]));
    isLibraryReady = true;
    if (onProgress) onProgress(rawAlbumsPool.length, rawAlbumsPool.length);
  } catch (err) {
    throw new Error("Failed to initialize data pool.");
  }
};

export const getArtistSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 1 || !cachedArtists) return [];
  const normalizedQuery = normalizeString(query);
  return cachedArtists
    .filter((a: any) => normalizeString(a["Artist Name"] || a.Artist).includes(normalizedQuery))
    .map((a: any) => a["Artist Name"] || a.Artist).slice(0, 10);
};

export const hydrateAlbum = async (entry: any, filters?: Filters): Promise<Album> => {
  const catalogId = entry["Catalog Identifiers - Album"];
  const originalTitle = entry.Title || "Unknown Title";
  const safeId = catalogId ? String(catalogId).split(',')[0].trim() : normalizeString(originalTitle);
  const cached = memoryCache[safeId];
  if (cached && (cached.tracks || !catalogId)) return cached;

  let album: Album;
  if (catalogId) {
    try {
      album = await fetchMetadataById(String(catalogId));
    } catch {
      album = await fetchMetadataBySearch(originalTitle, filters?.artist);
    }
  } else {
    album = await fetchMetadataBySearch(originalTitle, filters?.artist);
  }

  album.originalName = originalTitle;
  saveToPersistentCache(album);
  memoryCache[safeId] = album;
  return album;
};

export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  if (!isLibraryReady) throw new Error("Library is still booting...");
  let pool = [...rawAlbumsPool];
  if (filters.artist && filters.artist.trim() !== "") {
    const nFilter = normalizeString(filters.artist);
    pool = pool.filter(entry => normalizeString(entry.Title).includes(nFilter));
    if (pool.length === 0) pool = [...rawAlbumsPool];
  }
  let freshPool = pool.filter(entry => {
    const id = entry["Catalog Identifiers - Album"] ? String(entry["Catalog Identifiers - Album"]).split(',')[0].trim() : null;
    const title = normalizeString(entry.Title);
    return !sessionSeenIds.has(id || "") && !sessionSeenTitles.has(title);
  });
  if (freshPool.length === 0 && pool.length > 0) {
    resetSessionHistory();
    freshPool = [...pool];
  }
  if (freshPool.length === 0) throw new Error("No albums match your filters.");
  let attempts = 0;
  while (attempts < 15) {
    attempts++;
    const randomIndex = Math.floor(Math.random() * freshPool.length);
    const entry = freshPool[randomIndex];
    try {
      const album = await hydrateAlbum(entry, filters);
      sessionSeenIds.add(album.id);
      sessionSeenTitles.add(normalizeString(album.originalName));
      return album;
    } catch (e) { freshPool.splice(randomIndex, 1); }
    if (freshPool.length === 0) break;
  }
  throw new Error("Could not find a fresh match.");
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
  const contextPool = rawAlbumsPool.slice(0, 15).map(a => a.Title).join(", ");
  const exclusions = Array.from(sessionSeenTitles).slice(-8).join(", ");
  const seed = Math.random().toString(36).substring(7);
  const prompt = `Recommend ONE real music album. EXCLUDE: [${exclusions}]. Return ONLY JSON: {"albumName": "string", "artistName": "string"}`;
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
    sessionSeenIds.add(album.id);
    sessionSeenTitles.add(normalizeString(rec.albumName));
    return album;
  } catch (err: any) { throw new Error("Discovery error."); }
};

export const refreshAlbumMetadata = async (currentAlbum: Album, filters: Filters): Promise<Album> => {
  const sourceName = currentAlbum.originalName || currentAlbum.name;
  const refreshed = await fetchMetadataBySearch(sourceName, filters.artist);
  refreshed.originalName = sourceName;
  saveToPersistentCache(refreshed);
  return refreshed;
};