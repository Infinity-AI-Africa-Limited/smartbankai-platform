import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AgentBadge } from "@/components/AgentBadge";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ShieldAlert, AlertTriangle, TrendingDown, Activity, Settings, RefreshCw } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  clean: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  flagged: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  under_review: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed_fraud: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function FraudDetection() {
  const [threshold, setThreshold] = useState([65]);
  const [advisoryMessage, setAdvisoryMessage] = useState<string | null>(null);
  const txQuery = trpc.fraud.transactions.useQuery({ limit: 30 });
  const flaggedQuery = trpc.fraud.flagged.useQuery({});
  const statsQuery = trpc.fraud.stats.useQuery();
  const assessMutation = trpc.fraud.assess.useMutation({
    onSuccess: (result) => setAdvisoryMessage(result.recommendation ?? "Fraud advisory is unavailable; a human review is required."),
    onError: (error) => toast.error(error.message),
  });

  const stats = statsQuery.data;
  const transactions = txQuery.data ?? [];
  const flagged = flaggedQuery.data ?? [];

  const scatterData = transactions.map((t) => ({
    amount: parseFloat(String(t.amount)),
    risk: parseFloat(String(t.riskScore ?? "0")),
    status: t.fraudStatus,
  }));

  const assessFirstFlagged = () => {
    const transaction = flagged[0];
    if (!transaction) return toast.info("No flagged transaction is available for advisory analysis");
    const createdAt = new Date(transaction.createdAt);
    const channelMap: Record<string, "web" | "mobile" | "ussd" | "pos" | "atm" | "branch" | "api"> = {
      web_banking: "web", mobile_app: "mobile", web: "web", mobile: "mobile", ussd: "ussd", pos: "pos", atm: "atm", branch: "branch", api: "api",
    };
    assessMutation.mutate({
      tenantId: Number(transaction.tenantId ?? 4),
      payload: {
        transaction_id: String(transaction.transactionRef),
        amount_ngn: Number(transaction.amount),
        channel: channelMap[String(transaction.channel)] ?? "mobile",
        hour_of_day: createdAt.getHours(),
        day_of_week: createdAt.getDay(),
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <AgentBadge name="Fraud Detection" size="lg" showDesc />
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1.5 text-xs"
          onClick={() => { txQuery.refetch(); flaggedQuery.refetch(); toast.success("Feed refreshed"); }}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
        <Button size="sm" className="gradient-brand text-white text-xs h-8" onClick={assessFirstFlagged} disabled={assessMutation.isPending}>
          <ShieldAlert className="h-3.5 w-3.5 mr-1" /> {assessMutation.isPending ? "Analysing" : "Review flagged"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Transactions Scanned" value={(stats?.totalScanned ?? 0).toLocaleString()} icon={Activity} color="blue" />
        <StatCard title="Flagged Today" value={stats?.flaggedToday ?? 0} icon={AlertTriangle} color="gold" />
        <StatCard title="Confirmed Fraud" value={stats?.confirmedFraud ?? 0} icon={ShieldAlert} color="red" />
        <StatCard title="Value at Risk" value={`₦${((stats?.totalValueAtRisk ?? 0) / 1000000).toFixed(2)}M`} icon={TrendingDown} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scatter plot */}
        <div className="lg:col-span-2 rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
              <XAxis dataKey="amount" name="Amount (₦)" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="risk" name="Risk Score" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }}
                formatter={(v: any, name: string) => [name === "Amount (₦)" ? `₦${Number(v).toLocaleString()}` : `${Number(v).toFixed(1)}`, name]} />
              <Scatter data={scatterData} name="Transactions">
                {scatterData.map((d, i) => (
                  <Cell key={i} fill={
                    d.status === "confirmed_fraud" ? "#EF4444" :
                    d.status === "flagged" ? "#F59E0B" :
                    d.status === "under_review" ? "#3B82F6" : "#10B981"
                  } fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
            {[["#10B981", "Clean"], ["#F59E0B", "Flagged"], ["#3B82F6", "Under Review"], ["#EF4444", "Confirmed Fraud"]].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full inline-block" style={{ background: c }} />{l}</span>
            ))}
          </div>
        </div>

        {/* Threshold config */}
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Threshold Configuration</h3>
          </div>
          <div className="space-y-5">
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Alert Threshold: <span className="text-amber-400 font-semibold">{threshold[0]}</span></Label>
              <Slider value={threshold} onValueChange={setThreshold} min={0} max={100} step={1} className="w-full" />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>Low Risk</span><span>High Risk</span></div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Auto-block threshold", value: 85, color: "text-red-400" },
                { label: "Review threshold", value: threshold[0], color: "text-amber-400" },
                { label: "Monitor threshold", value: 40, color: "text-blue-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={cn("font-mono font-semibold", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
            <Button className="w-full gradient-brand text-white text-xs h-8"
              onClick={() => toast.success("Thresholds updated")}>
              Apply Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Flagged transactions */}
      <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
        <div className="flex items-center justify-between p-4 border-b border-[#1E2A3A]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Flagged Transactions</h3>
          </div>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">{flagged.length} alerts</Badge>
        </div>
        {advisoryMessage && <div className="mx-4 mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-100">AI advisory — human review required: {advisoryMessage}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                {["Ref", "Amount", "Channel", "Risk Score", "Status", "Time"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flagged.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">No flagged transactions</td></tr>
              ) : (
                flagged.slice(0, 10).map((t) => (
                  <tr key={t.id} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{String(t.transactionRef).slice(-10)}</td>
                    <td className="px-4 py-3 text-white font-medium">₦{parseFloat(String(t.amount)).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{t.channel ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/10">
                          <div className={cn("h-full rounded-full", parseFloat(String(t.riskScore ?? "0")) > 70 ? "bg-red-400" : "bg-amber-400")}
                            style={{ width: `${parseFloat(String(t.riskScore ?? "0"))}%` }} />
                        </div>
                        <span className="text-xs font-mono text-slate-300">{parseFloat(String(t.riskScore ?? "0")).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border capitalize", statusColors[t.fraudStatus ?? "flagged"] ?? statusColors.flagged)}>
                        {t.fraudStatus?.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(t.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
