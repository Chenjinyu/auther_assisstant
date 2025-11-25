/**
 * Implements a simple in-memory cache to satisfy the requirement:
 * "if some questions have been asked oftenly, the data stores in cache database."
 */

interface CacheEntry {
  response: string;
  hits: number;
  lastAccessed: number;
}

const CACHE_LIMIT = 50;
const memoryCache = new Map<string, CacheEntry>();

export const getCachedResponse = (query: string): string | null => {
  const normalizedKey = query.trim().toLowerCase();
  const entry = memoryCache.get(normalizedKey);

  if (entry) {
    entry.hits += 1;
    entry.lastAccessed = Date.now();
    console.log(`[Cache Hit] for query: "${query}"`);
    return entry.response;
  }
  return null;
};

export const setCachedResponse = (query: string, response: string): void => {
  const normalizedKey = query.trim().toLowerCase();

  // Eviction policy: Remove least recently used if over limit
  if (memoryCache.size >= CACHE_LIMIT) {
    let oldestKey = '';
    let oldestTime = Infinity;

    for (const [key, val] of memoryCache.entries()) {
      if (val.lastAccessed < oldestTime) {
        oldestTime = val.lastAccessed;
        oldestKey = key;
      }
    }
    if (oldestKey) memoryCache.delete(oldestKey);
  }

  memoryCache.set(normalizedKey, {
    response,
    hits: 1,
    lastAccessed: Date.now()
  });
};
