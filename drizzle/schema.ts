import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["platform_owner", "tenant_admin", "analyst", "user", "admin"])
    .default("user")
    .notNull(),
  tenantId: int("tenantId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Tenants ──────────────────────────────────────────────────────────────────
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  industry: varchar("industry", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Nigeria"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  status: mysqlEnum("status", ["active", "inactive", "suspended", "trial"]).default("trial").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["starter", "growth", "enterprise"]).default("starter").notNull(),
  subscriptionStartDate: timestamp("subscriptionStartDate"),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
  monthlyActiveUsers: int("monthlyActiveUsers").default(0),
  totalTransactions: bigint("totalTransactions", { mode: "number" }).default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ─── AI Agents ────────────────────────────────────────────────────────────────
export const agentTypes = [
  "Conversational",
  "Fraud Detection",
  "Credit Risk",
  "Personalization",
  "Predictive Analytics",
  "Compliance & Reporting",
  "Data Aggregation",
  "Smart Dashboard",
] as const;

export type AgentType = (typeof agentTypes)[number];

export const tenantAgents = mysqlTable("tenant_agents", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  agentName: varchar("agentName", { length: 100 }).notNull(),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  config: json("config"),
  lastUpdatedBy: int("lastUpdatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TenantAgent = typeof tenantAgents.$inferSelect;

// ─── Agent Metrics ────────────────────────────────────────────────────────────
export const agentMetrics = mysqlTable("agent_metrics", {
  id: int("id").autoincrement().primaryKey(),
  agentName: varchar("agentName", { length: 100 }).notNull(),
  tenantId: int("tenantId"),
  status: mysqlEnum("status", ["healthy", "degraded", "down"]).default("healthy").notNull(),
  uptimePercent: decimal("uptimePercent", { precision: 5, scale: 2 }).default("99.99"),
  latencyP99Ms: int("latencyP99Ms").default(0),
  requestsPerMin: int("requestsPerMin").default(0),
  errorRate: decimal("errorRate", { precision: 5, scale: 4 }).default("0.0000"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type AgentMetric = typeof agentMetrics.$inferSelect;

// ─── Transactions (Fraud Detection) ──────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  transactionRef: varchar("transactionRef", { length: 100 }).notNull().unique(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("NGN"),
  channel: varchar("channel", { length: 50 }),
  senderAccount: varchar("senderAccount", { length: 100 }),
  receiverAccount: varchar("receiverAccount", { length: 100 }),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).default("0.00"),
  fraudStatus: mysqlEnum("fraudStatus", ["clean", "flagged", "confirmed_fraud", "under_review"]).default("clean"),
  flagReason: text("flagReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;

// ─── Credit Applications ──────────────────────────────────────────────────────
export const creditApplications = mysqlTable("credit_applications", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  applicantName: varchar("applicantName", { length: 255 }),
  applicantId: varchar("applicantId", { length: 100 }),
  requestedAmount: decimal("requestedAmount", { precision: 15, scale: 2 }),
  creditScore: int("creditScore"),
  recommendation: mysqlEnum("recommendation", ["approve", "decline", "review"]),
  alternativeDataScore: int("alternativeDataScore"),
  status: mysqlEnum("status", ["pending", "approved", "declined", "under_review"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditApplication = typeof creditApplications.$inferSelect;

// ─── Compliance Reports ───────────────────────────────────────────────────────
export const complianceReports = mysqlTable("compliance_reports", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  reportType: varchar("reportType", { length: 100 }).notNull(),
  reportPeriod: varchar("reportPeriod", { length: 50 }),
  status: mysqlEnum("status", ["draft", "generated", "submitted"]).default("draft"),
  generatedBy: int("generatedBy"),
  fileUrl: text("fileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComplianceReport = typeof complianceReports.$inferSelect;

// ─── AML Alerts ───────────────────────────────────────────────────────────────
export const amlAlerts = mysqlTable("aml_alerts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  transactionRef: varchar("transactionRef", { length: 100 }),
  alertType: varchar("alertType", { length: 100 }),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  description: text("description"),
  status: mysqlEnum("status", ["open", "investigating", "resolved", "escalated"]).default("open"),
  assignedTo: int("assignedTo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type AmlAlert = typeof amlAlerts.$inferSelect;

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  tenantId: int("tenantId"),
  action: varchar("action", { length: 255 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  resourceId: varchar("resourceId", { length: 100 }),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;

// ─── Billing ──────────────────────────────────────────────────────────────────
export const billingRecords = mysqlTable("billing_records", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending"),
  invoiceUrl: text("invoiceUrl"),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BillingRecord = typeof billingRecords.$inferSelect;

// ─── Chat Messages ────────────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tenantId: int("tenantId"),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
