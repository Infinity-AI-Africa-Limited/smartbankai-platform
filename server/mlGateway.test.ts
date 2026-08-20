import { describe, expect, it, vi } from "vitest";
import { ML_CONTRACT_VERSION } from "../shared/ml-contract";
import { createAdvisoryRequest, createAuditSafeInput, MlGateway } from "./mlGateway";

function fraudRequest() {
  return createAdvisoryRequest(4, "fraud_check", {
    transaction_id: "TXN-001",
    amount_ngn: 125000,
    channel: "mobile",
    hour_of_day: 10,
    day_of_week: 2,
  });
}

describe("MlGateway", () => {
  it("returns an advisory unavailable result when the ML deployment is not configured", async () => {
    const gateway = new MlGateway({ baseUrl: "", serviceToken: "" });

    const result = await gateway.route(fraudRequest());

    expect(result.status).toBe("unavailable");
    expect(result.human_review_required).toBe(true);
    expect(result.recommendation).toContain("not configured");
  });

  it("posts only through the backend contract and validates a correlated advisory result", async () => {
    const request = fraudRequest();
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({
        "X-Service-Token": "test-service-token",
        "X-Client-ID": "smartbank-platform",
        "X-Correlation-ID": request.correlation_id,
      });
      return new Response(JSON.stringify({
        contract_version: ML_CONTRACT_VERSION,
        correlation_id: request.correlation_id,
        decision_id: "83a368a5-77f4-4df2-8d58-5cac40188dfb",
        request_type: "fraud_check",
        status: "advisory",
        recommendation: "REVIEW",
        confidence: 0.87,
        human_review_required: true,
        received_at: "2026-08-16T09:00:00.000Z",
        model: { agent: "fraud_detection", model_version: "2026.08.1" },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const gateway = new MlGateway({
      baseUrl: "https://ml.internal",
      serviceToken: "test-service-token",
      fetchImpl,
    });

    const result = await gateway.route(request);

    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(String(fetchImpl.mock.calls[0]?.[0])).toBe("https://ml.internal/v1/route");
    expect(result.status).toBe("advisory");
    expect(result.human_review_required).toBe(true);
    expect(result.correlation_id).toBe(request.correlation_id);
  });

  it("opens the local circuit breaker after repeated upstream failures", async () => {
    const fetchImpl = vi.fn(async () => new Response("unavailable", { status: 503 }));
    const gateway = new MlGateway({
      baseUrl: "https://ml.internal",
      serviceToken: "test-service-token",
      fetchImpl,
      now: () => 1_000,
    });

    await gateway.route(fraudRequest());
    await gateway.route(fraudRequest());
    await gateway.route(fraudRequest());
    const circuitResult = await gateway.route(fraudRequest());

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(circuitResult.status).toBe("unavailable");
    expect(circuitResult.recommendation).toContain("circuit is open");
  });

  it("redacts conversational content before it reaches the immutable decision audit", () => {
    const request = createAdvisoryRequest(4, "chat", {
      session_id: "session-1",
      customer_id: "customer-7",
      message: "My account number is 0123456789",
      conversation_history: [{ role: "user", content: "Sensitive historical content" }],
      language: "en",
    });

    const safe = createAuditSafeInput(request);

    expect(safe.digest).toHaveLength(64);
    expect(safe.payload).toMatchObject({ message_redacted: true, conversation_turn_count: 1 });
    expect(JSON.stringify(safe.payload)).not.toContain("0123456789");
    expect(JSON.stringify(safe.payload)).not.toContain("Sensitive historical content");
  });
});
