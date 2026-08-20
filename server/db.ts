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
  customers, channelSessions, agentEvents, dataSources,
  aiDecisionAudits,
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

// ─── AI Decision Audits (append-only) ─────────────────────────────────────────
type AiDecisionAuditWriter = (data: typeof aiDecisionAudits.$inferInsert) => Promise<void>;
let testAiDecisionAuditWriter: AiDecisionAuditWriter | undefined;

/** Test-only seam. Production advisory flows always use the append-only database writer. */
export function setAiDecisionAuditWriterForTesting(writer?: AiDecisionAuditWriter) {
  if (process.env.NODE_ENV !== "test" && process.env.VITEST !== "true") {
    throw new Error("AI audit writer overrides are only permitted in tests");
  }
  testAiDecisionAuditWriter = writer;
}

export async function createAiDecisionAudit(data: typeof aiDecisionAudits.$inferInsert) {
  if (testAiDecisionAuditWriter) {
    await testAiDecisionAuditWriter(data);
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB unavailable: AI advisory results must be audited before use");
  await db.insert(aiDecisionAudits).values(data);
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

// ─── Customers ────────────────────────────────────────────────────────────────
export async function getCustomers(tenantId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).where(eq(customers.tenantId, tenantId)).orderBy(desc(customers.createdAt)).limit(limit).offset(offset);
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

export async function getCustomerStats(tenantId: number) {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, highNetWorth: 0, sme: 0, newThisMonth: 0 };
  const [total] = await db.select({ cnt: count() }).from(customers).where(eq(customers.tenantId, tenantId));
  const [active] = await db.select({ cnt: count() }).from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.isActive, true)));
  const [hnw] = await db.select({ cnt: count() }).from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.segment, "high_net_worth")));
  const [smeCount] = await db.select({ cnt: count() }).from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.segment, "sme")));
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const [newMonth] = await db.select({ cnt: count() }).from(customers).where(and(eq(customers.tenantId, tenantId), sql`${customers.createdAt} >= ${monthStart}`));
  return {
    total: Number(total?.cnt ?? 0),
    active: Number(active?.cnt ?? 0),
    highNetWorth: Number(hnw?.cnt ?? 0),
    sme: Number(smeCount?.cnt ?? 0),
    newThisMonth: Number(newMonth?.cnt ?? 0),
  };
}

// ─── Channel Sessions ─────────────────────────────────────────────────────────
export async function getChannelSessions(tenantId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(channelSessions).where(eq(channelSessions.tenantId, tenantId)).orderBy(desc(channelSessions.startedAt)).limit(limit);
}

export async function getChannelStats(tenantId: number) {
  const db = await getDb();
  if (!db) return { totalSessions: 0, mobile: 0, web: 0, ussd: 0, avgDuration: 0 };
  const rows = await db.select({ channel: channelSessions.channel, cnt: count() }).from(channelSessions).where(eq(channelSessions.tenantId, tenantId)).groupBy(channelSessions.channel);
  const stats: Record<string, number> = {};
  let total = 0;
  rows.forEach(r => { stats[r.channel ?? "unknown"] = Number(r.cnt); total += Number(r.cnt); });
  const [avgRow] = await db.select({ avg: sql<number>`AVG(${channelSessions.duration})` }).from(channelSessions).where(eq(channelSessions.tenantId, tenantId));
  return {
    totalSessions: total,
    mobile: stats["mobile_app"] ?? 0,
    web: stats["web_banking"] ?? 0,
    ussd: stats["ussd"] ?? 0,
    branch: stats["branch"] ?? 0,
    avgDuration: Math.round(Number(avgRow?.avg ?? 0)),
  };
}

// ─── Agent Events ─────────────────────────────────────────────────────────────
export async function getAgentEvents(tenantId: number, agentName?: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(agentEvents.tenantId, tenantId)];
  if (agentName) conditions.push(eq(agentEvents.agentName, agentName));
  return db.select().from(agentEvents).where(and(...conditions)).orderBy(desc(agentEvents.createdAt)).limit(limit);
}

export async function getAgentEventStats(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ agentName: agentEvents.agentName, cnt: count(), successCnt: sql<number>`SUM(CASE WHEN ${agentEvents.status} = 'success' THEN 1 ELSE 0 END)`, avgLatency: sql<number>`AVG(${agentEvents.processingTimeMs})` }).from(agentEvents).where(eq(agentEvents.tenantId, tenantId)).groupBy(agentEvents.agentName);
}

// ─── Data Sources ─────────────────────────────────────────────────────────────
export async function getDataSources(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dataSources).where(eq(dataSources.tenantId, tenantId)).orderBy(desc(dataSources.createdAt));
}

// ─── Tenant Transaction Stats ─────────────────────────────────────────────────
export async function getTenantTransactionStats(tenantId: number) {
  const db = await getDb();
  if (!db) return { total: 0, today: 0, flagged: 0, totalVolume: "0", successRate: 0 };
  const [total] = await db.select({ cnt: count() }).from(transactions).where(eq(transactions.tenantId, tenantId));
  const today = new Date(); today.setHours(0,0,0,0);
  const [todayCount] = await db.select({ cnt: count() }).from(transactions).where(and(eq(transactions.tenantId, tenantId), sql`${transactions.createdAt} >= ${today}`));
  const [flagged] = await db.select({ cnt: count() }).from(transactions).where(and(eq(transactions.tenantId, tenantId), sql`${transactions.fraudStatus} != 'clean'`));
  const [volRow] = await db.select({ vol: sql<string>`SUM(${transactions.amount})` }).from(transactions).where(and(eq(transactions.tenantId, tenantId), eq(transactions.status, "success")));
  const [successRow] = await db.select({ cnt: count() }).from(transactions).where(and(eq(transactions.tenantId, tenantId), eq(transactions.status, "success")));
  const totalCount = Number(total?.cnt ?? 0);
  const successCount = Number(successRow?.cnt ?? 0);
  return {
    total: totalCount,
    today: Number(todayCount?.cnt ?? 0),
    flagged: Number(flagged?.cnt ?? 0),
    totalVolume: volRow?.vol ?? "0",
    successRate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
  };
}
