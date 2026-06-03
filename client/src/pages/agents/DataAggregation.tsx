import { AgentBadge } from "@/components/AgentBadge";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const dataSources = [
  { name: "Core Banking System (Temenos)", type: "Core Banking", status: "connected", lastSync: "2 min ago", records: "1.2M", latency: "45ms" },
  { name: "NIBSS Interbank Settlement", type: "Payment Network", status: "connected", lastSync: "5 min ago", records: "890K", latency: "120ms" },
  { name: "CRC Credit Bureau", type: "Credit Bureau", status: "connected", lastSync: "15 min ago", records: "340K", latency: "280ms" },
  { name: "FirstCentral Credit Bureau", type: "Credit Bureau", status: "connected", lastSync: "15 min ago", records: "280K", latency: "310ms" },
  { name: "MTN MoMo API", type: "Mobile Money", status: "connected", lastSync: "8 min ago", records: "520K", latency: "95ms" },
  { name: "Airtel Money API", type: "Mobile Money", status: "degraded", lastSync: "42 min ago", records: "210K", latency: "890ms" },
  { name: "NIN Identity Verification", type: "KYC/Identity", status: "connected", lastSync: "1 min ago", records: "1.8M", latency: "65ms" },
  { name: "BVN Validation Service", type: "KYC/Identity", status: "connected", lastSync: "3 min ago", records: "1.5M", latency: "78ms" },
  { name: "FIRS Tax Records", type: "Government", status: "pending", lastSync: "Never", records: "—", latency: "—" },
  { name: "CAC Business Registry", type: "Government", status: "connected", lastSync: "1 hr ago", records: "95K", latency: "420ms" },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  connected: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  degraded: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: AlertTriangle },
  pending: { color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: Clock },
  disconnected: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertTriangle },
};

export default function DataAggregation() {
  const connected = dataSources.filter((s) => s.status === "connected").length;
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <AgentBadge name="Data Aggregation" size="lg" showDesc />
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1.5 text-xs"
          onClick={() => toast.success("Sync initiated for all sources")}>
          <RefreshCw className="h-3.5 w-3.5" /> Sync All
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Data Sources" value={dataSources.length} icon={Database} color="gold" />
        <StatCard title="Connected" value={connected} icon={CheckCircle} color="green" />
        <StatCard title="Total Records" value="7.1M" icon={Database} color="blue" />
        <StatCard title="Avg Sync Latency" value="218ms" icon={Clock} color="cyan" />
      </div>
      <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
        <div className="p-4 border-b border-[#1E2A3A] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Data Source Registry</h3>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">{connected}/{dataSources.length} Online</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                {["Source", "Type", "Status", "Last Sync", "Records", "Latency"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataSources.map((s) => {
                const cfg = statusConfig[s.status] ?? statusConfig.disconnected;
                const Icon = cfg.icon;
                return (
                  <tr key={s.name} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-white text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{s.type}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border capitalize gap-1", cfg.color)}>
                        <Icon className="h-2.5 w-2.5" />{s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{s.lastSync}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{s.records}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <span className={s.latency === "—" ? "text-slate-600" : parseFloat(s.latency) > 500 ? "text-amber-400" : "text-emerald-400"}>
                        {s.latency}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
