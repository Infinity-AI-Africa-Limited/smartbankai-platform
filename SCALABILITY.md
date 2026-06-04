# SmartBank AI — Scalability Architecture

**Platform:** SmartBank AI by Infinity AI Africa Limited
**Target Scale:** 1M–10M Monthly Active Users (MAUs) | Millions of daily transactions
**Document Version:** 1.0 | June 2026

---

## Executive Summary

SmartBank AI is architected to scale from a single-tenant pilot deployment to a multi-tenant platform serving 1M–10M MAUs and processing millions of daily transactions across Nigeria and the African continent. This document details every scalability decision embedded in the platform and the infrastructure path required to reach each scale tier.

---

## Scale Tiers

| Tier | MAUs | Daily Transactions | Concurrent Users | Infrastructure |
|---|---|---|---|---|
| **Tier 1 — Pilot** | Up to 50K | Up to 100K/day | 500 | Single node, managed DB |
| **Tier 2 — Growth** | 50K–500K | 100K–1M/day | 5,000 | 2–4 nodes, read replicas |
| **Tier 3 — Scale** | 500K–3M | 1M–5M/day | 25,000 | Horizontal cluster, Redis |
| **Tier 4 — Enterprise** | 3M–10M+ | 5M–20M+/day | 100,000+ | Multi-region, CDN, Kafka |

---

## Database Layer

### Indexing Strategy (Implemented)

All high-traffic query paths are covered by composite indexes applied via `scripts/add-scale-indexes.mjs`. The following 36 indexes are active:

**Transactions Table** — the highest-volume table at scale:
- `(tenantId, createdAt DESC)` — time-ordered transaction feeds per tenant
- `(tenantId, fraudStatus, createdAt DESC)` — fraud alert queues
- `(tenantId, channel, createdAt DESC)` — channel analytics breakdowns
- `(tenantId, customerId, createdAt DESC)` — Customer 360 transaction history
- `(tenantId, riskScore DESC)` — risk-ranked transaction views
- `(transactionRef)` — unique lookup by reference (UNIQUE index)

**Customers Table:**
- `(tenantId, createdAt DESC)` — customer list pagination
- `(tenantId, riskCategory)` — risk-segmented customer queries
- `(tenantId, segment)` — segment-based personalization queries
- `(bvn)`, `(nin)` — KYC identity lookups (UNIQUE indexes)
- `(tenantId, accountNumber)` — account lookup

**Agent Events Table:**
- `(tenantId, agentName, createdAt DESC)` — per-agent event streams
- `(tenantId, status, createdAt DESC)` — failed event monitoring
- `(transactionId)` — event-to-transaction joins

**AML Alerts, Credit Applications, Compliance Reports, Channel Sessions** — all indexed on `(tenantId, createdAt DESC)` and status fields.

### Connection Pooling (Implemented)

The `server/_core/scale.ts` module provides a production-grade MySQL connection pool:

```typescript
// Configuration in scale.ts
const pool = mysql.createPool({
  connectionLimit: 20,      // Max 20 concurrent DB connections per node
  queueLimit: 100,          // Queue up to 100 waiting requests
  waitForConnections: true,
  connectTimeout: 10_000,
  acquireTimeout: 30_000,
  idleTimeout: 60_000,
});
```

At **Tier 3+**, replace with PlanetScale (serverless MySQL) or TiDB Serverless for automatic horizontal scaling without connection management.

### Query Optimisation Patterns

All high-traffic procedures use:
1. **Cursor-based pagination** instead of OFFSET — avoids full table scans at large offsets
2. **`Promise.all()`** for parallel queries — reduces latency by running independent queries concurrently
3. **Selective column projection** — never `SELECT *` on large tables
4. **Result set limits** — all list queries enforce a maximum page size of 100 rows

---

## Caching Layer (Implemented)

The `cached()` helper in `server/_core/scale.ts` provides an in-process LRU cache with TTL-based expiry:

```typescript
// TTL configuration
export const TTL = {
  PLATFORM_STATS:  60_000,  // 1 minute  — aggregate counts
  TENANT_SUMMARY:  30_000,  // 30 seconds — tenant overview KPIs
  AGENT_METRICS:   15_000,  // 15 seconds — agent health metrics
  CUSTOMER_LIST:   20_000,  // 20 seconds — paginated customer lists
  TRANSACTION_FEED: 5_000,  // 5 seconds  — live transaction feed
};
```

**Cached procedures:**
- `platform.stats` — platform-wide aggregate stats (1 min TTL)
- `platform.agentMetrics` — agent health metrics (15 sec TTL)
- `tenants.list` — full tenant list (30 sec TTL)
- `tenants.stats` — tenant aggregate stats (30 sec TTL)
- `tenantOverview.summary` — per-tenant KPI dashboard (30 sec TTL)

**At Tier 3+ (500K+ MAUs):** Replace the in-process cache with **Redis** (AWS ElastiCache or Upstash) to share cache state across multiple Node.js instances. The `cached()` helper interface is designed to be swapped without changing any calling code.

---

## API Layer

### Rate Limiting (Implemented)

Per-IP rate limiting is enforced at the Express middleware level via `server/_core/scale.ts`:

```typescript
export const RATE_LIMITS = {
  API_GENERAL:  { windowMs: 60_000, max: 100 },  // 100 req/min per IP
  API_AUTH:     { windowMs: 60_000, max: 10  },  // 10 auth req/min
  API_LLM:      { windowMs: 60_000, max: 20  },  // 20 LLM req/min
  API_REPORTS:  { windowMs: 60_000, max: 30  },  // 30 report req/min
};
```

At Tier 3+, move rate limiting to an API Gateway (AWS API Gateway, Kong, or Nginx) to enforce limits before requests reach the application tier.

### Pagination

All list endpoints support cursor-based pagination:
- `limit` — page size (default 50, max 100)
- `cursor` — last seen ID for next-page fetching
- `offset` — fallback for admin views (not used in high-traffic paths)

### tRPC Batching

The tRPC client is configured to batch multiple procedure calls into a single HTTP request, reducing round-trips for dashboard pages that call 4–6 procedures simultaneously.

---

## Frontend Performance (Implemented)

### Code Splitting

Vite's Rollup configuration splits the application into 7 chunks:

| Chunk | Contents | Size (est.) |
|---|---|---|
| `vendor-react` | React + React DOM | ~140KB |
| `vendor-charts` | Recharts | ~280KB |
| `vendor-trpc` | tRPC + React Query | ~90KB |
| `vendor-ui` | Framer Motion + Lucide + Streamdown | ~120KB |
| `chunk-admin` | 6 super-admin pages | ~80KB |
| `chunk-agents` | 9 agent panels | ~150KB |
| `chunk-tenant` | 10 tenant portal pages | ~130KB |

**Initial load:** Only `vendor-react`, `vendor-trpc`, and the layout components (~250KB gzipped ~80KB) are loaded on first visit. All other chunks are loaded on demand.

### Lazy Loading

All 25 route-level components use `React.lazy()` with `<Suspense>` boundaries. Each navigation event triggers a dynamic import of only the required chunk, not the entire application bundle.

### React Query Caching

All tRPC queries use React Query's built-in stale-while-revalidate strategy:
- `staleTime: 30_000` — data is considered fresh for 30 seconds
- `gcTime: 300_000` — unused data is garbage collected after 5 minutes
- Optimistic updates on mutations — UI updates instantly, server confirms asynchronously

---

## Infrastructure Scaling Path

### Tier 1 → Tier 2 (50K → 500K MAUs)

No code changes required. Infrastructure changes only:
1. Add 1–2 read replicas to the MySQL database
2. Point read-heavy queries (stats, lists) to read replicas
3. Add a CDN (CloudFront or Cloudflare) in front of the static frontend
4. Increase Node.js instance size (2 vCPU → 4 vCPU)

### Tier 2 → Tier 3 (500K → 3M MAUs)

1. **Replace in-process cache with Redis** — swap `cached()` implementation in `scale.ts`
2. **Horizontal scaling** — run 3–5 Node.js instances behind a load balancer (AWS ALB)
3. **Database sharding** — shard the `transactions` table by `tenantId`
4. **Queue-based agent processing** — move AI agent invocations to a job queue (BullMQ + Redis)
5. **Separate read/write APIs** — route mutations to primary, queries to read replicas

### Tier 3 → Tier 4 (3M → 10M+ MAUs)

1. **Event streaming** — replace synchronous transaction processing with Kafka event streams
2. **Multi-region deployment** — deploy to Lagos (primary), Nairobi (East Africa), Johannesburg (Southern Africa)
3. **Database per tenant** — large tenants (>1M customers) get dedicated database instances
4. **ML model serving** — move fraud and credit scoring to dedicated GPU inference endpoints (AWS SageMaker)
5. **API Gateway** — Kong or AWS API Gateway for rate limiting, authentication, and routing at the edge

---

## Security at Scale

| Layer | Implementation |
|---|---|
| **Authentication** | JWT with 24h expiry, refresh token rotation |
| **Authorisation** | RBAC enforced at tRPC procedure level (`adminProcedure`, `protectedProcedure`) |
| **Transport** | TLS 1.3 enforced (handled by platform/CDN layer) |
| **Data at rest** | AES-256 encryption for PII fields (BVN, NIN, account numbers) |
| **Rate limiting** | Per-IP limits at API layer, per-tenant limits at application layer |
| **Audit logging** | All mutations write to `auditLogs` table with user, action, and timestamp |
| **CBN compliance** | NDPR-compliant data residency — all data stored in Nigerian/African cloud regions |

---

## Monitoring & Observability

At Tier 2+, add:
- **APM:** Datadog or New Relic for request tracing across all agent procedures
- **Metrics:** Prometheus + Grafana for database query latency, cache hit rates, and error rates
- **Alerting:** PagerDuty integration for fraud spike alerts and agent failure notifications
- **Structured logging:** Replace `console.log` with Winston/Pino for JSON-structured log aggregation

---

## Summary: What Is Already Built vs. What Scales with Infrastructure

| Capability | Status | Scales to |
|---|---|---|
| Composite DB indexes (36 indexes) | ✅ Implemented | Tier 4 |
| Connection pooling (20 connections) | ✅ Implemented | Tier 2 |
| In-process LRU cache with TTL | ✅ Implemented | Tier 2 |
| API rate limiting (per-IP) | ✅ Implemented | Tier 2 |
| Cursor-based pagination | ✅ Implemented | Tier 4 |
| React lazy loading + code splitting | ✅ Implemented | Tier 4 |
| React Query stale-while-revalidate | ✅ Implemented | Tier 4 |
| Parallel query execution (Promise.all) | ✅ Implemented | Tier 4 |
| Redis distributed cache | 🔧 Infrastructure change | Tier 3 |
| Read replicas | 🔧 Infrastructure change | Tier 2 |
| Horizontal Node.js scaling | 🔧 Infrastructure change | Tier 3 |
| Kafka event streaming | 🔧 Architecture upgrade | Tier 4 |
| Multi-region deployment | 🔧 Infrastructure change | Tier 4 |
| ML model serving (SageMaker) | 🔧 Architecture upgrade | Tier 4 |

The platform is **production-ready for Tier 1 and Tier 2** without any code changes. Tiers 3 and 4 require infrastructure provisioning and targeted architectural upgrades, all of which are designed into the current codebase as swap-in replacements.
