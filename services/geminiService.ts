
import { GoogleGenAI, Type } from "@google/genai";
import { Album, Filters, DiscoveryMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const discoverAlbum = async (filters: Filters, mode: DiscoveryMode): Promise<Album> => {
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

  const searchQuery = encodeURIComponent(`${recommendation.albumName} ${recommendation.artistName}`);
  const itunesResponse = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=1`);
  const itunesData = await itunesResponse.json();

  if (!itunesData.results || itunesData.results.length === 0) {
    const fallbackQuery = encodeURIComponent(recommendation.albumName);
    const fallbackResponse = await fetch(`https://itunes.apple.com/search?term=${fallbackQuery}&entity=album&limit=1`);
    const fallbackData = await fallbackResponse.json();
    
    if (!fallbackData.results || fallbackData.results.length === 0) {
      throw new Error("Could not find this album in the Apple Music catalog.");
    }
    return mapItunesToAlbum(fallbackData.results[0], recommendation.albumName);
  }

  return mapItunesToAlbum(itunesData.results[0], recommendation.albumName);
};

const mapItunesToAlbum = (result: any, originalName?: string): Album => ({
  id: result.collectionId.toString(),
  name: result.collectionName,
  originalName: originalName || result.collectionName,
  artist: result.artistName,
  artworkUrl: result.artworkUrl100.replace('100x100bb', '800x800bb'),
  releaseYear: new Date(result.releaseDate).getFullYear(),
  genre: result.primaryGenreName,
  appleMusicUrl: result.collectionViewUrl,
});
