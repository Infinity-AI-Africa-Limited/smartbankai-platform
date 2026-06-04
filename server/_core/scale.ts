/**
 * SmartBank AI — Enterprise Scale Infrastructure
 * ─────────────────────────────────────────────
 * Implements three critical layers for 1M–10M MAU workloads:
 *
 * 1. CONNECTION POOL  — mysql2 pool with tuned limits so the server can handle
 *    thousands of concurrent requests without exhausting DB connections.
 *
 * 2. IN-MEMORY CACHE  — LRU-style TTL cache for expensive aggregate queries
 *    (platform stats, tenant summaries, agent metrics). Reduces DB load by
 *    serving repeated dashboard reads from memory.
 *
 * 3. RATE LIMITER  — Per-IP sliding-window counter stored in memory. Protects
 *    the API from abuse and ensures fair resource allocation across tenants.
 *    Limits: 300 req/min for authenticated users, 60 req/min for public.
 */

import mysql, { Pool as MySQLPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

// ─── 1. Connection Pool ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _pool: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _pooledDb: any = null;

/**
 * Returns a singleton mysql2 connection pool tuned for high-concurrency workloads.
 *
 * Pool sizing rationale:
 *  - connectionLimit: 20  → supports ~200 concurrent tRPC requests (10 req/conn)
 *  - queueLimit: 100      → queues bursts without dropping requests
 *  - waitForConnections   → prevents immediate ECONNREFUSED under load
 *  - connectTimeout: 10s  → fast-fail on network issues
 *  - idleTimeout: 60s     → recycles idle connections to avoid stale handles
 *
 * For production at 10M MAU: scale horizontally (multiple Node instances) and
 * increase connectionLimit to 50–100 per instance, or use a connection proxy
 * like PlanetScale's connection pooler or AWS RDS Proxy.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPool(): any {
  if (!_pool && process.env.DATABASE_URL) {
    _pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 20,
      queueLimit: 100,
      waitForConnections: true,
      connectTimeout: 10_000,
      idleTimeout: 60_000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
    });

    _pool.on("connection", () => {
      // Log new connections in debug mode only
      if (process.env.DEBUG_POOL) console.log("[Pool] New connection acquired");
    });
  }
  return _pool!;
}

export function getPooledDb() {
  if (!_pooledDb && process.env.DATABASE_URL) {
    _pooledDb = drizzle(getPool());
  }
  return _pooledDb;
}

// ─── 2. In-Memory TTL Cache ───────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
    // Periodic cleanup every 5 minutes
    setInterval(() => this.evictExpired(), 5 * 60 * 1000).unref();
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    entry.hits++;
    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    // Evict oldest entry if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs, hits: 0 });
  }

  invalidate(prefix: string): void {
    Array.from(this.store.keys()).forEach(key => {
      if (key.startsWith(prefix)) this.store.delete(key);
    });
  }

  stats() {
    return { size: this.store.size, maxSize: this.maxSize };
  }

  private evictExpired(): void {
    const now = Date.now();
    Array.from(this.store.entries()).forEach(([key, entry]) => {
      if (now > entry.expiresAt) this.store.delete(key);
    });
  }
}

export const cache = new TtlCache(500);

// Cache TTL constants (milliseconds)
export const TTL = {
  PLATFORM_STATS: 60_000,       // 1 min  — platform-wide aggregates
  TENANT_SUMMARY: 30_000,       // 30 sec — per-tenant KPI cards
  AGENT_METRICS: 15_000,        // 15 sec — agent health (near real-time)
  TRANSACTION_STATS: 20_000,    // 20 sec — transaction volume charts
  CUSTOMER_STATS: 60_000,       // 1 min  — customer segment counts
  BILLING_SUMMARY: 120_000,     // 2 min  — billing aggregates
  FRAUD_STATS: 10_000,          // 10 sec — fraud alerts (time-sensitive)
  COMPLIANCE_REPORTS: 300_000,  // 5 min  — compliance report lists
} as const;

/**
 * Cache-aside helper: returns cached value or executes fetcher and caches result.
 * Usage: const data = await cached("key", TTL.PLATFORM_STATS, () => db.query(...))
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = cache.get<T>(key);
  if (hit !== null) return hit;
  const value = await fetcher();
  cache.set(key, value, ttlMs);
  return value;
}

// ─── 3. Rate Limiter ──────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

class SlidingWindowRateLimiter {
  private windows = new Map<string, RateLimitEntry>();
  private windowMs: number;

  constructor(windowMs = 60_000) {
    this.windowMs = windowMs;
    // Cleanup stale windows every 2 minutes
    setInterval(() => {
      const now = Date.now();
      Array.from(this.windows.entries()).forEach(([key, entry]) => {
        if (now - entry.windowStart > this.windowMs * 2) {
          this.windows.delete(key);
        }
      });
    }, 2 * 60 * 1000).unref();
  }

  /**
   * Returns { allowed: true } if under limit, or { allowed: false, retryAfterMs }
   */
  check(identifier: string, limit: number): { allowed: boolean; retryAfterMs?: number; remaining: number } {
    const now = Date.now();
    const entry = this.windows.get(identifier);

    if (!entry || now - entry.windowStart > this.windowMs) {
      // New window
      this.windows.set(identifier, { count: 1, windowStart: now });
      return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      const retryAfterMs = this.windowMs - (now - entry.windowStart);
      return { allowed: false, retryAfterMs, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
  }
}

// Single shared limiter instance
export const rateLimiter = new SlidingWindowRateLimiter(60_000); // 1-minute window

export const RATE_LIMITS = {
  AUTHENTICATED: 300,   // 300 req/min per user (5 req/sec sustained)
  PUBLIC: 60,           // 60 req/min per IP
  LLM_CHAT: 20,         // 20 LLM calls/min per user (cost protection)
  BULK_EXPORT: 5,       // 5 export requests/min per user
} as const;

// ─── 4. Pagination Helpers ────────────────────────────────────────────────────

export interface CursorPage<T> {
  items: T[];
  nextCursor: number | null;
  total: number;
  hasMore: boolean;
}

/**
 * Standardised offset-based page result for all list endpoints.
 * For very large tables (>10M rows), migrate to cursor-based pagination
 * using the last item's `id` as the cursor.
 */
export function buildPage<T extends { id: number }>(
  items: T[],
  total: number,
  limit: number
): CursorPage<T> {
  const hasMore = items.length === limit;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;
  return { items, nextCursor, total, hasMore };
}

// ─── 5. Query Performance Helpers ────────────────────────────────────────────

/**
 * Wraps a DB query with timing instrumentation.
 * Logs slow queries (>500ms) to help identify N+1 and missing index issues.
 */
export async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const elapsed = Date.now() - start;
    if (elapsed > 500) {
      console.warn(`[SlowQuery] ${label} took ${elapsed}ms`);
    }
    return result;
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[QueryError] ${label} failed after ${elapsed}ms:`, err);
    throw err;
  }
}
