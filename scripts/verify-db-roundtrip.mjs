/**
 * Exercises the database surface the platform actually depends on, against a real
 * MySQL instance. Used to verify an ORM upgrade rather than trusting the type
 * checker: a drizzle minor bump can change SQL generation, decimal and JSON
 * handling, or enum binding without changing a single TypeScript signature.
 *
 * Usage:
 *   DATABASE_URL=mysql://root:pw@127.0.0.1:3307/smartbankai node scripts/verify-db-roundtrip.mjs
 *
 * Exits non-zero on the first mismatch.
 */
import { deepStrictEqual } from "node:assert";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

import {
  aiDecisionAudits,
  customers,
  tenants,
  transactions,
} from "../drizzle/schema.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const db = drizzle(url);
const checks = [];
const fail = (name, detail) => {
  checks.push({ name, ok: false, detail });
};
const pass = (name) => checks.push({ name, ok: true });

const suffix = randomUUID().slice(0, 8);

// ── tenants: insert + read back ──────────────────────────────────────────────
await db.insert(tenants).values({
  name: `Verify Bank ${suffix}`,
  slug: `verify-${suffix}`,
  status: "active",
});
const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, `verify-${suffix}`)).limit(1);
tenant ? pass("tenant insert and select") : fail("tenant insert and select", "row not found");

const tenantId = tenant.id;

// ── enum binding ─────────────────────────────────────────────────────────────
tenant.status === "active"
  ? pass("enum column round-trips")
  : fail("enum column round-trips", `got ${tenant.status}`);

// ── customers ────────────────────────────────────────────────────────────────
await db.insert(customers).values({
  tenantId,
  customerId: `CUST-${suffix}`,
  firstName: "Ada",
  lastName: "Okafor",
  accountNumber: `00${suffix.slice(0, 8)}`,
  accountBalance: "1250000.75",
});
const [customer] = await db
  .select()
  .from(customers)
  .where(and(eq(customers.tenantId, tenantId), eq(customers.customerId, `CUST-${suffix}`)))
  .limit(1);
customer ? pass("customer insert with composite where") : fail("customer insert with composite where", "row not found");
customer?.accountBalance === "1250000.75"
  ? pass("customer balance decimal preserved")
  : fail("customer balance decimal preserved", `got ${customer?.accountBalance}`);

// ── transactions: decimals, enums, ordering, limit ───────────────────────────
const amounts = ["950000.00", "920000.50", "480000.25"];
for (const [index, amount] of amounts.entries()) {
  await db.insert(transactions).values({
    tenantId,
    customerId: customer.id,
    transactionRef: `TXN-${suffix}-${index}`,
    amount,
    currency: "NGN",
    type: "transfer",
    channel: "mobile_app",
    senderAccount: `01234567${index}0`,
    receiverAccount: `09876543${index}0`,
    status: "success",
  });
}

const window = await db
  .select()
  .from(transactions)
  .where(eq(transactions.tenantId, tenantId))
  .orderBy(desc(transactions.createdAt))
  .limit(50);

window.length === amounts.length
  ? pass("transaction window select with order and limit")
  : fail("transaction window select with order and limit", `expected ${amounts.length}, got ${window.length}`);

// Decimals must survive as exact strings; a float round-trip would corrupt Naira amounts.
const returned = new Set(window.map((row) => row.amount));
amounts.every((amount) => returned.has(amount))
  ? pass("decimal precision preserved")
  : fail("decimal precision preserved", `expected ${amounts.join(", ")}, got ${[...returned].join(", ")}`);

window.every((row) => row.customerId === customer.id)
  ? pass("nullable int column round-trips")
  : fail("nullable int column round-trips", "customerId mismatch");

window.every((row) => row.createdAt instanceof Date)
  ? pass("timestamp maps to Date")
  : fail("timestamp maps to Date", "createdAt is not a Date");

// ── ai_decision_audits: JSON columns, boolean, float, unique constraint ──────
const decisionId = randomUUID();
const responseData = {
  status: "advisory",
  recommendation: "REFER_FOR_APPROVAL",
  explanation: { summary: "verification row", top_factors: [{ factor: "test", agent: "credit_risk" }] },
};
await db.insert(aiDecisionAudits).values({
  decisionId,
  correlationId: randomUUID(),
  tenantId,
  requestType: "credit_assessment",
  contractVersion: "2026-08-01",
  decisionStatus: "advisory",
  recommendation: "REFER_FOR_APPROVAL",
  confidence: 0.73,
  humanReviewRequired: true,
  inputDigest: "a".repeat(64),
  minimisedInput: { customer_id: "party_x", financial_inputs_redacted: true },
  responseData,
  latencyMs: 42,
});

const [audit] = await db
  .select()
  .from(aiDecisionAudits)
  .where(eq(aiDecisionAudits.decisionId, decisionId))
  .limit(1);

audit ? pass("audit insert and select") : fail("audit insert and select", "row not found");
audit?.humanReviewRequired === true
  ? pass("boolean column round-trips")
  : fail("boolean column round-trips", `got ${audit?.humanReviewRequired}`);
// MySQL JSON columns do not preserve key order, so compare structurally.
try {
  deepStrictEqual(audit?.responseData, responseData);
  pass("nested JSON column round-trips");
} catch {
  fail("nested JSON column round-trips", JSON.stringify(audit?.responseData));
}
Math.abs((audit?.confidence ?? 0) - 0.73) < 1e-6
  ? pass("float column round-trips")
  : fail("float column round-trips", `got ${audit?.confidence}`);

// The audit trail depends on decisionId being unique; a duplicate must be refused.
let duplicateRefused = false;
try {
  await db.insert(aiDecisionAudits).values({
    decisionId,
    correlationId: randomUUID(),
    tenantId,
    requestType: "credit_assessment",
    contractVersion: "2026-08-01",
    decisionStatus: "advisory",
    humanReviewRequired: true,
    inputDigest: "b".repeat(64),
    minimisedInput: {},
    responseData: {},
  });
} catch {
  duplicateRefused = true;
}
duplicateRefused
  ? pass("unique decisionId constraint enforced")
  : fail("unique decisionId constraint enforced", "duplicate insert succeeded");

// ── tenant scoping: another tenant must not see these rows ───────────────────
await db.insert(tenants).values({
  name: `Other Bank ${suffix}`,
  slug: `other-${suffix}`,
  status: "active",
});
const [other] = await db.select().from(tenants).where(eq(tenants.slug, `other-${suffix}`)).limit(1);
const otherRows = await db.select().from(transactions).where(eq(transactions.tenantId, other.id));
otherRows.length === 0
  ? pass("tenant-scoped select isolates rows")
  : fail("tenant-scoped select isolates rows", `leaked ${otherRows.length} rows`);

// ── report ───────────────────────────────────────────────────────────────────
const failures = checks.filter((check) => !check.ok);
for (const check of checks) {
  console.log(`${check.ok ? "  ok  " : "  FAIL"} ${check.name}${check.ok ? "" : ` -> ${check.detail}`}`);
}
console.log(`\n${checks.length - failures.length}/${checks.length} database checks passed`);
process.exit(failures.length === 0 ? 0 : 1);
