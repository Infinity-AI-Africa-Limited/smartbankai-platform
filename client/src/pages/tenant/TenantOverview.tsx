import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Activity, ShieldAlert, Cpu, TrendingUp, Globe, AlertTriangle,
  CheckCircle, Clock, Zap, ArrowUpRight, ArrowDownRight, RefreshCw
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";

const AGENT_COLORS: Record<string, string> = {
  "Conversational": "#00D4FF",
  "Fraud Detection": "#FF4D4D",
  "Credit Risk": "#FFB800",
  "Personalization": "#00FF88",
  "Predictive Analytics": "#A855F7",
  "Compliance & Reporting": "#F47558",
  "Data Aggregation": "#3B82F6",
  "Smart Dashboard": "#EC4899",
};

const txTrend = [
  { time: "00:00", volume: 1240, flagged: 12 },
  { time: "04:00", volume: 890, flagged: 8 },
  { time: "08:00", volume: 3420, flagged: 34 },
  { time: "12:00", volume: 5670, flagged: 56 },
  { time: "16:00", volume: 4890, flagged: 48 },
  { time: "20:00", volume: 3210, flagged: 31 },
  { time: "Now", volume: 2840, flagged: 28 },
];

const channelPie = [
  { name: "Mobile App", value: 58, color: "#00D4FF" },
  { name: "Web Banking", value: 24, color: "#0066FF" },
  { name: "USSD", value: 13, color: "#F47558" },
  { name: "Branch", value: 5, color: "#8892A4" },
];

export default function TenantOverview() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: summary, isLoading: summaryLoading } = trpc.tenantOverview.summary.useQuery(
    { tenantId: DEMO_TENANT_ID },
    { refetchInterval: 30000 }
  );
  const { data: agentNetwork, isLoading: agentsLoading } = trpc.tenantOverview.agentNetwork.useQuery(
    { tenantId: DEMO_TENANT_ID },
    { refetchInterval: 15000 }
  );
  const { data: recentActivity, isLoading: activityLoading } = trpc.tenantOverview.recentActivity.useQuery(
    { tenantId: DEMO_TENANT_ID },
    { refetchInterval: 10000 }
  );

  const formatNGN = (v: string | number) => {
    const n = typeof v === "string" ? parseFloat(v) : v;
    if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return `₦${n.toFixed(0)}`;
  };

  const kpis = summary ? [
    {
      label: "Total Customers",
      value: summary.customerStats.total.toLocaleString(),
      sub: `+${summary.customerStats.newThisMonth} this month`,
      icon: <Users size={18} />,
      color: "#00D4FF",
      trend: "up",
    },
    {
      label: "Transactions Today",
      value: summary.txStats.today.toLocaleString(),
      sub: `${summary.txStats.successRate}% success rate`,
      icon: <Activity size={18} />,
      color: "#00FF88",
      trend: "up",
    },
    {
      label: "Total Volume",
      value: formatNGN(summary.txStats.totalVolume),
      sub: `${summary.txStats.flagged} flagged`,
      icon: <TrendingUp size={18} />,
      color: "#FFB800",
      trend: "up",
    },
    {
      label: "Active Sessions",
      value: (summary.channelStats.totalSessions).toLocaleString(),
      sub: `${summary.channelStats.mobile.toLocaleString()} mobile`,
      icon: <Globe size={18} />,
      color: "#A855F7",
      trend: "up",
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
            {summary?.tenant?.name ?? "First Bank Nigeria"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
            SmartBank AI Tenant Operations Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="px-3 py-1" style={{ background: "#00FF8822", color: "#00FF88", border: "1px solid #00FF8844" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-2" />
            Live
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey(k => k + 1)}
            style={{ borderColor: "#1A2744", color: "#8892A4", background: "transparent" }}
          >
            <RefreshCw size={14} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" style={{ background: "#1A2744" }} />
                  <Skeleton className="h-8 w-32 mb-1" style={{ background: "#1A2744" }} />
                  <Skeleton className="h-3 w-20" style={{ background: "#1A2744" }} />
                </CardContent>
              </Card>
            ))
          : kpis.map((kpi) => (
              <Card key={kpi.label} style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: "#8892A4" }}>{kpi.label}</span>
                    <div className="p-1.5 rounded-lg" style={{ background: `${kpi.color}22` }}>
                      <span style={{ color: kpi.color }}>{kpi.icon}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: "#FFFFFF" }}>{kpi.value}</div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "#00FF88" }}>
                    <ArrowUpRight size={12} />
                    {kpi.sub}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction Volume Chart */}
        <Card className="lg:col-span-2" style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
              Transaction Volume — Today (NGN)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={txTrend}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="flagGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                <XAxis dataKey="time" tick={{ fill: "#8892A4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8892A4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0D1527", border: "1px solid #1A2744", borderRadius: 8 }} labelStyle={{ color: "#FFFFFF" }} itemStyle={{ color: "#8892A4" }} />
                <Area type="monotone" dataKey="volume" stroke="#00D4FF" fill="url(#volGrad)" strokeWidth={2} name="Transactions" />
                <Area type="monotone" dataKey="flagged" stroke="#FF4D4D" fill="url(#flagGrad)" strokeWidth={2} name="Flagged" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <PieChart width={140} height={140}>
                <Pie data={channelPie} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {channelPie.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-2">
              {channelPie.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span style={{ color: "#8892A4" }}>{c.name}</span>
                  </div>
                  <span className="font-medium" style={{ color: "#FFFFFF" }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Agent Network */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Cpu size={16} style={{ color: "#00D4FF" }} />
            AI Agent Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20" style={{ background: "#1A2744" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(agentNetwork ?? []).map((agent) => {
                const color = AGENT_COLORS[agent.name] ?? "#8892A4";
                const statusColor = agent.status === "healthy" ? "#00FF88" : agent.status === "degraded" ? "#FFB800" : "#8892A4";
                return (
                  <div
                    key={agent.name}
                    className="p-3 rounded-xl"
                    style={{ background: "#0A1628", border: `1px solid ${color}22` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                      <span className="text-xs capitalize" style={{ color: statusColor }}>{agent.status}</span>
                    </div>
                    <div className="text-xs font-semibold mb-1 leading-tight" style={{ color: "#FFFFFF" }}>{agent.name}</div>
                    <div className="text-xs" style={{ color: "#8892A4" }}>
                      {agent.totalEvents.toLocaleString()} events
                    </div>
                    {agent.totalEvents > 0 && (
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#1A2744" }}>
                        <div className="h-full rounded-full" style={{ width: `${agent.successRate}%`, background: color }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" style={{ background: "#1A2744" }} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {(recentActivity?.transactions ?? []).slice(0, 6).map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "#0A1628" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: tx.fraudStatus !== "clean" ? "#FF4D4D22" : "#00FF8822" }}>
                        {tx.fraudStatus !== "clean" ? <AlertTriangle size={10} style={{ color: "#FF4D4D" }} /> : <CheckCircle size={10} style={{ color: "#00FF88" }} />}
                      </div>
                      <div>
                        <div className="text-xs font-medium" style={{ color: "#FFFFFF" }}>{tx.transactionRef}</div>
                        <div className="text-xs" style={{ color: "#8892A4" }}>{tx.channel?.replace("_", " ")}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold" style={{ color: "#FFFFFF" }}>₦{parseFloat(tx.amount).toLocaleString()}</div>
                      <div className="text-xs" style={{ color: tx.fraudStatus !== "clean" ? "#FF4D4D" : "#8892A4" }}>
                        {tx.fraudStatus?.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AML Alerts */}
        <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
              <AlertTriangle size={14} style={{ color: "#FF4D4D" }} />
              Active AML Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" style={{ background: "#1A2744" }} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {(recentActivity?.alerts ?? []).slice(0, 5).map((alert: any) => {
                  const sevColor = alert.severity === "critical" ? "#FF4D4D" : alert.severity === "high" ? "#FFB800" : alert.severity === "medium" ? "#F47558" : "#8892A4";
                  return (
                    <div key={alert.id} className="p-2 rounded-lg" style={{ background: "#0A1628", border: `1px solid ${sevColor}22` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: "#FFFFFF" }}>{alert.alertType}</span>
                        <Badge className="text-xs px-1.5 py-0" style={{ background: `${sevColor}22`, color: sevColor, border: `1px solid ${sevColor}44` }}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="text-xs truncate" style={{ color: "#8892A4" }}>{alert.description}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "#8892A4" }}>
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
