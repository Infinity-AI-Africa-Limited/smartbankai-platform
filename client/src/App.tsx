import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminLayout from "./components/AdminLayout";
import TenantLayout from "./components/TenantLayout";
import { Settings as SettingsIcon } from "lucide-react";

// ── Infinity AI Super-Admin Pages ─────────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import TenantDetail from "./pages/TenantDetail";
import AgentControlCenter from "./pages/AgentControlCenter";
import Monitoring from "./pages/Monitoring";
import Billing from "./pages/Billing";
import Users from "./pages/Users";

// ── Infinity AI Agent Panels ──────────────────────────────────────────────────
import ConversationalAgent from "./pages/agents/ConversationalAgent";
import FraudDetection from "./pages/agents/FraudDetection";
import CreditRisk from "./pages/agents/CreditRisk";
import Compliance from "./pages/agents/Compliance";
import Personalization from "./pages/agents/Personalization";
import PredictiveAnalytics from "./pages/agents/PredictiveAnalytics";
import DataAggregation from "./pages/agents/DataAggregation";
import SmartDashboard from "./pages/agents/SmartDashboard";

// ── Tenant Portal Pages ───────────────────────────────────────────────────────
import TenantOverview from "./pages/tenant/TenantOverview";
import TenantDeployment from "./pages/tenant/TenantDeployment";
import TenantCustomers from "./pages/tenant/TenantCustomers";
import TenantTransactions from "./pages/tenant/TenantTransactions";
import TenantChannels from "./pages/tenant/TenantChannels";
import TenantDataSources from "./pages/tenant/TenantDataSources";
import TenantAMLCompliance from "./pages/tenant/TenantAMLCompliance";
import TenantAgentEvents from "./pages/tenant/TenantAgentEvents";
import TenantSettings from "./pages/tenant/TenantSettings";
import TenantCustomerDetail from "./pages/tenant/TenantCustomerDetail";

// ── Shared Placeholder Pages ──────────────────────────────────────────────────
function AuditPage() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-0.5">Platform-wide audit trail for all user actions</p>
      </div>
      <Compliance />
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
        {(params) => <AdminLayout><TenantDetail /></AdminLayout>}
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
        <TenantLayout><TenantCustomerDetail /></TenantLayout>
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
