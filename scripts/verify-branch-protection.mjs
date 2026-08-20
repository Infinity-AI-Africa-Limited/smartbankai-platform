/**
 * Verify that branch protection is in place and still matches the workflow.
 *
 *   node scripts/verify-branch-protection.mjs [owner/repo] [branch]
 *
 * Requires an authenticated GitHub CLI with admin read on the repository.
 *
 * Two failure modes matter, and the second is the quiet one:
 *
 *   - protection was never applied, or was removed;
 *   - a CI job was renamed, so a required status check names a job that no
 *     longer exists. GitHub then waits forever for a result that will never
 *     arrive, or - if the check was simply dropped - merges without it.
 *
 * The expected checks are derived from the workflow rather than hardcoded, so
 * this cannot drift away from reality.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

const WORKFLOW = resolve(process.cwd(), ".github/workflows/ci.yml");

/**
 * Job display names that will actually report a status on a pull request. A job
 * whose condition excludes pull_request, or which is gated on workflow_dispatch,
 * never reports and must never be a required check.
 */
function jobsThatRunOnPullRequests(workflow) {
  const names = new Set();
  for (const [jobId, job] of Object.entries(workflow.jobs)) {
    const condition = String(job.if ?? "");
    if (condition.includes("pull_request") && condition.includes("!=")) continue;
    if (condition.includes("workflow_dispatch")) continue;
    names.add(job.name ?? jobId);
  }
  return names;
}

function ghApi(path) {
  try {
    const out = execFileSync("gh", ["api", "-H", "Accept: application/vnd.github+json", path], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(out);
  } catch (error) {
    const stderr = String(error.stderr ?? "");
    if (error.code === "ENOENT") {
      console.error("FAIL: the GitHub CLI is not installed. Install it, then run: gh auth login");
    } else if (stderr.includes("Not Found")) {
      console.error("FAIL: no branch protection is configured (or no admin access)");
    } else {
      console.error(`FAIL: gh api call failed: ${stderr.trim() || error.message}`);
    }
    process.exit(1);
  }
}

const repo = process.argv[2] ?? "Infinity-AI-Africa-Limited/smartbankai-platform";
const branch = process.argv[3] ?? "main";

const workflow = parse(readFileSync(WORKFLOW, "utf8"));
const expected = jobsThatRunOnPullRequests(workflow);
const protection = ghApi(`repos/${repo}/branches/${branch}/protection`);

const failures = [];
const required = new Set(protection.required_status_checks?.contexts ?? []);

if (required.size === 0) failures.push("no required status checks are configured");

const unknown = [...required].filter((name) => !expected.has(name));
if (unknown.length) {
  failures.push(`required checks name jobs that do not report on a pull request: ${unknown.sort().join(", ")}`);
}

const missing = [...expected].filter((name) => !required.has(name));
if (missing.length) {
  failures.push(`jobs run on pull requests but are not required: ${missing.sort().join(", ")}`);
}

if (!protection.enforce_admins?.enabled) failures.push("administrators are exempt from protection");

const reviews = protection.required_pull_request_reviews;
if (!reviews) failures.push("pull request review is not required");
else if ((reviews.required_approving_review_count ?? 0) < 1) failures.push("no approving review is required");

if (protection.allow_force_pushes?.enabled) failures.push("force pushes are permitted");
if (protection.allow_deletions?.enabled) failures.push("branch deletion is permitted");

console.log(`Branch protection for ${repo}@${branch}`);
console.log(`  required checks: ${[...required].sort().join(", ") || "none"}`);
console.log(`  jobs reporting on pull requests: ${[...expected].sort().join(", ")}`);

if (failures.length) {
  console.log("\nFAIL");
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exit(1);
}

console.log("\nOK: protection is present and matches the workflow");
