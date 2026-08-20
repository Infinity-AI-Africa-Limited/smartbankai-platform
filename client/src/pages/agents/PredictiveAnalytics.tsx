import { AgentBadge } from "@/components/AgentBadge";
import { StatCard } from "@/components/ui/stat-card";
import { BarChart3, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const cashFlowForecast = [
  { month: "Jul", actual: null, forecast: 52000000 },
  { month: "Aug", actual: null, forecast: 58000000 },
  { month: "Sep", actual: null, forecast: 61000000 },
  { month: "Oct", actual: null, forecast: 55000000 },
  { month: "Nov", actual: null, forecast: 63000000 },
  { month: "Dec", actual: null, forecast: 71000000 },
];

const churnRisk = [
  { segment: "Mass Market", risk: 18.2, count: 8190 },
  { segment: "SME Owners", risk: 12.5, count: 1500 },
  { segment: "Salary Earners", risk: 9.8, count: 3724 },
  { segment: "High Net Worth", risk: 6.2, count: 198 },
  { segment: "Students", risk: 24.1, count: 5061 },
];

const defaultPredictions = [
  { month: "Jul", predicted: 2.1, confidence: 91 },
  { month: "Aug", predicted: 2.4, confidence: 88 },
  { month: "Sep", predicted: 2.2, confidence: 85 },
  { month: "Oct", predicted: 2.8, confidence: 82 },
  { month: "Nov", predicted: 3.1, confidence: 79 },
  { month: "Dec", predicted: 2.9, confidence: 76 },
];

export default function PredictiveAnalytics() {
  return (
    <div className="space-y-6 animate-fade-up">
      <AgentBadge name="Predictive Analytics" size="lg" showDesc />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Forecast Validation" value="Pending" icon={BarChart3} color="cyan" />
        <StatCard title="Churn Risk Customers" value="18.7K" icon={Users} color="gold" trend={{ value: -2.1, label: "vs last month" }} />
        <StatCard title="Predicted Default Rate" value="2.4%" icon={AlertTriangle} color="red" />
        <StatCard title="Revenue Forecast (Q3)" value="₦172M" icon={TrendingUp} color="green" trend={{ value: 14.3, label: "projected growth" }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-1">Cash Flow Forecast (6-Month)</h3>
          <p className="text-xs text-slate-500 mb-4">Synthetic development scenario only — independent bank-data validation and calibration are pending.</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cashFlowForecast}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v / 1000000}M`} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }}
                formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, "Forecast"]} />
              <Area type="monotone" dataKey="forecast" stroke="#06B6D4" strokeWidth={2} strokeDasharray="5 5" fill="url(#forecastGrad)" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-1">Default Rate Prediction</h3>
          <p className="text-xs text-slate-500 mb-4">XGBoost ensemble — confidence bands shown</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={defaultPredictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E2A3A", borderRadius: "8px", color: "#fff", fontSize: 11 }} />
              <Line type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", r: 3 }} name="Default Rate %" />
              <Line type="monotone" dataKey="confidence" stroke="#2563EB" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Confidence %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
        <h3 className="text-sm font-semibold text-white mb-4">Churn Risk by Segment</h3>
        <div className="space-y-3">
          {churnRisk.map((s) => (
            <div key={s.segment} className="flex items-center gap-4">
              <div className="w-28 text-xs text-slate-300 flex-shrink-0">{s.segment}</div>
              <div className="flex-1 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${s.risk}%`, background: s.risk > 20 ? "#EF4444" : s.risk > 15 ? "#F59E0B" : "#10B981" }} />
              </div>
              <div className="w-12 text-right text-xs font-mono text-slate-300">{s.risk}%</div>
              <div className="w-16 text-right text-xs text-slate-500">{s.count.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
