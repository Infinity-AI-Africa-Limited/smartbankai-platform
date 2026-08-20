# ML Orchestrator Execution Status

## Completed

The SmartBank application already contains the server-only gateway in `server/mlGateway.ts`. It reads `SMARTBANK_ML_ORCHESTRATOR_URL` and `SMARTBANK_ML_SERVICE_TOKEN`, validates the v1 contract, applies a six-second timeout and circuit breaker, returns an explicit unavailable advisory on failure, and requires human review in every response.

An isolated local smoke test was executed from the hardened ML orchestrator contract branch (`manus/ml-contract-v1`). The test generated a disposable in-memory development token, started the orchestrator only on `127.0.0.1:8001`, confirmed `/health`, and called authenticated `POST /v1/route` using the data-minimised `2026-08-01` contract. The response was `status: unavailable` with `human_review_required: true`, which is the expected safe fallback because the specialist agent containers were not running.

## Why the application secrets remain unset

The application secret update shown in the rejected environment panel should remain unset until the orchestrator is reachable from the SmartBank backend runtime. The sandbox does not contain Docker, so the guide's full Compose stack could not be started here. More importantly, a temporary sandbox `http://localhost:8001` endpoint would not be reachable from a separately hosted SmartBank application and must never be configured as its persistent service URL.

| Application secret | Set it only when | Development example | Private staging / production example |
|---|---|---|---|
| `SMARTBANK_ML_ORCHESTRATOR_URL` | The endpoint resolves from the application backend and is private | `http://localhost:8001` only when both processes share the same developer machine | `https://ml-orchestrator.staging.bank.internal` or an approved private Kubernetes service address |
| `SMARTBANK_ML_SERVICE_TOKEN` | The same token is loaded into the ML workload as `SERVICE_AUTH_TOKEN` through a managed secret store | A disposable `openssl rand -hex 32` value | A distinct rotated secret, never the development token |

## Required next deployment action

Deploy the ML service stack to one of the following private targets, then provide the internal base URL and confirm that `SERVICE_AUTH_TOKEN` has been injected into the ML workload through the target's secret manager:

1. A developer machine with Docker Engine and Docker Compose, for local contract testing only.
2. A private staging Kubernetes cluster or VM accessible from the SmartBank backend, with private networking, managed secrets, and TLS/mTLS.

After that endpoint exists, configure the two application secrets, restart the application service, call the gateway health/advisory procedure, and verify creation of an immutable AI decision audit record.

## Important hardening note

The current service accepts a shared service token using a constant-time comparison. It is not a signed HMAC request protocol despite earlier wording in the deployment material. Before private staging or bank production, Claude Code should replace or supplement this with mTLS or bank-approved workload identity, short-lived credentials, rotation, replay protection, and tenant-scoped service policy.
