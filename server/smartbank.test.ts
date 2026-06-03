import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Context factories ────────────────────────────────────────────────────────
function makeClearedCookies() {
  const cleared: Array<{ name: string; options: Record<string, unknown> }> = [];
  return { cleared, clearCookie: (name: string, options: Record<string, unknown>) => cleared.push({ name, options }) };
}

function makeCtx(role: "platform_owner" | "tenant_admin" | "analyst" | "user" | "admin" = "platform_owner"): TrpcContext {
  const { clearCookie } = makeClearedCookies();
  return {
    user: {
      id: 1,
      openId: "test-open-id",
      email: "admin@smartbankAI.com",
      name: "Test Admin",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie } as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  const { clearCookie } = makeClearedCookies();
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie } as TrpcContext["res"],
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).toBeTruthy();
    expect(result?.role).toBe("platform_owner");
  });

  it("logout clears session cookie", async () => {
    const { cleared, clearCookie } = makeClearedCookies();
    const ctx: TrpcContext = {
      user: makeCtx().user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared.length).toBe(1);
    expect(cleared[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ─── Platform stats ───────────────────────────────────────────────────────────
describe("platform.stats", () => {
  it("returns platform-level statistics", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const stats = await caller.platform.stats();
    // Fields from getPlatformStats: tenantCount, userCount, txCount, alertCount
    expect(stats).toHaveProperty("tenantCount");
    expect(stats).toHaveProperty("userCount");
    expect(typeof stats.tenantCount).toBe("number");
  });
});

// ─── Tenants ──────────────────────────────────────────────────────────────────
describe("tenants", () => {
  it("list returns an array", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const tenants = await caller.tenants.list();
    expect(Array.isArray(tenants)).toBe(true);
  });

  it("stats returns tenant statistics object", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const stats = await caller.tenants.stats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("active");
    expect(stats).toHaveProperty("trial");
    expect(stats).toHaveProperty("suspended");
  });

  it("analyst role cannot create tenants (FORBIDDEN)", async () => {
    const caller = appRouter.createCaller(makeCtx("analyst"));
    await expect(
      caller.tenants.create({
        name: "Test Bank",
        slug: "test-bank",
        contactEmail: "test@bank.com",
        subscriptionTier: "starter",
      })
    ).rejects.toThrow();
  });

  it("platform_owner can create a tenant", async () => {
    const caller = appRouter.createCaller(makeCtx("platform_owner"));
    const result = await caller.tenants.create({
      name: "Acme MFB",
      slug: `acme-mfb-${Date.now()}`,
      contactEmail: "admin@acmemfb.com",
      subscriptionTier: "growth",
    });
    expect(result).toHaveProperty("id");
    expect(result.name).toBe("Acme MFB");
  });
});

// ─── Agents ───────────────────────────────────────────────────────────────────
describe("agents", () => {
  it("allMetrics returns array with 8 agents", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const metrics = await caller.agents.allMetrics();
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBe(8);
  });

  it("each metric has required fields", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const metrics = await caller.agents.allMetrics();
    for (const m of metrics) {
      expect(m).toHaveProperty("agentName");
      expect(m).toHaveProperty("status");
      expect(m).toHaveProperty("uptimePercent");
      expect(m).toHaveProperty("latencyP99Ms");
    }
  });

  it("forTenant returns array for a given tenant", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const agents = await caller.agents.forTenant({ tenantId: 1 });
    expect(Array.isArray(agents)).toBe(true);
  });
});

// ─── Fraud ────────────────────────────────────────────────────────────────────
describe("fraud", () => {
  it("transactions returns array", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const txns = await caller.fraud.transactions({});
    expect(Array.isArray(txns)).toBe(true);
    expect(txns.length).toBeGreaterThan(0);
  });

  it("each transaction has riskScore and fraudStatus", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const txns = await caller.fraud.transactions({});
    for (const t of txns) {
      expect(t).toHaveProperty("riskScore");
      expect(t).toHaveProperty("fraudStatus");
    }
  });

  it("stats returns fraud statistics", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const stats = await caller.fraud.stats();
    expect(stats).toHaveProperty("totalScanned");
    expect(stats).toHaveProperty("flaggedToday");
    expect(stats).toHaveProperty("confirmedFraud");
  });
});

// ─── Credit ───────────────────────────────────────────────────────────────────
describe("credit", () => {
  it("applications returns array", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const apps = await caller.credit.applications({});
    expect(Array.isArray(apps)).toBe(true);
    expect(apps.length).toBeGreaterThan(0);
  });

  it("score returns a valid credit score between 300 and 850", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.credit.score({
      applicantName: "Chidi Okeke",
      monthlyIncome: 250000,
      requestedAmount: 500000,
      employmentStatus: "employed",
      mobileMoneyScore: 75,
    });
    expect(result.score).toBeGreaterThanOrEqual(300);
    expect(result.score).toBeLessThanOrEqual(850);
    expect(["approve", "review", "decline"]).toContain(result.recommendation);
    expect(result.factors.length).toBeGreaterThan(0);
  });

  it("low income to loan ratio produces decline recommendation", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.credit.score({
      applicantName: "Low Income Applicant",
      monthlyIncome: 10000,
      requestedAmount: 5000000,
      employmentStatus: "unemployed",
      mobileMoneyScore: 10,
    });
    expect(["decline", "review"]).toContain(result.recommendation);
  });
});

// ─── Compliance ───────────────────────────────────────────────────────────────
describe("compliance", () => {
  it("reports returns array with CBN report types", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const reports = await caller.compliance.reports({});
    expect(Array.isArray(reports)).toBe(true);
    expect(reports.length).toBeGreaterThan(0);
    const hasCBN = reports.some((r) => (r as any).reportType?.includes("CBN"));
    expect(hasCBN).toBe(true);
  });

  it("amlAlerts returns array", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const alerts = await caller.compliance.amlAlerts({});
    expect(Array.isArray(alerts)).toBe(true);
  });

  it("auditLogs returns array", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const logs = await caller.compliance.auditLogs({});
    expect(Array.isArray(logs)).toBe(true);
  });
});

// ─── Billing ──────────────────────────────────────────────────────────────────
describe("billing", () => {
  it("summary returns MRR and ARR", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const summary = await caller.billing.summary();
    expect(summary.mrr).toBeGreaterThan(0);
    expect(summary.arr).toBeGreaterThan(0);
    expect(summary.activeSubscriptions).toBeGreaterThan(0);
  });

  it("invoices returns array", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const invoices = await caller.billing.invoices({});
    expect(Array.isArray(invoices)).toBe(true);
    expect(invoices.length).toBeGreaterThan(0);
  });
});

// ─── Chat ─────────────────────────────────────────────────────────────────────
describe("chat", () => {
  it("history returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const history = await caller.chat.history();
    expect(Array.isArray(history)).toBe(true);
  });

  it("unauthenticated user cannot access chat history", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.chat.history()).rejects.toThrow();
  });
});

// ─── Users ────────────────────────────────────────────────────────────────────
describe("users", () => {
  it("list requires admin role", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("platform_owner can list users", async () => {
    const caller = appRouter.createCaller(makeCtx("platform_owner"));
    const userList = await caller.users.list();
    expect(Array.isArray(userList)).toBe(true);
  });

  it("analyst cannot update user roles", async () => {
    const caller = appRouter.createCaller(makeCtx("analyst"));
    await expect(
      caller.users.updateRole({ userId: 2, role: "tenant_admin" })
    ).rejects.toThrow();
  });
});
