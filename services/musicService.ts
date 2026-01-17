
import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";
import { fetchMetadataById, fetchMetadataBySearch } from "./itunesService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Cache the library data to avoid redundant network requests
let cachedLibrary: any[] | null = null;

export const getRandomLibraryAlbum = async (): Promise<Album> => {
  try {
    if (!cachedLibrary) {
      // Fetch the library JSON file directly via HTTP
      const response = await fetch('./library.json');
      if (!response.ok) {
        throw new Error(`Failed to load library.json: ${response.statusText}`);
      }
      cachedLibrary = await response.json();
    }
    
    // Filter library to only include albums marked as visible
    const visibleAlbums = cachedLibrary!.filter(album => album.Visible === true);
    
    if (!visibleAlbums.length) {
      throw new Error("No visible albums found in your library.");
    }

    // Pick a random index from the visible library
    const randomIndex = Math.floor(Math.random() * visibleAlbums.length);
    const selected = visibleAlbums[randomIndex];

    const catalogId = selected["Catalog Identifiers - Album"];
    const title = selected["Title"];

    // Use Catalog ID if available for better accuracy, otherwise search by title
    if (catalogId) {
      try {
        return await fetchMetadataById(catalogId);
      } catch (e) {
        console.warn("Catalog ID lookup failed, falling back to title search:", title);
        return await fetchMetadataBySearch(title);
      }
    } else {
      return await fetchMetadataBySearch(title);
    }
  } catch (error) {
    console.error("Library shuffle error:", error);
    throw error;
  }
};

export const discoverAlbumViaAI = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
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
    contents: `Recommend a single real music album based on these criteria: ${filterSummary || 'An influential, critically acclaimed album'}. 
               Current mode: ${mode}.
               Randomization Token: ${randomSeed}.
               IMPORTANT: Be wildly varied and creative. Do not repeat the most famous choices. 
               If mode is "taste", pick a definitive classic. If "discovery", pick a deep cut or slightly obscure gem.`,
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
