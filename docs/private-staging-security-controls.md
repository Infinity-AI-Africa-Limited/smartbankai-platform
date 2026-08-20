# SmartBank AI Private Staging Security Controls

**Status:** Required before activating the platform ML gateway in any bank-facing staging environment. This document is a deployment control plan, not evidence that a staging environment exists or that production approval has been granted.

## Purpose and boundary

SmartBank AI private staging is the controlled environment for demonstrating the application platform, ML orchestrator, and eight specialist agent services to an approved design-partner bank. It must accept only synthetic or bank-authorised UAT data, be private by default, and preserve the advisory-only product posture. No response from the ML layer may autonomously move funds, block an account, approve or decline credit, submit a regulatory filing, or change KYC status.

The current platform gateway deliberately remains unconfigured until a reachable private endpoint exists. `SMARTBANK_ML_ORCHESTRATOR_URL` and `SMARTBANK_ML_SERVICE_TOKEN` must **not** be supplied to local demo, browser, or public environments.

## Deployment control baseline

| Control domain | Required staging control | Evidence required before gateway activation | Approval owner |
|---|---|---|---|
| Network boundary | Separate private network/namespace; no public service or load balancer for agent APIs; default-deny ingress and egress with only named allow paths. | Namespace, service, and network-policy manifests; approved traffic-flow diagram; negative external-connectivity test. | Bank security and platform engineering |
| Workload identity | Bank-approved workload identity or service-to-service mTLS. The platform identity may call only the orchestrator route; the orchestrator identity may call only named agent services. | Identity bindings, policy export, rotation interval, and a rejected-call test from an unauthorised workload. | Bank security / IAM |
| TLS and mTLS | TLS at every hop and mutual authentication between platform gateway, orchestrator, and agents. Certificates must be short lived and automatically renewed. | Certificate issuer and trust-chain record, mTLS policy, successful authenticated probe, and failed plaintext/untrusted-client probe. | Bank security / PKI |
| Secrets | A managed bank-approved secret store injects short-lived credentials at runtime. No secret is committed to Git, container images, logs, browser code, or static configuration. | Redacted deployment configuration, secret-reference paths, rotation test, and repository/image secret scan. | Bank security / platform engineering |
| Data minimisation | Gateway sends only the contract-required fields, hashed/minimised identifiers, and no BVN, NIN, raw account numbers, passwords, or transaction narratives unless separately approved. | Contract capture, redacted sample request, structured-log review, retention/deletion policy, and privacy approval. | DPO / bank security |
| Audit integrity | Every accepted, unavailable, or rejected advisory creates an append-only `ai_decision_audits` record with correlation ID, request type, contract/model metadata, minimised input digest, response, and `humanReviewRequired=true`. | Migration state, insert-only audit test, dashboard/query evidence, export retention controls, and a failed update/delete authorisation test. | Compliance / platform engineering |
| Human review | All channels visibly label results as advisory only. Decisions and overrides occur in a bank-owned review workflow and are recorded as new events rather than changes to the original ML audit. | Screen recording or test evidence for fraud, AML, recommendation, web assistant, and mobile assistant; reviewer/override audit samples. | Operations / MLRO |
| Supply chain | Images are pinned by digest/commit SHA, scanned, paired with SBOMs, and promoted manually after CI and environment approval. | CI run links, image scan, SBOM, image digest inventory, and signed promotion record. | Platform engineering / security |
| Resilience | Gateway timeout/circuit-breaker fallback, recovery playbook, model rollback, backup/restore, and kill-switch runbook. | Controlled unavailable-orchestrator test, recovery log, rollback drill, backup/restore result, and named on-call owners. | Platform engineering / bank operations |

## Required target inputs

The following information must come from the selected design-partner bank or its delegated staging operator before any secret request or deployment action is taken.

| Input | Accepted form | Why it is required |
|---|---|---|
| Deployment target | Private Kubernetes cluster, approved private-cloud account, or bank on-premises container platform | Determines the workload-identity, secret-store, ingress, and certificate implementation. |
| Network design | CIDRs, private DNS name, approved ingress path, egress allowlist, and firewall ownership | Ensures the gateway is not accidentally reachable from public or untrusted networks. |
| Identity and PKI approach | Bank mTLS/mesh standard, issuer, service-account rules, and rotation policy | Required for authenticated service-to-service calls without a long-lived shared token. |
| Secrets interface | Vault/KMS/external-secret mechanism and the names—not values—of staged secret references | Allows runtime injection without disclosing credentials in configuration or source control. |
| Data approval | Signed UAT and data-processing agreement (DPA), approved data classification, and minimisation schedule | A prerequisite for using any real or de-identified bank data. |
| Operational ownership | Security contact, MLRO/compliance owner, incident contact, and release approver | Needed for escalation, review gates, and evidence sign-off. |

## Activation sequence

1. **Provision the private target.** Apply the namespace, default-deny policies, private DNS/service discovery, registry access, and workload identities. Confirm no public route exists for individual agents or the orchestrator.
2. **Establish trust.** Configure the bank-approved certificate issuer and mTLS policy. Prove that only the platform gateway identity can reach the orchestrator and only the orchestrator identity can reach its named agents.
3. **Inject runtime secrets.** Create secret references in the approved secret manager. Bind them to service accounts and confirm that rendered pod/container environments expose no secret values to application logs or UI code.
4. **Build development-only artefacts inside staging.** Generate synthetic models in the controlled training workflow, mount artefacts read-only, and confirm each relevant health endpoint reports `model_loaded: true`. Do not promote synthetic artefacts to bank production.
5. **Activate the gateway only in the private target.** Configure `SMARTBANK_ML_ORCHESTRATOR_URL` to the private DNS endpoint and inject the short-lived credential through the managed secret mechanism. Do not set these values in public hosting, local developer files, or the browser.
6. **Run the evidence pack.** Exercise successful, unavailable, rejected, unauthorised, and mTLS-failure paths. Verify correlation IDs through the immutable audit record and verify visible human-review notices in all user-facing channels.
7. **Obtain documented sign-off.** Security, engineering, compliance/MLRO, and the bank UAT owner must accept the evidence before a controlled UAT starts. A controlled UAT is not a production launch.

## Model-validation gate

> Synthetic data demonstrates software pipeline behaviour; it cannot establish real bank performance, threshold calibration, fairness, or regulatory suitability.

No production claim or promotion is permitted until a design-partner bank has signed the UAT and DPA, made approved data available, and completed independent validation. The required validation package includes representative sampling, performance and calibration by tenant/channel/segment, false-positive and false-negative analysis, bias/fairness review, explainability review, security/privacy assessment, model-risk approval, and MLRO sign-off for regulated workflows.

## Evidence register template

| Evidence item | Result | Location | Reviewer | Date | Status |
|---|---|---|---|---|---|
| Private network and default-deny verification | Pending | To be supplied by target operator | Bank security | — | Blocked on target |
| mTLS and unauthorised-client negative test | Pending | To be supplied by target operator | Bank PKI / security | — | Blocked on target |
| Workload identity and secret rotation test | Pending | To be supplied by target operator | Bank IAM | — | Blocked on target |
| Model artefact build and `model_loaded: true` health evidence | Pending | Staging validation record | Platform engineering | — | Blocked on target |
| Platform-to-orchestrator audit-path test | Pending | Staging validation record | Platform engineering / compliance | — | Blocked on target |
| Human-review UI and override evidence | Pending | UAT evidence pack | Operations / MLRO | — | Blocked on UAT/DPA |
| Independent model validation and MLRO sign-off | Pending | Bank model-risk pack | Model risk / MLRO | — | Blocked on UAT/DPA |
