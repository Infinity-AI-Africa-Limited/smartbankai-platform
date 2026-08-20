CREATE TABLE `agent_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`agentName` varchar(100) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` varchar(100),
	`inputData` json,
	`outputData` json,
	`processingTimeMs` int DEFAULT 0,
	`status` enum('success','failed','timeout') DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentName` varchar(100) NOT NULL,
	`tenantId` int,
	`status` enum('healthy','degraded','down') NOT NULL DEFAULT 'healthy',
	`uptimePercent` decimal(5,2) DEFAULT '99.99',
	`latencyP99Ms` int DEFAULT 0,
	`requestsPerMin` int DEFAULT 0,
	`errorRate` decimal(5,4) DEFAULT '0.0000',
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_decision_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` varchar(64) NOT NULL,
	`correlationId` varchar(64) NOT NULL,
	`tenantId` int NOT NULL,
	`requestedByUserId` int,
	`requestType` varchar(64) NOT NULL,
	`contractVersion` varchar(32) NOT NULL,
	`agentName` varchar(100),
	`modelName` varchar(100),
	`modelVersion` varchar(100),
	`decisionStatus` enum('advisory','unavailable','rejected') NOT NULL,
	`recommendation` text,
	`confidence` float,
	`humanReviewRequired` boolean NOT NULL DEFAULT true,
	`inputDigest` varchar(128) NOT NULL,
	`minimisedInput` json NOT NULL,
	`responseData` json NOT NULL,
	`latencyMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_decision_audits_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_decision_audits_decisionId_unique` UNIQUE(`decisionId`)
);
--> statement-breakpoint
CREATE TABLE `aml_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`customerId` int,
	`transactionRef` varchar(100),
	`alertType` varchar(100),
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`description` text,
	`status` enum('open','investigating','resolved','escalated') DEFAULT 'open',
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `aml_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`tenantId` int,
	`action` varchar(255) NOT NULL,
	`resource` varchar(100),
	`resourceId` varchar(100),
	`details` json,
	`ipAddress` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billing_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`period` varchar(20) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`status` enum('pending','paid','overdue','cancelled') DEFAULT 'pending',
	`invoiceUrl` text,
	`dueDate` timestamp,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billing_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `channel_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`customerId` int,
	`sessionId` varchar(100) NOT NULL,
	`channel` enum('web_banking','mobile_app','ussd','branch') DEFAULT 'mobile_app',
	`deviceType` varchar(100),
	`osVersion` varchar(100),
	`appVersion` varchar(50),
	`ipAddress` varchar(50),
	`location` varchar(200),
	`duration` int DEFAULT 0,
	`pagesViewed` int DEFAULT 0,
	`transactionCount` int DEFAULT 0,
	`status` enum('active','completed','expired','terminated') DEFAULT 'completed',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	CONSTRAINT `channel_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `channel_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tenantId` int,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`reportType` varchar(100) NOT NULL,
	`reportPeriod` varchar(50),
	`status` enum('draft','generated','submitted') DEFAULT 'draft',
	`generatedBy` int,
	`fileUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`customerId` int,
	`applicationRef` varchar(50) NOT NULL,
	`applicantName` varchar(255),
	`applicantId` varchar(100),
	`loanType` enum('personal','sme','mortgage','auto','salary_advance','micro') DEFAULT 'personal',
	`requestedAmount` decimal(15,2),
	`approvedAmount` decimal(15,2),
	`tenure` int,
	`interestRate` decimal(5,2),
	`creditScore` int,
	`altDataScore` int,
	`dtiRatio` decimal(5,2),
	`recommendation` enum('approve','decline','review'),
	`status` enum('pending','approved','declined','under_review','disbursed') DEFAULT 'pending',
	`declineReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `credit_applications_applicationRef_unique` UNIQUE(`applicationRef`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`customerId` varchar(50) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`bvn` varchar(11),
	`nin` varchar(11),
	`accountNumber` varchar(20) NOT NULL,
	`accountType` enum('savings','current','domiciliary','fixed_deposit') DEFAULT 'savings',
	`segment` enum('mass_market','sme','salary_earner','high_net_worth','student','diaspora') DEFAULT 'mass_market',
	`kycLevel` enum('tier1','tier2','tier3') DEFAULT 'tier1',
	`state` varchar(100),
	`city` varchar(100),
	`gender` enum('male','female'),
	`dateOfBirth` varchar(20),
	`occupation` varchar(200),
	`monthlyIncome` decimal(15,2),
	`accountBalance` decimal(15,2) DEFAULT '0.00',
	`creditScore` int DEFAULT 0,
	`riskRating` enum('low','medium','high') DEFAULT 'low',
	`isActive` boolean DEFAULT true,
	`preferredChannel` enum('web','mobile','ussd','branch') DEFAULT 'mobile',
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_customerId_unique` UNIQUE(`customerId`)
);
--> statement-breakpoint
CREATE TABLE `data_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`type` enum('core_banking','payment_gateway','credit_bureau','kyc_provider','mobile_money','data_warehouse') NOT NULL,
	`provider` varchar(100),
	`status` enum('connected','disconnected','error','syncing') DEFAULT 'connected',
	`lastSyncAt` timestamp,
	`recordsIngested` bigint DEFAULT 0,
	`syncFrequency` varchar(50) DEFAULT 'real-time',
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`agentName` varchar(100) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`config` json,
	`lastUpdatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenant_agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`industry` varchar(100),
	`country` varchar(100) DEFAULT 'Nigeria',
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`status` enum('active','inactive','suspended','trial') NOT NULL DEFAULT 'trial',
	`subscriptionTier` enum('starter','growth','enterprise') NOT NULL DEFAULT 'starter',
	`subscriptionStartDate` timestamp,
	`subscriptionEndDate` timestamp,
	`monthlyActiveUsers` int DEFAULT 0,
	`totalTransactions` bigint DEFAULT 0,
	`deploymentModel` enum('on_premise','private_cloud','hybrid') DEFAULT 'private_cloud',
	`deploymentRegion` varchar(100) DEFAULT 'Lagos, Nigeria',
	`apiBaseUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`customerId` int,
	`transactionRef` varchar(100) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'NGN',
	`type` enum('transfer','payment','withdrawal','deposit','airtime','data','bill_payment','pos','atm','ussd') DEFAULT 'transfer',
	`channel` enum('web_banking','mobile_app','ussd','pos','atm','branch','api') DEFAULT 'mobile_app',
	`senderAccount` varchar(100),
	`receiverAccount` varchar(100),
	`receiverName` varchar(255),
	`receiverBank` varchar(100),
	`narration` text,
	`merchantCategory` varchar(100),
	`location` varchar(200),
	`status` enum('success','failed','pending','reversed') DEFAULT 'success',
	`riskScore` decimal(5,2) DEFAULT '0.00',
	`fraudStatus` enum('clean','flagged','confirmed_fraud','under_review') DEFAULT 'clean',
	`flagReason` text,
	`agentProcessed` boolean DEFAULT false,
	`processingTimeMs` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionRef_unique` UNIQUE(`transactionRef`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('platform_owner','tenant_admin','analyst','user','admin') NOT NULL DEFAULT 'user',
	`tenantId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `ai_decision_audits_tenant_created_idx` ON `ai_decision_audits` (`tenantId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_decision_audits_correlation_idx` ON `ai_decision_audits` (`correlationId`);--> statement-breakpoint
CREATE INDEX `ai_decision_audits_request_type_created_idx` ON `ai_decision_audits` (`requestType`,`createdAt`);