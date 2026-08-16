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
const platformContract = readFileSync(platformContractPath, "utf8").trim();
const mlContract = readFileSync(mlContractPath, "utf8").trim();

if (!platformContract.includes(`version: ${manifest.contractVersion}`)) {
  throw new Error(`Platform OpenAPI contract does not declare pinned version ${manifest.contractVersion}`);
}
if (!mlContract.includes(`version: ${manifest.contractVersion}`)) {
  throw new Error(`ML OpenAPI contract does not declare pinned version ${manifest.contractVersion}`);
}
if (platformContract !== mlContract) {
  throw new Error("Platform and ML OpenAPI contracts differ. Update both in reviewed, compatible pull requests.");
}

console.log(`ML contract compatibility passed: ${manifest.contractVersion} @ ${manifest.pinnedMlCommit}`);
