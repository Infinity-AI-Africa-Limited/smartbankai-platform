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
CREATE TABLE `aml_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
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
	`applicantName` varchar(255),
	`applicantId` varchar(100),
	`requestedAmount` decimal(15,2),
	`creditScore` int,
	`recommendation` enum('approve','decline','review'),
	`alternativeDataScore` int,
	`status` enum('pending','approved','declined','under_review') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credit_applications_id` PRIMARY KEY(`id`)
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`transactionRef` varchar(100) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'NGN',
	`channel` varchar(50),
	`senderAccount` varchar(100),
	`receiverAccount` varchar(100),
	`riskScore` decimal(5,2) DEFAULT '0.00',
	`fraudStatus` enum('clean','flagged','confirmed_fraud','under_review') DEFAULT 'clean',
	`flagReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionRef_unique` UNIQUE(`transactionRef`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('platform_owner','tenant_admin','analyst','user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `tenantId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;