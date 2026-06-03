import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminLayout from "./components/AdminLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import AgentControlCenter from "./pages/AgentControlCenter";
import Monitoring from "./pages/Monitoring";
import Billing from "./pages/Billing";
import Users from "./pages/Users";

// Agent panels
import ConversationalAgent from "./pages/agents/ConversationalAgent";
import FraudDetection from "./pages/agents/FraudDetection";
import CreditRisk from "./pages/agents/CreditRisk";
import Compliance from "./pages/agents/Compliance";
import Personalization from "./pages/agents/Personalization";
import PredictiveAnalytics from "./pages/agents/PredictiveAnalytics";
import DataAggregation from "./pages/agents/DataAggregation";
import SmartDashboard from "./pages/agents/SmartDashboard";

import TenantDetail from "./pages/TenantDetail";

// Audit placeholder
import { Lock, Settings as SettingsIcon } from "lucide-react";

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
          <div key={s.title} className="rounded-xl border border-[#1E2A3A] p-5 hover:border-blue-500/30 transition-colors cursor-pointer"
            style={{ background: "#111827" }}
            onClick={() => {}}>
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

function Router() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/" component={() => <Redirect to="/dashboard" />} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/tenants" component={Tenants} />
        <Route path="/tenants/:id" component={TenantDetail} />
        <Route path="/agents" component={AgentControlCenter} />
        <Route path="/agents/conversational" component={ConversationalAgent} />
        <Route path="/agents/fraud" component={FraudDetection} />
        <Route path="/agents/credit" component={CreditRisk} />
        <Route path="/agents/personalization" component={Personalization} />
        <Route path="/agents/predictive" component={PredictiveAnalytics} />
        <Route path="/agents/compliance" component={Compliance} />
        <Route path="/agents/data" component={DataAggregation} />
        <Route path="/agents/smartdashboard" component={SmartDashboard} />
        <Route path="/monitoring" component={Monitoring} />
        <Route path="/users" component={Users} />
        <Route path="/billing" component={Billing} />
        <Route path="/audit" component={AuditPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
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
