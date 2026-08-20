import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  getAllTenants, getTenantById, createTenant, updateTenant, getTenantStats,
  getTenantAgents, upsertTenantAgent, initTenantAgents,
  getLatestAgentMetrics, upsertAgentMetric,
  getTransactions, getFlaggedTransactions,
  getAllTransactionsForPlatform, getAllFlaggedTransactionsForPlatform,
  getCreditApplications, getAllCreditApplicationsForPlatform,
  getComplianceReports, getAllComplianceReportsForPlatform,
  getAmlAlerts, getAllAmlAlertsForPlatform,
  getAuditLogs, getAllAuditLogsForPlatform, createAuditLog, createAiDecisionAudit,
  getBillingRecords, getAllBillingRecordsForPlatform,
  getChatHistory, saveChatMessage,
  getPlatformStats, getAllUsersForPlatform, getUsersForTenant,
  getCustomers, getCustomerById, getCustomerStats,
  getChannelSessions, getChannelStats,
  getAgentEvents, getAgentEventStats,
  getDataSources,
  getTenantTransactionStats,
} from "./db";
import { agentTypes } from "../drizzle/schema";
import { cached, TTL, rateLimiter, RATE_LIMITS } from "./_core/scale";
import {
  assistantFeaturesSchema,
  creditFeaturesSchema,
  customerFeaturesSchema,
  transactionFeaturesSchema,
  type MlAdvisoryRequest,
  type MlRequestType,
  amlFeaturesSchema,
} from "../shared/ml-contract";
import { createAdvisoryRequest, createAuditSafeInput, getMlGateway, pseudonymousKey } from "./mlGateway";

// ─── Role guard helpers ───────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const adminRoles = ["platform_owner", "admin", "tenant_admin"];
  if (!adminRoles.includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
  }
  return next({ ctx });
});

const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "platform_owner" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Platform owner access required" });
  }
  return next({ ctx });
});

// ─── Tenant isolation ─────────────────────────────────────────────────────────
// The tenant a request may read is derived from the caller's own user record,
// never from the request body. Infinity AI platform staff may target a specific
// tenant, or omit it to work across the estate; a bank's own users are pinned to
// the tenant they belong to and cannot widen their scope by sending an id.
const PLATFORM_ROLES = new Set(["platform_owner", "admin"]);

/** Returns the tenant to scope to, or null meaning "all tenants" (platform staff only). */
export function resolveTenantScope(
  user: { role: string; tenantId: number | null },
  requested?: unknown,
): number | null {
  const asked =
    typeof requested === "number" && Number.isInteger(requested) && requested > 0
      ? requested
      : undefined;

  if (PLATFORM_ROLES.has(user.role)) return asked ?? null;

  if (user.tenantId == null) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No tenant is assigned to this account" });
  }
  if (asked !== undefined && asked !== user.tenantId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Cross-tenant access is not permitted" });
  }
  return user.tenantId;
}

/**
 * For endpoints that pre-date tenant binding and must stay usable by accounts
 * with no tenant. An unassigned caller yields null, which callers treat as
 * "skip the tenant-scoped advisory". A caller naming a tenant that is not
 * theirs is still refused.
 */
export function optionalTenantScope(
  user: { role: string; tenantId: number | null },
  requested?: unknown,
): number | null {
  if (!PLATFORM_ROLES.has(user.role) && user.tenantId == null) return null;
  return resolveTenantScope(user, requested);
}

/** For endpoints that are meaningless without one concrete tenant. */
function requireTenant(scope: number | null): number {
  if (scope === null) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "tenantId is required for this operation" });
  }
  return scope;
}

const tenantProcedure = protectedProcedure.use(async ({ ctx, next, getRawInput }) => {
  const input = (await getRawInput()) as { tenantId?: unknown } | undefined;
  return next({ ctx: { ...ctx, tenantScope: resolveTenantScope(ctx.user, input?.tenantId) } });
});

const tenantAdminProcedure = tenantProcedure.use(({ ctx, next }) => {
  const adminRoles = ["platform_owner", "admin", "tenant_admin"];
  if (!adminRoles.includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
  }
  return next({ ctx });
});

// ─── Mock data generators for demo realism ───────────────────────────────────
function generateMockMetrics() {
  const agents = agentTypes;
  return agents.map((name) => ({
    agentName: name,
    status: Math.random() > 0.1 ? "healthy" : Math.random() > 0.5 ? "degraded" : "down",
    uptimePercent: (99 + Math.random()).toFixed(2),
    latencyP99Ms: Math.floor(Math.random() * 400 + 50),
    requestsPerMin: Math.floor(Math.random() * 2000 + 100),
    errorRate: (Math.random() * 0.02).toFixed(4),
  }));
}

function generateMockTransactions(count = 20) {
  const channels = ["Mobile", "Web", "USSD", "POS", "ATM"];
  const statuses = ["clean", "clean", "clean", "clean", "flagged", "under_review"];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    tenantId: 1,
    // Present so the demo shape matches the real row: callers that scope by
    // customer must not silently see a narrower type from the mock path.
    customerId: (i % 5) + 1 as number | null,
    transactionRef: `TXN${Date.now()}${i}`,
    amount: (Math.random() * 500000 + 1000).toFixed(2),
    currency: "NGN",
    channel: channels[Math.floor(Math.random() * channels.length)],
    senderAccount: `0${Math.floor(Math.random() * 9e9 + 1e9)}`,
    receiverAccount: `0${Math.floor(Math.random() * 9e9 + 1e9)}`,
    riskScore: (Math.random() * 100).toFixed(2),
    fraudStatus: statuses[Math.floor(Math.random() * statuses.length)],
    flagReason: null,
    createdAt: new Date(Date.now() - Math.random() * 86400000),
  }));
}

const AML_WINDOW_LIMIT = 200;

/**
 * AML typologies - structuring, layering, smurfing - are properties of a window
 * of a customer's activity, not of one transaction. The window is assembled here
 * rather than in the browser for two reasons: the client must never hold other
 * parties' transactions, and account numbers must be replaced with pseudonymous
 * keys before anything crosses the ML boundary.
 */
async function buildAmlWindow(tenantId: number, customerId: number) {
  const recent = await getTransactions(tenantId, AML_WINDOW_LIMIT);
  const scoped = recent.filter((txn) => txn.customerId === customerId);
  if (scoped.length === 0) return null;

  const key = (value: string | null | undefined) => pseudonymousKey(tenantId, "party", value ?? "unknown");
  const subjectAccount = scoped.find((txn) => txn.senderAccount)?.senderAccount ?? `customer:${customerId}`;

  return amlFeaturesSchema.parse({
    customer_id: key(subjectAccount),
    transactions: scoped.map((txn) => ({
      id: String(txn.transactionRef),
      sender: key(txn.senderAccount),
      receiver: key(txn.receiverAccount),
      amount_ngn: Number(txn.amount),
      timestamp: new Date(txn.createdAt).toISOString(),
    })),
  });
}

async function runAdvisoryWorkflow(
  tenantId: number,
  userId: number,
  requestType: MlRequestType,
  payload: MlAdvisoryRequest["payload"],
) {
  const request = createAdvisoryRequest(tenantId, requestType, payload);
  const response = await getMlGateway().route(request);
  const safeInput = createAuditSafeInput(request);

  // This is intentionally an insert-only record. Human review outcomes must be
  // added as later audit events; the original advisory output is never overwritten.
  await createAiDecisionAudit({
    decisionId: response.decision_id,
    correlationId: response.correlation_id,
    tenantId,
    requestedByUserId: userId,
    requestType: response.request_type,
    contractVersion: response.contract_version,
    agentName: response.model?.agent ?? null,
    modelName: response.model?.model_name ?? null,
    modelVersion: response.model?.model_version ?? null,
    decisionStatus: response.status,
    recommendation: response.recommendation ?? null,
    confidence: response.confidence ?? null,
    humanReviewRequired: true,
    inputDigest: safeInput.digest,
    minimisedInput: safeInput.payload as any,
    responseData: response as any,
    latencyMs: response.latency_ms ? Math.round(response.latency_ms) : null,
  });

  return response;
}

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Platform Stats ────────────────────────────────────────────────────────
  platform: router({
    stats: ownerProcedure.query(async () => {
      return cached("platform:stats", TTL.PLATFORM_STATS, () => getPlatformStats());
    }),
    agentMetrics: protectedProcedure.query(async () => {
      return cached("platform:agentMetrics", TTL.AGENT_METRICS, async () => generateMockMetrics());
    }),
  }),

  // ─── Tenants ───────────────────────────────────────────────────────────────
  tenants: router({
    list: ownerProcedure.query(async () => {
      return cached("tenants:list", TTL.TENANT_SUMMARY, () => getAllTenants());
    }),
    stats: ownerProcedure.query(async () => {
      return cached("tenants:stats", TTL.TENANT_SUMMARY, () => getTenantStats());
    }),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      return getTenantById(requireTenant(resolveTenantScope(ctx.user, input.id)));
    }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(2),
          slug: z.string().min(2),
          industry: z.string().optional(),
          country: z.string().optional(),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
          subscriptionTier: z.enum(["starter", "growth", "enterprise"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const tenant = await createTenant({ ...input, status: "trial" as const });
        if (tenant) await initTenantAgents(tenant.id);
        await createAuditLog({
          userId: ctx.user.id,
          action: "CREATE_TENANT",
          resource: "tenant",
          resourceId: String(tenant?.id ?? ""),
          details: { name: input.name } as any,
        });
        return tenant;
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        await updateTenant(input.id, input.data);
        await createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE_TENANT",
          resource: "tenant",
          resourceId: String(input.id),
          details: input.data as any,
        });
        return { success: true };
      }),
  }),

  // ─── Agent Management ──────────────────────────────────────────────────────
  agents: router({
    forTenant: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => {
        const tenantId = requireTenant(ctx.tenantScope);
        const saved = await getTenantAgents(tenantId);
        // Merge with full agent list so all 8 always appear
        return agentTypes.map((name) => {
          const found = saved.find((s) => s.agentName === name);
          return found ?? { agentName: name, isEnabled: false, tenantId, config: null };
        });
      }),
    toggle: tenantAdminProcedure
      .input(z.object({ tenantId: z.number(), agentName: z.string(), isEnabled: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = requireTenant(ctx.tenantScope);
        await upsertTenantAgent(tenantId, input.agentName, input.isEnabled);
        await createAuditLog({
          userId: ctx.user.id,
          action: input.isEnabled ? "ENABLE_AGENT" : "DISABLE_AGENT",
          resource: "agent",
          resourceId: input.agentName,
          details: { tenantId } as any,
        });
        return { success: true };
      }),
    updateConfig: tenantAdminProcedure
      .input(z.object({ tenantId: z.number(), agentName: z.string(), config: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        await upsertTenantAgent(requireTenant(ctx.tenantScope), input.agentName, true, input.config);
        return { success: true };
      }),
    allMetrics: protectedProcedure.query(async () => {
      return generateMockMetrics();
    }),
  }),

  // ─── Advisory ML Gateway ───────────────────────────────────────────────────
  // The browser calls a typed tRPC procedure. Only this backend module makes the
  // authenticated network call to the private ML orchestrator.
  aiAdvisory: router({
    health: adminProcedure.query(async () => getMlGateway().health()),
    fraud: tenantAdminProcedure
      .input(z.object({ tenantId: z.number().int().positive(), payload: transactionFeaturesSchema }))
      .mutation(async ({ input, ctx }) =>
        runAdvisoryWorkflow(requireTenant(ctx.tenantScope), ctx.user.id, "fraud_check", input.payload)
      ),
    credit: tenantAdminProcedure
      .input(z.object({ tenantId: z.number().int().positive(), payload: creditFeaturesSchema }))
      .mutation(async ({ input, ctx }) =>
        runAdvisoryWorkflow(requireTenant(ctx.tenantScope), ctx.user.id, "credit_assessment", input.payload)
      ),
    aml: tenantAdminProcedure
      .input(z.object({ tenantId: z.number().int().positive(), payload: amlFeaturesSchema }))
      .mutation(async ({ input, ctx }) =>
        runAdvisoryWorkflow(requireTenant(ctx.tenantScope), ctx.user.id, "aml_check", input.payload)
      ),
    recommendation: tenantProcedure
      .input(z.object({ tenantId: z.number().int().positive(), payload: customerFeaturesSchema }))
      .mutation(async ({ input, ctx }) =>
        runAdvisoryWorkflow(requireTenant(ctx.tenantScope), ctx.user.id, "recommend", input.payload)
      ),
    assistant: tenantProcedure
      .input(z.object({ tenantId: z.number().int().positive(), payload: assistantFeaturesSchema }))
      .mutation(async ({ input, ctx }) =>
        runAdvisoryWorkflow(requireTenant(ctx.tenantScope), ctx.user.id, "chat", input.payload)
      ),
  }),

  // ─── Fraud Detection ───────────────────────────────────────────────────────
  fraud: router({
    transactions: tenantProcedure
      .input(z.object({ tenantId: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const limit = input.limit ?? 30;
        const dbTx = ctx.tenantScope === null
          ? await getAllTransactionsForPlatform(limit)
          : await getTransactions(ctx.tenantScope, limit);
        if (dbTx.length > 0) return dbTx;
        return generateMockTransactions(30);
      }),
    flagged: tenantProcedure
      .input(z.object({ tenantId: z.number().optional() }))
      .query(async ({ ctx }) => {
        const dbTx = ctx.tenantScope === null
          ? await getAllFlaggedTransactionsForPlatform()
          : await getFlaggedTransactions(ctx.tenantScope);
        if (dbTx.length > 0) return dbTx;
        return generateMockTransactions(30).filter((t) => t.fraudStatus !== "clean");
      }),
    stats: protectedProcedure.query(() => ({
      totalScanned: 142857,
      flaggedToday: 23,
      confirmedFraud: 7,
      falsePositiveRate: 2.3,
      avgRiskScore: 18.4,
      totalValueAtRisk: 4750000,
    })),
    assess: tenantAdminProcedure
      .input(z.object({ tenantId: z.number().int().positive(), payload: transactionFeaturesSchema }))
      .mutation(async ({ input, ctx }) =>
        runAdvisoryWorkflow(requireTenant(ctx.tenantScope), ctx.user.id, "fraud_check", input.payload)
      ),
  }),

  // ─── Credit Risk ───────────────────────────────────────────────────────────
  credit: router({
    applications: tenantProcedure
      .input(z.object({ tenantId: z.number().optional() }))
      .query(async ({ ctx }) => {
        const apps = ctx.tenantScope === null
          ? await getAllCreditApplicationsForPlatform()
          : await getCreditApplications(ctx.tenantScope);
        if (apps.length > 0) return apps;
        // Mock data
        return Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          tenantId: 1,
          applicantName: `Applicant ${i + 1}`,
          applicantId: `APP${1000 + i}`,
          requestedAmount: (Math.random() * 5000000 + 50000).toFixed(2),
          creditScore: Math.floor(Math.random() * 400 + 400),
          recommendation: ["approve", "decline", "review"][Math.floor(Math.random() * 3)] as any,
          alternativeDataScore: Math.floor(Math.random() * 100),
          status: ["pending", "approved", "declined", "under_review"][Math.floor(Math.random() * 4)] as any,
          createdAt: new Date(Date.now() - Math.random() * 7 * 86400000),
        }));
      }),
    score: protectedProcedure
      .input(z.object({
        applicantName: z.string(),
        tenantId: z.number().int().positive().optional(),
        customerId: z.string().min(1).default("anonymous-customer"),
        monthlyIncome: z.number(),
        requestedAmount: z.number(),
        employmentStatus: z.string(),
        mobileMoneyScore: z.number().optional(),
        existingMonthlyObligations: z.number().nonnegative().default(0),
        repaymentHistoryScore: z.number().min(0).max(100).optional(),
        bvnVerified: z.boolean().default(false),
        accountAgeMonths: z.number().int().nonnegative().default(0),
        averageMonthlyBalance: z.number().nonnegative().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const base = Math.min(850, Math.max(300,
          400 +
          (input.monthlyIncome / input.requestedAmount) * 100 +
          (input.mobileMoneyScore ?? 50) * 1.5 +
          (input.employmentStatus === "employed" ? 80 : 20)
        ));
        const score = Math.floor(base + (Math.random() * 40 - 20));
        // The advisory writes an immutable, tenant-scoped audit record, so it
        // only runs when the tenant is known. A guessed tenant would falsify it.
        const tenantScope = optionalTenantScope(ctx.user, input.tenantId);
        const advisory = tenantScope === null ? null : await runAdvisoryWorkflow(tenantScope, ctx.user.id, "credit_assessment", {
          customer_id: input.customerId,
          monthly_income_ngn: input.monthlyIncome,
          employment_type: ["salaried", "self_employed", "informal", "unemployed"].includes(input.employmentStatus)
            ? input.employmentStatus as "salaried" | "self_employed" | "informal" | "unemployed"
            : "unknown",
          loan_amount_ngn: input.requestedAmount,
          loan_tenure_months: 12,
          existing_monthly_obligations_ngn: input.existingMonthlyObligations,
          repayment_history_score: input.repaymentHistoryScore ?? input.mobileMoneyScore ?? 50,
          bvn_verified: input.bvnVerified,
          account_age_months: input.accountAgeMonths,
          avg_monthly_balance_ngn: input.averageMonthlyBalance,
        });
        return {
          score,
          recommendation: score >= 650 ? "approve" : score >= 500 ? "review" : "decline",
          confidence: (85 + Math.random() * 10).toFixed(1),
          factors: [
            { factor: "Income to Loan Ratio", impact: "positive", weight: 35 },
            { factor: "Mobile Money History", impact: score > 600 ? "positive" : "neutral", weight: 25 },
            { factor: "Employment Status", impact: input.employmentStatus === "employed" ? "positive" : "negative", weight: 20 },
            { factor: "Alternative Data Score", impact: "positive", weight: 20 },
          ],
          mlAdvisory: advisory,
          humanReviewRequired: true,
        };
      }),
  }),

  // ─── Compliance & Reporting ────────────────────────────────────────────────
  compliance: router({
    reports: tenantProcedure
      .input(z.object({ tenantId: z.number().optional() }))
      .query(async ({ ctx }) => {
        const reports = ctx.tenantScope === null
          ? await getAllComplianceReportsForPlatform()
          : await getComplianceReports(ctx.tenantScope);
        if (reports.length > 0) return reports;
        const types = ["CBN Monthly Return", "AML Suspicious Activity Report", "CBN Quarterly Report", "NFIU Compliance Report", "Annual Regulatory Filing"];
        return types.map((t, i) => ({
          id: i + 1,
          tenantId: 1,
          reportType: t,
          reportPeriod: `Q${Math.ceil((i + 1) / 3)}-2026`,
          status: ["generated", "submitted", "draft"][i % 3] as any,
          generatedBy: 1,
          fileUrl: null,
          createdAt: new Date(Date.now() - i * 7 * 86400000),
        }));
      }),
    amlAlerts: tenantProcedure
      .input(z.object({ tenantId: z.number().optional() }))
      .query(async ({ ctx }) => {
        const alerts = ctx.tenantScope === null
          ? await getAllAmlAlertsForPlatform()
          : await getAmlAlerts(ctx.tenantScope);
        if (alerts.length > 0) return alerts;
        return Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          tenantId: 1,
          transactionRef: `TXN${Date.now()}${i}`,
          alertType: ["Structuring", "Unusual Pattern", "High-Risk Country", "Velocity Alert", "Large Cash Transaction"][i % 5],
          severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as any,
          description: `Suspicious activity detected on account ending ${Math.floor(Math.random() * 9000 + 1000)}`,
          status: ["open", "investigating", "resolved"][i % 3] as any,
          assignedTo: null,
          createdAt: new Date(Date.now() - i * 3600000),
          resolvedAt: i % 3 === 2 ? new Date() : null,
        }));
      }),
    analyseCustomerActivity: tenantAdminProcedure
      .input(z.object({ tenantId: z.number().int().positive(), customerId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = requireTenant(ctx.tenantScope);
        const window = await buildAmlWindow(tenantId, input.customerId);
        if (!window) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No transactions are available for AML analysis" });
        }
        return runAdvisoryWorkflow(tenantId, ctx.user.id, "aml_check", window);
      }),
    auditLogs: tenantProcedure
      .input(z.object({ tenantId: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const limit = input.limit ?? 100;
        return ctx.tenantScope === null
          ? getAllAuditLogsForPlatform(limit)
          : getAuditLogs(ctx.tenantScope, limit);
      }),
    generateReport: tenantAdminProcedure
      .input(z.object({ tenantId: z.number(), reportType: z.string(), period: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await createAuditLog({
          userId: ctx.user.id,
          action: "GENERATE_REPORT",
          resource: "compliance_report",
          details: input as any,
        });
        return { success: true, message: `${input.reportType} report generated for ${input.period}` };
      }),
  }),

  // ─── Billing ───────────────────────────────────────────────────────────────
  billing: router({
    records: tenantProcedure
      .input(z.object({ tenantId: z.number().optional() }))
      .query(async ({ ctx }) => {
        const records = ctx.tenantScope === null
          ? await getAllBillingRecordsForPlatform()
          : await getBillingRecords(ctx.tenantScope);
        if (records.length > 0) return records;
        return Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          tenantId: 1,
          period: `2026-${String(6 - i).padStart(2, "0")}`,
          amount: (Math.random() * 5000 + 500).toFixed(2),
          currency: "USD",
          status: ["paid", "paid", "paid", "pending", "paid", "overdue"][i] as any,
          invoiceUrl: null,
          dueDate: new Date(Date.now() - i * 30 * 86400000),
          paidAt: i < 3 ? new Date(Date.now() - i * 30 * 86400000) : null,
          createdAt: new Date(Date.now() - i * 30 * 86400000),
        }));
      }),
    summary: protectedProcedure.query(() => ({
      mrr: 48500,
      arr: 582000,
      growth: 23.4,
      churnRate: 1.2,
      avgRevenuePerTenant: 2425,
      activeSubscriptions: 12,
      overdueCount: 2,
    })),
    invoices: tenantProcedure
      .input(z.object({ tenantId: z.number().optional() }))
      .query(async ({ ctx }) => {
        const records = ctx.tenantScope === null
          ? await getAllBillingRecordsForPlatform()
          : await getBillingRecords(ctx.tenantScope);
        if (records.length > 0) return records;
        return Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          tenantId: (i % 3) + 1,
          amount: [499, 1499, 2999, 4999][Math.floor(Math.random() * 4)].toFixed(2),
          currency: "USD",
          billingPeriod: `${["Jan","Feb","Mar","Apr","May","Jun"][i % 6]}-2026`,
          status: ["paid","paid","paid","pending","overdue"][Math.floor(Math.random() * 5)] as any,
          dueDate: new Date(Date.now() + (i - 3) * 30 * 86400000),
          paidAt: i % 3 !== 0 ? new Date(Date.now() - i * 5 * 86400000) : null,
          createdAt: new Date(Date.now() - i * 30 * 86400000),
        }));
      }),
  }),

  // ─── Users ─────────────────────────────────────────────────────────────────
  users: router({
    list: tenantAdminProcedure.query(async ({ ctx }) => {
      // Platform staff see the estate; a tenant admin sees only their own tenant.
      return ctx.tenantScope === null
        ? getAllUsersForPlatform()
        : getUsersForTenant(ctx.tenantScope);
    }),
    updateRole: ownerProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["platform_owner", "tenant_admin", "analyst", "user"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { users: usersTable } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(usersTable).set({ role: input.role as any }).where(eq(usersTable.id, input.userId));
        await createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE_USER_ROLE",
          resource: "user",
          resourceId: String(input.userId),
          details: { newRole: input.role } as any,
        });
        return { success: true };
      }),
  }),

  // ─── Conversational AI ─────────────────────────────────────────────────────
  chat: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      const msgs = await getChatHistory(ctx.user.id, 50);
      return msgs.reverse();
    }),
    send: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        tenantId: z.number().int().positive().optional(),
        language: z.string().min(2).max(10).default("en"),
      }))
      .mutation(async ({ input, ctx }) => {
        const tenantScope = optionalTenantScope(ctx.user, input.tenantId);

        // Read the prior turns before persisting this one. Reading afterwards put
        // the current message into the history and then appended it again below,
        // so the model saw the user's turn twice.
        const priorMessages = await getChatHistory(ctx.user.id, 10);
        await saveChatMessage({ userId: ctx.user.id, role: "user", content: input.message });

        const conversationHistory = priorMessages.reverse().map((message) => ({
          role: message.role === "assistant" ? "assistant" as const : "user" as const,
          content: message.content,
        }));

        // The advisory writes an immutable, tenant-scoped audit record, so it
        // only runs when the tenant is known. A guessed tenant would falsify it.
        const advisory = tenantScope === null ? null : await runAdvisoryWorkflow(tenantScope, ctx.user.id, "chat", {
          session_id: `platform-user-${ctx.user.id}`,
          customer_id: `platform-user-${ctx.user.id}`,
          message: input.message,
          conversation_history: conversationHistory,
          language: input.language,
        });

        if (advisory && advisory.status === "advisory" && advisory.recommendation) {
          await saveChatMessage({ userId: ctx.user.id, role: "assistant", content: advisory.recommendation });
          return { reply: advisory.recommendation, mlAdvisory: advisory, humanReviewRequired: true };
        }

        const systemPrompt = `You are SmartBank AI's Conversational Financial Intelligence Agent, powered by Infinity AI. 
You are an expert in African banking, Nigerian financial regulations (CBN guidelines), fintech, credit risk, fraud detection, and financial analytics.
You assist bank executives, compliance officers, and financial analysts with data-driven insights.
Be precise, professional, and reference Nigerian/African market context where relevant.
Current date: ${new Date().toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...conversationHistory,
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices[0]?.message?.content;
        const reply = typeof rawContent === 'string' ? rawContent : "I apologize, I could not process your request.";

        await saveChatMessage({ userId: ctx.user.id, role: "assistant", content: reply });
        return { reply, mlAdvisory: advisory, humanReviewRequired: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await import("./db").then((m) => m.getDb());
      if (!db) return { success: false };
      const { chatMessages: chatTable } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await db.delete(chatTable).where(eq(chatTable.userId, ctx.user.id));
      return { success: true };
    }),
  }),

  // ─── Tenant Portal: Customers ────────────────────────────────────────────────
  tenantCustomers: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        return getCustomers(requireTenant(ctx.tenantScope), input.limit ?? 50, input.offset ?? 0);
      }),
    byId: tenantProcedure
      .input(z.object({ id: z.number(), tenantId: z.number().optional() }))
      .query(async ({ input, ctx }) => getCustomerById(input.id, requireTenant(ctx.tenantScope))),
    stats: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => getCustomerStats(requireTenant(ctx.tenantScope))),
    transactions: tenantProcedure
      .input(z.object({ tenantId: z.number(), customerId: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        return getTransactions(requireTenant(ctx.tenantScope), input.limit ?? 20);
      }),
  }),

  // ─── Tenant Portal: Channels ──────────────────────────────────────────────────
  tenantChannels: router({
    sessions: tenantProcedure
      .input(z.object({ tenantId: z.number(), limit: z.number().optional() }))
      .query(async ({ input, ctx }) => getChannelSessions(requireTenant(ctx.tenantScope), input.limit ?? 50)),
    stats: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => getChannelStats(requireTenant(ctx.tenantScope))),
  }),

  // ─── Tenant Portal: Agent Events ──────────────────────────────────────────────
  tenantAgentEvents: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number(), agentName: z.string().optional(), limit: z.number().optional() }))
      .query(async ({ input, ctx }) => getAgentEvents(requireTenant(ctx.tenantScope), input.agentName, input.limit ?? 50)),
    stats: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => getAgentEventStats(requireTenant(ctx.tenantScope))),
  }),

  // ─── Tenant Portal: Data Sources ──────────────────────────────────────────────
  tenantDataSources: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => getDataSources(requireTenant(ctx.tenantScope))),
    sync: tenantAdminProcedure
      .input(z.object({ tenantId: z.number(), sourceId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = requireTenant(ctx.tenantScope);
        await createAuditLog({ userId: ctx.user.id, action: "SYNC_DATA_SOURCE", resource: "data_source", resourceId: String(input.sourceId), details: { tenantId } as any });
        return { success: true, message: "Sync initiated" };
      }),
  }),

  // ─── Tenant Portal: Overview ──────────────────────────────────────────────────
  tenantOverview: router({
    summary: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => {
        const tenantId = requireTenant(ctx.tenantScope);
        return cached(`tenant:${tenantId}:overview`, TTL.TENANT_SUMMARY, async () => {
          const [txStats, customerStats, channelStats, agentEventStats, tenant] = await Promise.all([
            getTenantTransactionStats(tenantId),
            getCustomerStats(tenantId),
            getChannelStats(tenantId),
            getAgentEventStats(tenantId),
            getTenantById(tenantId),
          ]);
          return { txStats, customerStats, channelStats, agentEventStats, tenant };
        });
      }),
    agentNetwork: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => {
        const tenantId = requireTenant(ctx.tenantScope);
        const agents = await getTenantAgents(tenantId);
        const eventStats = await getAgentEventStats(tenantId);
        return agentTypes.map((name) => {
          const agent = agents.find((a) => a.agentName === name);
          const stats = eventStats.find((e) => e.agentName === name);
          return {
            name,
            isEnabled: agent?.isEnabled ?? false,
            config: agent?.config,
            totalEvents: Number(stats?.cnt ?? 0),
            successRate: stats ? Math.round((Number(stats.successCnt) / Number(stats.cnt)) * 100) : 0,
            avgLatencyMs: Math.round(Number(stats?.avgLatency ?? 0)),
            status: agent?.isEnabled ? (Math.random() > 0.1 ? "healthy" : "degraded") : "offline",
          };
        });
      }),
    recentActivity: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => {
        const tenantId = requireTenant(ctx.tenantScope);
        const [transactions, alerts, events] = await Promise.all([
          getTransactions(tenantId, 10),
          getAmlAlerts(tenantId),
          getAgentEvents(tenantId, undefined, 20),
        ]);
        return { transactions: transactions.slice(0, 10), alerts: alerts.slice(0, 5), events: events.slice(0, 10) };
      }),
  }),

  // ─── Tenant Portal: Deployment ────────────────────────────────────────────────
  tenantDeployment: router({
    status: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => {
        const tenant = await getTenantById(requireTenant(ctx.tenantScope));
        return {
          deploymentModel: tenant?.deploymentModel ?? "private_cloud",
          deploymentRegion: tenant?.deploymentRegion ?? "Lagos, Nigeria",
          apiBaseUrl: tenant?.apiBaseUrl ?? "https://api.smartbankng.com",
          status: "operational",
          version: "v2.4.1",
          lastDeployed: new Date(Date.now() - 7 * 86400000),
          uptime: "99.97%",
          services: [
            { name: "AI Agent Orchestrator", status: "running", version: "v2.4.1", cpu: 34, memory: 62 },
            { name: "API Gateway", status: "running", version: "v1.8.3", cpu: 18, memory: 41 },
            { name: "Message Queue (Kafka)", status: "running", version: "v3.6.0", cpu: 22, memory: 55 },
            { name: "Feature Store (Feast)", status: "running", version: "v0.38.0", cpu: 12, memory: 38 },
            { name: "Model Registry (MLflow)", status: "running", version: "v2.9.1", cpu: 8, memory: 29 },
            { name: "Vector Database (Qdrant)", status: "running", version: "v1.7.4", cpu: 15, memory: 44 },
            { name: "Monitoring (Prometheus)", status: "running", version: "v2.48.0", cpu: 5, memory: 18 },
            { name: "Log Aggregation (ELK)", status: "degraded", version: "v8.11.0", cpu: 45, memory: 78 },
          ],
          networkStats: { ingressMbps: 124, egressMbps: 89, activeConnections: 2847, tlsHandshakesPerMin: 342 },
        };
      }),
    connectivity: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ ctx }) => {
        const sources = await getDataSources(requireTenant(ctx.tenantScope));
        return {
          infinityAiPlatform: { status: "connected", latencyMs: 23, lastHeartbeat: new Date() },
          dataSources: sources,
          channels: [
            { name: "Web Banking Portal", status: "connected", activeUsers: 1247, lastActivity: new Date(Date.now() - 120000) },
            { name: "Mobile Banking Super App", status: "connected", activeUsers: 4823, lastActivity: new Date(Date.now() - 30000) },
            { name: "USSD Gateway", status: "connected", activeUsers: 892, lastActivity: new Date(Date.now() - 60000) },
            { name: "Branch Teller System", status: "connected", activeUsers: 134, lastActivity: new Date(Date.now() - 300000) },
          ],
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
