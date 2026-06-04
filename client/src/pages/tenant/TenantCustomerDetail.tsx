import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRoute } from "wouter";
import {
  User, ArrowLeft, CreditCard, Activity, Shield, TrendingUp,
  MapPin, Phone, Mail, Calendar, CheckCircle, AlertTriangle, Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDistanceToNow, format } from "date-fns";

const RISK_COLORS: Record<string, string> = { low: "#00FF88", medium: "#FFB800", high: "#FF4D4D", critical: "#FF0000" };
const STATUS_COLORS: Record<string, string> = { active: "#00FF88", inactive: "#8892A4", suspended: "#FF4D4D", dormant: "#FFB800" };
const SEGMENT_COLORS: Record<string, string> = { premium: "#FFD700", mass_affluent: "#A855F7", mass_market: "#00D4FF", sme: "#F47558", corporate: "#0066FF" };

export default function TenantCustomerDetail() {
  const [, params] = useRoute("/tenant/customers/:id");
  const customerId = params?.id ? parseInt(params.id) : 0;

  const { data: customer, isLoading } = trpc.tenantCustomers.byId.useQuery(
    { id: customerId },
    { enabled: !!customerId }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" style={{ background: "#1A2744" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" style={{ background: "#1A2744" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User size={48} style={{ color: "#1A2744" }} />
        <p className="mt-4 text-sm" style={{ color: "#8892A4" }}>Customer not found</p>
        <Link href="/tenant/customers">
          <button className="mt-4 text-xs px-4 py-2 rounded-lg" style={{ background: "#00D4FF22", color: "#00D4FF" }}>
            Back to Customers
          </button>
        </Link>
      </div>
    );
  }

  const c = customer as any;
  const riskColor = RISK_COLORS[c.riskProfile] ?? "#8892A4";
  const statusColor = STATUS_COLORS[c.status] ?? "#8892A4";
  const segmentColor = SEGMENT_COLORS[c.segment] ?? "#8892A4";

  // Build mock spending chart data from transaction summary
  const spendingData = [
    { month: "Jan", amount: 1200000 }, { month: "Feb", amount: 980000 },
    { month: "Mar", amount: 1450000 }, { month: "Apr", amount: 1100000 },
    { month: "May", amount: 1680000 }, { month: "Jun", amount: c.totalTransactionAmount ? Math.round(Number(c.totalTransactionAmount) / 6) : 1300000 },
  ];

  const channelData = [
    { name: "Mobile App", value: 55, color: "#00D4FF" },
    { name: "Web Banking", value: 28, color: "#0066FF" },
    { name: "USSD", value: 12, color: "#FFB800" },
    { name: "Branch", value: 5, color: "#F47558" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tenant/customers">
          <button className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: "#8892A4" }}>
            <ArrowLeft size={16} />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #1B365D, #00D4FF33)", color: "#00D4FF" }}>
              {c.fullName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#FFFFFF" }}>{c.fullName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: "#8892A4" }}>Account: {c.accountNumber}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${statusColor}22`, color: statusColor }}>{c.status}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${segmentColor}22`, color: segmentColor }}>{c.segment?.replace("_", " ")}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs" style={{ color: "#8892A4" }}>Account Balance</div>
            <div className="text-lg font-bold" style={{ color: "#00FF88" }}>
              ₦{Number(c.accountBalance ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Fraud Risk Score", value: `${c.fraudRiskScore ?? 0}%`, color: c.fraudRiskScore > 70 ? "#FF4D4D" : c.fraudRiskScore > 40 ? "#FFB800" : "#00FF88", icon: Shield },
          { label: "Credit Score", value: c.creditScore ?? "N/A", color: c.creditScore > 700 ? "#00FF88" : c.creditScore > 580 ? "#FFB800" : "#FF4D4D", icon: CreditCard },
          { label: "Churn Probability", value: `${c.churnProbability ?? 0}%`, color: c.churnProbability > 60 ? "#FF4D4D" : c.churnProbability > 30 ? "#FFB800" : "#00FF88", icon: TrendingUp },
          { label: "Engagement Score", value: `${c.engagementScore ?? 0}%`, color: c.engagementScore > 70 ? "#00FF88" : c.engagementScore > 40 ? "#FFB800" : "#FF4D4D", icon: Zap },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} style={{ background: "#0D1527", border: `1px solid ${color}33` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color }} />
                <span className="text-xs" style={{ color: "#8892A4" }}>{label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs mt-1" style={{ color: "#8892A4" }}>AI-generated score</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details */}
        <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Customer Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: User, label: "Full Name", value: c.fullName },
              { icon: Mail, label: "Email", value: c.email },
              { icon: Phone, label: "Phone", value: c.phone },
              { icon: MapPin, label: "State", value: c.state },
              { icon: Calendar, label: "Customer Since", value: c.createdAt ? format(new Date(c.createdAt), "MMM yyyy") : "—" },
              { icon: CreditCard, label: "Account Type", value: c.accountType?.replace("_", " ") },
              { icon: Shield, label: "KYC Status", value: c.kycStatus },
              { icon: CheckCircle, label: "BVN Verified", value: c.bvnVerified ? "Yes" : "No" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={12} style={{ color: "#8892A4", flexShrink: 0 }} />
                <span className="text-xs w-28 flex-shrink-0" style={{ color: "#8892A4" }}>{label}</span>
                <span className="text-xs font-medium truncate" style={{ color: "#FFFFFF" }}>{value ?? "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {[
                { label: "Total Transactions", value: c.transactionCount ?? 0, color: "#00D4FF" },
                { label: "Total Volume", value: `₦${Number(c.totalTransactionAmount ?? 0).toLocaleString()}`, color: "#00FF88" },
                { label: "Avg Transaction", value: c.transactionCount > 0 ? `₦${Math.round(Number(c.totalTransactionAmount ?? 0) / c.transactionCount).toLocaleString()}` : "—", color: "#FFB800" },
                { label: "Risk Profile", value: c.riskProfile?.toUpperCase(), color: riskColor },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#8892A4" }}>{label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs mb-2" style={{ color: "#8892A4" }}>Channel Usage</p>
              <div className="flex items-center gap-2">
                <PieChart width={80} height={80}>
                  <Pie data={channelData} cx={35} cy={35} innerRadius={20} outerRadius={35} dataKey="value" strokeWidth={0}>
                    {channelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
                <div className="space-y-1">
                  {channelData.map(ch => (
                    <div key={ch.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: ch.color }} />
                      <span style={{ color: "#8892A4" }}>{ch.name}</span>
                      <span className="ml-auto font-medium" style={{ color: "#FFFFFF" }}>{ch.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
              <Zap size={14} style={{ color: "#A855F7" }} />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { product: "FirstBank Salary Advance", reason: "Regular salary inflows detected", confidence: 92, color: "#00D4FF" },
              { product: "FirstBank Investment Plan", reason: "High account balance, low risk profile", confidence: 87, color: "#00FF88" },
              { product: "FirstBank Auto Loan", reason: "Credit score qualifies for premium rates", confidence: 78, color: "#FFB800" },
              { product: "FirstBank Premium Card", reason: "Mass affluent segment, high engagement", confidence: 85, color: "#A855F7" },
            ].map((rec) => (
              <div key={rec.product} className="p-3 rounded-lg" style={{ background: "#0A1628", border: "1px solid #1A2744" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "#FFFFFF" }}>{rec.product}</span>
                  <span className="text-xs font-bold" style={{ color: rec.color }}>{rec.confidence}%</span>
                </div>
                <p className="text-xs" style={{ color: "#8892A4" }}>{rec.reason}</p>
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#1A2744" }}>
                  <div className="h-full rounded-full" style={{ width: `${rec.confidence}%`, background: rec.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Spending Trend */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>6-Month Transaction Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
              <XAxis dataKey="month" tick={{ fill: "#8892A4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8892A4", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ background: "#0D1527", border: "1px solid #1A2744", borderRadius: 8 }} labelStyle={{ color: "#FFFFFF" }} formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, "Volume"]} />
              <Line type="monotone" dataKey="amount" stroke="#00D4FF" strokeWidth={2} dot={{ fill: "#00D4FF", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
