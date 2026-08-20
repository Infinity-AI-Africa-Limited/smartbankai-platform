import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { z } from "zod";

import {
  ML_CONTRACT_VERSION,
  amlFeaturesSchema,
  assistantFeaturesSchema,
  creditFeaturesSchema,
  customerFeaturesSchema,
  mlRequestTypeSchema,
  transactionFeaturesSchema,
} from "../shared/ml-contract";

/**
 * `scripts/check-ml-contract.mjs` proves the two repositories carry the same
 * contract file. It cannot prove that either file describes the code, and that
 * gap is exactly how `aml_check` shipped documented as a single transaction
 * while the agent had always served a transaction window.
 *
 * These tests bind the published OpenAPI schema to the zod schema the gateway
 * actually validates against, so the document and the implementation cannot
 * drift apart silently again.
 */

const contract = parse(
  readFileSync(resolve(process.cwd(), "contracts/ml-orchestrator.v1.openapi.yaml"), "utf8"),
);

const schemas = contract.components.schemas as Record<string, any>;

function openApiPayloadName(requestSchemaName: string): string {
  const request = schemas[requestSchemaName];
  const body = request.allOf.find((part: any) => part.properties?.payload);
  const ref: string = body.properties.payload.$ref;
  return ref.split("/").pop() as string;
}

function openApiProperties(schemaName: string) {
  const schema = schemas[schemaName];
  return {
    properties: new Set(Object.keys(schema.properties ?? {})),
    required: new Set<string>(schema.required ?? []),
    additionalProperties: schema.additionalProperties,
  };
}

function zodProperties(schema: z.ZodObject<z.ZodRawShape>) {
  const shape = schema.shape;
  const properties = new Set(Object.keys(shape));
  const required = new Set(
    Object.entries(shape)
      .filter(([, value]) => !(value as z.ZodTypeAny).isOptional())
      .map(([key]) => key),
  );
  return { properties, required };
}

const CASES: Array<{
  requestType: string;
  requestSchema: string;
  payloadSchema: string;
  zodSchema: z.ZodObject<z.ZodRawShape>;
}> = [
  {
    requestType: "fraud_check",
    requestSchema: "FraudRequest",
    payloadSchema: "TransactionFeatures",
    zodSchema: transactionFeaturesSchema,
  },
  {
    requestType: "aml_check",
    requestSchema: "AmlRequest",
    payloadSchema: "AmlFeatures",
    zodSchema: amlFeaturesSchema,
  },
  {
    requestType: "credit_assessment",
    requestSchema: "CreditRequest",
    payloadSchema: "CreditFeatures",
    zodSchema: creditFeaturesSchema,
  },
  {
    requestType: "recommend",
    requestSchema: "RecommendationRequest",
    payloadSchema: "CustomerFeatures",
    zodSchema: customerFeaturesSchema,
  },
  {
    requestType: "chat",
    requestSchema: "AssistantRequest",
    payloadSchema: "AssistantFeatures",
    zodSchema: assistantFeaturesSchema,
  },
];

describe("ML contract alignment", () => {
  it("declares the pinned contract version", () => {
    expect(contract.info.version).toBe(ML_CONTRACT_VERSION);
  });

  it("covers exactly the request types the platform can send", () => {
    const documented = new Set<string>(
      schemas.ContractMetadata.properties.request_type.enum as string[],
    );
    expect(documented).toEqual(new Set(mlRequestTypeSchema.options));
    expect(new Set(CASES.map((entry) => entry.requestType))).toEqual(documented);
  });

  describe.each(CASES)("$requestType", ({ requestSchema, payloadSchema, zodSchema }) => {
    it("routes to the documented payload schema", () => {
      expect(openApiPayloadName(requestSchema)).toBe(payloadSchema);
    });

    it("documents the same fields the gateway validates", () => {
      const documented = openApiProperties(payloadSchema);
      const implemented = zodProperties(zodSchema);
      expect([...documented.properties].sort()).toEqual([...implemented.properties].sort());
    });

    it("documents the same required fields the gateway enforces", () => {
      const documented = openApiProperties(payloadSchema);
      const implemented = zodProperties(zodSchema);
      expect([...documented.required].sort()).toEqual([...implemented.required].sort());
    });

    it("forbids unknown fields on both sides", () => {
      // The contract says additionalProperties: false; zod must be .strict(),
      // otherwise an un-minimised payload would pass the platform and be
      // rejected only at the orchestrator.
      expect(openApiProperties(payloadSchema).additionalProperties).toBe(false);
      const parsed = zodSchema.safeParse({ definitely_not_a_contract_field: 1 });
      expect(parsed.success).toBe(false);
    });
  });

  it("documents the AML transaction item the agent consumes", () => {
    const item = openApiProperties("AmlTransaction");
    expect([...item.properties].sort()).toEqual(
      ["amount_ngn", "id", "receiver", "sender", "timestamp"].sort(),
    );
    expect([...item.required].sort()).toEqual(
      ["amount_ngn", "id", "receiver", "sender", "timestamp"].sort(),
    );
  });

  it("rejects raw BVN-shaped party identifiers before they leave the platform", () => {
    const withRawBvn = {
      customer_id: "22123456789",
      transactions: [
        {
          id: "TXN-1",
          sender: "22123456789",
          receiver: "party_abc",
          amount_ngn: 1000,
          timestamp: "2026-08-20T09:00:00.000Z",
        },
      ],
    };
    expect(amlFeaturesSchema.safeParse(withRawBvn).success).toBe(false);
  });
});
