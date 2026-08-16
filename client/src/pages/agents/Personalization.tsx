import { AgentBadge } from "@/components/AgentBadge";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Globe, Users, Target, TrendingUp, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";

const segmentData = [
  { segment: "Mass Market", users: 45000, products: 12 },
  { segment: "SME Owners", users: 12000, products: 18 },
  { segment: "Salary Earners", users: 38000, products: 9 },
  { segment: "High Net Worth", users: 3200, products: 24 },
  { segment: "Students", users: 21000, products: 7 },
  { segment: "Diaspora", users: 8500, products: 15 },
];

const productRecs = [
  { name: "Micro-Savings Plan", relevance: 94, segment: "Mass Market" },
  { name: "SME Working Capital Loan", relevance: 91, segment: "SME Owners" },
  { name: "Salary Advance", relevance: 88, segment: "Salary Earners" },
  { name: "Investment Portfolio", relevance: 85, segment: "High Net Worth" },
  { name: "Student Loan", relevance: 82, segment: "Students" },
  { name: "Diaspora Remittance Plan", relevance: 79, segment: "Diaspora" },
];

const COLORS = ["#2563EB", "#06B6D4", "#F59E0B", "#10B981", "#8B5CF6", "#F47558"];

export default function Personalization() {
  const [advisory, setAdvisory] = useState<{ recommendation?: string; status: string } | null>(null);
  const recommendationMutation = trpc.aiAdvisory.recommendation.useMutation({
    onSuccess: (result) => setAdvisory(result),
  });

  const generateAdvisory = () => recommendationMutation.mutate({
    tenantId: 4,
    payload: {
      customer_id: "demo-segment-mass-market-001",
      age_band: "26-35",
      income_band: "mid",
      products_held: ["Savings Account", "Debit Card"],
      channel_preference: "mobile",
      days_since_last_transaction: 2,
      monthly_txn_count_3m_avg: 18,
      complaint_count_12m: 0,
      account_age_months: 36,
    },
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <AgentBadge name="Personalization" size="lg" showDesc />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Customer Segments" value="6" icon={Users} color="purple" />
        <StatCard title="Avg Relevance Score" value="86.5%" icon={Target} color="blue" />
        <StatCard title="Recommendations Sent" value="142K" icon={Sparkles} color="cyan" />
        <StatCard title="Conversion Rate" value="23.4%" icon={TrendingUp} color="green" trend={{ value: 4.2, label: "vs last month" }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Segment Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="segment" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }} />
              <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                {segmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-white">Top Product Recommendations</h3>
            <Button size="sm" onClick={generateAdvisory} disabled={recommendationMutation.isPending}
              className="h-7 text-[10px] gradient-brand text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              {recommendationMutation.isPending ? "Analysing" : "Run advisory"}
            </Button>
          </div>
          {advisory && (
            <div className="mb-4 rounded-lg border border-purple-500/25 bg-purple-500/5 p-3 text-xs">
              <div className="font-semibold text-purple-300">AI advisory — human review required</div>
              <div className="mt-1 text-slate-300">{advisory.recommendation ?? "The recommendation service is unavailable; review the customer segment manually."}</div>
            </div>
          )}
          <div className="space-y-3">
            {productRecs.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] + "33", border: `1px solid ${COLORS[i % COLORS.length]}44`, color: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{r.name}</div>
                  <div className="text-[10px] text-slate-500">{r.segment}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="h-1 w-16 rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${r.relevance}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="text-xs font-mono text-slate-300 w-8 text-right">{r.relevance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
