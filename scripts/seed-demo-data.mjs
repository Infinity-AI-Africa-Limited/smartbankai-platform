import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = await mysql.createConnection(process.env.DATABASE_URL);

// ─── Nigerian Names & Data ─────────────────────────────────────────────────────
const firstNames = {
  male: ["Chukwuemeka","Oluwaseun","Babatunde","Emeka","Tunde","Seun","Chidi","Kelechi","Ifeanyi","Obinna","Adewale","Abiodun","Kayode","Olumide","Femi","Tobi","Gbenga","Rotimi","Segun","Lanre","Musa","Ibrahim","Aliyu","Suleiman","Abdullahi","Usman","Yusuf","Aminu","Garba","Bello","Chukwudi","Nnamdi","Chibuike","Uchenna","Ikechukwu","Jide","Kunle","Wale","Dele","Niyi","Biodun","Yemi","Dayo","Sola","Bola","Ade","Tayo","Leke","Dotun","Remi"],
  female: ["Ngozi","Chioma","Amaka","Adaeze","Nneka","Ifeoma","Chinyere","Obiageli","Adaora","Nkechi","Folake","Yetunde","Bimpe","Toyin","Funke","Sade","Kemi","Titi","Lola","Bisi","Fatima","Aisha","Hauwa","Zainab","Maryam","Halima","Bilkisu","Ramatu","Falmata","Hadiza","Ebele","Uloma","Nwanneka","Chinwe","Uche","Ola","Remi","Dupe","Bunmi","Shade","Yinka","Joke","Nike","Ayo","Ife","Temi","Dami","Bola","Simi","Tope"]
};
const lastNames = ["Okonkwo","Adeyemi","Balogun","Okafor","Nwosu","Eze","Obi","Chukwu","Nwachukwu","Okoye","Adebayo","Afolabi","Adesanya","Adeleke","Adegoke","Ogundimu","Ogundele","Ogunleye","Fashola","Tinubu","Dangote","Otedola","Danjuma","Abubakar","Umar","Shehu","Lawan","Gusau","Yari","Matawalle","Aliyu","Bello","Musa","Ibrahim","Suleiman","Abdullahi","Garba","Aminu","Yakubu","Tanko","Onyekachi","Obiora","Okafor","Nzekwe","Igwe","Onuoha","Anyanwu","Agu","Nwofor","Obi"];
const states = ["Lagos","Abuja","Rivers","Kano","Oyo","Delta","Anambra","Kaduna","Enugu","Imo","Ogun","Kwara","Edo","Akwa Ibom","Cross River","Benue","Plateau","Niger","Kogi","Osun"];
const cities = { "Lagos": ["Victoria Island","Lekki","Ikeja","Surulere","Yaba","Ikoyi","Ajah","Festac","Apapa","Ojodu"], "Abuja": ["Maitama","Asokoro","Garki","Wuse","Gwarinpa","Kubwa","Kuje","Bwari","Gwagwalada","Abaji"], "Rivers": ["Port Harcourt","Obio-Akpor","Eleme","Okrika","Bonny","Degema","Ahoada","Omuma","Ogba","Etche"], "Kano": ["Kano Municipal","Fagge","Dala","Gwale","Tarauni","Nassarawa","Ungogo","Kumbotso","Dawakin Tofa","Warawa"] };
const occupations = ["Software Engineer","Bank Manager","Medical Doctor","Civil Servant","Teacher","Trader","Entrepreneur","Lawyer","Accountant","Nurse","Police Officer","Army Officer","Lecturer","Pharmacist","Engineer","Architect","Journalist","Pastor","Imam","Farmer","Driver","Security Officer","Caterer","Fashion Designer","Hair Stylist","Mechanic","Plumber","Electrician","Carpenter","Tailor"];
const banks = ["First Bank Nigeria","Zenith Bank","GTBank","Access Bank","UBA","Fidelity Bank","Stanbic IBTC","Sterling Bank","Wema Bank","Polaris Bank","FCMB","Union Bank","Jaiz Bank","SunTrust Bank","Providus Bank"];
const merchantCategories = ["Supermarket","Restaurant","Fuel Station","Pharmacy","Clothing Store","Electronics","Hotel","Transport","Utilities","Telecom","Healthcare","Education","Entertainment","Real Estate","Agriculture"];
const narrations = ["Transfer to family","School fees payment","Rent payment","Business transaction","Salary advance","Investment","Bill payment","Online purchase","Food delivery","Airtime recharge","Data subscription","DSTV subscription","NEPA bill","Water bill","Insurance premium"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dp = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
function randDate(daysBack) { return new Date(Date.now() - Math.random() * daysBack * 86400000); }
function padNum(n, len) { return String(n).padStart(len, "0"); }

// ─── Step 1: Seed Tenants ─────────────────────────────────────────────────────
console.log("Seeding tenants...");
const tenantData = [
  { name: "First Bank Nigeria", slug: "first-bank-ng", industry: "Commercial Banking", country: "Nigeria", contactEmail: "admin@firstbank.ng", contactPhone: "+234-1-905-2000", status: "active", subscriptionTier: "enterprise", monthlyActiveUsers: 245000, totalTransactions: 1850000, deploymentModel: "private_cloud", deploymentRegion: "Lagos, Nigeria" },
  { name: "Zenith Bank Plc", slug: "zenith-bank", industry: "Commercial Banking", country: "Nigeria", contactEmail: "admin@zenithbank.com", contactPhone: "+234-1-278-7000", status: "active", subscriptionTier: "enterprise", monthlyActiveUsers: 198000, totalTransactions: 1420000, deploymentModel: "hybrid", deploymentRegion: "Lagos, Nigeria" },
  { name: "Kuda Microfinance Bank", slug: "kuda-mfb", industry: "Microfinance Banking", country: "Nigeria", contactEmail: "admin@kuda.com", contactPhone: "+234-700-000-5832", status: "active", subscriptionTier: "growth", monthlyActiveUsers: 87000, totalTransactions: 650000, deploymentModel: "private_cloud", deploymentRegion: "Abuja, Nigeria" },
  { name: "Lapo Microfinance Bank", slug: "lapo-mfb", industry: "Microfinance Banking", country: "Nigeria", contactEmail: "admin@lapo-mfb.com", contactPhone: "+234-52-254-000", status: "trial", subscriptionTier: "starter", monthlyActiveUsers: 32000, totalTransactions: 180000, deploymentModel: "on_premise", deploymentRegion: "Benin City, Nigeria" },
  { name: "OPay Digital Services", slug: "opay-ng", industry: "Fintech / Mobile Money", country: "Nigeria", contactEmail: "admin@opay.com", contactPhone: "+234-700-888-0000", status: "active", subscriptionTier: "growth", monthlyActiveUsers: 156000, totalTransactions: 980000, deploymentModel: "private_cloud", deploymentRegion: "Lagos, Nigeria" },
];

let primaryTenantId = 1;
for (const t of tenantData) {
  try {
    const [res] = await db.execute(
      `INSERT IGNORE INTO tenants (name, slug, industry, country, contactEmail, contactPhone, status, subscriptionTier, monthlyActiveUsers, totalTransactions, deploymentModel, deploymentRegion, subscriptionStartDate, subscriptionEndDate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [t.name, t.slug, t.industry, t.country, t.contactEmail, t.contactPhone, t.status, t.subscriptionTier, t.monthlyActiveUsers, t.totalTransactions, t.deploymentModel, t.deploymentRegion, new Date("2024-01-01"), new Date("2025-12-31")]
    );
    if (res.insertId) { primaryTenantId = res.insertId; }
    console.log(`  ✓ Tenant: ${t.name}`);
  } catch(e) { console.log(`  ⚠ Tenant ${t.name}: ${e.message}`); }
}

// Get the first tenant's ID
const [[firstTenant]] = await db.execute("SELECT id FROM tenants WHERE slug = 'first-bank-ng' LIMIT 1");
const tenantId = firstTenant?.id || 1;
console.log(`  → Primary tenant ID: ${tenantId}`);

// ─── Step 2: Seed Tenant Agents ───────────────────────────────────────────────
console.log("\nSeeding tenant agents...");
const agentNames = ["Conversational","Fraud Detection","Credit Risk","Personalization","Predictive Analytics","Compliance & Reporting","Data Aggregation","Smart Dashboard"];
const [[tenantCount]] = await db.execute("SELECT COUNT(*) as c FROM tenant_agents WHERE tenantId = ?", [tenantId]);
if (tenantCount.c === 0) {
  for (const agentName of agentNames) {
    await db.execute(
      `INSERT INTO tenant_agents (tenantId, agentName, isEnabled, config) VALUES (?,?,?,?)`,
      [tenantId, agentName, true, JSON.stringify({ threshold: 0.75, model: "v2.1", region: "africa-west" })]
    );
  }
  console.log("  ✓ 8 agents enabled for First Bank Nigeria");
}

// ─── Step 3: Seed Customers ───────────────────────────────────────────────────
console.log("\nSeeding 500 customers...");
const [[custCount]] = await db.execute("SELECT COUNT(*) as c FROM customers WHERE tenantId = ?", [tenantId]);
const customerIds = [];

if (custCount.c < 100) {
  const segments = ["mass_market","mass_market","mass_market","salary_earner","salary_earner","sme","high_net_worth","student","diaspora"];
  const kycLevels = ["tier1","tier1","tier2","tier2","tier3"];
  
  for (let i = 1; i <= 500; i++) {
    const gender = Math.random() > 0.45 ? "male" : "female";
    const firstName = rand(firstNames[gender]);
    const lastName = rand(lastNames);
    const state = rand(states);
    const cityList = cities[state] || ["City Center"];
    const city = rand(cityList);
    const segment = rand(segments);
    const kycLevel = rand(kycLevels);
    const creditScore = segment === "high_net_worth" ? randInt(680, 850) : segment === "sme" ? randInt(580, 780) : segment === "salary_earner" ? randInt(550, 750) : randInt(300, 650);
    const monthlyIncome = segment === "high_net_worth" ? randFloat(500000, 5000000) : segment === "sme" ? randFloat(200000, 2000000) : segment === "salary_earner" ? randFloat(80000, 500000) : segment === "student" ? randFloat(20000, 80000) : randFloat(30000, 200000);
    const accountBalance = randFloat(monthlyIncome * 0.1, monthlyIncome * 3);
    const riskRating = creditScore >= 700 ? "low" : creditScore >= 550 ? "medium" : "high";
    
    try {
      const [res] = await db.execute(
        `INSERT INTO customers (tenantId, customerId, firstName, lastName, email, phone, bvn, nin, accountNumber, accountType, segment, kycLevel, state, city, gender, dateOfBirth, occupation, monthlyIncome, accountBalance, creditScore, riskRating, isActive, preferredChannel, lastLoginAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          tenantId,
          `FBN${padNum(i, 7)}`,
          firstName, lastName,
          `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
          `+2348${padNum(randInt(10000000, 99999999), 8)}`,
          padNum(randInt(10000000000, 99999999999), 11),
          padNum(randInt(10000000000, 99999999999), 11),
          `${randInt(1000000000, 9999999999)}`,
          rand(["savings","savings","current","domiciliary"]),
          segment, kycLevel, state, city, gender,
          `${randInt(1960,2000)}-${padNum(randInt(1,12),2)}-${padNum(randInt(1,28),2)}`,
          rand(occupations),
          monthlyIncome, accountBalance, creditScore, riskRating, true,
          rand(["mobile","mobile","mobile","web","ussd"]),
          randDate(7)
        ]
      );
      customerIds.push(res.insertId);
    } catch(e) { /* skip duplicates */ }
    if (i % 100 === 0) console.log(`  ✓ ${i}/500 customers seeded`);
  }
} else {
  const [rows] = await db.execute("SELECT id FROM customers WHERE tenantId = ? LIMIT 500", [tenantId]);
  customerIds.push(...rows.map(r => r.id));
  console.log(`  ✓ Using ${customerIds.length} existing customers`);
}

// ─── Step 4: Seed Transactions ────────────────────────────────────────────────
console.log("\nSeeding 2000 transactions...");
const [[txCount]] = await db.execute("SELECT COUNT(*) as c FROM transactions WHERE tenantId = ?", [tenantId]);

if (txCount.c < 500) {
  const txTypes = ["transfer","transfer","transfer","payment","withdrawal","deposit","airtime","data","bill_payment","pos","atm"];
  const channels = ["mobile_app","mobile_app","mobile_app","web_banking","web_banking","ussd","pos","atm"];
  const fraudStatuses = ["clean","clean","clean","clean","clean","clean","clean","clean","flagged","under_review"];
  
  for (let i = 1; i <= 2000; i++) {
    const customerId = rand(customerIds);
    const channel = rand(channels);
    const type = rand(txTypes);
    const amount = type === "withdrawal" ? randFloat(5000, 500000) : type === "deposit" ? randFloat(10000, 2000000) : type === "transfer" ? randFloat(1000, 5000000) : type === "payment" || type === "pos" ? randFloat(500, 150000) : randFloat(200, 50000);
    const fraudStatus = rand(fraudStatuses);
    const riskScore = fraudStatus === "flagged" ? randFloat(75, 95) : fraudStatus === "under_review" ? randFloat(60, 80) : randFloat(0, 30);
    const state = rand(states);
    const cityList = cities[state] || ["City Center"];
    
    try {
      await db.execute(
        `INSERT INTO transactions (tenantId, customerId, transactionRef, amount, currency, type, channel, senderAccount, receiverAccount, receiverName, receiverBank, narration, merchantCategory, location, status, riskScore, fraudStatus, flagReason, agentProcessed, processingTimeMs, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          tenantId, customerId,
          `TXN${Date.now()}${padNum(i,5)}`,
          amount, "NGN", type, channel,
          `${randInt(1000000000, 9999999999)}`,
          `${randInt(1000000000, 9999999999)}`,
          `${rand(firstNames.male)} ${rand(lastNames)}`,
          rand(banks),
          rand(narrations),
          rand(merchantCategories),
          `${rand(cityList)}, ${state}`,
          rand(["success","success","success","success","failed","pending"]),
          riskScore,
          fraudStatus,
          fraudStatus !== "clean" ? rand(["Unusual transaction pattern","Multiple rapid transfers","High-risk merchant","Velocity breach","Geographic anomaly"]) : null,
          true,
          randInt(50, 2500),
          randDate(90)
        ]
      );
    } catch(e) { /* skip */ }
    if (i % 500 === 0) console.log(`  ✓ ${i}/2000 transactions seeded`);
  }
}

// ─── Step 5: Seed Channel Sessions ───────────────────────────────────────────
console.log("\nSeeding channel sessions...");
const [[sessCount]] = await db.execute("SELECT COUNT(*) as c FROM channel_sessions WHERE tenantId = ?", [tenantId]);
if (sessCount.c < 200) {
  for (let i = 1; i <= 800; i++) {
    const customerId = rand(customerIds);
    const channel = rand(["mobile_app","mobile_app","mobile_app","web_banking","web_banking","ussd"]);
    const startedAt = randDate(30);
    const duration = randInt(60, 1800);
    const state = rand(states);
    const cityList = cities[state] || ["City Center"];
    
    try {
      await db.execute(
        `INSERT INTO channel_sessions (tenantId, customerId, sessionId, channel, deviceType, osVersion, appVersion, ipAddress, location, duration, pagesViewed, transactionCount, status, startedAt, endedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          tenantId, customerId,
          `SES${Date.now()}${padNum(i,5)}`,
          channel,
          channel === "mobile_app" ? rand(["iPhone 14","Samsung Galaxy S23","Tecno Camon 20","Infinix Note 30","iPhone 13"]) : rand(["Desktop Chrome","Desktop Firefox","Desktop Edge","Laptop Chrome"]),
          channel === "mobile_app" ? rand(["iOS 17.2","Android 13","Android 12","iOS 16.5"]) : rand(["Windows 11","macOS Ventura","Ubuntu 22.04"]),
          channel === "mobile_app" ? rand(["3.2.1","3.1.5","3.0.8","2.9.4"]) : "N/A",
          `${randInt(41,197)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(1,254)}`,
          `${rand(cityList)}, ${state}`,
          duration,
          randInt(2, 15),
          randInt(0, 5),
          "completed",
          startedAt,
          new Date(startedAt.getTime() + duration * 1000)
        ]
      );
    } catch(e) { /* skip */ }
  }
  console.log("  ✓ 800 channel sessions seeded");
}

// ─── Step 6: Seed Credit Applications ────────────────────────────────────────
console.log("\nSeeding credit applications...");
const [[creditCount]] = await db.execute("SELECT COUNT(*) as c FROM credit_applications WHERE tenantId = ?", [tenantId]);
if (creditCount.c < 50) {
  const loanTypes = ["personal","personal","sme","salary_advance","micro","mortgage","auto"];
  for (let i = 1; i <= 120; i++) {
    const customerId = rand(customerIds);
    const loanType = rand(loanTypes);
    const requestedAmount = loanType === "mortgage" ? randFloat(5000000, 50000000) : loanType === "sme" ? randFloat(500000, 10000000) : loanType === "auto" ? randFloat(1000000, 8000000) : loanType === "personal" ? randFloat(50000, 2000000) : randFloat(10000, 200000);
    const creditScore = randInt(350, 820);
    const altDataScore = randInt(40, 95);
    const dtiRatio = randFloat(0.15, 0.65);
    const recommendation = creditScore >= 650 && dtiRatio < 0.4 ? "approve" : creditScore < 500 || dtiRatio > 0.55 ? "decline" : "review";
    const status = recommendation === "approve" ? rand(["approved","approved","disbursed"]) : recommendation === "decline" ? "declined" : rand(["pending","under_review"]);
    
    try {
      await db.execute(
        `INSERT INTO credit_applications (tenantId, customerId, applicationRef, applicantName, applicantId, loanType, requestedAmount, approvedAmount, tenure, interestRate, creditScore, altDataScore, dtiRatio, recommendation, status, declineReason, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          tenantId, customerId,
          `LOAN${padNum(i,6)}`,
          `${rand(firstNames.male)} ${rand(lastNames)}`,
          `FBN${padNum(randInt(1,500),7)}`,
          loanType,
          requestedAmount,
          recommendation === "approve" ? requestedAmount * randFloat(0.7, 1.0) : null,
          loanType === "mortgage" ? randInt(120, 240) : loanType === "sme" ? randInt(12, 60) : randInt(3, 24),
          loanType === "mortgage" ? randFloat(14, 18) : loanType === "micro" ? randFloat(24, 36) : randFloat(18, 28),
          creditScore, altDataScore, dtiRatio, recommendation, status,
          recommendation === "decline" ? rand(["Insufficient credit history","High debt-to-income ratio","Irregular income pattern","Previous loan default","Incomplete documentation"]) : null,
          randDate(60)
        ]
      );
    } catch(e) { /* skip */ }
  }
  console.log("  ✓ 120 credit applications seeded");
}

// ─── Step 7: Seed AML Alerts ──────────────────────────────────────────────────
console.log("\nSeeding AML alerts...");
const [[amlCount]] = await db.execute("SELECT COUNT(*) as c FROM aml_alerts WHERE tenantId = ?", [tenantId]);
if (amlCount.c < 20) {
  const alertTypes = ["Structuring","Unusual Cash Activity","Rapid Fund Movement","High-Risk Jurisdiction Transfer","PEP Transaction","Suspicious Wire Transfer","Multiple Account Funding","Layering Pattern","Shell Company Activity","Smurfing"];
  const severities = ["low","medium","medium","high","high","critical"];
  for (let i = 1; i <= 45; i++) {
    const customerId = rand(customerIds);
    const offset = randInt(0, 50);
    const [txRows] = await db.query(`SELECT transactionRef FROM transactions WHERE tenantId = ${tenantId} AND fraudStatus != 'clean' LIMIT 1 OFFSET ${offset}`);
    const txRef = txRows[0]?.transactionRef || `TXN${padNum(i,10)}`;
    const severity = rand(severities);
    
    try {
      await db.execute(
        `INSERT INTO aml_alerts (tenantId, customerId, transactionRef, alertType, severity, description, status, createdAt) VALUES (?,?,?,?,?,?,?,?)`,
        [
          tenantId, customerId, txRef,
          rand(alertTypes), severity,
          `Automated detection: ${rand(alertTypes)} pattern identified. Transaction amount exceeds threshold for customer segment. Manual review required per CBN AML/CFT guidelines.`,
          rand(["open","open","investigating","resolved","escalated"]),
          randDate(30)
        ]
      );
    } catch(e) { /* skip */ }
  }
  console.log("  ✓ 45 AML alerts seeded");
}

// ─── Step 8: Seed Compliance Reports ─────────────────────────────────────────
console.log("\nSeeding compliance reports...");
const [[crCount]] = await db.execute("SELECT COUNT(*) as c FROM compliance_reports WHERE tenantId = ?", [tenantId]);
if (crCount.c < 5) {
  const reportTypes = ["CBN Monthly Return","STR Report","CTR Report","Annual AML/CFT Report","NFIU Intelligence Report","FATF Compliance Assessment","KYC Audit Report","PEP Screening Report"];
  const periods = ["2024-Q4","2025-Q1","2025-Q2","2025-Q3","2025-Q4","2025-01","2025-02","2025-03","2025-04","2025-05"];
  for (const rt of reportTypes) {
    for (let p = 0; p < 3; p++) {
      try {
        await db.execute(
          `INSERT INTO compliance_reports (tenantId, reportType, reportPeriod, status, createdAt) VALUES (?,?,?,?,?)`,
          [tenantId, rt, rand(periods), rand(["draft","generated","generated","submitted"]), randDate(90)]
        );
      } catch(e) { /* skip */ }
    }
  }
  console.log("  ✓ Compliance reports seeded");
}

// ─── Step 9: Seed Data Sources ────────────────────────────────────────────────
console.log("\nSeeding data sources...");
const [[dsCount]] = await db.execute("SELECT COUNT(*) as c FROM data_sources WHERE tenantId = ?", [tenantId]);
if (dsCount.c < 3) {
  const sources = [
    { name: "Finacle Core Banking System", type: "core_banking", provider: "Infosys Finacle", status: "connected", recordsIngested: 1850000, syncFrequency: "real-time" },
    { name: "Interswitch Payment Gateway", type: "payment_gateway", provider: "Interswitch", status: "connected", recordsIngested: 980000, syncFrequency: "real-time" },
    { name: "CRC Credit Bureau", type: "credit_bureau", provider: "CRC Credit Bureau", status: "connected", recordsIngested: 245000, syncFrequency: "daily" },
    { name: "NIBSS BVN Service", type: "kyc_provider", provider: "NIBSS", status: "connected", recordsIngested: 245000, syncFrequency: "on-demand" },
    { name: "MTN MoMo Integration", type: "mobile_money", provider: "MTN Nigeria", status: "connected", recordsIngested: 156000, syncFrequency: "hourly" },
    { name: "Airtel Money Integration", type: "mobile_money", provider: "Airtel Nigeria", status: "connected", recordsIngested: 87000, syncFrequency: "hourly" },
    { name: "First Bank Data Warehouse", type: "data_warehouse", provider: "Internal", status: "connected", recordsIngested: 5200000, syncFrequency: "nightly" },
    { name: "CRIF Credit Bureau", type: "credit_bureau", provider: "CRIF", status: "syncing", recordsIngested: 198000, syncFrequency: "daily" },
  ];
  for (const s of sources) {
    try {
      await db.execute(
        `INSERT INTO data_sources (tenantId, name, type, provider, status, lastSyncAt, recordsIngested, syncFrequency) VALUES (?,?,?,?,?,?,?,?)`,
        [tenantId, s.name, s.type, s.provider, s.status, randDate(1), s.recordsIngested, s.syncFrequency]
      );
    } catch(e) { /* skip */ }
  }
  console.log("  ✓ 8 data sources seeded");
}

// ─── Step 10: Seed Agent Events ───────────────────────────────────────────────
console.log("\nSeeding agent events...");
const [[aeCount]] = await db.execute("SELECT COUNT(*) as c FROM agent_events WHERE tenantId = ?", [tenantId]);
if (aeCount.c < 200) {
  const agentEventTypes = {
    "Fraud Detection": ["transaction_scored","alert_generated","model_retrained","threshold_updated"],
    "Credit Risk": ["application_scored","model_inference","alternative_data_fetched","decision_rendered"],
    "Conversational": ["intent_classified","response_generated","session_started","handover_triggered"],
    "Personalization": ["segment_updated","recommendation_generated","offer_served","click_tracked"],
    "Predictive Analytics": ["forecast_generated","churn_score_updated","default_probability_computed","report_generated"],
    "Compliance & Reporting": ["str_generated","ctr_filed","aml_alert_raised","report_submitted"],
    "Data Aggregation": ["data_ingested","pipeline_completed","schema_validated","error_handled"],
    "Smart Dashboard": ["widget_refreshed","kpi_computed","insight_generated","alert_dispatched"],
  };
  
  for (const [agentName, eventTypes] of Object.entries(agentEventTypes)) {
    for (let i = 0; i < 50; i++) {
      try {
        await db.execute(
          `INSERT INTO agent_events (tenantId, agentName, eventType, entityType, entityId, processingTimeMs, status, createdAt) VALUES (?,?,?,?,?,?,?,?)`,
          [
            tenantId, agentName,
            rand(eventTypes),
            rand(["transaction","customer","application","session"]),
            `${randInt(1,500)}`,
            randInt(20, 3000),
            rand(["success","success","success","success","failed","timeout"]),
            randDate(7)
          ]
        );
      } catch(e) { /* skip */ }
    }
  }
  console.log("  ✓ Agent events seeded");
}

// ─── Step 11: Seed Agent Metrics ──────────────────────────────────────────────
console.log("\nSeeding agent metrics...");
const [[amCount]] = await db.execute("SELECT COUNT(*) as c FROM agent_metrics WHERE tenantId = ?", [tenantId]);
if (amCount.c < 8) {
  const agentMetricData = [
    { agentName: "Conversational", status: "healthy", uptimePercent: "99.97", latencyP99Ms: 420, requestsPerMin: 1240, errorRate: "0.0012" },
    { agentName: "Fraud Detection", status: "healthy", uptimePercent: "99.99", latencyP99Ms: 185, requestsPerMin: 3850, errorRate: "0.0003" },
    { agentName: "Credit Risk", status: "healthy", uptimePercent: "99.95", latencyP99Ms: 2100, requestsPerMin: 145, errorRate: "0.0021" },
    { agentName: "Personalization", status: "healthy", uptimePercent: "99.93", latencyP99Ms: 95, requestsPerMin: 2100, errorRate: "0.0008" },
    { agentName: "Predictive Analytics", status: "degraded", uptimePercent: "98.72", latencyP99Ms: 4800, requestsPerMin: 62, errorRate: "0.0145" },
    { agentName: "Compliance & Reporting", status: "healthy", uptimePercent: "99.91", latencyP99Ms: 1200, requestsPerMin: 28, errorRate: "0.0005" },
    { agentName: "Data Aggregation", status: "healthy", uptimePercent: "99.88", latencyP99Ms: 850, requestsPerMin: 480, errorRate: "0.0018" },
    { agentName: "Smart Dashboard", status: "healthy", uptimePercent: "99.96", latencyP99Ms: 145, requestsPerMin: 890, errorRate: "0.0007" },
  ];
  for (const m of agentMetricData) {
    try {
      await db.execute(
        `INSERT INTO agent_metrics (agentName, tenantId, status, uptimePercent, latencyP99Ms, requestsPerMin, errorRate) VALUES (?,?,?,?,?,?,?)`,
        [m.agentName, tenantId, m.status, m.uptimePercent, m.latencyP99Ms, m.requestsPerMin, m.errorRate]
      );
    } catch(e) { /* skip */ }
  }
  console.log("  ✓ Agent metrics seeded");
}

// ─── Step 12: Seed Billing Records ───────────────────────────────────────────
console.log("\nSeeding billing records...");
const [[billCount]] = await db.execute("SELECT COUNT(*) as c FROM billing_records WHERE tenantId = ?", [tenantId]);
if (billCount.c < 3) {
  const periods = ["2024-10","2024-11","2024-12","2025-01","2025-02","2025-03","2025-04","2025-05"];
  for (const period of periods) {
    try {
      await db.execute(
        `INSERT INTO billing_records (tenantId, period, amount, currency, status, dueDate, paidAt) VALUES (?,?,?,?,?,?,?)`,
        [tenantId, period, randFloat(8500, 12000).toFixed(2), "USD", rand(["paid","paid","paid","pending"]), new Date(`${period}-28`), rand([null, new Date(`${period}-15`)])]
      );
    } catch(e) { /* skip */ }
  }
  console.log("  ✓ Billing records seeded");
}

await db.end();
console.log("\n✅ All demo data seeded successfully!");
console.log("   → 5 tenants");
console.log("   → 500 Nigerian banking customers");
console.log("   → 2,000 transactions (web + mobile + USSD channels)");
console.log("   → 800 channel sessions");
console.log("   → 120 credit applications");
console.log("   → 45 AML alerts");
console.log("   → Compliance reports, data sources, agent events, metrics");
