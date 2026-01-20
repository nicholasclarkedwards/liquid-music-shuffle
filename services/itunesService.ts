
import { Album } from "../types";

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

  // 1. Title matching
  if (resTitle === cleanTargetTitle) score += 100;
  else if (resTitle.includes(cleanTargetTitle) || cleanTargetTitle.includes(resTitle)) score += 40;

  // 2. Artist matching
  if (cleanTargetArtist) {
    if (resArtist === cleanTargetArtist) score += 80;
    else if (resArtist.includes(cleanTargetArtist) || cleanTargetArtist.includes(resArtist)) score += 30;
  }

  // 3. Type Penalties (CRITICAL for "19" vs "Skyfall - Single")
  const isSingle = (result.collectionName || "").toLowerCase().includes("single");
  const targetIsSingle = targetTitle.toLowerCase().includes("single");
  
  if (isSingle && !targetIsSingle) score -= 150; // Heavy penalty for unwanted singles
  if (!isSingle && targetIsSingle) score -= 50;

  // 4. Popularity/Completeness bonus
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
    // Search a wider pool to find the best scoring match
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=20`;
    console.log(`[ITunesService] Searching: ${url}`);
    const data: any = await jsonpFetch(url);
    return data.results || [];
  };

  // PASS 1: Try combined term (Best for specific matches)
  let results = cleanArtist 
    ? await performSearch(`${cleanArtist} ${cleanTitle}`) 
    : await performSearch(cleanTitle);

  // PASS 2: If nothing found, try permutations (e.g. remove "the", "and")
  if (results.length === 0 && cleanArtist) {
    const reducedTitle = cleanTitle.replace(/^(the|a|an)\s+/i, "");
    if (reducedTitle !== cleanTitle) {
      results = await performSearch(`${cleanArtist} ${reducedTitle}`);
    }
  }

  // PASS 3: Broad fallback (Search just title, score by artist later)
  if (results.length === 0) {
    results = await performSearch(cleanTitle);
  }

  // FILTER & SCORE
  const scoredMatches = results
    .filter(isValidAlbum)
    .map((r: any) => ({
      result: r,
      score: calculateMatchScore(r, cleanTitle, cleanArtist)
    }))
    .sort((a: any, b: any) => b.score - a.score);

  const bestMatch = scoredMatches[0]?.result;
  if (!bestMatch) throw new Error(`Catalog miss: "${cleanTitle}" not found.`);

  console.log(`[ITunesService] Best Match: "${bestMatch.collectionName}" by ${bestMatch.artistName} (Score: ${scoredMatches[0].score})`);

  const album = mapItunesToAlbum(bestMatch);
  album.originalName = title; 
  return album;
};

export const fetchMetadataById = async (catalogId: string): Promise<Album> => {
  const firstId = catalogId.split(',')[0].trim();
  const url = `https://itunes.apple.com/lookup?id=${firstId}&entity=album`;
  
  try {
    const data: any = await jsonpFetch(url);
    if (!data.results || data.results.length === 0) throw new Error(`Catalog ID ${firstId} not found.`);
    return mapItunesToAlbum(data.results[0]);
  } catch (err: any) {
    console.warn(`[ITunesService] ID Lookup failed: ${err.message}. Fallback to search.`);
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
});
