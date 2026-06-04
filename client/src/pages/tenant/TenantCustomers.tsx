import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, UserCheck, UserX, TrendingUp, MapPin, Phone, Mail } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  low: "#00FF88", medium: "#FFB800", high: "#FF8C00", very_high: "#FF4D4D",
};
const KYC_COLORS: Record<string, string> = {
  verified: "#00FF88", pending: "#FFB800", failed: "#FF4D4D", not_started: "#8892A4",
};

export default function TenantCustomers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: stats } = trpc.tenantCustomers.stats.useQuery({ tenantId: DEMO_TENANT_ID });
  const { data: customers, isLoading } = trpc.tenantCustomers.list.useQuery({
    tenantId: DEMO_TENANT_ID,
    limit,
    offset: page * limit,
  });

  const filtered = (customers ?? []).filter((c: any) =>
    !search || c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.accountNumber?.includes(search) ||
    c.bvn?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Customer Management</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
            AI-enriched customer profiles from web banking and mobile super app channels
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: stats?.total?.toLocaleString() ?? "—", icon: <Users size={16} />, color: "#00D4FF" },
          { label: "High Net Worth", value: stats?.highNetWorth?.toLocaleString() ?? "—", icon: <UserCheck size={16} />, color: "#00FF88" },
          { label: "SME Customers", value: stats?.sme?.toLocaleString() ?? "—", icon: <UserX size={16} />, color: "#FF4D4D" },
          { label: "New This Month", value: stats?.newThisMonth?.toLocaleString() ?? "—", icon: <TrendingUp size={16} />, color: "#FFB800" },
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

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8892A4" }} />
        <Input
          placeholder="Search by name, email, account number, or BVN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-sm"
          style={{ background: "#0D1527", border: "1px solid #1A2744", color: "#FFFFFF" }}
        />
      </div>

      {/* Customer Table */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #1A2744" }}>
                  {["Customer", "Account", "Segment", "KYC", "Risk", "Credit Score", "Location", "Status"].map((h) => (
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
                            <Skeleton className="h-4 w-20" style={{ background: "#1A2744" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((c: any) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid #1A2744" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#1B365D", color: "#00D4FF" }}>
                              {c.fullName?.charAt(0) ?? "?"}
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: "#FFFFFF" }}>{c.fullName}</div>
                              <div style={{ color: "#8892A4" }}>{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div style={{ color: "#FFFFFF" }}>{c.accountNumber}</div>
                          <div style={{ color: "#8892A4" }}>{c.accountType?.replace("_", " ")}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#00D4FF22", color: "#00D4FF" }}>
                            {c.segment?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="text-xs px-1.5 py-0" style={{
                            background: `${KYC_COLORS[c.kycStatus ?? "not_started"]}22`,
                            color: KYC_COLORS[c.kycStatus ?? "not_started"],
                            border: `1px solid ${KYC_COLORS[c.kycStatus ?? "not_started"]}44`
                          }}>
                            {c.kycStatus?.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="text-xs px-1.5 py-0" style={{
                            background: `${RISK_COLORS[c.riskLevel ?? "low"]}22`,
                            color: RISK_COLORS[c.riskLevel ?? "low"],
                            border: `1px solid ${RISK_COLORS[c.riskLevel ?? "low"]}44`
                          }}>
                            {c.riskLevel?.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: "#1A2744" }}>
                              <div className="h-full rounded-full" style={{
                                width: `${((c.creditScore ?? 0) / 850) * 100}%`,
                                background: (c.creditScore ?? 0) > 700 ? "#00FF88" : (c.creditScore ?? 0) > 500 ? "#FFB800" : "#FF4D4D"
                              }} />
                            </div>
                            <span style={{ color: "#FFFFFF" }}>{c.creditScore ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1" style={{ color: "#8892A4" }}>
                            <MapPin size={10} />
                            {c.state ?? "Lagos"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="text-xs px-1.5 py-0" style={{
                            background: c.isActive ? "#00FF8822" : "#FF4D4D22",
                            color: c.isActive ? "#00FF88" : "#FF4D4D",
                            border: `1px solid ${c.isActive ? "#00FF8844" : "#FF4D4D44"}`
                          }}>
                            {c.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/tenant/customers/${c.id}`}>
                            <button className="text-xs px-2 py-1 rounded transition-colors" style={{ color: "#00D4FF", border: "1px solid #00D4FF33" }}>
                              View 360°
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #1A2744" }}>
            <span className="text-xs" style={{ color: "#8892A4" }}>
              Showing {page * limit + 1}–{Math.min((page + 1) * limit, stats?.total ?? 0)} of {stats?.total?.toLocaleString() ?? "—"} customers
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                style={{ borderColor: "#1A2744", color: "#8892A4", background: "transparent" }}>
                Previous
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= (stats?.total ?? 0)}
                style={{ borderColor: "#1A2744", color: "#8892A4", background: "transparent" }}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
