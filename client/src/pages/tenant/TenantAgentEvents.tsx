import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu, CheckCircle, XCircle, Clock, Zap, BarChart2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AGENT_COLORS: Record<string, string> = {
  "Conversational Agent": "#00D4FF",
  "Fraud Detection Agent": "#FF4D4D",
  "Credit Risk Agent": "#FFB800",
  "Personalization Agent": "#A855F7",
  "Predictive Analytics Agent": "#0066FF",
  "Compliance & Reporting Agent": "#00FF88",
  "Data Aggregation Agent": "#F47558",
  "Smart Dashboard Agent": "#FFD700",
};

const AGENTS = Object.keys(AGENT_COLORS);

export default function TenantAgentEvents() {
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);

  const { data: events, isLoading } = trpc.tenantAgentEvents.list.useQuery({
    tenantId: DEMO_TENANT_ID,
    agentName: selectedAgent,
    limit: 50,
  });

  const { data: stats } = trpc.tenantAgentEvents.stats.useQuery({ tenantId: DEMO_TENANT_ID });

  const chartData = (stats ?? []).map((s: any) => ({
    name: s.agentName?.replace(" Agent", "").replace("Compliance & Reporting", "Compliance"),
    events: Number(s.cnt),
    success: Number(s.successCnt),
    latency: Math.round(Number(s.avgLatency ?? 0)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Agent Event Log</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
          Real-time event stream from all 8 AI agents — processing logs, inference results, and performance metrics
        </p>
      </div>

      {/* Agent Stats Chart */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Agent Event Volume & Avg Latency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#8892A4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8892A4", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ background: "#0D1527", border: "1px solid #1A2744", borderRadius: 8 }} labelStyle={{ color: "#FFFFFF" }} itemStyle={{ color: "#8892A4" }} />
              <Bar dataKey="events" fill="#00D4FF" radius={[0, 4, 4, 0]} name="Total Events" />
              <Bar dataKey="success" fill="#00FF88" radius={[0, 4, 4, 0]} name="Successful" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Agent Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedAgent(undefined)}
          style={{
            borderColor: !selectedAgent ? "#00D4FF" : "#1A2744",
            color: !selectedAgent ? "#00D4FF" : "#8892A4",
            background: !selectedAgent ? "#00D4FF11" : "transparent",
            fontSize: "11px",
          }}
        >
          All Agents
        </Button>
        {AGENTS.map((agent) => {
          const color = AGENT_COLORS[agent];
          return (
            <Button
              key={agent}
              size="sm"
              variant="outline"
              onClick={() => setSelectedAgent(agent)}
              style={{
                borderColor: selectedAgent === agent ? color : "#1A2744",
                color: selectedAgent === agent ? color : "#8892A4",
                background: selectedAgent === agent ? `${color}11` : "transparent",
                fontSize: "11px",
              }}
            >
              {agent.replace(" Agent", "")}
            </Button>
          );
        })}
      </div>

      {/* Event Table */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #1A2744" }}>
                  {["Agent", "Event Type", "Input Summary", "Latency", "Confidence", "Status", "Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "#8892A4" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1A2744" }}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-20" style={{ background: "#1A2744" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : (events ?? []).map((ev: any) => {
                      const color = AGENT_COLORS[ev.agentName] ?? "#8892A4";
                      const confidence = ev.confidenceScore ? parseFloat(ev.confidenceScore) : null;
                      return (
                        <tr key={ev.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid #1A2744" }}>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${color}22`, color }}>
                              {ev.agentName?.replace(" Agent", "")}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium" style={{ color: "#FFFFFF" }}>{ev.eventType}</td>
                          <td className="px-4 py-3 max-w-48 truncate" style={{ color: "#8892A4" }}>
                            {typeof ev.inputData === "object" ? JSON.stringify(ev.inputData).slice(0, 60) + "…" : String(ev.inputData ?? "—")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Zap size={10} style={{ color: "#FFB800" }} />
                              <span style={{ color: "#FFFFFF" }}>{ev.processingTimeMs ?? "—"}ms</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {confidence !== null ? (
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-12 rounded-full overflow-hidden" style={{ background: "#1A2744" }}>
                                  <div className="h-full rounded-full" style={{
                                    width: `${confidence * 100}%`,
                                    background: confidence > 0.8 ? "#00FF88" : confidence > 0.5 ? "#FFB800" : "#FF4D4D"
                                  }} />
                                </div>
                                <span style={{ color: "#FFFFFF" }}>{(confidence * 100).toFixed(0)}%</span>
                              </div>
                            ) : <span style={{ color: "#8892A4" }}>—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className="text-xs px-1.5 py-0" style={{
                              background: ev.status === "success" ? "#00FF8822" : ev.status === "failed" ? "#FF4D4D22" : "#FFB80022",
                              color: ev.status === "success" ? "#00FF88" : ev.status === "failed" ? "#FF4D4D" : "#FFB800",
                              border: "none"
                            }}>
                              {ev.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3" style={{ color: "#8892A4" }}>
                            {formatDistanceToNow(new Date(ev.createdAt), { addSuffix: true })}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
