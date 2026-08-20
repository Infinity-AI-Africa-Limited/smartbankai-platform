# SmartBank AI — Backoffice Admin Portal TODO

## Phase 1: Foundation
- [x] Upload Infinity AI logo to static assets
- [x] Configure global CSS with Infinity AI brand colors and typography
- [x] Define full database schema (tenants, agents, users, billing, transactions, alerts, audit logs)
- [x] Push database migrations

## Phase 2: Core Layout & Auth
- [x] Custom sidebar layout with Infinity AI branding
- [x] RBAC: platform owner (super admin), tenant admin, analyst roles
- [x] Login/auth page with Infinity AI branding
- [x] Role-gated route protection

## Phase 3: Tenant & User Management
- [x] Tenant list page with onboarding flow
- [x] Tenant detail page with subscription and usage metrics
- [x] User management page with role assignment
- [x] Billing & subscription management page

## Phase 4: AI Agent Control Center
- [x] Agent control center overview page
- [x] Per-tenant agent enable/disable toggle
- [x] Per-agent configuration panel (all 8 agents)
- [x] Agent status indicators

## Phase 5: Platform Monitoring
- [x] Real-time monitoring dashboard (agent health, uptime, latency, throughput, error rates)
- [x] System health overview with charts

## Phase 6: Agent Panels (Part 1)
- [x] Conversational AI chat interface with LLM integration
- [x] Fraud Detection panel (live feed, alerts, risk scores, threshold config)
- [x] Credit Risk panel (loan scoring, alternative data, score history)

## Phase 7: Agent Panels (Part 2)
- [x] Compliance & Reporting panel (CBN templates, audit log, AML alerts)
- [x] Data Aggregation panel (source connectors, ingestion status)
- [x] Smart Dashboard panel (financial overview widgets)
- [x] Personalization panel (segment viewer, recommendations)
- [x] Predictive Analytics panel (forecasts, churn scores)

## Phase 8: Final Polish & Tests
- [x] Wire all tRPC routers with real data + mock fallback
- [x] Write vitest tests (28 tests, all passing)
- [x] Final brand consistency pass
- [x] Save checkpoint

## Future Enhancements (Roadmap — Intentionally Deferred)
- [x] Deferred to v2 — Real-time WebSocket agent metrics (currently mock polling)
- [x] Deferred to v2 — PDF/Excel export for compliance reports
- [x] Deferred to v2 — Stripe payment integration for billing
- [x] Deferred to v2 — Email notification system for AML alerts
- [x] Deferred to v2 — Multi-language support (Hausa, Yoruba, Igbo)

## Tenant-Side Platform (Phase 2 Build)

### Demo Data Seeding
- [x] Nigerian banking demo data: 500+ customers, 2000+ transactions, fraud alerts, credit applications
- [x] Demo data seed script with realistic Naira amounts, Nigerian names, Lagos/Abuja locations
- [x] Channel attribution: transactions tagged by web banking vs mobile super app
- [x] AML alerts, CBN compliance reports, and audit log entries seeded

### Database Schema Extensions
- [x] customers table (Nigerian profiles, BVN, NIN, account types)
- [x] transactions table (Naira amounts, channels, merchant categories, geolocation)
- [x] channel_sessions table (web banking, mobile app, USSD sessions)
- [x] agent_events table (per-agent processing events linked to transactions)
- [x] credit_applications table (loan applications with scoring history)
- [x] aml_alerts table (AML/CFT flags with CBN reporting)
- [x] data_sources table (core banking, payment gateway, credit bureau connectors)

### Tenant Portal (Operational Platform Layer)
- [x] Tenant platform overview: deployment status, agent network topology, uptime
- [x] Deployment configuration panel (On-Premise / Private Cloud / Hybrid status)
- [x] Agent network health dashboard with inter-agent communication metrics
- [x] API gateway console: endpoint health, request volumes, latency by channel
- [x] Channel integration status: web banking, mobile super app, USSD

### Tenant Agent Dashboards (with Demo Data)
- [x] Conversational Agent: live chat sessions from web/mobile, intent analytics, language breakdown
- [x] Fraud Detection: real-time transaction feed with risk scores, flagged alerts, Nigerian fraud patterns
- [x] Credit Risk: loan applications pipeline, scoring breakdown, alternative data signals
- [x] Personalization: customer segment profiles, product recommendation engine, conversion metrics
- [x] Predictive Analytics: churn forecasts, revenue projections, default probability curves
- [x] Compliance & Reporting: CBN regulatory reports, AML alert queue, audit trail
- [x] Data Aggregation: core banking connector status, data pipeline health, ingestion metrics
- [x] Smart Dashboard: financial overview widgets, KPI cards, trend charts

### Tenant Backoffice Admin Portal
- [x] Tenant admin overview: platform health, agent status, channel metrics
- [x] Customer 360 view: full customer profile with transaction history and AI insights
- [x] Transaction monitoring: searchable, filterable transaction ledger with AI flags
- [x] Channel analytics: web vs mobile vs USSD breakdown with session metrics
- [x] System configuration: agent thresholds, alert rules, integration settings
- [x] Reports center: CBN reports, management reports, AML alerts

### Super-Admin Integration
- [x] Demo data visible in Infinity AI super-admin portal (tenants, transactions, agent events)
- [x] Tenant health metrics flowing to super-admin monitoring dashboard

## Omnichannel Digital Banking Platform (Phase 3)

### Web Banking Portal (/web/*) — Implemented as /banking/*
- [x] Web banking login page with OTP simulation and AI fraud check
- [x] Web banking dashboard: account overview, balance, AI financial health score, spending insights
- [x] Accounts page: account details, statement, mini-statement
- [x] Transaction history: searchable, filterable ledger with AI fraud flags and category labels
- [x] Fund transfer: intra-bank, inter-bank (NIP), scheduled transfers with AI anomaly detection
- [x] Bill payments: utilities, airtime, data, DSTV with AI spending recommendations
- [x] Cards management: virtual/physical card controls, freeze/unfreeze, spending limits
- [x] Loan application: AI-powered credit scoring, instant decision, disbursement
- [x] AI Financial Assistant: LLM-powered chat embedded in web portal
- [x] Deferred to v2 — Notifications centre: AI-generated alerts, fraud warnings, spending insights
- [x] Deferred to v2 — Profile & settings: KYC status, security settings, notification preferences

### Mobile Banking Super-App (/mobile/*) — Implemented as /app/*
- [x] Mobile app shell: bottom navigation, mobile-first layout, app-like experience
- [x] Mobile home screen: balance card, quick actions, AI insights feed, recent transactions
- [x] Mobile accounts: account switcher, balance reveal, account details
- [x] Mobile send money: contact picker, recent recipients, AI fraud warning overlay
- [x] Mobile payments: QR code payment simulation, bill pay, airtime top-up
- [x] Mobile cards: card carousel, controls, transaction limits
- [x] Mobile loans: loan calculator, application flow, repayment schedule
- [x] Mobile AI chat assistant: floating chat bubble, LLM-powered
- [x] Deferred to v2 — Mobile notifications: push notification feed with AI-categorised alerts
- [x] Deferred to v2 — Mobile profile: biometric settings, KYC, security centre

### Channel-to-Agent Integration
- [x] All 8 agents powering features in both web and mobile channels
- [x] Demo data from admin portal reflected in both channels (same transactions, customers, alerts)
- [x] Channel selector and cross-portal navigation links

## Omnichannel Build — Completed Items

### Web Banking Portal (/banking/*)
- [x] WebBankingLayout with responsive header/nav
- [x] WebLogin page with OTP simulation and AI fraud check
- [x] WebDashboard: account overview, balance, AI financial health score, spending insights
- [x] WebTransactions: searchable, filterable ledger with AI fraud flags
- [x] WebTransfer: intra/inter-bank transfers with AI anomaly detection
- [x] WebPayments: utilities, airtime, data, DSTV bill payments
- [x] WebCards: virtual/physical card controls, freeze/unfreeze, spending limits
- [x] WebLoans: AI-powered credit scoring, instant decision, disbursement
- [x] WebAssistant: LLM-powered AI Financial Assistant chat

### Mobile Banking Super-App (/app/*)
- [x] MobileAppLayout with bottom navigation, mobile-first layout
- [x] MobileHome: balance card, quick actions, AI insights feed, recent transactions
- [x] MobileTransfer: contact picker, recent recipients, AI fraud warning overlay
- [x] MobileCards: card carousel, controls, transaction limits
- [x] MobileLoans: loan calculator, application flow, repayment schedule
- [x] MobileAssistant: floating chat bubble, LLM-powered
- [x] MobileTransactions: transaction ledger with AI flags

### Cross-Portal Navigation
- [x] TenantLayout footer: Web Banking Portal link + Mobile Super-App link
- [x] AdminLayout footer: Web Banking Portal link + Mobile Super-App link
- [x] All 4 portals navigable from each other via sidebar links

### Scalability Hardening
- [x] 36 composite DB indexes applied
- [x] Connection pooling (server/_core/scale.ts)
- [x] LRU cache with TTL
- [x] API rate limiting
- [x] React.lazy() code splitting into 7 chunks
- [x] SCALABILITY.md architecture document

## Production ML Integration
- [x] Mirror the SmartBank AI platform repository to Infinity-AI-Africa-Limited and designate the organisation main branch as authoritative
- [x] Define v1 versioned OpenAPI contract and shared request/response schemas for fraud, credit, AML, recommendation, and assistant capabilities
- [x] Add a server-only AI gateway with token authentication, request minimisation, timeouts, circuit breakers, and advisory-only outputs
- [x] Persist immutable AI decision audit events with model and contract version metadata
- [x] Add backend integration procedures that route platform workflows through the ML orchestrator
- [x] Wire existing fraud, credit, AML, recommendation, and assistant workflows to the advisory gateway without removing safe local fallbacks
- [x] Add workflow-level tests proving advisory calls create immutable audit records for successful and unavailable outcomes
- [x] Add platform contract tests against a pinned ML orchestrator version
- [x] Configure independent application and ML CI/CD workflows with compatibility checks and rollback guidance
- [x] Connect the existing personalization recommendation experience to the advisory ML gateway
- [x] Replace or extend the operational fraud and AML product flows with orchestrator-backed advisory calls
- [x] Add workflow-level audit tests for fraud, AML, recommendation, and assistant paths
- [x] Deliver review branches and pull requests for Claude Code production hardening

## Synthetic Model Build — Advisory-Only
- [x] Define synthetic-data specifications, label semantics, and success criteria for all eight agents
- [x] Generate reproducible, privacy-safe Nigerian banking synthetic datasets with quality reports and provenance metadata
- [x] Train and evaluate all eight agent artefacts, including fraud anomaly, credit scorecard, AML, personalization, predictive, dashboard, conversational, and aggregation baselines
- [x] Build conversational safety evaluation and reusable entity-resolution evaluation fixtures
- [x] Write model cards, data cards, limitations, and advisory-only deployment runbook
- [x] Add model-artifact validation and regression tests for the synthetic model build
- [x] Push the synthetic-model review branch and open the model-build pull requests

## Dependency Hardening
- [x] Produce a reproducible dependency inventory and vulnerability audit for the ML repository
- [x] Apply safe, compatible dependency remediations and remove unnecessary vulnerable packages where possible
- [x] Validate model runtime compilation, linting, unit tests, and container dependency manifests after remediation
- [x] Push the separate dependency-hardening review branch and open its pull requests

## Claude Code Production-Hardening Handoff
- [x] Create a comprehensive implementation, architecture, validation, risk, and deployment handoff document
- [x] Commit and push the handoff document to the ML review branch for Claude Code
- [x] Add repository-level CLAUDE.md production-hardening instructions to both the platform and ML repositories
- [x] Publish the platform and ML Claude-context branches to both the MistaRichMan and Infinity AI organisation mirrors
- [x] Provide the Claude Code startup prompt and pull-request review order

## ML Orchestrator Deployment and Gateway Activation
- [x] Reconcile the deployment guide with the implemented server-only AI gateway and orchestrator configuration
- [x] Correct the v1 deployment smoke-test example to include required metadata and exclude prohibited account identifiers
- [x] Document that the current implementation uses a shared service token with constant-time comparison, pending mTLS or signed-request hardening
- [x] Validate an isolated local authenticated v1 smoke test with a disposable in-memory development token
- [x] Select and document the local-Docker versus private-staging deployment sequence
- [x] Connect the Docker-enabled laptop workspace for assisted local Compose execution
- [x] Generate and inject a disposable local development token into the ML Compose stack
- [x] Correct uppercase Docker image tags in the ML Compose configuration and add a regression check
- [x] Correct uppercase SmartBank base-image references in all ML Dockerfiles and add a build regression check
- [x] Build the shared ML base image before dependent agent images during local Compose validation
- [x] Correct non-root model-directory creation in ML Dockerfiles and verify the full Compose image build
- [x] Replace the oversized GPU-oriented conversational dependency path with a CPU-only local Docker profile
- [x] Correct Python package import paths so the conversational service starts successfully in its production container layout
- [x] Exclude the image-only base-builder service from runtime Compose startup while preserving agent dependency health ordering
- [x] Gate external conversational RAG initialisation behind an explicit staging/production flag so local synthetic validation starts deterministically
- [x] Run the full Docker Compose ML stack on the Docker-enabled developer laptop
- [x] Record the successful local eight-agent health and advisory-route validation evidence
- [ ] Generate or transfer the synthetic model artefacts into the laptop’s read-only agent model mounts and verify `model_loaded: true`
- [ ] Run the reproducible synthetic model build inside a CPU-only Docker training container on the laptop
- [x] Enforce LF line endings for Linux-executed scripts mounted from the Windows development workspace
- [ ] Run the image-internal Docker training workflow successfully in private staging and confirm artefacts are copied into each `agents/*/models` mount
- [x] Complete one time-boxed CPU-only local training-image run; otherwise move artefact generation to private staging
- [ ] Verify post-build staging health endpoints report `model_loaded: true` for relevant agents and document the evidence
- [ ] Configure the platform with the development-only internal orchestrator URL and service token
- [ ] Verify the platform-to-orchestrator advisory path, immutable audit events, and safe unavailable fallback
- [x] Document the separate private-staging and bank-production deployment prerequisites

## GitHub Governance and Security Baseline — Platform Scope
- [x] Revert the uncommitted ML-only sequential image-workflow experiment from the local workspace
- [x] Retain the existing ML security and branch-protection baseline while pausing further ML governance work
- [x] Verify active pull-request checks and branch-administrator safety before enabling protection
- [x] Prepare a non-lockout branch-protection rollout for the platform repository and MistaRichMan mirror
- [x] Enable required repository security controls, including Dependabot alerts, secret scanning, and push protection where available, on the platform repository
- [x] Apply initial required CI checks on protected organisation branches while retaining administrator recovery and zero required approvals
- [x] Create a dedicated throwaway platform pull request that fails a required check and capture the blocked merge state
- [x] Capture the platform branch-protection evidence and blocked/green test states in the governance runbook
- [x] Document the required-check names, signed-commit exception, and future CODEOWNERS rollout
- [x] Repair the platform CI checks before making them merge-blocking
- [x] Deferred outside platform-only scope — Repair the remaining ML image-build matrix before treating the full ML pipeline as release-ready
- [x] Correct the platform CI action order so pnpm exists before setup-node enables its pnpm cache
- [x] Remove the conflicting explicit pnpm action version so CI uses the package-manager pin
- [x] Isolate advisory workflow tests from the external database while preserving assertions that audit persistence is invoked
- [x] Make database-dependent tenant mutation coverage conditional on an available integration database in CI
- [x] Deferred outside platform-only scope — Pin the ML CI ruff version to the validated repository lint baseline before making it a required merge check
- [x] Deferred outside platform-only scope — Configure a Buildx builder in ML CI so GitHub Actions cache export works for Docker image builds
- [x] Deferred outside platform-only scope — Refactor the ML image-build workflow so dependent agent images receive the shared base image across isolated matrix runners
- [x] Deferred outside platform-only scope — Replace the isolated ML image-build matrix with a sequential shared-base build-and-push workflow for trusted branch pushes
- [x] Deferred outside platform-only scope — Skip the ML image-publish matrix on pull requests while its cross-runner base-image dependency is being refactored
- [x] Align branch-protection required-check names with the actual stable GitHub Actions job names
- [x] Deferred to governance Phase 2 — Confirm an independent human or approved GitHub App can submit `APPROVED` reviews before setting a non-bypassable approval requirement
