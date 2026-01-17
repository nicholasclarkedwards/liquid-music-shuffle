import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataById, fetchMetadataBySearch, fetchMetadataByIds } from "./itunesService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let cachedFullLibrary: any[] | null = null;
let cachedVisibleLibrary: any[] | null = null;

const getLibraryData = async () => {
  if (!cachedFullLibrary) {
    const response = await fetch('./library.json');
    if (!response.ok) {
      throw new Error(`Failed to load library.json`);
    }
    const data = await response.json();
    cachedFullLibrary = data;
    cachedVisibleLibrary = data.filter((album: any) => album.Visible === true);
  }
  return { 
    full: cachedFullLibrary!, 
    visible: cachedVisibleLibrary! 
  };
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

export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  try {
    const { visible: visibleAlbums } = await getLibraryData();
    
    if (!visibleAlbums.length) {
      throw new Error("No visible albums found in your library.");
    }

    const hasActiveFilters = Object.values(filters).some(f => f !== '');
    
    if (!hasActiveFilters) {
      const randomIndex = Math.floor(Math.random() * visibleAlbums.length);
      return await resolveAlbumMetadata(visibleAlbums[randomIndex]);
    }

    // High Speed Filtered Shuffle Strategy: Batch Lookups
    // We shuffle the whole library and pick batches of items with IDs
    const shuffledPool = [...visibleAlbums].sort(() => Math.random() - 0.5);
    
    // Process in batches of 20 to find a match fast
    const BATCH_SIZE = 20;
    const MAX_ITEMS_TO_SCAN = 100; // Limit total items scanned to avoid extreme wait times
    
    for (let i = 0; i < MAX_ITEMS_TO_SCAN; i += BATCH_SIZE) {
      const batch = shuffledPool.slice(i, i + BATCH_SIZE);
      
      // Separate items with IDs for batch lookup and those without IDs for sequential fallback
      const withIds = batch.filter(item => item["Catalog Identifiers - Album"]);
      const withoutIds = batch.filter(item => !item["Catalog Identifiers - Album"]);

      // 1. Batch fetch metadata for items with catalog IDs (Fastest)
      if (withIds.length > 0) {
        const ids = withIds.map(item => item["Catalog Identifiers - Album"]);
        const metadataBatch = await fetchMetadataByIds(ids);
        const match = metadataBatch.find(album => matchesFilters(album, filters));
        if (match) return match;
      }

      // 2. Fallback to sequential search for items without IDs in this batch (Slower)
      for (const selected of withoutIds) {
        try {
          const album = await resolveAlbumMetadata(selected);
          if (matchesFilters(album, filters)) return album;
        } catch (e) {
          continue;
        }
      }
    }

    throw new Error("No matches found in library for these filters. Try broadening your criteria or use 'Discover'.");
  } catch (error) {
    console.error("Library shuffle error:", error);
    throw error;
  }
};

const resolveAlbumMetadata = async (selected: any): Promise<Album> => {
  const catalogId = selected["Catalog Identifiers - Album"];
  const title = selected["Title"];
  if (catalogId) {
    try {
      return await fetchMetadataById(catalogId);
    } catch (e) {
      return await fetchMetadataBySearch(title);
    }
  } else {
    return await fetchMetadataBySearch(title);
  }
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
  const { visible: visibleAlbums } = await getLibraryData();
  const visibleAlbumsSample = visibleAlbums
    .slice(0, 30)
    .map(a => a.Title)
    .join(", ");

  const filterSummary = [
    filters.decade && `Decade: ${filters.decade}`,
    filters.year && `Year: ${filters.year}`,
    filters.month && `Month: ${filters.month}`,
    filters.genre && `Genre: ${filters.genre}`,
    filters.artist && `Artist: ${filters.artist}`
  ].filter(Boolean).join(", ");

  const randomSeed = Math.random().toString(36).substring(7) + Date.now();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a world-class music curator. Recommend a single real music album.
               Criteria: ${filterSummary || 'An influential, critically acclaimed album'}.
               Mode: ${mode}.
               User's Library Context (they like these): ${visibleAlbumsSample}.
               Randomization Token: ${randomSeed}.
               
               IMPORTANT: 
               - If mode is "taste", provide something stylistically similar to the library context but NOT in the library.
               - If mode is "discovery", provide something unique or genre-bending outside their usual scope.
               - Strictly adhere to any specific Year or Decade filter provided.
               - Return ONLY the album and artist name.`,
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