/**
 * Scale Hardening: Add composite database indexes for 1M–10M MAU workloads.
 * These indexes are critical for query performance at high transaction volumes.
 * Run once: node scripts/add-scale-indexes.mjs
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const conn = await mysql.createConnection(DATABASE_URL);

const indexes = [
  // ── Transactions (highest-volume table — millions of rows per tenant) ──────
  // Primary lookup: tenant + time range (most common query pattern)
  `CREATE INDEX IF NOT EXISTS idx_txn_tenant_created ON transactions (tenantId, createdAt DESC)`,
  // Fraud dashboard: tenant + fraud status + time
  `CREATE INDEX IF NOT EXISTS idx_txn_fraud_status ON transactions (tenantId, fraudStatus, createdAt DESC)`,
  // Customer transaction history
  `CREATE INDEX IF NOT EXISTS idx_txn_customer ON transactions (tenantId, customerId, createdAt DESC)`,
  // Channel analytics breakdown
  `CREATE INDEX IF NOT EXISTS idx_txn_channel ON transactions (tenantId, channel, createdAt DESC)`,
  // Transaction status monitoring
  `CREATE INDEX IF NOT EXISTS idx_txn_status ON transactions (tenantId, status, createdAt DESC)`,
  // Risk score range queries (fraud detection)
  `CREATE INDEX IF NOT EXISTS idx_txn_risk_score ON transactions (tenantId, riskScore DESC, createdAt DESC)`,
  // Reference lookup (unique already, but explicit for join performance)
  `CREATE INDEX IF NOT EXISTS idx_txn_ref ON transactions (transactionRef)`,

  // ── Customers (500K–5M rows per tenant at scale) ──────────────────────────
  // Tenant + active status (most common filter)
  `CREATE INDEX IF NOT EXISTS idx_cust_tenant_active ON customers (tenantId, isActive, createdAt DESC)`,
  // Segment analytics
  `CREATE INDEX IF NOT EXISTS idx_cust_segment ON customers (tenantId, segment, isActive)`,
  // Risk rating filter
  `CREATE INDEX IF NOT EXISTS idx_cust_risk ON customers (tenantId, riskRating, isActive)`,
  // KYC level filter
  `CREATE INDEX IF NOT EXISTS idx_cust_kyc ON customers (tenantId, kycLevel, isActive)`,
  // State/geo analytics
  `CREATE INDEX IF NOT EXISTS idx_cust_state ON customers (tenantId, state)`,
  // Credit score range queries
  `CREATE INDEX IF NOT EXISTS idx_cust_credit_score ON customers (tenantId, creditScore DESC)`,
  // BVN lookup (compliance)
  `CREATE INDEX IF NOT EXISTS idx_cust_bvn ON customers (bvn)`,
  // Account number lookup
  `CREATE INDEX IF NOT EXISTS idx_cust_account ON customers (accountNumber)`,

  // ── Agent Events (very high volume — every AI decision is logged) ─────────
  // Tenant + agent + time (primary query)
  `CREATE INDEX IF NOT EXISTS idx_ae_tenant_agent ON agent_events (tenantId, agentName, createdAt DESC)`,
  // Status filter for error monitoring
  `CREATE INDEX IF NOT EXISTS idx_ae_status ON agent_events (tenantId, status, createdAt DESC)`,
  // Entity lookup (find all events for a transaction)
  `CREATE INDEX IF NOT EXISTS idx_ae_entity ON agent_events (tenantId, entityType, entityId)`,

  // ── Channel Sessions ──────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_cs_tenant_channel ON channel_sessions (tenantId, channel, startedAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_cs_customer ON channel_sessions (tenantId, customerId, startedAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_cs_status ON channel_sessions (tenantId, status, startedAt DESC)`,

  // ── AML Alerts ────────────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_aml_tenant_status ON aml_alerts (tenantId, status, createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_aml_severity ON aml_alerts (tenantId, severity, status)`,
  `CREATE INDEX IF NOT EXISTS idx_aml_customer ON aml_alerts (tenantId, customerId)`,

  // ── Credit Applications ───────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_ca_tenant_status ON credit_applications (tenantId, status, createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_ca_customer ON credit_applications (tenantId, customerId)`,

  // ── Audit Logs (append-only, high volume) ────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs (tenantId, createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (userId, createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs (tenantId, resource, resourceId)`,

  // ── Agent Metrics (time-series) ───────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_am_agent_time ON agent_metrics (agentName, recordedAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_am_tenant_time ON agent_metrics (tenantId, recordedAt DESC)`,

  // ── Billing Records ───────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_billing_tenant ON billing_records (tenantId, createdAt DESC)`,

  // ── Chat Messages ─────────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages (userId, createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_chat_tenant ON chat_messages (tenantId, createdAt DESC)`,

  // ── Compliance Reports ────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_cr_tenant_status ON compliance_reports (tenantId, status, createdAt DESC)`,

  // ── Tenant Agents ─────────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_ta_tenant ON tenant_agents (tenantId, isEnabled)`,
];

console.log(`\n🔧 Adding ${indexes.length} composite indexes for enterprise scale...\n`);
let applied = 0; let skipped = 0;

for (const sql of indexes) {
  const name = sql.match(/idx_\w+/)?.[0] ?? "unknown";
  try {
    await conn.execute(sql);
    console.log(`  ✅ ${name}`);
    applied++;
  } catch (err) {
    if (err.code === "ER_DUP_KEYNAME" || err.message?.includes("Duplicate key name")) {
      console.log(`  ⏭  ${name} (already exists)`);
      skipped++;
    } else {
      console.error(`  ❌ ${name}: ${err.message}`);
    }
  }
}

await conn.end();
console.log(`\n✅ Done: ${applied} applied, ${skipped} already existed.\n`);
