
import { Album } from "../types";

export const fetchMetadataById = async (catalogId: string): Promise<Album> => {
  const response = await fetch(`https://itunes.apple.com/lookup?id=${catalogId}&entity=album`);
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("Could not find album metadata for ID: " + catalogId);
  }
  return mapItunesToAlbum(data.results[0]);
};

export const fetchMetadataBySearch = async (title: string, artist?: string): Promise<Album> => {
  const term = artist ? `${title} ${artist}` : title;
  const searchQuery = encodeURIComponent(term);
  const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=1`);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    // If exact search fails, try searching just the title
    if (artist) return fetchMetadataBySearch(title);
    throw new Error(`Could not find album matching: ${title}`);
  }
  return mapItunesToAlbum(data.results[0]);
};

export const mapItunesToAlbum = (result: any): Album => ({
  id: result.collectionId.toString(),
  name: result.collectionName,
  artist: result.artistName,
  artworkUrl: result.artworkUrl100.replace('100x100bb', '1200x1200bb'),
  releaseYear: new Date(result.releaseDate).getFullYear(),
  genre: result.primaryGenreName,
  appleMusicUrl: result.collectionViewUrl,
});
