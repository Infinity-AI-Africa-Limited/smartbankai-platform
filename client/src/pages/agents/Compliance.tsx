import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AgentBadge } from "@/components/AgentBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, AlertTriangle, CheckCircle, Clock, Download, Plus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const severityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const alertStatusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-400 border-red-500/20",
  investigating: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  escalated: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const CBN_TEMPLATES = [
  { id: "cbn-monthly", name: "CBN Monthly Return", period: "Monthly", authority: "Central Bank of Nigeria" },
  { id: "cbn-quarterly", name: "CBN Quarterly Report", period: "Quarterly", authority: "Central Bank of Nigeria" },
  { id: "aml-sar", name: "AML Suspicious Activity Report", period: "As-needed", authority: "NFIU" },
  { id: "nfiu-compliance", name: "NFIU Compliance Report", period: "Quarterly", authority: "NFIU" },
  { id: "annual-filing", name: "Annual Regulatory Filing", period: "Annual", authority: "CBN / SEC" },
  { id: "cbn-forex", name: "CBN Forex Transaction Report", period: "Monthly", authority: "Central Bank of Nigeria" },
];

export default function Compliance() {
  const [activeTab, setActiveTab] = useState<"reports" | "aml" | "audit">("reports");
  const [selectedPeriod, setSelectedPeriod] = useState("Q2-2026");
  const reportsQuery = trpc.compliance.reports.useQuery({});
  const amlQuery = trpc.compliance.amlAlerts.useQuery({});
  const transactionsQuery = trpc.fraud.transactions.useQuery({ tenantId: 4, limit: 30 });
  const auditQuery = trpc.compliance.auditLogs.useQuery({});
  const generateMutation = trpc.compliance.generateReport.useMutation({
    onSuccess: (d) => { toast.success(d.message); reportsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const reports = reportsQuery.data ?? [];
  const alerts = amlQuery.data ?? [];
  const logs = auditQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];

  const openAlerts = alerts.filter((a) => a.status === "open").length;
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const amlAdvisory = trpc.compliance.analyseTransaction.useMutation({
    onSuccess: (result) => toast.success(result.status === "advisory" ? "AML advisory recorded for human review" : "AML service unavailable — review is required"),
    onError: (error) => toast.error(error.message),
  });

  const analyseAml = () => {
    const transaction = transactions[0];
    if (!transaction) return toast.info("No transaction is available for AML advisory analysis");
    const createdAt = new Date(transaction.createdAt);
    const channelMap: Record<string, "web" | "mobile" | "ussd" | "pos" | "atm" | "branch" | "api"> = {
      web_banking: "web", mobile_app: "mobile", web: "web", mobile: "mobile", ussd: "ussd", pos: "pos", atm: "atm", branch: "branch", api: "api",
    };
    amlAdvisory.mutate({
      tenantId: Number(transaction.tenantId ?? 4),
      payload: {
        transaction_id: String(transaction.transactionRef), amount_ngn: Number(transaction.amount),
        channel: channelMap[String(transaction.channel)] ?? "mobile", hour_of_day: createdAt.getHours(), day_of_week: createdAt.getDay(),
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <AgentBadge name="Compliance & Reporting" size="lg" showDesc />
        <div className="flex items-center gap-2">
          {criticalAlerts > 0 && (
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 gap-1">
              <AlertTriangle className="h-3 w-3" /> {criticalAlerts} Critical
            </Badge>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Reports Generated", value: reports.length, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Open AML Alerts", value: openAlerts, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Critical Alerts", value: criticalAlerts, icon: Shield, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Audit Events (7d)", value: logs.length, icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-[#1E2A3A] p-4 flex items-center gap-3" style={{ background: "#111827" }}>
            <div className={cn("p-2 rounded-lg", kpi.bg)}>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-slate-500">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5 w-fit">
        {(["reports", "aml", "audit"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
              activeTab === tab ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white")}>
            {tab === "aml" ? "AML Alerts" : tab === "audit" ? "Audit Log" : "Reports"}
          </button>
        ))}
      </div>

      {activeTab === "reports" && (
        <div className="space-y-4">
          {/* CBN Templates */}
          <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">CBN Regulatory Report Templates</h3>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 bg-white/5 border-[#1E2A3A] text-white h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-[#1E2A3A]">
                  {["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026"].map((p) => (
                    <SelectItem key={p} value={p} className="text-white text-xs">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CBN_TEMPLATES.map((tpl) => (
                <div key={tpl.id} className="rounded-lg border border-[#1E2A3A] p-3 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs font-semibold text-white">{tpl.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{tpl.authority} · {tpl.period}</div>
                    </div>
                    <FileText className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  </div>
                  <Button size="sm" className="w-full h-7 text-[10px] gradient-brand text-white mt-1"
                    onClick={() => generateMutation.mutate({ tenantId: 1, reportType: tpl.name, period: selectedPeriod })}
                    disabled={generateMutation.isPending}>
                    <Plus className="h-3 w-3 mr-1" /> Generate
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Generated reports */}
          <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
            <div className="p-4 border-b border-[#1E2A3A]">
              <h3 className="text-sm font-semibold text-white">Generated Reports</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E2A3A]">
                  {["Report Type", "Period", "Status", "Generated", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-white text-sm">{r.reportType}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.reportPeriod}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border capitalize",
                        r.status === "submitted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        r.status === "generated" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}>
                        {r.status === "submitted" ? <CheckCircle className="h-2.5 w-2.5 mr-1 inline" /> : null}
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString("en-NG")}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-white gap-1"
                        onClick={() => toast.info("Download feature coming soon")}>
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "aml" && (
        <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
          <div className="p-4 border-b border-[#1E2A3A] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">AML Alert Management</h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">{openAlerts} Open</Badge>
              <Button size="sm" className="h-7 text-[10px] gradient-brand text-white" onClick={analyseAml} disabled={amlAdvisory.isPending}>
                <Shield className="h-3 w-3 mr-1" /> {amlAdvisory.isPending ? "Analysing" : "Run advisory"}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E2A3A]">
                  {["Alert Type", "Transaction Ref", "Severity", "Description", "Status", "Time"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-white text-sm font-medium">{a.alertType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{String(a.transactionRef ?? "—").slice(-10)}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border capitalize", severityColors[a.severity ?? "medium"])}>
                        {a.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{a.description}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border capitalize", alertStatusColors[a.status ?? "open"])}>
                        {a.status?.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(a.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
          <div className="p-4 border-b border-[#1E2A3A]">
            <h3 className="text-sm font-semibold text-white">Audit Log</h3>
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No audit events recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1E2A3A]">
                    {["Action", "Resource", "User", "IP", "Time"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 20).map((l) => (
                    <tr key={l.id} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{l.action}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs capitalize">{l.resource}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">User #{l.userId}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.ipAddress ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(l.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
