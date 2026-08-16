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
  float,
  index,
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
  deploymentModel: mysqlEnum("deploymentModel", ["on_premise", "private_cloud", "hybrid"]).default("private_cloud"),
  deploymentRegion: varchar("deploymentRegion", { length: 100 }).default("Lagos, Nigeria"),
  apiBaseUrl: varchar("apiBaseUrl", { length: 500 }),
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

// ─── Customers (Nigerian Banking Profiles) ────────────────────────────────────
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  customerId: varchar("customerId", { length: 50 }).notNull().unique(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  bvn: varchar("bvn", { length: 11 }),
  nin: varchar("nin", { length: 11 }),
  accountNumber: varchar("accountNumber", { length: 20 }).notNull(),
  accountType: mysqlEnum("accountType", ["savings", "current", "domiciliary", "fixed_deposit"]).default("savings"),
  segment: mysqlEnum("segment", ["mass_market", "sme", "salary_earner", "high_net_worth", "student", "diaspora"]).default("mass_market"),
  kycLevel: mysqlEnum("kycLevel", ["tier1", "tier2", "tier3"]).default("tier1"),
  state: varchar("state", { length: 100 }),
  city: varchar("city", { length: 100 }),
  gender: mysqlEnum("gender", ["male", "female"]),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }),
  occupation: varchar("occupation", { length: 200 }),
  monthlyIncome: decimal("monthlyIncome", { precision: 15, scale: 2 }),
  accountBalance: decimal("accountBalance", { precision: 15, scale: 2 }).default("0.00"),
  creditScore: int("creditScore").default(0),
  riskRating: mysqlEnum("riskRating", ["low", "medium", "high"]).default("low"),
  isActive: boolean("isActive").default(true),
  preferredChannel: mysqlEnum("preferredChannel", ["web", "mobile", "ussd", "branch"]).default("mobile"),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  customerId: int("customerId"),
  transactionRef: varchar("transactionRef", { length: 100 }).notNull().unique(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("NGN"),
  type: mysqlEnum("type", ["transfer", "payment", "withdrawal", "deposit", "airtime", "data", "bill_payment", "pos", "atm", "ussd"]).default("transfer"),
  channel: mysqlEnum("channel", ["web_banking", "mobile_app", "ussd", "pos", "atm", "branch", "api"]).default("mobile_app"),
  senderAccount: varchar("senderAccount", { length: 100 }),
  receiverAccount: varchar("receiverAccount", { length: 100 }),
  receiverName: varchar("receiverName", { length: 255 }),
  receiverBank: varchar("receiverBank", { length: 100 }),
  narration: text("narration"),
  merchantCategory: varchar("merchantCategory", { length: 100 }),
  location: varchar("location", { length: 200 }),
  status: mysqlEnum("status", ["success", "failed", "pending", "reversed"]).default("success"),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).default("0.00"),
  fraudStatus: mysqlEnum("fraudStatus", ["clean", "flagged", "confirmed_fraud", "under_review"]).default("clean"),
  flagReason: text("flagReason"),
  agentProcessed: boolean("agentProcessed").default(false),
  processingTimeMs: int("processingTimeMs").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ─── Channel Sessions ─────────────────────────────────────────────────────────
export const channelSessions = mysqlTable("channel_sessions", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  customerId: int("customerId"),
  sessionId: varchar("sessionId", { length: 100 }).notNull().unique(),
  channel: mysqlEnum("channel", ["web_banking", "mobile_app", "ussd", "branch"]).default("mobile_app"),
  deviceType: varchar("deviceType", { length: 100 }),
  osVersion: varchar("osVersion", { length: 100 }),
  appVersion: varchar("appVersion", { length: 50 }),
  ipAddress: varchar("ipAddress", { length: 50 }),
  location: varchar("location", { length: 200 }),
  duration: int("duration").default(0),
  pagesViewed: int("pagesViewed").default(0),
  transactionCount: int("transactionCount").default(0),
  status: mysqlEnum("status", ["active", "completed", "expired", "terminated"]).default("completed"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
});

export type ChannelSession = typeof channelSessions.$inferSelect;

// ─── Agent Events ─────────────────────────────────────────────────────────────
export const agentEvents = mysqlTable("agent_events", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  agentName: varchar("agentName", { length: 100 }).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: varchar("entityId", { length: 100 }),
  inputData: json("inputData"),
  outputData: json("outputData"),
  processingTimeMs: int("processingTimeMs").default(0),
  status: mysqlEnum("status", ["success", "failed", "timeout"]).default("success"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentEvent = typeof agentEvents.$inferSelect;

// ─── Credit Applications ──────────────────────────────────────────────────────
export const creditApplications = mysqlTable("credit_applications", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  customerId: int("customerId"),
  applicationRef: varchar("applicationRef", { length: 50 }).notNull().unique(),
  applicantName: varchar("applicantName", { length: 255 }),
  applicantId: varchar("applicantId", { length: 100 }),
  loanType: mysqlEnum("loanType", ["personal", "sme", "mortgage", "auto", "salary_advance", "micro"]).default("personal"),
  requestedAmount: decimal("requestedAmount", { precision: 15, scale: 2 }),
  approvedAmount: decimal("approvedAmount", { precision: 15, scale: 2 }),
  tenure: int("tenure"),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }),
  creditScore: int("creditScore"),
  altDataScore: int("altDataScore"),
  dtiRatio: decimal("dtiRatio", { precision: 5, scale: 2 }),
  recommendation: mysqlEnum("recommendation", ["approve", "decline", "review"]),
  status: mysqlEnum("status", ["pending", "approved", "declined", "under_review", "disbursed"]).default("pending"),
  declineReason: text("declineReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
  customerId: int("customerId"),
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

// ─── AI Decision Audits (append-only) ─────────────────────────────────────────
// The original recommendation is never updated or deleted. Human reviews should
// be recorded as separate events so the full decision trail remains reconstructable.
export const aiDecisionAudits = mysqlTable("ai_decision_audits", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: varchar("decisionId", { length: 64 }).notNull().unique(),
  correlationId: varchar("correlationId", { length: 64 }).notNull(),
  tenantId: int("tenantId").notNull(),
  requestedByUserId: int("requestedByUserId"),
  requestType: varchar("requestType", { length: 64 }).notNull(),
  contractVersion: varchar("contractVersion", { length: 32 }).notNull(),
  agentName: varchar("agentName", { length: 100 }),
  modelName: varchar("modelName", { length: 100 }),
  modelVersion: varchar("modelVersion", { length: 100 }),
  decisionStatus: mysqlEnum("decisionStatus", ["advisory", "unavailable", "rejected"]).notNull(),
  recommendation: text("recommendation"),
  confidence: float("confidence"),
  humanReviewRequired: boolean("humanReviewRequired").default(true).notNull(),
  inputDigest: varchar("inputDigest", { length: 128 }).notNull(),
  minimisedInput: json("minimisedInput").notNull(),
  responseData: json("responseData").notNull(),
  latencyMs: int("latencyMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("ai_decision_audits_tenant_created_idx").on(table.tenantId, table.createdAt),
  index("ai_decision_audits_correlation_idx").on(table.correlationId),
  index("ai_decision_audits_request_type_created_idx").on(table.requestType, table.createdAt),
]);

export type AiDecisionAudit = typeof aiDecisionAudits.$inferSelect;
export type InsertAiDecisionAudit = typeof aiDecisionAudits.$inferInsert;

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

// ─── Data Sources (Integration Connectors) ────────────────────────────────────
export const dataSources = mysqlTable("data_sources", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["core_banking", "payment_gateway", "credit_bureau", "kyc_provider", "mobile_money", "data_warehouse"]).notNull(),
  provider: varchar("provider", { length: 100 }),
  status: mysqlEnum("status", ["connected", "disconnected", "error", "syncing"]).default("connected"),
  lastSyncAt: timestamp("lastSyncAt"),
  recordsIngested: bigint("recordsIngested", { mode: "number" }).default(0),
  syncFrequency: varchar("syncFrequency", { length: 50 }).default("real-time"),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataSource = typeof dataSources.$inferSelect;
