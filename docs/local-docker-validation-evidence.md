# SmartBank AI ML Orchestrator — Local Docker Validation Evidence

**Validation date:** 17 August 2026  
**Target:** Developer laptop running Docker Desktop 29.7.2  
**Scope:** Synthetic-data, advisory-only local validation. This is not bank UAT or production evidence.

## Result

The full SmartBank ML service topology was built and started on the developer laptop. The orchestrator reported all eight downstream agents as healthy and accepted an authenticated `POST /v1/route` request using the v1 data-minimisation contract.

| Check | Result |
|---|---|
| Shared ML base image | Built locally before agent images |
| Agent services | Fraud Detection, Credit Risk, AML Compliance, Personalization, Predictive Analytics, Conversational AI, Smart Dashboard, and Data Aggregation healthy |
| Orchestrator health | `status: ok`; all eight agent circuit breakers `CLOSED` |
| Contract | `2026-08-01` |
| Authenticated advisory route | Passed with a disposable, local-only service token |
| Advisory response | `status: advisory`, `human_review_required: true` |
| Observed route latency | 706.91 ms |

## Applied Local Docker Corrections

The validation exposed and corrected the following deployment defects on the ML Compose fix branch:

1. Docker image and base-image references are lowercase.
2. The shared base image is built before dependent agent images.
3. Agent model directories are created as root and owned by the non-root runtime user.
4. The conversational image installs the CPU-only PyTorch wheel for laptop deployment.
5. The conversational service uses its deployed package import path.
6. The runtime validation starts the orchestrator dependency graph rather than the image-only base-builder service.
7. Remote RAG initialisation is opt-in through `SMARTBANK_ENABLE_REMOTE_RAG`; local validation uses the deterministic synthetic retrieval fallback.

## Important Limitations

The local service health responses reported `model_loaded: false`. Trained synthetic model artefacts are intentionally excluded from source control and were not yet generated or transferred into the laptop's read-only `agents/*/models` mounts. The successful result therefore proves container startup, authenticated orchestration, contract enforcement, and the advisory-only envelope; it is **not yet evidence of trained model inference on the laptop**.

The service token was disposable and local-only. It must not be reused for staging or production. The platform gateway secrets remain intentionally unset because a laptop-local endpoint is not reachable from the hosted SmartBank platform backend.

A focused CPU-only training-container attempt was run on the laptop after resolving Docker image naming, image build ordering, non-root model-directory permissions, conversational CPU dependency, package import, and Windows line-ending issues. It was deliberately stopped at the agreed time limit after no persisted artefacts were produced. This is a development-environment performance and bind-mount constraint; it does not invalidate the completed container, health, authentication, or advisory-contract checks.

## Required Next Steps

1. Deploy the same Compose/Kubernetes topology to a private staging network with a distinct secret-manager-injected token, durable CPU resources, and internal DNS name; run the reproducible synthetic model build there.
2. Verify every relevant staging health endpoint reports `model_loaded: true` before treating model inference as validated.
3. Set `SMARTBANK_ML_ORCHESTRATOR_URL` and `SMARTBANK_ML_SERVICE_TOKEN` only in the platform's server environment for that reachable private staging endpoint.
4. Verify a platform-originated advisory call persists an immutable `ai_decision_audits` record.
5. Before bank UAT or production, replace shared-token authentication with mTLS or bank-approved workload identity, use approved data, and complete independent model validation.
