import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Settings, Shield, Bell, Database, Cpu, Globe, Key,
  CheckCircle, AlertTriangle, Sliders, Lock, RefreshCw
} from "lucide-react";

const AGENT_THRESHOLDS = [
  { agent: "Fraud Detection Agent", metric: "Risk Score Threshold", value: 75, unit: "%", color: "#FF4D4D", description: "Flag transactions above this risk score" },
  { agent: "Credit Risk Agent", metric: "Min Credit Score", value: 580, unit: "pts", color: "#FFB800", description: "Minimum score for loan approval" },
  { agent: "Conversational Agent", metric: "Confidence Threshold", value: 82, unit: "%", color: "#00D4FF", description: "Min confidence for automated responses" },
  { agent: "Predictive Analytics Agent", metric: "Churn Alert Threshold", value: 65, unit: "%", color: "#0066FF", description: "Alert when churn probability exceeds this" },
  { agent: "Compliance & Reporting Agent", metric: "AML Alert Threshold", value: 500000, unit: "₦", color: "#00FF88", description: "Flag transactions above this amount for AML review" },
  { agent: "Personalization Agent", metric: "Recommendation Score", value: 70, unit: "%", color: "#A855F7", description: "Min relevance score for product recommendations" },
];

const ALERT_RULES = [
  { name: "High-Value Transaction Alert", trigger: "Transaction > ₦5,000,000", channel: "Email + SMS", status: "active" },
  { name: "Fraud Score Alert", trigger: "Fraud score > 80%", channel: "Email + Push", status: "active" },
  { name: "Failed Login Alert", trigger: "3+ failed logins in 5 min", channel: "Email", status: "active" },
  { name: "AML Suspicious Activity", trigger: "AML flag raised", channel: "Email + SMS + Dashboard", status: "active" },
  { name: "Credit Application Alert", trigger: "New loan application submitted", channel: "Dashboard", status: "active" },
  { name: "System Downtime Alert", trigger: "Agent offline > 2 min", channel: "Email + SMS", status: "active" },
  { name: "Daily Summary Report", trigger: "Every day at 08:00 WAT", channel: "Email", status: "active" },
  { name: "CBN Report Due Reminder", trigger: "3 days before due date", channel: "Email", status: "paused" },
];

const INTEGRATIONS = [
  { name: "Finacle Core Banking", type: "Core Banking", status: "connected", lastSync: "2 min ago", endpoint: "https://cbs.firstbanknigeria.com/api/v2" },
  { name: "Interswitch Payment Gateway", type: "Payment", status: "connected", lastSync: "30 sec ago", endpoint: "https://sandbox.interswitchng.com/api/v3" },
  { name: "CRC Credit Bureau", type: "Credit Bureau", status: "connected", lastSync: "1 hr ago", endpoint: "https://api.creditregistrycorp.com/v1" },
  { name: "First Central Credit Bureau", type: "Credit Bureau", status: "connected", lastSync: "1 hr ago", endpoint: "https://api.firstcentralcreditbureau.com/v1" },
  { name: "NIBSS BVN Service", type: "Identity", status: "connected", lastSync: "5 min ago", endpoint: "https://api.nibss-plc.com.ng/bvn/v1" },
  { name: "CBN Regulatory Reporting", type: "Regulatory", status: "connected", lastSync: "Daily at 06:00", endpoint: "https://reporting.cbn.gov.ng/api/v1" },
  { name: "Twilio SMS Gateway", type: "Notification", status: "connected", lastSync: "Real-time", endpoint: "https://api.twilio.com/2010-04-01" },
  { name: "Firebase Push Notifications", type: "Notification", status: "degraded", lastSync: "15 min ago", endpoint: "https://fcm.googleapis.com/fcm/send" },
];

export default function TenantSettings() {
  const [thresholds, setThresholds] = useState(AGENT_THRESHOLDS.map(t => ({ ...t })));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    toast.success("Settings saved successfully", { description: "All agent thresholds and alert rules have been updated." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Platform Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
            Configure agent thresholds, alert rules, and integration settings for First Bank Nigeria
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
          style={{ background: "linear-gradient(135deg, #00D4FF, #0066FF)", color: "#FFFFFF" }}
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* Agent Thresholds */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Sliders size={16} style={{ color: "#00D4FF" }} />
            Agent Decision Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thresholds.map((t, i) => (
              <div key={t.agent} className="p-4 rounded-xl" style={{ background: "#0A1628", border: "1px solid #1A2744" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: t.color }}>{t.agent.replace(" Agent", "")}</span>
                  <Badge className="text-xs px-1.5 py-0" style={{ background: `${t.color}22`, color: t.color, border: "none" }}>Active</Badge>
                </div>
                <p className="text-xs mb-3" style={{ color: "#8892A4" }}>{t.description}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: "#8892A4" }}>{t.metric}</span>
                      <span className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
                        {t.unit === "₦" ? `₦${t.value.toLocaleString()}` : `${t.value}${t.unit}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={t.unit === "₦" ? 100000 : t.unit === "pts" ? 300 : 0}
                      max={t.unit === "₦" ? 2000000 : t.unit === "pts" ? 850 : 100}
                      step={t.unit === "₦" ? 50000 : t.unit === "pts" ? 10 : 1}
                      value={t.value}
                      onChange={(e) => {
                        const newThresholds = [...thresholds];
                        newThresholds[i] = { ...newThresholds[i], value: Number(e.target.value) };
                        setThresholds(newThresholds);
                      }}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: t.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Bell size={16} style={{ color: "#FFB800" }} />
            Alert Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #1A2744" }}>
                {["Rule Name", "Trigger Condition", "Notification Channel", "Status", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "#8892A4" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALERT_RULES.map((rule) => (
                <tr key={rule.name} className="hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid #1A2744" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "#FFFFFF" }}>{rule.name}</td>
                  <td className="px-4 py-3" style={{ color: "#8892A4" }}>{rule.trigger}</td>
                  <td className="px-4 py-3" style={{ color: "#8892A4" }}>{rule.channel}</td>
                  <td className="px-4 py-3">
                    <Badge className="text-xs px-1.5 py-0" style={{
                      background: rule.status === "active" ? "#00FF8822" : "#FFB80022",
                      color: rule.status === "active" ? "#00FF88" : "#FFB800",
                      border: "none"
                    }}>
                      {rule.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{ color: "#00D4FF", border: "1px solid #00D4FF33" }}
                      onClick={() => toast.info(`Editing rule: ${rule.name}`, { description: "Rule editor coming soon." })}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Database size={16} style={{ color: "#A855F7" }} />
            Integration Connectors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #1A2744" }}>
                {["Integration", "Type", "Endpoint", "Last Sync", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "#8892A4" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INTEGRATIONS.map((intg) => (
                <tr key={intg.name} className="hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid #1A2744" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "#FFFFFF" }}>{intg.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#1A2744", color: "#8892A4" }}>{intg.type}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs max-w-48 truncate" style={{ color: "#8892A4" }}>{intg.endpoint}</td>
                  <td className="px-4 py-3" style={{ color: "#8892A4" }}>{intg.lastSync}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{
                        background: intg.status === "connected" ? "#00FF88" : intg.status === "degraded" ? "#FFB800" : "#FF4D4D"
                      }} />
                      <span style={{ color: intg.status === "connected" ? "#00FF88" : intg.status === "degraded" ? "#FFB800" : "#FF4D4D" }}>
                        {intg.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Lock, title: "Security & Access", color: "#00D4FF", items: ["MFA: Enabled", "Session timeout: 30 min", "IP allowlist: 3 ranges", "Audit logging: Enabled"] },
          { icon: Key, title: "API Keys", color: "#FFB800", items: ["Production key: ••••••••a3f2", "Sandbox key: ••••••••7b91", "Webhook secret: ••••••••c8e4", "Last rotated: 30 days ago"] },
          { icon: Globe, title: "Data Residency", color: "#00FF88", items: ["Primary region: Nigeria (Lagos)", "Backup region: South Africa", "Data sovereignty: Compliant", "NDPR: Compliant"] },
        ].map(({ icon: Icon, title, color, items }) => (
          <Card key={title} style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
                <Icon size={14} style={{ color }} />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map(item => (
                <div key={item} className="flex items-center gap-2 text-xs" style={{ color: "#8892A4" }}>
                  <CheckCircle size={10} style={{ color, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
