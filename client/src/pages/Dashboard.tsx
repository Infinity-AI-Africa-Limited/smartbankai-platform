import { trpc } from "@/lib/trpc";
import { StatCard } from "@/components/ui/stat-card";
import { AgentBadge, AgentName } from "@/components/AgentBadge";
import { Building2, Users, Activity, ShieldAlert, TrendingUp, DollarSign, Cpu, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const txTrend = [
  { time: "00:00", tx: 1200, fraud: 12 }, { time: "04:00", tx: 980, fraud: 8 },
  { time: "08:00", tx: 2400, fraud: 18 }, { time: "12:00", tx: 3800, fraud: 31 },
  { time: "16:00", tx: 3200, fraud: 24 }, { time: "20:00", tx: 2100, fraud: 15 },
  { time: "Now",   tx: 2800, fraud: 20 },
];

const revenueData = [
  { month: "Jan", mrr: 32000 }, { month: "Feb", mrr: 35000 }, { month: "Mar", mrr: 38000 },
  { month: "Apr", mrr: 41000 }, { month: "May", mrr: 44500 }, { month: "Jun", mrr: 48500 },
];

export default function Dashboard() {
  const statsQuery = trpc.platform.stats.useQuery();
  const metricsQuery = trpc.platform.agentMetrics.useQuery();
  const billingSummary = trpc.billing.summary.useQuery();

  const stats = statsQuery.data;
  const metrics = metricsQuery.data ?? [];

  const healthyCount = metrics.filter((m) => m.status === "healthy").length;
  const degradedCount = metrics.filter((m) => m.status === "degraded").length;
  const downCount = metrics.filter((m) => m.status === "down").length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">SmartBank AI — Agentic Financial Intelligence Platform</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Tenants"
          value={stats?.tenantCount ?? "—"}
          subtitle="Financial institutions"
          icon={Building2}
          color="blue"
          trend={{ value: 12.5, label: "vs last month" }}
        />
        <StatCard
          title="Platform Users"
          value={stats?.userCount ?? "—"}
          subtitle="Across all tenants"
          icon={Users}
          color="cyan"
          trend={{ value: 8.2, label: "vs last month" }}
        />
        <StatCard
          title="Transactions Today"
          value={stats?.txCount ? `${(stats.txCount / 1000).toFixed(1)}K` : "142.8K"}
          subtitle="Processed & scored"
          icon={Activity}
          color="green"
          trend={{ value: 5.7, label: "vs yesterday" }}
        />
        <StatCard
          title="AML Alerts"
          value={stats?.alertCount ?? 23}
          subtitle="Requiring attention"
          icon={AlertTriangle}
          color="gold"
          trend={{ value: -3.1, label: "vs last week" }}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard title="Monthly Recurring Revenue" value={`$${((billingSummary.data?.mrr ?? 48500) / 1000).toFixed(1)}K`}
          subtitle="USD" icon={DollarSign} color="gold" trend={{ value: 23.4, label: "YoY growth" }} />
        <StatCard title="Agents Healthy" value={`${healthyCount}/8`}
          subtitle={degradedCount > 0 ? `${degradedCount} degraded` : "All systems nominal"} icon={Cpu}
          color={downCount > 0 ? "red" : degradedCount > 0 ? "gold" : "green"} />
        <StatCard title="Fraud Blocked Today" value="₦4.75M"
          subtitle="7 confirmed fraud cases" icon={ShieldAlert} color="red"
          trend={{ value: -18.3, label: "vs yesterday" }} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transaction volume */}
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Transaction Volume (24h)</h3>
              <p className="text-xs text-slate-500">Transactions processed vs fraud flagged</p>
            </div>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={txTrend}>
              <defs>
                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }} />
              <Area type="monotone" dataKey="tx" stroke="#2563EB" strokeWidth={2} fill="url(#txGrad)" name="Transactions" />
              <Area type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={2} fill="url(#fraudGrad)" name="Flagged" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MRR trend */}
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Monthly Recurring Revenue</h3>
              <p className="text-xs text-slate-500">USD — 6-month trend</p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">+23.4%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }}
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "MRR"]} />
              <Bar dataKey="mrr" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent health grid */}
      <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">AI Agent Health Status</h3>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Healthy</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> Degraded</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Down</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.length > 0 ? metrics.map((m) => (
            <div key={m.agentName} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-[#1E2A3A]">
              <AgentBadge name={m.agentName as AgentName} size="sm" />
              <div className="text-right ml-2">
                <div className={cn("text-xs font-semibold",
                  m.status === "healthy" ? "text-emerald-400" : m.status === "degraded" ? "text-amber-400" : "text-red-400")}>
                  {String(m.uptimePercent)}%
                </div>
                <div className="text-[10px] text-slate-500">{m.latencyP99Ms}ms</div>
              </div>
            </div>
          )) : (
            Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-14 rounded-lg bg-white/3 border border-[#1E2A3A] animate-pulse" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
