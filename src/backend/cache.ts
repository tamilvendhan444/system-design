import type { CacheEntryMetadata, CacheMetrics } from '../types/index.ts';

interface CacheEntry<T = any> {
  value: T;
  expiresAt: number; // timestamp in ms
  createdAt: number;
  ttlSeconds: number;
  hitCount: number;
  sizeBytes: number;
}

class RedisCacheManager {
  private store: Map<string, CacheEntry> = new Map();
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private isEnabled = true;

  constructor() {
    // Periodic expiration cleanup every 15 seconds
    setInterval(() => {
      this.cleanExpired();
    }, 15000);
  }

  public get<T>(key: string): { data: T | null; isHit: boolean } {
    if (!this.isEnabled) {
      this.misses++;
      return { data: null, isHit: false };
    }

    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return { data: null, isHit: false };
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.evictions++;
      this.misses++;
      return { data: null, isHit: false };
    }

    entry.hitCount++;
    this.hits++;
    return { data: entry.value as T, isHit: true };
  }

  public set<T>(key: string, value: T, ttlSeconds = 120): void {
    if (!this.isEnabled) return;

    const strValue = JSON.stringify(value);
    const sizeBytes = Buffer.byteLength(strValue, 'utf-8');

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
      ttlSeconds,
      hitCount: 0,
      sizeBytes,
    };

    this.store.set(key, entry);
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(`^${pattern.replace('*', '.*')}`);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  public flush(): void {
    this.store.clear();
  }

  public getMetrics(): CacheMetrics {
    const totalReqs = this.hits + this.misses;
    const hitRatio = totalReqs > 0 ? Number((this.hits / totalReqs).toFixed(3)) : 0;

    let totalBytes = 0;
    for (const entry of this.store.values()) {
      totalBytes += entry.sizeBytes;
    }

    return {
      hits: this.hits,
      misses: this.misses,
      keysCount: this.store.size,
      hitRatio,
      memoryUsedKb: Number((totalBytes / 1024).toFixed(2)),
      evictionCount: this.evictions,
    };
  }

  public listKeys(): CacheEntryMetadata[] {
    const now = Date.now();
    const result: CacheEntryMetadata[] = [];

    for (const [key, entry] of this.store.entries()) {
      const remainingSeconds = Math.max(0, Math.round((entry.expiresAt - now) / 1000));
      result.push({
        key,
        ttlSeconds: remainingSeconds,
        expiresAt: entry.expiresAt,
        sizeBytes: entry.sizeBytes,
        hitCount: entry.hitCount,
      });
    }

    return result.sort((a, b) => b.hitCount - a.hitCount);
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        this.evictions++;
      }
    }
  }

  public toggle(enable?: boolean): boolean {
    if (enable !== undefined) {
      this.isEnabled = enable;
    } else {
      this.isEnabled = !this.isEnabled;
    }
    return this.isEnabled;
  }

  public getStatus(): { isEnabled: boolean; mode: 'IN_MEMORY_REDIS_SIMULATION'; clusterNodes: number } {
    return {
      isEnabled: this.isEnabled,
      mode: 'IN_MEMORY_REDIS_SIMULATION',
      clusterNodes: 3, // Primary + 2 replicas simulation
    };
  }
}

export const cache = new RedisCacheManager();
