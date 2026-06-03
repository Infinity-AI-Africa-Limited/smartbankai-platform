import { AgentBadge } from "@/components/AgentBadge";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, TrendingUp, Users, DollarSign, Activity, Globe } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const performanceData = [
  { month: "Jan", revenue: 32, customers: 8200, nps: 42 },
  { month: "Feb", revenue: 35, customers: 9100, nps: 45 },
  { month: "Mar", revenue: 38, customers: 10200, nps: 48 },
  { month: "Apr", revenue: 41, customers: 11800, nps: 51 },
  { month: "May", revenue: 44.5, customers: 13200, nps: 54 },
  { month: "Jun", revenue: 48.5, customers: 14900, nps: 58 },
];

const productMix = [
  { name: "Savings", value: 35, color: "#2563EB" },
  { name: "Loans", value: 28, color: "#F59E0B" },
  { name: "Payments", value: 22, color: "#10B981" },
  { name: "Insurance", value: 9, color: "#8B5CF6" },
  { name: "Investments", value: 6, color: "#06B6D4" },
];

const geoData = [
  { state: "Lagos", customers: 42000, revenue: "₦18.2M" },
  { state: "Abuja (FCT)", customers: 18000, revenue: "₦9.1M" },
  { state: "Kano", customers: 12000, revenue: "₦5.4M" },
  { state: "Rivers", customers: 9500, revenue: "₦4.8M" },
  { state: "Oyo", customers: 8200, revenue: "₦3.9M" },
  { state: "Kaduna", customers: 6800, revenue: "₦3.2M" },
];

export default function SmartDashboard() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <AgentBadge name="Smart Dashboard" size="lg" showDesc />
        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">Unified Intelligence View</Badge>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total AUM" value="₦2.4B" icon={DollarSign} color="gold" trend={{ value: 18.3, label: "YoY growth" }} />
        <StatCard title="Active Customers" value="127K" icon={Users} color="blue" trend={{ value: 12.1, label: "vs last month" }} />
        <StatCard title="NPS Score" value="58" icon={TrendingUp} color="green" trend={{ value: 6.2, label: "vs last quarter" }} />
        <StatCard title="Platform Uptime" value="99.97%" icon={Activity} color="cyan" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Revenue & Customer Growth (6M)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} name="Revenue ($K)" fillOpacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", r: 3 }} name="Customers" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Product Mix</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={productMix} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {productMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }}
                formatter={(v: any) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {productMix.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                {p.name} <span className="text-slate-500">({p.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Geographic Distribution (Nigeria)</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {geoData.map((g, i) => (
            <div key={g.state} className="rounded-lg border border-[#1E2A3A] p-3 text-center">
              <div className="text-xs font-semibold text-white">{g.state}</div>
              <div className="text-lg font-bold text-indigo-400 mt-1">{(g.customers / 1000).toFixed(0)}K</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{g.revenue}</div>
              <div className="h-1 rounded-full bg-white/10 mt-2">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(g.customers / 42000) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
