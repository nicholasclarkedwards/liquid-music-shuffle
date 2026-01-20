
import { Album } from "../types";

const STORAGE_KEY = "liquid_shuffle_cache_v1";

export const loadPersistentCache = (): Record<string, Album> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    const parsed = JSON.parse(data);
    console.log(`[Cache] Found ${Object.keys(parsed).length} items in local storage.`);
    return parsed;
  } catch (e) {
    console.error("[Cache] Failed to load local storage:", e);
    return {};
  }
};

export const saveToPersistentCache = (album: Album) => {
  try {
    const current = loadPersistentCache();
    current[album.id] = album;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn("[Cache] Storage full or inaccessible:", e);
  }
};

export const saveBulkToPersistentCache = (albums: Album[]) => {
    try {
      const current = loadPersistentCache();
      albums.forEach(a => {
          current[a.id] = a;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn("[Cache] Bulk storage failed:", e);
    }
};
