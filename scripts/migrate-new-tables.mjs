import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = await mysql.createConnection(process.env.DATABASE_URL);

const statements = [
  // Add new columns to tenants
  `ALTER TABLE tenants 
   ADD COLUMN IF NOT EXISTS deploymentModel ENUM('on_premise','private_cloud','hybrid') DEFAULT 'private_cloud',
   ADD COLUMN IF NOT EXISTS deploymentRegion VARCHAR(100) DEFAULT 'Lagos, Nigeria',
   ADD COLUMN IF NOT EXISTS apiBaseUrl VARCHAR(500)`,

  // Customers table
  `CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    customerId VARCHAR(50) NOT NULL UNIQUE,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(320),
    phone VARCHAR(20),
    bvn VARCHAR(11),
    nin VARCHAR(11),
    accountNumber VARCHAR(20) NOT NULL,
    accountType ENUM('savings','current','domiciliary','fixed_deposit') DEFAULT 'savings',
    segment ENUM('mass_market','sme','salary_earner','high_net_worth','student','diaspora') DEFAULT 'mass_market',
    kycLevel ENUM('tier1','tier2','tier3') DEFAULT 'tier1',
    state VARCHAR(100),
    city VARCHAR(100),
    gender ENUM('male','female'),
    dateOfBirth VARCHAR(20),
    occupation VARCHAR(200),
    monthlyIncome DECIMAL(15,2),
    accountBalance DECIMAL(15,2) DEFAULT 0.00,
    creditScore INT DEFAULT 0,
    riskRating ENUM('low','medium','high') DEFAULT 'low',
    isActive BOOLEAN DEFAULT TRUE,
    preferredChannel ENUM('web','mobile','ussd','branch') DEFAULT 'mobile',
    lastLoginAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
  )`,

  // Extend transactions table with new columns
  `ALTER TABLE transactions 
   ADD COLUMN IF NOT EXISTS customerId INT,
   ADD COLUMN IF NOT EXISTS type ENUM('transfer','payment','withdrawal','deposit','airtime','data','bill_payment','pos','atm','ussd') DEFAULT 'transfer',
   ADD COLUMN IF NOT EXISTS receiverName VARCHAR(255),
   ADD COLUMN IF NOT EXISTS receiverBank VARCHAR(100),
   ADD COLUMN IF NOT EXISTS narration TEXT,
   ADD COLUMN IF NOT EXISTS merchantCategory VARCHAR(100),
   ADD COLUMN IF NOT EXISTS location VARCHAR(200),
   ADD COLUMN IF NOT EXISTS status ENUM('success','failed','pending','reversed') DEFAULT 'success',
   ADD COLUMN IF NOT EXISTS agentProcessed BOOLEAN DEFAULT FALSE,
   ADD COLUMN IF NOT EXISTS processingTimeMs INT DEFAULT 0`,

  // Modify channel column to enum if not already
  `ALTER TABLE transactions MODIFY COLUMN channel ENUM('web_banking','mobile_app','ussd','pos','atm','branch','api') DEFAULT 'mobile_app'`,

  // Channel sessions
  `CREATE TABLE IF NOT EXISTS channel_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    customerId INT,
    sessionId VARCHAR(100) NOT NULL UNIQUE,
    channel ENUM('web_banking','mobile_app','ussd','branch') DEFAULT 'mobile_app',
    deviceType VARCHAR(100),
    osVersion VARCHAR(100),
    appVersion VARCHAR(50),
    ipAddress VARCHAR(50),
    location VARCHAR(200),
    duration INT DEFAULT 0,
    pagesViewed INT DEFAULT 0,
    transactionCount INT DEFAULT 0,
    status ENUM('active','completed','expired','terminated') DEFAULT 'completed',
    startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    endedAt TIMESTAMP NULL
  )`,

  // Agent events
  `CREATE TABLE IF NOT EXISTS agent_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    agentName VARCHAR(100) NOT NULL,
    eventType VARCHAR(100) NOT NULL,
    entityType VARCHAR(50),
    entityId VARCHAR(100),
    inputData JSON,
    outputData JSON,
    processingTimeMs INT DEFAULT 0,
    status ENUM('success','failed','timeout') DEFAULT 'success',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,

  // Extend credit_applications
  `ALTER TABLE credit_applications 
   ADD COLUMN IF NOT EXISTS customerId INT,
   ADD COLUMN IF NOT EXISTS applicationRef VARCHAR(50),
   ADD COLUMN IF NOT EXISTS loanType ENUM('personal','sme','mortgage','auto','salary_advance','micro') DEFAULT 'personal',
   ADD COLUMN IF NOT EXISTS approvedAmount DECIMAL(15,2),
   ADD COLUMN IF NOT EXISTS tenure INT,
   ADD COLUMN IF NOT EXISTS interestRate DECIMAL(5,2),
   ADD COLUMN IF NOT EXISTS altDataScore INT,
   ADD COLUMN IF NOT EXISTS dtiRatio DECIMAL(5,2),
   ADD COLUMN IF NOT EXISTS declineReason TEXT,
   ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,

  // Data sources
  `CREATE TABLE IF NOT EXISTS data_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    type ENUM('core_banking','payment_gateway','credit_bureau','kyc_provider','mobile_money','data_warehouse') NOT NULL,
    provider VARCHAR(100),
    status ENUM('connected','disconnected','error','syncing') DEFAULT 'connected',
    lastSyncAt TIMESTAMP NULL,
    recordsIngested BIGINT DEFAULT 0,
    syncFrequency VARCHAR(50) DEFAULT 'real-time',
    config JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
  )`,

  // Add customerId to aml_alerts
  `ALTER TABLE aml_alerts ADD COLUMN IF NOT EXISTS customerId INT`,
];

for (const sql of statements) {
  try {
    await db.execute(sql);
    console.log("✓ Executed:", sql.substring(0, 60) + "...");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME" || e.message?.includes("Duplicate column")) {
      console.log("⚠ Column already exists, skipping:", sql.substring(0, 60));
    } else {
      console.error("✗ Error:", e.message, "\nSQL:", sql.substring(0, 100));
    }
  }
}

await db.end();
console.log("\n✅ Migration complete!");
