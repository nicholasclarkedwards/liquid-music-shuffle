
import { Album } from "../types";

/**
 * Note: AI discovery logic is now primarily handled in musicService.ts 
 * to share context with the user's library.
 * This file serves as a mapping utility for GenAI parts.
 */

export const mapItunesToAlbum = (result: any, originalName?: string): Album => ({
  id: result.collectionId.toString(),
  name: result.collectionName,
  originalName: originalName || result.collectionName,
  artist: result.artistName,
  artworkUrl: result.artworkUrl100 ? result.artworkUrl100.replace('100x100bb', '800x800bb') : '',
  releaseYear: new Date(result.releaseDate).getFullYear(),
  genre: result.primaryGenreName,
  appleMusicUrl: result.collectionViewUrl,
});
