import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { Settings as SettingsIcon } from "lucide-react";

// ── Layouts (loaded eagerly — needed on every route) ──────────────────────────
import AdminLayout from "./components/AdminLayout";
import TenantLayout from "./components/TenantLayout";

// ── Loading fallback ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500">Loading...</span>
      </div>
    </div>
  );
}

// ── Infinity AI Super-Admin Pages (lazy — only loaded when navigated to) ──────
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tenants = lazy(() => import("./pages/Tenants"));
const TenantDetail = lazy(() => import("./pages/TenantDetail"));
const AgentControlCenter = lazy(() => import("./pages/AgentControlCenter"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const Billing = lazy(() => import("./pages/Billing"));
const Users = lazy(() => import("./pages/Users"));

// ── Infinity AI Agent Panels (lazy) ──────────────────────────────────────────
const ConversationalAgent = lazy(() => import("./pages/agents/ConversationalAgent"));
const FraudDetection = lazy(() => import("./pages/agents/FraudDetection"));
const CreditRisk = lazy(() => import("./pages/agents/CreditRisk"));
const Compliance = lazy(() => import("./pages/agents/Compliance"));
const Personalization = lazy(() => import("./pages/agents/Personalization"));
const PredictiveAnalytics = lazy(() => import("./pages/agents/PredictiveAnalytics"));
const DataAggregation = lazy(() => import("./pages/agents/DataAggregation"));
const SmartDashboard = lazy(() => import("./pages/agents/SmartDashboard"));

// ── Tenant Portal Pages (lazy) ────────────────────────────────────────────────
const TenantOverview = lazy(() => import("./pages/tenant/TenantOverview"));
const TenantDeployment = lazy(() => import("./pages/tenant/TenantDeployment"));
const TenantCustomers = lazy(() => import("./pages/tenant/TenantCustomers"));
const TenantTransactions = lazy(() => import("./pages/tenant/TenantTransactions"));
const TenantChannels = lazy(() => import("./pages/tenant/TenantChannels"));
const TenantDataSources = lazy(() => import("./pages/tenant/TenantDataSources"));
const TenantAMLCompliance = lazy(() => import("./pages/tenant/TenantAMLCompliance"));
const TenantAgentEvents = lazy(() => import("./pages/tenant/TenantAgentEvents"));
const TenantSettings = lazy(() => import("./pages/tenant/TenantSettings"));
const TenantCustomerDetail = lazy(() => import("./pages/tenant/TenantCustomerDetail"));

// ── Shared Placeholder Pages ──────────────────────────────────────────────────
function AuditPage() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-0.5">Platform-wide audit trail for all user actions</p>
      </div>
      <Suspense fallback={<PageLoader />}>
        <Compliance />
      </Suspense>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Configure SmartBank AI platform preferences</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "API Configuration", desc: "Manage API keys, webhooks, and integration endpoints" },
          { title: "Notification Settings", desc: "Configure alert thresholds and notification channels" },
          { title: "Security & Compliance", desc: "MFA, IP allowlisting, and session management" },
          { title: "Data Retention", desc: "Configure data retention policies and archiving rules" },
          { title: "White-labeling", desc: "Customize branding for tenant-facing interfaces" },
          { title: "Backup & Recovery", desc: "Database backup schedules and disaster recovery" },
        ].map((s) => (
          <div
            key={s.title}
            className="rounded-xl border border-[#1E2A3A] p-5 hover:border-blue-500/30 transition-colors cursor-pointer"
            style={{ background: "#111827" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <SettingsIcon className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-sm font-semibold text-white">{s.title}</div>
            </div>
            <p className="text-xs text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Root redirect */}
        <Route path="/" component={() => <Redirect to="/dashboard" />} />

        {/* ── Infinity AI Super-Admin Portal (/dashboard, /tenants, /agents, etc.) */}
        <Route path="/dashboard">
          <AdminLayout><Dashboard /></AdminLayout>
        </Route>
        <Route path="/tenants">
          <AdminLayout><Tenants /></AdminLayout>
        </Route>
        <Route path="/tenants/:id">
          {() => <AdminLayout><TenantDetail /></AdminLayout>}
        </Route>
        <Route path="/agents">
          <AdminLayout><AgentControlCenter /></AdminLayout>
        </Route>
        <Route path="/agents/conversational">
          <AdminLayout><ConversationalAgent /></AdminLayout>
        </Route>
        <Route path="/agents/fraud">
          <AdminLayout><FraudDetection /></AdminLayout>
        </Route>
        <Route path="/agents/credit">
          <AdminLayout><CreditRisk /></AdminLayout>
        </Route>
        <Route path="/agents/personalization">
          <AdminLayout><Personalization /></AdminLayout>
        </Route>
        <Route path="/agents/predictive">
          <AdminLayout><PredictiveAnalytics /></AdminLayout>
        </Route>
        <Route path="/agents/compliance">
          <AdminLayout><Compliance /></AdminLayout>
        </Route>
        <Route path="/agents/data">
          <AdminLayout><DataAggregation /></AdminLayout>
        </Route>
        <Route path="/agents/smartdashboard">
          <AdminLayout><SmartDashboard /></AdminLayout>
        </Route>
        <Route path="/monitoring">
          <AdminLayout><Monitoring /></AdminLayout>
        </Route>
        <Route path="/users">
          <AdminLayout><Users /></AdminLayout>
        </Route>
        <Route path="/billing">
          <AdminLayout><Billing /></AdminLayout>
        </Route>
        <Route path="/audit">
          <AdminLayout><AuditPage /></AdminLayout>
        </Route>
        <Route path="/settings">
          <AdminLayout><SettingsPage /></AdminLayout>
        </Route>

        {/* ── Tenant Portal (/tenant/*) — SmartBank AI client-side platform */}
        <Route path="/tenant">
          <Redirect to="/tenant/overview" />
        </Route>
        <Route path="/tenant/overview">
          <TenantLayout><TenantOverview /></TenantLayout>
        </Route>
        <Route path="/tenant/deployment">
          <TenantLayout><TenantDeployment /></TenantLayout>
        </Route>
        <Route path="/tenant/customers">
          <TenantLayout><TenantCustomers /></TenantLayout>
        </Route>
        <Route path="/tenant/transactions">
          <TenantLayout><TenantTransactions /></TenantLayout>
        </Route>
        <Route path="/tenant/channels">
          <TenantLayout><TenantChannels /></TenantLayout>
        </Route>
        <Route path="/tenant/data-sources">
          <TenantLayout><TenantDataSources /></TenantLayout>
        </Route>
        <Route path="/tenant/aml-compliance">
          <TenantLayout><TenantAMLCompliance /></TenantLayout>
        </Route>
        <Route path="/tenant/agent-events">
          <TenantLayout><TenantAgentEvents /></TenantLayout>
        </Route>
        <Route path="/tenant/customers/:id">
          {() => <TenantLayout><TenantCustomerDetail /></TenantLayout>}
        </Route>
        <Route path="/tenant/settings">
          <TenantLayout><TenantSettings /></TenantLayout>
        </Route>

        {/* ── Tenant Agent Panels (within tenant layout) */}
        <Route path="/tenant/agents/conversational">
          <TenantLayout><ConversationalAgent /></TenantLayout>
        </Route>
        <Route path="/tenant/agents/fraud">
          <TenantLayout><FraudDetection /></TenantLayout>
        </Route>
        <Route path="/tenant/agents/credit">
          <TenantLayout><CreditRisk /></TenantLayout>
        </Route>
        <Route path="/tenant/agents/personalization">
          <TenantLayout><Personalization /></TenantLayout>
        </Route>
        <Route path="/tenant/agents/predictive">
          <TenantLayout><PredictiveAnalytics /></TenantLayout>
        </Route>
        <Route path="/tenant/agents/compliance">
          <TenantLayout><Compliance /></TenantLayout>
        </Route>
        <Route path="/tenant/agents/data">
          <TenantLayout><DataAggregation /></TenantLayout>
        </Route>
        <Route path="/tenant/agents/smartdashboard">
          <TenantLayout><SmartDashboard /></TenantLayout>
        </Route>

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
