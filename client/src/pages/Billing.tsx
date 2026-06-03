import { trpc } from "@/lib/trpc";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mrrData = [
  { month: "Jan", mrr: 32000 }, { month: "Feb", mrr: 35000 }, { month: "Mar", mrr: 38000 },
  { month: "Apr", mrr: 41000 }, { month: "May", mrr: 44500 }, { month: "Jun", mrr: 48500 },
];

const tierPricing = [
  { tier: "Starter", price: "$499/mo", agents: "3 Agents", users: "Up to 10K MAU", sla: "99.5%", color: "border-blue-500/30" },
  { tier: "Growth", price: "$1,499/mo", agents: "6 Agents", users: "Up to 100K MAU", sla: "99.9%", color: "border-purple-500/30" },
  { tier: "Enterprise", price: "Custom", agents: "All 8 Agents", users: "Unlimited MAU", sla: "99.99%", color: "border-amber-500/30" },
];

const statusColors: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  overdue: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function Billing() {
  const summaryQuery = trpc.billing.summary.useQuery();
  const invoicesQuery = trpc.billing.invoices.useQuery({});
  const summary = summaryQuery.data;
  const invoices = invoicesQuery.data ?? [];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Subscriptions</h1>
        <p className="text-sm text-slate-400 mt-0.5">Revenue tracking, invoices, and subscription management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Recurring Revenue" value={`$${((summary?.mrr ?? 48500) / 1000).toFixed(1)}K`} icon={DollarSign} color="gold" trend={{ value: 23.4, label: "YoY" }} />
        <StatCard title="Annual Run Rate" value={`$${((summary?.arr ?? 582000) / 1000).toFixed(0)}K`} icon={TrendingUp} color="green" />
        <StatCard title="Active Subscriptions" value={summary?.activeSubscriptions ?? 0} icon={CreditCard} color="blue" />
        <StatCard title="Overdue Invoices" value={summary?.overdueCount ?? 0} icon={AlertCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* MRR chart */}
        <div className="lg:col-span-2 rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">MRR Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mrrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }}
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "MRR"]} />
              <Bar dataKey="mrr" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pricing tiers */}
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Subscription Tiers</h3>
          <div className="space-y-3">
            {tierPricing.map((t) => (
              <div key={t.tier} className={cn("rounded-lg border p-3", t.color)} style={{ background: "#0D1520" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-white">{t.tier}</span>
                  <span className="text-sm font-bold text-amber-400">{t.price}</span>
                </div>
                <div className="space-y-0.5 text-[10px] text-slate-400">
                  <div>{t.agents}</div>
                  <div>{t.users}</div>
                  <div>SLA: {t.sla}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices table */}
      <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
        <div className="flex items-center justify-between p-4 border-b border-[#1E2A3A]">
          <h3 className="text-sm font-semibold text-white">Invoice History</h3>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1.5 text-xs"
            onClick={() => toast.info("Export coming soon")}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                {["Invoice #", "Tenant", "Amount", "Period", "Status", "Due Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">No invoices yet</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">INV-{String(inv.id).padStart(5, "0")}</td>
                    <td className="px-4 py-3 text-white text-sm">Tenant #{inv.tenantId}</td>
                    <td className="px-4 py-3 text-white font-semibold">${parseFloat(String(inv.amount)).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{(inv as any).billingPeriod ?? (inv as any).period}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border capitalize", statusColors[inv.status ?? "pending"])}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-NG") : "—"}
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
