# SmartBank AI — Claude Code Production Context

## Mission and operating boundary

SmartBank AI is an Infinity AI Africa Limited digital-banking intelligence platform for Nigerian financial institutions. It is not a core-banking replacement and it must not independently execute high-impact banking actions.

> All AI outputs are **advisory**. Fraud blocks, credit approvals or declines, AML/SAR decisions, money movement, KYC changes, and customer-impacting actions require authorised human approval, an auditable workflow state, and applicable bank/CBN controls.

## Repository map

| Layer | Organisation source of truth | MistaRichMan mirror | Purpose |
|---|---|---|---|
| Application platform | `Infinity-AI-Africa-Limited/smartbankai-platform` | `MistaRichMan/smartbankai` | React/tRPC platform, database, portals, tenancy, RBAC, audit workflows, and ML gateway |
| ML services | `Infinity-AI-Africa-Limited/smartbankAI-ml` | `MistaRichMan/smartbankAI-ml` | Orchestrator, eight FastAPI agents, model pipelines, containers, and ML CI |

The Infinity AI organisation repositories are authoritative. Maintain the personal repositories as mirrors. Never merge directly into `main`; use feature branches and protected pull requests.

## Platform implementation

The application uses **React 19, TypeScript, Tailwind 4, tRPC 11, Drizzle ORM, and MySQL**. It consists of four connected experiences:

| Route family | Audience | Responsibility |
|---|---|---|
| `/dashboard` | Infinity AI platform owner | tenant management, agents, monitoring, billing, users, audit operations |
| `/tenant/*` | tenant admin and analyst | customers, transactions, channels, AML/compliance, data sources, agent events |
| `/banking/*` | bank customer | web banking, transfers, payments, cards, loans, assistant |
| `/app/*` | bank customer | mobile banking super-app, transfers, cards, loans, assistant, transactions |

The product has three roles: **platform owner (super admin)**, **tenant admin**, and **analyst**. The demo tenant/data model is Nigerian-bank specific: Naira amounts, Nigerian names, Lagos/Abuja context, BVN/NIN fields, CBN compliance views, fraud/AML alerts, 500+ synthetic customers, and 2,000+ synthetic transactions.

### Eight named agents

Use these names exactly in product and documentation:

1. Conversational
2. Fraud Detection
3. Credit Risk
4. Personalization
5. Predictive Analytics
6. Compliance & Reporting
7. Data Aggregation
8. Smart Dashboard

## ML integration boundary

The browser must **never** call an ML agent directly. The application backend routes the minimal permitted payload through `server/mlGateway.ts` to the ML orchestrator. The gateway must preserve: contract versioning, server-only service authentication, payload minimisation, timeout/circuit-breaker controls, fallback behaviour, correlation IDs, and immutable AI-decision audit evidence.

Important platform files:

- `contracts/ml-orchestrator.v1.openapi.yaml`: cross-repository REST contract.
- `shared/ml-contract.ts`: application-side typed schemas.
- `server/mlGateway.ts`: server-only outbound client and resilience boundary.
- `server/routers.ts`: advisory tRPC procedures and workflow integration.
- `drizzle/schema.ts` and `server/db.ts`: append-only AI-decision audit persistence.
- `contracts/ml-orchestrator.compatibility.json` and `scripts/check-ml-contract.mjs`: pinned compatibility check.

The ML orchestrator is in the companion repository. It is the only supported application-to-ML entry point; it delegates to agent services over private authenticated service calls.

## Current review work

Review and harden in this order:

| Order | Personal mirror PR | Organisation mirror PR | Scope |
|---|---|---|---|
| 1 | https://github.com/MistaRichMan/smartbankAI-ml/pull/1 | https://github.com/Infinity-AI-Africa-Limited/smartbankAI-ml/pull/2 | dependency hardening and audit gate |
| 2 | https://github.com/MistaRichMan/smartbankAI-ml/pull/2 | https://github.com/Infinity-AI-Africa-Limited/smartbankAI-ml/pull/3 | synthetic eight-agent model build |
| 3 | `manus/claude-production-handoff` | mirrored branch | cross-repository Claude instructions and detailed review handoff |

The ML repository contains a detailed companion brief at `docs/CLAUDE_CODE_PRODUCTION_HANDOFF.md` on the handoff branch.

## Claude Code startup prompt

Copy the following prompt into a Claude Code session opened at the parent directory containing both repositories:

```text
You are the production-hardening reviewer for Infinity AI Africa Limited's SmartBank AI.

Work across these repositories together:
1. smartbankai-platform — the React 19/tRPC/Drizzle/MySQL application platform.
2. smartbankAI-ml — the FastAPI orchestrator and eight ML agent services.

Read these files before changing any code:
- smartbankai-platform/CLAUDE.md
- smartbankAI-ml/CLAUDE.md
- smartbankAI-ml/docs/CLAUDE_CODE_PRODUCTION_HANDOFF.md

Review the pull requests in order: dependency hardening first, synthetic model build second, and cross-repository handoff documentation third. Treat the Infinity AI organisation repositories as authoritative and MistaRichMan repositories as mirrors. Work only on new feature branches and submit PRs; never merge directly to main.

The non-negotiable product posture is human-in-the-loop. AI outputs may observe, score, explain, and recommend, but may not autonomously execute or authorise money movement, fraud blocks, credit decisions, AML/SAR filings, KYC changes, or any customer-impacting action. The application backend is the only caller of the ML orchestrator; browsers must not call agents directly.

Start by validating the existing checks, then perform a P0 production-hardening review for identity/mTLS, secrets, tenant isolation, data minimisation and redaction, private networking, audit immutability, model registry and signing, dependency/container/SBOM scanning, integration and negative-authorisation tests, load/chaos tests, rollback, backup/restore, and disaster recovery. Treat all synthetic datasets and model artefacts as development-only; replace them with bank-approved UAT data and independent model validation before any bank deployment.

For each issue, classify severity, affected repository, exploit or failure path, recommended fix, test evidence, migration/rollback impact, and the approval owner (engineering, security, model risk, MLRO/compliance, or bank UAT). Do not make unverifiable production-readiness claims.
```

## Model status and restrictions

The model branch provides reproducible, privacy-safe **synthetic** Nigerian-banking datasets and development artefacts for all eight agents. It includes fraud anomaly detection, an explainable credit scorecard, AML typology/graph analysis, personalization, forecasting, dashboard segmentation, conversational safety/retrieval assets, and aggregation/entity-resolution fixtures.

Synthetic artefacts validate pipeline wiring and controls. They are **not** evidence of production fraud accuracy, credit-risk calibration, AML efficacy, fairness, or regulatory readiness. Replace all synthetic data and generated model artefacts with bank-authorised UAT data, independent validation, signed model versions, and production model governance before deployment.

## Production-hardening priorities

### P0: before bank UAT

1. Implement mTLS or bank-approved workload identity, short-lived credentials, rotation, and tenant-scoped service policies.
2. Move all secrets to a managed secret store and remove development fallbacks.
3. Enforce payload tokenisation/pseudonymisation, strict structured-log redaction, encryption, retention, deletion, and audit/hold controls.
4. Deploy private-only services with default-deny network policies, egress allowlists, TLS, trusted-host validation, rate/request-size controls, and container scanning.
5. Establish model registry, signed artefacts, data/training lineage, drift monitoring, rollback, kill switch, and independent model-risk approval.
6. Test mandatory human approval and override capture for every high-impact workflow.
7. Add full integration, negative authorization, privacy, contract, load/chaos, SAST/DAST/SCA, SBOM, backup/restore, and disaster-recovery evidence.

### P1: during controlled UAT

1. Integrate and contract-test core banking, NIP, bureau, KYC/AML, notification, and reporting adapters.
2. Replace demo metrics/seeded data with bank-approved de-identified or controlled UAT data.
3. Calibrate agent thresholds by tenant/channel and complete false-positive, false-negative, fairness, stability, and explainability analysis.
4. Build investigator/MLRO queues, reason-code capture, overrides, escalation, and reconciliation workflows.

## Verification commands

```bash
# Application platform
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm contract:check

# ML services (on the appropriate PR branch)
./scripts/audit_dependencies.sh
ruff check agents orchestrator shared tests
pytest tests/unit -q
python3 -m compileall -q agents orchestrator shared
```

## Development rules

- Never expose ML service URLs, service tokens, model internals, or direct agent calls to the client.
- Never log full banking identifiers, account numbers, BVN/NIN, credentials, raw request bodies, or model-training secrets.
- Preserve append-only audit records; do not add an endpoint that edits or deletes AI decision evidence.
- Treat LLM prompts, retrieved documents, agent inputs, and external feeds as untrusted data; apply allowlists, access control, redaction, validation, and prompt-injection defenses.
- Do not reintroduce dynamic or untrusted conversational retrieval until an access-controlled, bank-approved knowledge ingest and retrieval security review is complete.
- Keep bank production deployment private; do not deploy synthetic data, generated development model files, or local Compose secrets to a production image.
- Every production change is a new feature branch and PR. Claude Code reviews/hardens and the designated approvers merge.
