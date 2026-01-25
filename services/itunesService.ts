
import { Album, Track } from "../types";

/**
 * iTunes API requires JSONP for client-side browser requests to avoid CORS issues.
 */
const jsonpFetch = <T>(url: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const callbackName = `itunes_cb_${Math.floor(Math.random() * 1000000)}`;
    const script = document.createElement('script');
    
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

    setTimeout(() => {
      if ((window as any)[callbackName]) {
        cleanup();
        reject(new Error(`JSONP request timed out for ${url}`));
      }
    }, 10000);

    document.head.appendChild(script);
  });
};

const normalizeForMatch = (str: string) => 
  str.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .replace(/[^a-z0-9]/g, '');

const calculateMatchScore = (result: any, targetTitle: string, targetArtist?: string): number => {
  let score = 0;
  const resTitle = normalizeForMatch(result.collectionName || "");
  const resArtist = normalizeForMatch(result.artistName || "");
  const cleanTargetTitle = normalizeForMatch(targetTitle);
  const cleanTargetArtist = targetArtist ? normalizeForMatch(targetArtist) : "";

  if (resTitle === cleanTargetTitle) score += 100;
  else if (resTitle.includes(cleanTargetTitle) || cleanTargetTitle.includes(resTitle)) score += 40;

  if (cleanTargetArtist) {
    if (resArtist === cleanTargetArtist) score += 80;
    else if (resArtist.includes(cleanTargetArtist) || cleanTargetArtist.includes(resArtist)) score += 30;
  }

  const isSingle = (result.collectionName || "").toLowerCase().includes("single");
  const targetIsSingle = targetTitle.toLowerCase().includes("single");
  
  if (isSingle && !targetIsSingle) score -= 150; 
  if (!isSingle && targetIsSingle) score -= 50;

  if (result.trackCount > 5) score += 10;
  
  return score;
};

export const isValidAlbum = (result: any): boolean => {
  if (!result) return false;
  const primaryGenre = (result.primaryGenreName || "").toLowerCase();
  const forbidden = ["karaoke", "fitness", "spoken word", "tribute"];
  if (forbidden.some(word => primaryGenre.includes(word))) return false;
  return !!result.collectionId;
};

export const fetchMetadataBySearch = async (title: string, artist?: string): Promise<Album> => {
  const cleanTitle = title.replace(/["']/g, "").trim();
  const isPlaceholderArtist = !artist || artist === "Unknown Artist" || artist === "Unknown" || artist.trim() === "";
  const cleanArtist = !isPlaceholderArtist ? artist!.replace(/["']/g, "").trim() : "";

  const performSearch = async (term: string) => {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=20`;
    const data: any = await jsonpFetch(url);
    return data.results || [];
  };

  let results = cleanArtist 
    ? await performSearch(`${cleanArtist} ${cleanTitle}`) 
    : await performSearch(cleanTitle);

  if (results.length === 0 && cleanArtist) {
    const reducedTitle = cleanTitle.replace(/^(the|a|an)\s+/i, "");
    if (reducedTitle !== cleanTitle) {
      results = await performSearch(`${cleanArtist} ${reducedTitle}`);
    }
  }

  if (results.length === 0) {
    results = await performSearch(cleanTitle);
  }

  const scoredMatches = results
    .filter(isValidAlbum)
    .map((r: any) => ({
      result: r,
      score: calculateMatchScore(r, cleanTitle, cleanArtist)
    }))
    .sort((a: any, b: any) => b.score - a.score);

  const bestMatch = scoredMatches[0]?.result;
  if (!bestMatch) throw new Error(`Catalog miss: "${cleanTitle}" not found.`);

  return mapItunesToAlbum(bestMatch);
};

export const fetchMetadataById = async (catalogId: string): Promise<Album> => {
  const firstId = catalogId.split(',')[0].trim();
  const url = `https://itunes.apple.com/lookup?id=${firstId}&entity=song`;
  
  try {
    const data: any = await jsonpFetch(url);
    if (!data.results || data.results.length === 0) throw new Error(`Catalog ID ${firstId} not found.`);
    
    const albumData = data.results.find((r: any) => r.wrapperType === 'collection');
    const songsData = data.results.filter((r: any) => r.wrapperType === 'track');

    const album = mapItunesToAlbum(albumData || data.results[0]);
    
    if (songsData.length > 0) {
      album.tracks = songsData.map((s: any) => ({
        id: s.trackId.toString(),
        name: s.trackName,
        durationMs: s.trackTimeMillis,
        trackNumber: s.trackNumber
      }));
    }
    
    return album;
  } catch (err: any) {
    throw err;
  }
};

export const mapItunesToAlbum = (result: any): Album => ({
  id: result.collectionId.toString(),
  name: result.collectionName,
  originalName: result.collectionName, 
  artist: result.artistName,
  artworkUrl: result.artworkUrl100 ? result.artworkUrl100.replace('100x100bb', '1200x1200bb') : `https://picsum.photos/seed/${result.collectionId}/1200/1200`,
  releaseYear: new Date(result.releaseDate).getFullYear(),
  genre: result.primaryGenreName,
  appleMusicUrl: result.collectionViewUrl,
  description: result.description || result.editorialNotes?.standard || result.editorialNotes?.short || "",
});
