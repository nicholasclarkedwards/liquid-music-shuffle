import { Album } from "../types";

export const fetchMetadataById = async (catalogId: string): Promise<Album> => {
  const response = await fetch(`https://itunes.apple.com/lookup?id=${catalogId}&entity=album`);
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("Target album no longer available in the active store region.");
  }
  return mapItunesToAlbum(data.results[0]);
};

export const fetchMetadataByIds = async (catalogIds: string[]): Promise<Album[]> => {
  if (catalogIds.length === 0) return [];
  const response = await fetch(`https://itunes.apple.com/lookup?id=${catalogIds.join(',')}&entity=album`);
  const data = await response.json();
  return (data.results || [])
    .filter((r: any) => r.collectionType === "Album")
    .map(mapItunesToAlbum);
};

export const fetchMetadataBySearch = async (title: string, artist?: string): Promise<Album> => {
  const term = artist ? `${artist} ${title}` : title;
  const searchQuery = encodeURIComponent(term);
  
  const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=20`);
  const data = await response.json();

  let results = data.results || [];
  let albums = results.filter((r: any) => r.collectionType === "Album");

  if (albums.length === 0 && results.length > 0) {
    albums = results;
  }

  if (albums.length === 0) {
    const fallbackQuery = encodeURIComponent(title);
    const fallbackResponse = await fetch(`https://itunes.apple.com/search?term=${fallbackQuery}&entity=album&limit=5`);
    const fallbackData = await fallbackResponse.json();
    albums = (fallbackData.results || []).filter((r: any) => r.collectionType === "Album");
    if (albums.length === 0 && fallbackData.results?.length > 0) albums = fallbackData.results;
  }

  if (albums.length === 0) {
    throw new Error(`Catalog miss: No matching album found for "${title}".`);
  }

  if (artist) {
    const targetArtist = artist.toLowerCase();
    const artistMatch = albums.find((r: any) => {
      const resultArtist = r.artistName.toLowerCase();
      return resultArtist.includes(targetArtist) || targetArtist.includes(resultArtist);
    });
    if (artistMatch) return mapItunesToAlbum(artistMatch);
  }

  return mapItunesToAlbum(albums[0]);
};

export const mapItunesToAlbum = (result: any): Album => ({
  id: result.collectionId.toString(),
  name: result.collectionName,
  artist: result.artistName,
  artworkUrl: result.artworkUrl100 ? result.artworkUrl100.replace('100x100bb', '1200x1200bb') : `https://picsum.photos/seed/${result.collectionId}/1200/1200`,
  releaseYear: new Date(result.releaseDate).getFullYear(),
  genre: result.primaryGenreName,
  appleMusicUrl: result.collectionViewUrl,
});