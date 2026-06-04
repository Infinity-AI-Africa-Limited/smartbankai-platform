import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Search, AlertTriangle, CheckCircle, Clock, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const hourlyData = [
  { h: "00", vol: 234 }, { h: "02", vol: 156 }, { h: "04", vol: 89 },
  { h: "06", vol: 312 }, { h: "08", vol: 1240 }, { h: "10", vol: 1890 },
  { h: "12", vol: 2340 }, { h: "14", vol: 2180 }, { h: "16", vol: 1760 },
  { h: "18", vol: 1420 }, { h: "20", vol: 980 }, { h: "22", vol: 567 },
];

const FRAUD_COLORS: Record<string, string> = {
  clean: "#00FF88", suspicious: "#FFB800", flagged: "#FF8C00", confirmed_fraud: "#FF4D4D",
};

const TX_TYPE_COLORS: Record<string, string> = {
  transfer: "#00D4FF", payment: "#0066FF", withdrawal: "#F47558",
  deposit: "#00FF88", airtime: "#A855F7", bill_payment: "#FFB800",
};

export default function TenantTransactions() {
  const [search, setSearch] = useState("");
  const [fraudFilter, setFraudFilter] = useState<string>("all");

  const { data: transactions, isLoading } = trpc.tenantCustomers.transactions.useQuery({
    tenantId: DEMO_TENANT_ID,
    limit: 100,
  });

  const filtered = (transactions ?? []).filter((tx: any) => {
    const matchSearch = !search ||
      tx.transactionRef?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase());
    const matchFraud = fraudFilter === "all" || tx.fraudStatus === fraudFilter;
    return matchSearch && matchFraud;
  });

  const totalVolume = (transactions ?? []).reduce((sum: number, tx: any) => sum + parseFloat(tx.amount ?? "0"), 0);
  const flaggedCount = (transactions ?? []).filter((tx: any) => tx.fraudStatus !== "clean").length;
  const successCount = (transactions ?? []).filter((tx: any) => tx.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Transaction Monitor</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
          Real-time transaction feed from Web Banking Portal and Mobile Super App — AI fraud scoring applied
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Transactions", value: (transactions?.length ?? 0).toLocaleString(), color: "#00D4FF", icon: <Activity size={16} /> },
          { label: "Total Volume", value: `₦${(totalVolume / 1e6).toFixed(1)}M`, color: "#00FF88", icon: <Activity size={16} /> },
          { label: "Flagged / Suspicious", value: flaggedCount.toLocaleString(), color: "#FF4D4D", icon: <AlertTriangle size={16} /> },
          { label: "Success Rate", value: `${transactions?.length ? Math.round((successCount / transactions.length) * 100) : 0}%`, color: "#FFB800", icon: <CheckCircle size={16} /> },
        ].map((s) => (
          <Card key={s.label} style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "#8892A4" }}>{s.label}</span>
                <div className="p-1.5 rounded-lg" style={{ background: `${s.color}22` }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hourly Volume Chart */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Hourly Transaction Volume (Today)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
              <XAxis dataKey="h" tick={{ fill: "#8892A4", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8892A4", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0D1527", border: "1px solid #1A2744", borderRadius: 8 }} labelStyle={{ color: "#FFFFFF" }} itemStyle={{ color: "#8892A4" }} />
              <Bar dataKey="vol" fill="#00D4FF" radius={[4, 4, 0, 0]} name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8892A4" }} />
          <Input
            placeholder="Search by ref or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
            style={{ background: "#0D1527", border: "1px solid #1A2744", color: "#FFFFFF" }}
          />
        </div>
        <div className="flex gap-2">
          {["all", "clean", "suspicious", "flagged", "confirmed_fraud"].map((f) => (
            <Button
              key={f}
              size="sm"
              variant="outline"
              onClick={() => setFraudFilter(f)}
              style={{
                borderColor: fraudFilter === f ? "#00D4FF" : "#1A2744",
                color: fraudFilter === f ? "#00D4FF" : "#8892A4",
                background: fraudFilter === f ? "#00D4FF11" : "transparent",
                fontSize: "11px",
              }}
            >
              {f === "all" ? "All" : f.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #1A2744" }}>
                  {["Reference", "Type", "Amount (NGN)", "Channel", "Fraud Status", "AI Risk Score", "Status", "Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "#8892A4" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1A2744" }}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-16" style={{ background: "#1A2744" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered.slice(0, 50).map((tx: any) => {
                      const fraudColor = FRAUD_COLORS[tx.fraudStatus ?? "clean"];
                      const txColor = TX_TYPE_COLORS[tx.transactionType ?? "transfer"];
                      const riskScore = tx.fraudRiskScore ? parseFloat(tx.fraudRiskScore) : 0;
                      return (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid #1A2744" }}>
                          <td className="px-4 py-3 font-mono" style={{ color: "#00D4FF" }}>{tx.transactionRef}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full" style={{ background: `${txColor}22`, color: txColor }}>
                              {tx.transactionType?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold" style={{ color: "#FFFFFF" }}>
                            ₦{parseFloat(tx.amount ?? "0").toLocaleString()}
                          </td>
                          <td className="px-4 py-3" style={{ color: "#8892A4" }}>
                            {tx.channel?.replace("_", " ")}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className="text-xs px-1.5 py-0" style={{ background: `${fraudColor}22`, color: fraudColor, border: `1px solid ${fraudColor}44` }}>
                              {tx.fraudStatus?.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: "#1A2744" }}>
                                <div className="h-full rounded-full" style={{
                                  width: `${riskScore * 100}%`,
                                  background: riskScore > 0.7 ? "#FF4D4D" : riskScore > 0.4 ? "#FFB800" : "#00FF88"
                                }} />
                              </div>
                              <span style={{ color: "#FFFFFF" }}>{(riskScore * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className="text-xs px-1.5 py-0" style={{
                              background: tx.status === "completed" ? "#00FF8822" : tx.status === "failed" ? "#FF4D4D22" : "#FFB80022",
                              color: tx.status === "completed" ? "#00FF88" : tx.status === "failed" ? "#FF4D4D" : "#FFB800",
                              border: "none"
                            }}>
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3" style={{ color: "#8892A4" }}>
                            {new Date(tx.createdAt).toLocaleTimeString()}
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
