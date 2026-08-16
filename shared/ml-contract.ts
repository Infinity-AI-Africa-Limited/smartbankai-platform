import { z } from "zod";

/**
 * The only contract version accepted by the initial platform-to-orchestrator integration.
 * Version changes must be additive or introduced under a new contract version.
 */
export const ML_CONTRACT_VERSION = "2026-08-01" as const;

export const mlRequestTypeSchema = z.enum([
  "fraud_check",
  "credit_assessment",
  "aml_check",
  "recommend",
  "chat",
]);

const requestMetadataSchema = z.object({
  contract_version: z.literal(ML_CONTRACT_VERSION),
  correlation_id: z.string().uuid(),
  tenant_id: z.string().min(1).max(100),
  requested_at: z.string().datetime(),
});

export const transactionFeaturesSchema = z.object({
  transaction_id: z.string().min(1).max(100),
  amount_ngn: z.number().finite().nonnegative(),
  channel: z.enum(["web", "mobile", "ussd", "pos", "atm", "branch", "api"]),
  merchant_category: z.string().max(100).optional(),
  hour_of_day: z.number().int().min(0).max(23),
  day_of_week: z.number().int().min(0).max(6),
  origin_region: z.string().max(100).optional(),
  sender_30d_avg_amount: z.number().finite().nonnegative().optional(),
  sender_txn_count_1h: z.number().int().nonnegative().optional(),
}).strict();

export const creditFeaturesSchema = z.object({
  customer_id: z.string().min(1).max(100),
  monthly_income_ngn: z.number().finite().nonnegative(),
  employment_type: z.enum(["salaried", "self_employed", "informal", "unemployed", "unknown"]),
  loan_amount_ngn: z.number().finite().nonnegative(),
  loan_tenure_months: z.number().int().min(1).max(120),
  existing_monthly_obligations_ngn: z.number().finite().nonnegative(),
  repayment_history_score: z.number().finite().min(0).max(100),
  bvn_verified: z.boolean(),
  account_age_months: z.number().int().nonnegative(),
  avg_monthly_balance_ngn: z.number().finite().nonnegative(),
}).strict();

export const customerFeaturesSchema = z.object({
  customer_id: z.string().min(1).max(100),
  age_band: z.enum(["18-25", "26-35", "36-45", "46-55", "55+", "unknown"]).optional(),
  income_band: z.enum(["low", "mid", "high", "premium", "unknown"]).optional(),
  products_held: z.array(z.string().min(1).max(100)).max(30),
  channel_preference: z.enum(["mobile", "web", "ussd", "branch", "unknown"]),
  days_since_last_transaction: z.number().int().nonnegative().optional(),
  monthly_txn_count_3m_avg: z.number().finite().nonnegative().optional(),
  complaint_count_12m: z.number().int().nonnegative().optional(),
  account_age_months: z.number().int().nonnegative(),
}).strict();

export const assistantFeaturesSchema = z.object({
  session_id: z.string().min(1).max(100),
  customer_id: z.string().min(1).max(100).optional(),
  message: z.string().min(1).max(4000),
  conversation_history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
  }).strict()).max(20).default([]),
  language: z.string().min(2).max(10).default("en"),
}).strict();

export const fraudRequestSchema = requestMetadataSchema.extend({
  request_type: z.literal("fraud_check"),
  payload: transactionFeaturesSchema,
});

export const amlRequestSchema = requestMetadataSchema.extend({
  request_type: z.literal("aml_check"),
  payload: transactionFeaturesSchema,
});

export const creditRequestSchema = requestMetadataSchema.extend({
  request_type: z.literal("credit_assessment"),
  payload: creditFeaturesSchema,
});

export const recommendationRequestSchema = requestMetadataSchema.extend({
  request_type: z.literal("recommend"),
  payload: customerFeaturesSchema,
});

export const assistantRequestSchema = requestMetadataSchema.extend({
  request_type: z.literal("chat"),
  payload: assistantFeaturesSchema,
});

export const mlAdvisoryRequestSchema = z.discriminatedUnion("request_type", [
  fraudRequestSchema,
  amlRequestSchema,
  creditRequestSchema,
  recommendationRequestSchema,
  assistantRequestSchema,
]);

export const advisoryStatusSchema = z.enum(["advisory", "unavailable", "rejected"]);

export const mlAdvisoryResponseSchema = z.object({
  contract_version: z.literal(ML_CONTRACT_VERSION),
  correlation_id: z.string().uuid(),
  decision_id: z.string().uuid(),
  request_type: mlRequestTypeSchema,
  status: advisoryStatusSchema,
  recommendation: z.string().max(4000).optional(),
  confidence: z.number().finite().min(0).max(1).optional(),
  human_review_required: z.literal(true),
  explanation: z.object({
    summary: z.string().max(4000).optional(),
    top_factors: z.array(z.record(z.string(), z.unknown())).max(20).optional(),
  }).strict().optional(),
  model: z.object({
    agent: z.string().min(1).max(100),
    model_name: z.string().min(1).max(100).optional(),
    model_version: z.string().min(1).max(100).optional(),
  }).strict().optional(),
  received_at: z.string().datetime(),
  latency_ms: z.number().finite().nonnegative().optional(),
}).strict();

export const mlHealthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  contract_versions: z.array(z.string()).min(1),
  agents: z.record(z.string(), z.string()),
}).passthrough();

export type MlAdvisoryRequest = z.infer<typeof mlAdvisoryRequestSchema>;
export type MlAdvisoryResponse = z.infer<typeof mlAdvisoryResponseSchema>;
export type MlRequestType = z.infer<typeof mlRequestTypeSchema>;
