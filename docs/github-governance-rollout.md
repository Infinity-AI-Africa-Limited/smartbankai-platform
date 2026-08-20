# SmartBank AI GitHub Governance Rollout

**Status:** Drafted from the live repository assessment on 20 August 2026. This rollout applies exclusively to the authoritative SmartBank AI platform repository and its MistaRichMan mirror. The ML repository is outside the scope of this governance task.

## Scope

| Product component | Authoritative repository | Mirror | Default branch |
|---|---|---|
| SmartBank AI platform | `Infinity-AI-Africa-Limited/smartbankai-platform` | `MistaRichMan/smartbankai` | `main` |

## Assessment Findings

Neither organisation `main` branch is currently protected. Repository security features visible through the GitHub API are disabled, including Dependabot security updates, secret scanning, and push protection.

The proposed required checks cannot be enabled yet because the existing runs are not ready to become merge gates. The platform's observed workflow check is named **`Type-check, test, and verify ML compatibility`**, rather than the proposed `Type-check, test, and build`, and it is failing. The ML repository currently emits **`Lint & Unit Tests`** and **`Build Docker Images`**; the lint/unit job is failing and the image build is skipped on the observed PRs. A dynamic deploy job must never be required because it would block normal pull requests.

Greptile has produced `COMMENTED` reviews and successful review checks, but no observed `APPROVED` review. Therefore it must not be relied on as the sole required approver without a dedicated test confirming that it can submit an approval that GitHub accepts for a protected branch.

## Controls Applied — 20 August 2026

The following repository controls have been enabled on the authoritative platform repository:

| Control | Status |
|---|---|
| Dependabot security updates | Enabled |
| GitHub code security | Enabled |
| Secret scanning | Enabled |
| Secret-scanning push protection | Enabled |
| Secret-scanning validity checks | Enabled |
| Secret-scanning non-provider patterns | Enabled |
| Pull-request-only protection | Enabled with zero required approvals initially |
| Conversation resolution | Enabled |
| Linear history | Enabled |
| Force pushes and branch deletion | Disabled |
| Administrator bypass | Retained temporarily for recovery |

Required checks are now enabled with the following stable, passing contexts:

| Repository | Required check |
|---|---|
| SmartBank AI platform | `Type-check, test, and verify ML compatibility`; `Build platform` |

An earlier ML repository configuration is outside this task's scope and will not be changed further without explicit user direction. A one-approval rule remains intentionally disabled because the observed reviewer integration has commented but has not issued a valid `APPROVED` review. This staged platform configuration prevents an administrator lockout while retaining meaningful merge and history safeguards.

### Scope Decision — 20 August 2026

The project owner approved retaining the ML repository's existing security and branch-protection baseline. It is a separate, paused workstream: no further ML governance, CI, model, or deployment changes will be made as part of this platform-only task. The platform governance pull request provides the initial protected-branch test: its two required checks are green while the pull request remains blocked pending the rule's remaining merge conditions. Administrator recovery remains enabled until an independent reviewer can submit a valid GitHub `APPROVED` review.

### Protected-Branch Enforcement Evidence — 20 August 2026

A dedicated throwaway platform pull request, [#6](https://github.com/Infinity-AI-Africa-Limited/smartbankai-platform/pull/6), intentionally failed the `Build platform` command. GitHub reported `Build platform: failure`, `Type-check, test, and verify ML compatibility: success`, and `mergeable_state: blocked`. This confirms that the required-check rule blocks merge when one required platform check fails. The pull request was closed and its test branch deleted immediately after evidence capture.

## Safe Rollout Sequence

### Phase 1 — Security visibility and CI repair

Enable Dependabot security updates, secret scanning, and push protection where the organisation plan makes them available. Record any GitHub Advanced Security licensing limitation rather than silently treating an unavailable setting as enabled.

Repair the platform and ML CI failures, then rerun the active pull requests. Stabilise the exact job names before adding them as required checks. The expected steady-state names should be documented in the workflow files and this runbook.

### Phase 2 — Non-lockout branch protection

Apply an initial `main` rule that requires pull requests, passing status checks, resolved conversations, linear history, and blocks force pushes and deletions. Keep **required approvals at zero** and **administrator bypass available** during the first validation cycle. This preserves a route to recover from an incorrectly configured check or reviewer integration.

Open a throwaway pull request. Verify that each required check appears, executes, and genuinely blocks merge when failed. Also verify whether the intended reviewing account or GitHub App can submit a valid `APPROVED` review.

### Phase 3 — Approval and bypass hardening

Only after the throwaway test passes and there is a confirmed independent approver should the rule require one approval, dismiss stale approvals, require approval of the most recent push, and disallow administrator bypass. Enable Code Owners review only after a maintained `CODEOWNERS` file identifies accountable platform, security, and ML owners.

Leave signed commits disabled initially. Revisit it after every authorised human, automation account, and CI path can sign commits consistently.

## Initial Rule Configuration

| Control | Initial setting | Promotion condition |
|---|---:|---|
| Pull request required | Enabled | Immediate |
| Required approvals | `0` | Independent valid approver is tested |
| Dismiss stale approvals | Disabled | Enable with required approvals |
| Required status checks | Enabled after CI repair | Exact stable checks are passing |
| Branch up to date | Enabled with status checks | Immediate after checks are stable |
| Conversation resolution | Enabled | Immediate |
| Linear history | Enabled | Immediate |
| Force pushes/deletions | Disabled | Immediate |
| Administrator bypass | Allowed initially | Disable only after recovery path test |
| Signed commits | Disabled initially | All approved push paths can sign |

## Required Evidence Before Production Governance Promotion

1. A green platform CI run with its final, documented check name.
2. A passing platform governance PR with the two documented required checks.
3. A successful throwaway protected-branch test proving failed checks block merge.
4. A successful independent approval test, not merely a Greptile comment or check.
5. A `CODEOWNERS` file and named accountable owners before Code Owners enforcement.

## References

[1] GitHub Docs — Managing a branch protection rule: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule

[2] GitHub Docs — About secret scanning and push protection: https://docs.github.com/code-security/secret-scanning/introduction/about-secret-scanning

[3] GitHub Docs — Configuring Dependabot security updates: https://docs.github.com/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates
