import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const manifestPath = resolve(repoRoot, "contracts/ml-orchestrator.compatibility.json");
const platformContractPath = resolve(repoRoot, "contracts/ml-orchestrator.v1.openapi.yaml");
const mlContractPath = process.env.ML_CONTRACT_PATH
  ? resolve(repoRoot, process.env.ML_CONTRACT_PATH)
  : resolve(repoRoot, "../smartbankAI-ml/contracts/ml-orchestrator.v1.openapi.yaml");

for (const path of [manifestPath, platformContractPath, mlContractPath]) {
  if (!existsSync(path)) throw new Error(`Required ML compatibility file is missing: ${path}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

// Compare and hash the newline-normalised content. These repositories are edited
// in CRLF on Windows and checked out as LF in CI, so a raw byte comparison would
// fail on one platform or the other for no real reason.
const CR = String.fromCharCode(13);
const normalise = (text) => text.split(CR).join("").trim();

const platformContract = normalise(readFileSync(platformContractPath, "utf8"));
const mlContract = normalise(readFileSync(mlContractPath, "utf8"));

if (!platformContract.includes(`version: ${manifest.contractVersion}`)) {
  throw new Error(`Platform OpenAPI contract does not declare pinned version ${manifest.contractVersion}`);
}
if (!mlContract.includes(`version: ${manifest.contractVersion}`)) {
  throw new Error(`ML OpenAPI contract does not declare pinned version ${manifest.contractVersion}`);
}
if (platformContract !== mlContract) {
  throw new Error("Platform and ML OpenAPI contracts differ. Update both in reviewed, compatible pull requests.");
}

// Pointing ML_CONTRACT_PATH at the platform's own file makes the comparison
// above compare a file with itself, which is what CI was doing. The pinned hash
// is the check that actually holds across repositories, including private ones.
const actualSha = createHash("sha256").update(platformContract).digest("hex");
if (!manifest.contractSha256) {
  throw new Error("Compatibility manifest is missing contractSha256; the cross-repository lock is not enforced.");
}
if (actualSha !== manifest.contractSha256) {
  throw new Error(
    `Contract hash mismatch. Expected ${manifest.contractSha256}, got ${actualSha}. ` +
      "Update contracts in both repositories and re-pin contractSha256 in a reviewed pull request.",
  );
}

if (resolve(mlContractPath) === resolve(platformContractPath)) {
  console.warn(
    "note: ML_CONTRACT_PATH resolves to the platform contract; only the pinned hash was verified cross-repository.",
  );
}

console.log(`ML contract compatibility passed: ${manifest.contractVersion} @ ${manifest.pinnedMlCommit}`);
