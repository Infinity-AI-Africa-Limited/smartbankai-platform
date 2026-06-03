import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentBadge } from "@/components/AgentBadge";
import {
  Building2, ArrowLeft, Users, Activity, CreditCard,
  Bot, CheckCircle, XCircle, Calendar, Globe, Mail, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  trial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  suspended: "bg-red-500/10 text-red-400 border-red-500/20",
};

const tierColors: Record<string, string> = {
  starter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  growth: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  enterprise: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const tenantId = Number(id);

  const tenantQuery = trpc.tenants.byId.useQuery({ id: tenantId }, { enabled: !!tenantId });
  const agentsQuery = trpc.agents.forTenant.useQuery({ tenantId }, { enabled: !!tenantId });
  const toggleMutation = trpc.agents.toggle.useMutation({
    onSuccess: () => { toast.success("Agent updated"); agentsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const tenant = tenantQuery.data;
  const agents = agentsQuery.data ?? [];

  if (tenantQuery.isLoading) {
    return (
      <div className="space-y-4 animate-fade-up">
        <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Building2 className="h-12 w-12 mb-3 opacity-30" />
        <p>Tenant not found.</p>
        <Button variant="ghost" size="sm" className="mt-4 text-blue-400" onClick={() => navigate("/tenants")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tenants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"
            onClick={() => navigate("/tenants")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
              <Badge className={cn("text-[10px] border capitalize", statusColors[tenant.status ?? "inactive"])}>
                {tenant.status}
              </Badge>
              <Badge className={cn("text-[10px] border capitalize", tierColors[tenant.subscriptionTier ?? "starter"])}>
                {tenant.subscriptionTier}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">Tenant ID: #{tenant.id} · Onboarded {new Date(tenant.createdAt).toLocaleDateString("en-NG")}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Active Users" value={(tenant.monthlyActiveUsers ?? 0).toLocaleString()} icon={Users} color="blue" />
        <StatCard title="Total Transactions" value={(tenant.totalTransactions ?? 0).toLocaleString()} icon={Activity} color="cyan" />
        <StatCard title="Agents Enabled" value={agents.filter((a) => a.isEnabled).length} icon={Bot} color="green" />
        <StatCard title="Subscription" value={tenant.subscriptionTier ?? "Starter"} icon={CreditCard} color="gold" />
      </div>

      {/* Contact & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Contact Information</h3>
          <div className="space-y-3">
            {[
              { icon: Mail, label: "Email", value: tenant.contactEmail ?? "—" },
              { icon: Phone, label: "Phone", value: tenant.contactPhone ?? "—" },
              { icon: Globe, label: "Country", value: tenant.country ?? "Nigeria" },
              { icon: Calendar, label: "Joined", value: new Date(tenant.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" }) },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <item.icon className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
                  <div className="text-sm text-white">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent enablement */}
        <div className="lg:col-span-2 rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">AI Agent Configuration</h3>
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent) => (
              <div key={agent.agentName}
                className={cn("rounded-lg border p-3 flex items-center justify-between transition-all",
                  agent.isEnabled ? "border-blue-500/30 bg-blue-500/5" : "border-[#1E2A3A] bg-white/2"
                )}>
                <div className="flex items-center gap-2 min-w-0">
                  {agent.isEnabled
                    ? <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    : <XCircle className="h-4 w-4 text-slate-600 flex-shrink-0" />
                  }
                  <span className="text-xs font-medium text-white truncate">{agent.agentName}</span>
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ tenantId, agentName: agent.agentName, isEnabled: !agent.isEnabled })}
                  className={cn(
                    "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    agent.isEnabled ? "bg-blue-600" : "bg-slate-700"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    agent.isEnabled ? "translate-x-4" : "translate-x-0"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription details */}
      <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
        <h3 className="text-sm font-semibold text-white mb-4">Subscription & Billing Details</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Plan", value: (tenant.subscriptionTier ?? "starter").charAt(0).toUpperCase() + (tenant.subscriptionTier ?? "starter").slice(1), color: "text-amber-400" },
            { label: "Status", value: (tenant.status ?? "trial").charAt(0).toUpperCase() + (tenant.status ?? "trial").slice(1), color: "text-emerald-400" },
            { label: "Billing Cycle", value: "Monthly", color: "text-blue-400" },
            { label: "Next Renewal", value: new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-NG"), color: "text-slate-300" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-[#1E2A3A] p-3" style={{ background: "#0D1520" }}>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</div>
              <div className={cn("text-sm font-semibold", item.color)}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
