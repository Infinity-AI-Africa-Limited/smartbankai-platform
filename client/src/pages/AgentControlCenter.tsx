import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AgentBadge, AgentName, agentConfig } from "@/components/AgentBadge";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Settings, Activity, Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const agentRoutes: Record<AgentName, string> = {
  "Conversational": "/agents/conversational",
  "Fraud Detection": "/agents/fraud",
  "Credit Risk": "/agents/credit",
  "Personalization": "/agents/personalization",
  "Predictive Analytics": "/agents/predictive",
  "Compliance & Reporting": "/agents/compliance",
  "Data Aggregation": "/agents/data",
  "Smart Dashboard": "/agents/smartdashboard",
};

const agentNames: AgentName[] = [
  "Conversational", "Fraud Detection", "Credit Risk", "Personalization",
  "Predictive Analytics", "Compliance & Reporting", "Data Aggregation", "Smart Dashboard",
];

export default function AgentControlCenter() {
  const [selectedTenantId, setSelectedTenantId] = useState<number>(1);
  const tenantsQuery = trpc.tenants.list.useQuery();
  const agentsQuery = trpc.agents.forTenant.useQuery({ tenantId: selectedTenantId });
  const metricsQuery = trpc.agents.allMetrics.useQuery();
  const toggleMutation = trpc.agents.toggle.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`${vars.agentName} ${vars.isEnabled ? "enabled" : "disabled"}`);
      agentsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const agents = agentsQuery.data ?? [];
  const metrics = metricsQuery.data ?? [];
  const tenants = tenantsQuery.data ?? [];

  const getMetric = (name: string) => metrics.find((m) => m.agentName === name);
  const getAgentState = (name: string) => agents.find((a) => a.agentName === name);

  const enabledCount = agents.filter((a) => a.isEnabled).length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agent Control Center</h1>
          <p className="text-sm text-slate-400 mt-0.5">Enable, configure, and monitor all 8 SmartBank AI agents</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(selectedTenantId)} onValueChange={(v) => setSelectedTenantId(Number(v))}>
            <SelectTrigger className="w-52 bg-white/5 border-[#1E2A3A] text-white h-9 text-sm">
              <SelectValue placeholder="Select tenant..." />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] border-[#1E2A3A]">
              {tenants.length === 0 ? (
                <SelectItem value="1" className="text-white">Default Tenant</SelectItem>
              ) : (
                tenants.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)} className="text-white">{t.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            {enabledCount}/8 Active
          </Badge>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#1E2A3A] p-4 flex items-center gap-3" style={{ background: "#111827" }}>
          <div className="p-2 rounded-lg bg-blue-500/10"><Cpu className="h-4 w-4 text-blue-400" /></div>
          <div>
            <div className="text-lg font-bold text-white">{enabledCount}</div>
            <div className="text-xs text-slate-500">Agents Active</div>
          </div>
        </div>
        <div className="rounded-xl border border-[#1E2A3A] p-4 flex items-center gap-3" style={{ background: "#111827" }}>
          <div className="p-2 rounded-lg bg-emerald-500/10"><Activity className="h-4 w-4 text-emerald-400" /></div>
          <div>
            <div className="text-lg font-bold text-white">{metrics.filter((m) => m.status === "healthy").length}</div>
            <div className="text-xs text-slate-500">Healthy</div>
          </div>
        </div>
        <div className="rounded-xl border border-[#1E2A3A] p-4 flex items-center gap-3" style={{ background: "#111827" }}>
          <div className="p-2 rounded-lg bg-amber-500/10"><AlertTriangle className="h-4 w-4 text-amber-400" /></div>
          <div>
            <div className="text-lg font-bold text-white">{metrics.filter((m) => m.status !== "healthy").length}</div>
            <div className="text-xs text-slate-500">Need Attention</div>
          </div>
        </div>
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentNames.map((name) => {
          const cfg = agentConfig[name];
          const Icon = cfg.icon;
          const state = getAgentState(name);
          const metric = getMetric(name);
          const isEnabled = state?.isEnabled ?? false;
          const route = agentRoutes[name];

          return (
            <div key={name}
              className={cn(
                "rounded-xl border p-5 transition-all duration-200",
                isEnabled ? "border-blue-500/30 shadow-lg shadow-blue-500/5" : "border-[#1E2A3A]"
              )}
              style={{ background: "#111827" }}
            >
              <div className="flex items-start justify-between mb-4">
                <AgentBadge name={name} showDesc size="md" />
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ tenantId: selectedTenantId, agentName: name, isEnabled: checked })
                  }
                  disabled={toggleMutation.isPending}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-lg p-2 bg-white/3 text-center">
                  <div className="text-xs font-semibold text-white">{metric?.uptimePercent ?? "99.9"}%</div>
                  <div className="text-[10px] text-slate-500">Uptime</div>
                </div>
                <div className="rounded-lg p-2 bg-white/3 text-center">
                  <div className="text-xs font-semibold text-white">{metric?.latencyP99Ms ?? "—"}ms</div>
                  <div className="text-[10px] text-slate-500">P99 Latency</div>
                </div>
                <div className="rounded-lg p-2 bg-white/3 text-center">
                  <div className="text-xs font-semibold text-white">{metric?.requestsPerMin ?? "—"}</div>
                  <div className="text-[10px] text-slate-500">Req/min</div>
                </div>
              </div>

              {/* Status & actions */}
              <div className="flex items-center justify-between">
                <Badge className={cn("text-[10px] border",
                  metric?.status === "healthy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  metric?.status === "degraded" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {metric?.status ?? "healthy"}
                </Badge>
                <div className="flex items-center gap-2">
                  <Link href={route}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-white gap-1">
                      <Zap className="h-3 w-3" /> Open Panel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
