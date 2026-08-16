-- Additive migration intentionally kept separate from legacy schema history.
-- No existing table, column, or data is altered or dropped.
CREATE TABLE IF NOT EXISTS `ai_decision_audits` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `decisionId` VARCHAR(64) NOT NULL,
  `correlationId` VARCHAR(64) NOT NULL,
  `tenantId` INT NOT NULL,
  `requestedByUserId` INT,
  `requestType` VARCHAR(64) NOT NULL,
  `contractVersion` VARCHAR(32) NOT NULL,
  `agentName` VARCHAR(100),
  `modelName` VARCHAR(100),
  `modelVersion` VARCHAR(100),
  `decisionStatus` ENUM('advisory', 'unavailable', 'rejected') NOT NULL,
  `recommendation` TEXT,
  `confidence` FLOAT,
  `humanReviewRequired` BOOLEAN NOT NULL DEFAULT TRUE,
  `inputDigest` VARCHAR(128) NOT NULL,
  `minimisedInput` JSON NOT NULL,
  `responseData` JSON NOT NULL,
  `latencyMs` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `ai_decision_audits_id_pk` PRIMARY KEY (`id`),
  CONSTRAINT `ai_decision_audits_decision_id_unique` UNIQUE (`decisionId`),
  KEY `ai_decision_audits_tenant_created_idx` (`tenantId`, `createdAt`),
  KEY `ai_decision_audits_correlation_idx` (`correlationId`),
  KEY `ai_decision_audits_request_type_created_idx` (`requestType`, `createdAt`)
);
