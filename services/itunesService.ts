
import { Album } from "../types";

/**
 * iTunes API requires JSONP for client-side browser requests to avoid CORS issues.
 */
const jsonpFetch = <T>(url: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const callbackName = `itunes_cb_${Math.floor(Math.random() * 1000000)}`;
    const script = document.createElement('script');
    
    // Clean up function to remove script and global callback
    const cleanup = () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete (window as any)[callbackName];
    };

    (window as any)[callbackName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error(`JSONP request failed for ${url}`));
    };

    // Auto-reject on timeout
    setTimeout(() => {
      if ((window as any)[callbackName]) {
        cleanup();
        reject(new Error(`JSONP request timed out for ${url}`));
      }
    }, 10000);

    document.head.appendChild(script);
  });
};

export const isValidAlbum = (result: any): boolean => {
  if (!result) return false;
  const primaryGenre = (result.primaryGenreName || "").toLowerCase();
  if (primaryGenre.includes("karaoke") || primaryGenre.includes("fitness") || primaryGenre.includes("spoken word")) {
    return false;
  }
  return !!result.collectionId;
};

export const fetchMetadataBySearch = async (title: string, artist?: string): Promise<Album> => {
  const cleanTitle = title.replace(/["']/g, "").trim();
  const cleanArtist = artist ? artist.replace(/["']/g, "").trim() : "";

  const performSearch = async (term: string) => {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=5`;
    console.log(`[ITunesService] Searching: ${url}`);
    const data: any = await jsonpFetch(url);
    return data.results || [];
  };

  let results = await performSearch(`${cleanArtist} ${cleanTitle}`);
  if (results.length === 0) results = await performSearch(cleanTitle);
  if (results.length === 0 && cleanTitle.length > 10) results = await performSearch(cleanTitle.substring(0, 15));

  const bestMatch = results.find(isValidAlbum) || results[0];
  if (!bestMatch) throw new Error(`Catalog miss: "${cleanTitle}" not found.`);

  return mapItunesToAlbum(bestMatch);
};

export const fetchArtistAlbum = async (artistName: string): Promise<Album> => {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=album&attribute=artistTerm&limit=50`;
  console.log(`[ITunesService] Fetching artist albums: ${url}`);
  const data: any = await jsonpFetch(url);
  const results = (data.results || []).filter(isValidAlbum);
  if (results.length === 0) throw new Error(`No projects found for artist "${artistName}".`);
  return mapItunesToAlbum(results[Math.floor(Math.random() * results.length)]);
};

export const fetchMetadataById = async (catalogId: string): Promise<Album> => {
  // Handle comma separated IDs from albums.json
  const firstId = catalogId.split(',')[0].trim();
  const url = `https://itunes.apple.com/lookup?id=${firstId}&entity=album`;
  console.log(`[ITunesService] Lookup by ID: ${url}`);
  
  try {
    const data: any = await jsonpFetch(url);
    if (!data.results || data.results.length === 0) throw new Error(`Catalog ID ${firstId} not found.`);
    return mapItunesToAlbum(data.results[0]);
  } catch (err: any) {
    console.error(`[ITunesService] Fetch error for ID ${firstId}:`, err.message);
    throw err;
  }
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
