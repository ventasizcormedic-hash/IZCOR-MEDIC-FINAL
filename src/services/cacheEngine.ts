import crypto from 'crypto';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
  etag: string;
  sizeBytes: number;
  hits: number;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number; // 0 - 100%
  totalEntries: number;
  estimatedMemoryBytes: number;
  evictions: number;
  tagsCount: number;
}

export class CacheEngine {
  private store: Map<string, CacheEntry<any>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private stats: { hits: number; misses: number; evictions: number } = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };
  private maxEntries: number = 10000;

  constructor(maxEntries = 10000) {
    this.maxEntries = maxEntries;

    // Periodic cleanup of expired keys every 60 seconds
    setInterval(() => {
      this.evictExpired();
    }, 60000).unref();
  }

  /**
   * Generates a stable ETag for a payload
   */
  public generateETag(data: any): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return `"${crypto.createHash('md5').update(str).digest('hex').slice(0, 16)}"`;
  }

  /**
   * Retrieves an item from cache if valid and not expired
   */
  public get<T>(key: string): { value: T; etag: string } | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return { value: entry.value, etag: entry.etag };
  }

  /**
   * Stores an item with TTL in seconds and associated invalidation tags
   */
  public set<T>(key: string, value: T, ttlSeconds: number = 300, tags: string[] = []): string {
    if (this.store.size >= this.maxEntries) {
      this.evictLRU();
    }

    const payloadStr = typeof value === 'string' ? value : JSON.stringify(value);
    const etag = this.generateETag(payloadStr);
    const sizeBytes = payloadStr.length * 2; // rough memory estimate

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags,
      etag,
      sizeBytes,
      hits: 0,
      createdAt: Date.now(),
    };

    // Remove old tags for key if it was updated
    this.deleteTagsIndex(key);

    this.store.set(key, entry);

    // Index tags
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }

    return etag;
  }

  /**
   * Invalidate a single key
   */
  public delete(key: string): boolean {
    this.deleteTagsIndex(key);
    return this.store.delete(key);
  }

  /**
   * Invalidate all keys associated with a specific tag (granular invalidation)
   * Example: invalidateTag('catalog') or invalidateTag('product:42')
   */
  public invalidateTag(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let count = 0;
    for (const key of keys) {
      this.store.delete(key);
      count++;
    }

    this.tagIndex.delete(tag);
    return count;
  }

  /**
   * Clear all cache
   */
  public clear(): void {
    this.store.clear();
    this.tagIndex.clear();
  }

  /**
   * Cache telemetry statistics
   */
  public getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    let totalBytes = 0;
    for (const entry of this.store.values()) {
      totalBytes += entry.sizeBytes;
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRatio: Math.round(hitRatio * 10) / 10,
      totalEntries: this.store.size,
      estimatedMemoryBytes: totalBytes,
      evictions: this.stats.evictions,
      tagsCount: this.tagIndex.size,
    };
  }

  private deleteTagsIndex(key: string): void {
    const entry = this.store.get(key);
    if (entry && entry.tags) {
      for (const tag of entry.tags) {
        const set = this.tagIndex.get(tag);
        if (set) {
          set.delete(key);
          if (set.size === 0) this.tagIndex.delete(tag);
        }
      }
    }
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.delete(key);
      }
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let minHits = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }
}

export const cacheEngine = new CacheEngine(15000);
