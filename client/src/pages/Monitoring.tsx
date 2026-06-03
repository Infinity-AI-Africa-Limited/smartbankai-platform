import { trpc } from "@/lib/trpc";
import { AgentBadge, AgentName } from "@/components/AgentBadge";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu, Clock, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const latencyHistory = [
  { t: "10m", conv: 320, fraud: 180, credit: 890, pers: 210 },
  { t: "8m",  conv: 290, fraud: 165, credit: 920, pers: 195 },
  { t: "6m",  conv: 340, fraud: 190, credit: 870, pers: 220 },
  { t: "4m",  conv: 310, fraud: 175, credit: 910, pers: 205 },
  { t: "2m",  conv: 280, fraud: 160, credit: 880, pers: 215 },
  { t: "Now", conv: 295, fraud: 170, credit: 895, pers: 200 },
];

export default function Monitoring() {
  const metricsQuery = trpc.agents.allMetrics.useQuery({ refetchInterval: 30000 } as any);
  const metrics = metricsQuery.data ?? [];

  const radarData = metrics.map((m) => ({
    agent: m.agentName.split(" ")[0],
    uptime: parseFloat(String(m.uptimePercent)),
    performance: Math.max(0, 100 - (m.latencyP99Ms / 10)),
    throughput: Math.min(100, (m.requestsPerMin / 20)),
  }));

  const totalRequests = metrics.reduce((s, m) => s + (m.requestsPerMin ?? 0), 0);
  const avgLatency = metrics.length ? Math.round(metrics.reduce((s, m) => s + (m.latencyP99Ms ?? 0), 0) / metrics.length) : 0;
  const avgUptime = metrics.length ? (metrics.reduce((s, m) => s + parseFloat(String(m.uptimePercent ?? "99")), 0) / metrics.length).toFixed(2) : "99.99";

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Monitoring</h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time health, latency, and throughput across all AI agents</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live Monitoring</span>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Req/min", value: totalRequests.toLocaleString(), icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Avg P99 Latency", value: `${avgLatency}ms`, icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Platform Uptime", value: `${avgUptime}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Agents Healthy", value: `${metrics.filter((m) => m.status === "healthy").length}/8`, icon: Cpu, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-[#1E2A3A] p-4 flex items-center gap-3" style={{ background: "#111827" }}>
            <div className={cn("p-2 rounded-lg", kpi.bg)}>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-slate-500">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent metrics table */}
      <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
        <div className="flex items-center gap-2 p-4 border-b border-[#1E2A3A]">
          <Activity className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Agent Health Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                {["Agent", "Status", "Uptime", "P99 Latency", "Req/min", "Error Rate", "Health Score"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.length === 0 ? (
                Array.from({ length: 8 }, (_, i) => (
                  <tr key={i} className="border-b border-[#1E2A3A]/50">
                    {Array.from({ length: 7 }, (_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-white/5 animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                metrics.map((m) => {
                  const healthScore = Math.round(
                    parseFloat(String(m.uptimePercent ?? "99")) * 0.4 +
                    Math.max(0, 100 - (m.latencyP99Ms / 10)) * 0.4 +
                    (1 - parseFloat(String(m.errorRate ?? "0")) * 100) * 20
                  );
                  return (
                    <tr key={m.agentName} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <AgentBadge name={m.agentName as AgentName} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn("text-[10px] border",
                          m.status === "healthy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          m.status === "degraded" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {m.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-xs">{String(m.uptimePercent)}%</td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-xs">{m.latencyP99Ms}ms</td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-xs">{m.requestsPerMin?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className={parseFloat(String(m.errorRate ?? "0")) > 0.01 ? "text-amber-400" : "text-emerald-400"}>
                          {(parseFloat(String(m.errorRate ?? "0")) * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 max-w-[80px]">
                            <div className={cn("h-full rounded-full",
                              healthScore >= 90 ? "bg-emerald-400" : healthScore >= 70 ? "bg-amber-400" : "bg-red-400"
                            )} style={{ width: `${healthScore}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{healthScore}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Latency Trends (10 min)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={latencyHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
              <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} unit="ms" />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }} />
              <Line type="monotone" dataKey="conv" stroke="#2563EB" strokeWidth={2} dot={false} name="Conversational" />
              <Line type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={2} dot={false} name="Fraud Detection" />
              <Line type="monotone" dataKey="credit" stroke="#F59E0B" strokeWidth={2} dot={false} name="Credit Risk" />
              <Line type="monotone" dataKey="pers" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Personalization" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Agent Performance Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1E2A3A" />
              <PolarAngleAxis dataKey="agent" tick={{ fill: "#64748b", fontSize: 9 }} />
              <Radar name="Uptime" dataKey="uptime" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
              <Radar name="Performance" dataKey="performance" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
