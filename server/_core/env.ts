export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  mlOrchestratorUrl: process.env.SMARTBANK_ML_ORCHESTRATOR_URL ?? "",
  mlServiceToken: process.env.SMARTBANK_ML_SERVICE_TOKEN ?? "",
  // Keys the pseudonyms that replace account numbers on the way to the ML layer.
  // Must be its own managed secret before UAT: reusing the service token would
  // mean rotating one forces re-keying every historical pseudonym.
  mlPseudonymSecret: process.env.SMARTBANK_ML_PSEUDONYM_SECRET ?? "",
};
