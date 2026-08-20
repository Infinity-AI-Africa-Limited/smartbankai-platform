import { createHash, createHmac, randomUUID } from "node:crypto";
import {
  ML_CONTRACT_VERSION,
  mlAdvisoryRequestSchema,
  mlAdvisoryResponseSchema,
  mlHealthResponseSchema,
  type MlAdvisoryRequest,
  type MlAdvisoryResponse,
  type MlRequestType,
} from "../shared/ml-contract";
import { ENV } from "./_core/env";

const PLATFORM_CLIENT_ID = "smartbank-platform";
// Must exceed the orchestrator's own per-agent budget (10s) plus its overhead,
// otherwise the platform aborts work the orchestrator is still completing and
// trips its own circuit against a healthy service.
const REQUEST_TIMEOUT_MS = 15_000;
const FAILURE_THRESHOLD = 3;
const RECOVERY_WINDOW_MS = 30_000;

export class MlGatewayUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MlGatewayUnavailableError";
  }
}

type FetchLike = typeof fetch;

export type MlGatewayConfig = {
  baseUrl: string;
  serviceToken: string;
  fetchImpl?: FetchLike;
  now?: () => number;
};

/**
 * A narrow backend-only client. It accepts only the v1 contract, never forwards
 * browser credentials, and returns unavailable rather than silently inventing a decision.
 */
export class MlGateway {
  private failures = 0;
  private circuitOpenedAt = 0;
  private readonly fetchImpl: FetchLike;
  private readonly now: () => number;

  constructor(private readonly config: MlGatewayConfig) {
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.now = config.now ?? Date.now;
  }

  private get configured() {
    return Boolean(this.config.baseUrl && this.config.serviceToken);
  }

  private circuitOpen() {
    if (this.failures < FAILURE_THRESHOLD) return false;
    if (this.now() - this.circuitOpenedAt >= RECOVERY_WINDOW_MS) {
      this.failures = 0;
      this.circuitOpenedAt = 0;
      return false;
    }
    return true;
  }

  private recordFailure() {
    this.failures += 1;
    if (this.failures >= FAILURE_THRESHOLD) this.circuitOpenedAt = this.now();
  }

  private recordSuccess() {
    this.failures = 0;
    this.circuitOpenedAt = 0;
  }

  private unavailable(request: MlAdvisoryRequest, reason: string): MlAdvisoryResponse {
    return {
      contract_version: ML_CONTRACT_VERSION,
      correlation_id: request.correlation_id,
      decision_id: randomUUID(),
      request_type: request.request_type,
      status: "unavailable",
      recommendation: reason,
      human_review_required: true,
      received_at: new Date(this.now()).toISOString(),
    };
  }

  async route(request: MlAdvisoryRequest): Promise<MlAdvisoryResponse> {
    const validated = mlAdvisoryRequestSchema.parse(request);
    if (!this.configured) {
      return this.unavailable(validated, "ML orchestrator is not configured; human review is required.");
    }
    if (this.circuitOpen()) {
      return this.unavailable(validated, "ML orchestrator circuit is open; human review is required.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const startedAt = this.now();

    try {
      const response = await this.fetchImpl(`${this.config.baseUrl.replace(/\/$/, "")}/v1/route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Token": this.config.serviceToken,
          "X-Client-ID": PLATFORM_CLIENT_ID,
          "X-Correlation-ID": validated.correlation_id,
        },
        body: JSON.stringify(validated),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.recordFailure();
        return this.unavailable(validated, `ML orchestrator returned HTTP ${response.status}; human review is required.`);
      }

      const parsed = mlAdvisoryResponseSchema.safeParse(await response.json());
      if (!parsed.success || parsed.data.correlation_id !== validated.correlation_id) {
        this.recordFailure();
        return this.unavailable(validated, "ML orchestrator returned an invalid advisory response; human review is required.");
      }

      this.recordSuccess();
      return {
        ...parsed.data,
        latency_ms: parsed.data.latency_ms ?? this.now() - startedAt,
        human_review_required: true,
      };
    } catch (error) {
      this.recordFailure();
      const reason = error instanceof Error && error.name === "AbortError"
        ? "ML orchestrator timed out; human review is required."
        : "ML orchestrator is unavailable; human review is required.";
      return this.unavailable(validated, reason);
    } finally {
      clearTimeout(timeout);
    }
  }

  async health() {
    if (!this.configured) throw new MlGatewayUnavailableError("ML orchestrator is not configured");
    const response = await this.fetchImpl(`${this.config.baseUrl.replace(/\/$/, "")}/health`, {
      headers: { "X-Client-ID": PLATFORM_CLIENT_ID },
    });
    if (!response.ok) throw new MlGatewayUnavailableError(`ML orchestrator returned HTTP ${response.status}`);
    return mlHealthResponseSchema.parse(await response.json());
  }
}

/**
 * Replace a raw identifier - an account number, a customer id - with a stable
 * pseudonymous key before it crosses the ML boundary. Deterministic within a
 * tenant so AML typology graphs still link parties, and not reversible without
 * the secret. The tenant is mixed in so the same account under two tenants does
 * not produce the same key.
 */
export function pseudonymousKey(tenantId: number, kind: string, value: string | null | undefined): string {
  const secret = ENV.mlPseudonymSecret || ENV.mlServiceToken;
  if (!secret) throw new Error("Pseudonymisation secret is not configured; refusing to send identifiers to the ML layer");
  const digest = createHmac("sha256", secret)
    .update(`smartbank:pseudonym:v1:${tenantId}:${kind}:${value ?? ""}`)
    .digest("hex");
  return `${kind}_${digest.slice(0, 24)}`;
}

export function createAdvisoryRequest<T extends MlAdvisoryRequest["payload"]>(
  tenantId: number,
  requestType: MlRequestType,
  payload: T,
): MlAdvisoryRequest {
  return mlAdvisoryRequestSchema.parse({
    contract_version: ML_CONTRACT_VERSION,
    correlation_id: randomUUID(),
    tenant_id: String(tenantId),
    requested_at: new Date().toISOString(),
    request_type: requestType,
    payload,
  });
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Never persist chat contents in the decision audit; retain a digest and safe metadata only. */
export function createAuditSafeInput(request: MlAdvisoryRequest) {
  const digest = createHash("sha256").update(stableStringify(request.payload)).digest("hex");
  let payload: Record<string, unknown>;
  switch (request.request_type) {
    case "chat":
      payload = {
        session_id: request.payload.session_id,
        customer_id: request.payload.customer_id,
        language: request.payload.language,
        message_redacted: true,
        conversation_turn_count: request.payload.conversation_history.length,
      };
      break;
    case "credit_assessment": {
      // Income, obligations and balances are account data. The digest above
      // still binds the audit row to the exact input that produced the advice.
      const { customer_id, employment_type, loan_tenure_months, bvn_verified, account_age_months } = request.payload;
      payload = {
        customer_id,
        employment_type,
        loan_tenure_months,
        bvn_verified,
        account_age_months,
        financial_inputs_redacted: true,
      };
      break;
    }
    case "aml_check":
      payload = {
        customer_id: request.payload.customer_id,
        check_types: request.payload.check_types,
        transaction_count: request.payload.transactions.length,
        transactions_redacted: true,
      };
      break;
    default:
      payload = request.payload;
  }

  return { digest, payload };
}

let singletonGateway: MlGateway | undefined;

export function getMlGateway() {
  if (!singletonGateway) {
    singletonGateway = new MlGateway({
      baseUrl: ENV.mlOrchestratorUrl,
      serviceToken: ENV.mlServiceToken,
    });
  }
  return singletonGateway;
}

/** Test-only reset used to exercise different deployment configurations without process restarts. */
export function resetMlGatewayForTesting() {
  singletonGateway = undefined;
}

export function setMlGatewayForTesting(gateway: MlGateway | undefined) {
  singletonGateway = gateway;
}
