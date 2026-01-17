import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataById, fetchMetadataBySearch } from "./itunesService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let cachedLibrary: any[] | null = null;

const getLibraryData = async () => {
  if (!cachedLibrary) {
    const response = await fetch('./library.json');
    if (!response.ok) {
      throw new Error(`Failed to load library.json`);
    }
    cachedLibrary = await response.json();
  }
  return cachedLibrary!;
};

const matchesFilters = (album: Album, filters: Filters): boolean => {
  if (filters.year && album.releaseYear.toString() !== filters.year) return false;
  if (filters.decade) {
    const decadeStart = parseInt(filters.decade.substring(0, 4));
    if (album.releaseYear < decadeStart || album.releaseYear >= decadeStart + 10) return false;
  }
  if (filters.genre && !album.genre.toLowerCase().includes(filters.genre.toLowerCase())) return false;
  if (filters.artist && !album.artist.toLowerCase().includes(filters.artist.toLowerCase())) return false;
  // Month is trickier with library shuffles as release dates are partial, skipping strict month check for now
  return true;
};

export const getRandomLibraryAlbum = async (filters: Filters): Promise<Album> => {
  try {
    const library = await getLibraryData();
    const visibleAlbums = library.filter(album => album.Visible === true);
    
    if (!visibleAlbums.length) {
      throw new Error("No visible albums found in your library.");
    }

    const hasActiveFilters = Object.values(filters).some(f => f !== '');
    
    if (!hasActiveFilters) {
      const randomIndex = Math.floor(Math.random() * visibleAlbums.length);
      const selected = visibleAlbums[randomIndex];
      return await resolveAlbumMetadata(selected);
    }

    // Filtered Shuffle Strategy: Sample random items and check metadata
    // We try up to 25 times to find a match to balance speed and accuracy
    let attempts = 0;
    const shuffledPool = [...visibleAlbums].sort(() => Math.random() - 0.5);
    
    for (const selected of shuffledPool.slice(0, 25)) {
      try {
        const album = await resolveAlbumMetadata(selected);
        if (matchesFilters(album, filters)) {
          return album;
        }
      } catch (e) {
        continue;
      }
      attempts++;
    }

    throw new Error("Could not find a library match for your specific filters. Try 'Discover' mode or broaden your criteria.");
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
  const library = await getLibraryData();
  const visibleAlbumsSample = library
    .filter(album => album.Visible === true)
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