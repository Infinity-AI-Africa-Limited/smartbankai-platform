# SmartBank AI ML Orchestrator Deployment Guide

## Purpose and deployment boundary

The ML orchestrator is the internal service that receives a versioned request from the SmartBank AI platform backend, routes it to the appropriate specialist agent, and returns an **advisory** result. It must never be publicly called by a browser. In the final architecture, the platform backend is the only caller.

The current `smartbankAI-ml` repository is suitable for a **local development proof of connectivity**. Before any staging or bank deployment, merge the platform and ML hardening pull requests created in this work. Those changes will enforce inbound service authentication at the orchestrator boundary, restrict CORS, add the formal v1 API contract, and add platform-side audit logging. Do not expose the current orchestrator directly to the internet.

## 1. Generate the shared service token

On the machine or secure administrative workstation used to run the ML services, generate a 256-bit token:

```bash
openssl rand -hex 32
```

The result is a 64-character value. Store it in the organisation's approved secret manager. It has exactly two runtime destinations:

| Destination | Environment-variable name | Value |
|---|---|---|
| ML service deployment | `SERVICE_AUTH_TOKEN` | The generated 64-character value |
| SmartBank AI application backend | `SMARTBANK_ML_SERVICE_TOKEN` | The **same** generated 64-character value |

Do not put the token in source code, a GitHub Actions YAML file, a container image, or a committed `.env` file. Rotate it at least every 90 days and immediately after any suspected exposure. During development only, a separate, disposable token may be used.

> **Current implementation note:** `SMARTBANK_ML_SERVICE_TOKEN` / `SERVICE_AUTH_TOKEN` is presently a shared service token verified with a constant-time comparison. It is not an HMAC-signed request protocol. Before private staging or bank production, replace or supplement it with mTLS or bank-approved workload identity, short-lived credentials, rotation, and signed-request replay protection.

## 2. Start a local development deployment

Use this only for internal development and contract testing. It is not a bank production deployment.

```bash
git clone https://github.com/Infinity-AI-Africa-Limited/smartbankAI-ml.git
cd smartbankAI-ml
cp .env.example .env
```

Open `.env` in a local editor and set at least the following values. Keep the local token separate from every staging or production token.

```dotenv
ENVIRONMENT=development
SERVICE_AUTH_TOKEN=<paste-the-token-you-generated>
LOG_LEVEL=INFO

# Required only when exercising the Conversational AI agent:
ANTHROPIC_API_KEY=<your-provider-key>
```

Then build and start the stack:

```bash
docker compose -f infra/docker/docker-compose.yml up --build -d
docker compose -f infra/docker/docker-compose.yml ps
./scripts/health_check.sh
```

The orchestrator should report healthy on `http://localhost:8001/health`. Its local base URL is therefore:

```text
http://localhost:8001
```

For a local SmartBank AI backend running on the same host, this becomes the temporary value of `SMARTBANK_ML_ORCHESTRATOR_URL`. For containers on the same Docker network, use the internal service DNS name instead:

```text
http://orchestrator:8001
```

## 3. Verify the orchestrator without exposing it

After the authentication hardening PR is merged, run a request from the same private machine or network. Substitute the token from your secret manager; do not save it in shell history.

```bash
read -s SMARTBANK_ML_SERVICE_TOKEN
export SMARTBANK_ML_SERVICE_TOKEN

curl --fail-with-body \
  --request POST http://localhost:8001/v1/route \
  --header "Content-Type: application/json" \
  --header "X-Service-Token: ${SMARTBANK_ML_SERVICE_TOKEN}" \
  --header "X-Client-ID: smartbank-platform" \
  --data '{
    "contract_version": "2026-08-01",
    "request_type": "fraud_check",
    "tenant_id": "4",
    "correlation_id": "00000000-0000-4000-8000-000000000001",
    "requested_at": "2026-08-16T12:00:00Z",
    "payload": {
      "transaction_id": "TEST-001",
      "amount_ngn": 10000,
      "channel": "mobile",
      "hour_of_day": 10,
      "day_of_week": 1,
      "merchant_category": "groceries",
      "origin_region": "Lagos",
      "sender_30d_avg_amount": 8500,
      "sender_txn_count_1h": 1
    }
  }'
```

The expected response is an advisory recommendation containing a correlation ID, agent/model metadata, confidence, explanation data when available, and an explicit `human_review_required` indicator. It must not create a transfer, decline a loan, block an account, or submit a regulatory report.

## 4. Promote to private staging

For bank-grade staging, deploy the service to a **private Kubernetes cluster or a private network VM**, not a public endpoint. The internal base URL supplied to the platform depends on its network location:

| Platform and ML deployment relationship | `SMARTBANK_ML_ORCHESTRATOR_URL` |
|---|---|
| Same Kubernetes cluster and namespace | `http://orchestrator.smartbank-ml.svc.cluster.local:8001` |
| Same private network, different workloads | Private HTTPS DNS name, such as `https://ml-orchestrator.staging.bank.internal` |
| Local developer machine | `http://localhost:8001` |

Before staging, the infrastructure must supply a private ingress or service mesh policy, mTLS between workloads, persistent model storage, a managed secret store, structured log forwarding, metrics, backup/rollback procedures, and network allow-lists. The scaffold Kubernetes manifests in the repository are a starting point; they require the security and operational hardening described in the pending pull request before bank use.

## 5. Values to enter in the application secrets panel

After you have started a reachable local/private stack and passed its health check, enter only the following into the application environment settings. Do not use a sandbox-local `localhost` endpoint for a separately hosted platform service: the URL must be resolvable from the SmartBank backend runtime itself.

| Secret | Local-development value |
|---|---|
| `SMARTBANK_ML_ORCHESTRATOR_URL` | `http://localhost:8001` if both services run on the same host; otherwise use the private internal address described above |
| `SMARTBANK_ML_SERVICE_TOKEN` | The same output generated by `openssl rand -hex 32` and supplied to ML as `SERVICE_AUTH_TOKEN` |

For production, replace both values with production-specific secrets and an internal TLS endpoint. Never reuse the development token in a bank environment.

## Troubleshooting

If `docker compose` cannot build, confirm Docker Engine and the Compose plugin are installed using `docker --version` and `docker compose version`. If the health check fails, inspect `docker compose -f infra/docker/docker-compose.yml logs orchestrator` and the relevant agent service. Do not relax authentication, make the service public, or substitute production customer data to solve a local development error.
