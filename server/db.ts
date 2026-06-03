import { eq, desc, and, count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  tenants, InsertTenant,
  tenantAgents, agentMetrics,
  transactions, creditApplications,
  complianceReports, amlAlerts,
  auditLogs, billingRecords, chatMessages,
  agentTypes,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "platform_owner" as any;
    updateSet.role = "platform_owner";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Tenants ──────────────────────────────────────────────────────────────────
export async function getAllTenants() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenants).orderBy(desc(tenants.createdAt));
}

export async function getTenantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result[0];
}

export async function createTenant(data: InsertTenant) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(tenants).values(data);
  const result = await db.select().from(tenants).where(eq(tenants.slug, data.slug!)).limit(1);
  return result[0];
}

export async function updateTenant(id: number, data: Partial<InsertTenant>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(tenants).set(data).where(eq(tenants.id, id));
}

export async function getTenantStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, trial: 0, suspended: 0 };
  const rows = await db
    .select({ status: tenants.status, cnt: count() })
    .from(tenants)
    .groupBy(tenants.status);
  const stats = { total: 0, active: 0, trial: 0, suspended: 0 };
  rows.forEach((r) => {
    stats.total += Number(r.cnt);
    if (r.status === "active") stats.active = Number(r.cnt);
    if (r.status === "trial") stats.trial = Number(r.cnt);
    if (r.status === "suspended") stats.suspended = Number(r.cnt);
  });
  return stats;
}

// ─── Tenant Agents ────────────────────────────────────────────────────────────
export async function getTenantAgents(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenantAgents).where(eq(tenantAgents.tenantId, tenantId));
}

export async function upsertTenantAgent(tenantId: number, agentName: string, isEnabled: boolean, config?: any) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(tenantAgents)
    .where(and(eq(tenantAgents.tenantId, tenantId), eq(tenantAgents.agentName, agentName)))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(tenantAgents)
      .set({ isEnabled, config: config ?? existing[0].config })
      .where(and(eq(tenantAgents.tenantId, tenantId), eq(tenantAgents.agentName, agentName)));
  } else {
    await db.insert(tenantAgents).values({ tenantId, agentName, isEnabled, config });
  }
}

export async function initTenantAgents(tenantId: number) {
  const db = await getDb();
  if (!db) return;
  for (const agentName of agentTypes) {
    const existing = await db
      .select()
      .from(tenantAgents)
      .where(and(eq(tenantAgents.tenantId, tenantId), eq(tenantAgents.agentName, agentName)))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(tenantAgents).values({ tenantId, agentName, isEnabled: false });
    }
  }
}

// ─── Agent Metrics ────────────────────────────────────────────────────────────
export async function getLatestAgentMetrics() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(agentMetrics)
    .orderBy(desc(agentMetrics.recordedAt))
    .limit(50);
}

export async function upsertAgentMetric(data: typeof agentMetrics.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(agentMetrics).values(data);
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function getTransactions(tenantId?: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const q = db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
  if (tenantId) return db.select().from(transactions).where(eq(transactions.tenantId, tenantId)).orderBy(desc(transactions.createdAt)).limit(limit);
  return q;
}

export async function getFlaggedTransactions(tenantId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [sql`${transactions.fraudStatus} != 'clean'`];
  if (tenantId) conditions.push(eq(transactions.tenantId, tenantId));
  return db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.createdAt)).limit(100);
}

// ─── Credit Applications ──────────────────────────────────────────────────────
export async function getCreditApplications(tenantId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (tenantId) return db.select().from(creditApplications).where(eq(creditApplications.tenantId, tenantId)).orderBy(desc(creditApplications.createdAt));
  return db.select().from(creditApplications).orderBy(desc(creditApplications.createdAt));
}

// ─── Compliance Reports ───────────────────────────────────────────────────────
export async function getComplianceReports(tenantId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (tenantId) return db.select().from(complianceReports).where(eq(complianceReports.tenantId, tenantId)).orderBy(desc(complianceReports.createdAt));
  return db.select().from(complianceReports).orderBy(desc(complianceReports.createdAt));
}

// ─── AML Alerts ───────────────────────────────────────────────────────────────
export async function getAmlAlerts(tenantId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (tenantId) return db.select().from(amlAlerts).where(eq(amlAlerts.tenantId, tenantId)).orderBy(desc(amlAlerts.createdAt));
  return db.select().from(amlAlerts).orderBy(desc(amlAlerts.createdAt));
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export async function getAuditLogs(tenantId?: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  if (tenantId) return db.select().from(auditLogs).where(eq(auditLogs.tenantId, tenantId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export async function getBillingRecords(tenantId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (tenantId) return db.select().from(billingRecords).where(eq(billingRecords.tenantId, tenantId)).orderBy(desc(billingRecords.createdAt));
  return db.select().from(billingRecords).orderBy(desc(billingRecords.createdAt));
}

// ─── Chat Messages ────────────────────────────────────────────────────────────
export async function getChatHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(desc(chatMessages.createdAt)).limit(limit);
}

export async function saveChatMessage(data: typeof chatMessages.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatMessages).values(data);
}

// ─── Platform Stats ───────────────────────────────────────────────────────────
export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { tenantCount: 0, userCount: 0, txCount: 0, alertCount: 0 };
  const [tc] = await db.select({ cnt: count() }).from(tenants);
  const [uc] = await db.select({ cnt: count() }).from(users);
  const [txc] = await db.select({ cnt: count() }).from(transactions);
  const [ac] = await db.select({ cnt: count() }).from(amlAlerts);
  return {
    tenantCount: Number(tc?.cnt ?? 0),
    userCount: Number(uc?.cnt ?? 0),
    txCount: Number(txc?.cnt ?? 0),
    alertCount: Number(ac?.cnt ?? 0),
  };
}
