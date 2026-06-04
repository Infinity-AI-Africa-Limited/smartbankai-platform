import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, FileText, Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const SEV_COLORS: Record<string, string> = {
  critical: "#FF4D4D", high: "#FF8C00", medium: "#FFB800", low: "#8892A4",
};

export default function TenantAMLCompliance() {
  const { data: alerts, isLoading: alertsLoading } = trpc.compliance.amlAlerts.useQuery({ tenantId: DEMO_TENANT_ID });
  const { data: reports, isLoading: reportsLoading } = trpc.compliance.reports.useQuery({ tenantId: DEMO_TENANT_ID });
  const updateAlert = { mutate: (_: any) => toast.info("Alert management requires admin access"), isPending: false };

  const openAlerts = (alerts ?? []).filter((a: any) => a.status === "open");
  const criticalAlerts = (alerts ?? []).filter((a: any) => a.severity === "critical");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>AML & Compliance</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
          AI-powered AML monitoring, CBN regulatory compliance reports, and audit management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open Alerts", value: openAlerts.length, color: "#FF4D4D", icon: <AlertTriangle size={16} /> },
          { label: "Critical", value: criticalAlerts.length, color: "#FF8C00", icon: <Shield size={16} /> },
          { label: "Reports Filed", value: (reports ?? []).length, color: "#00D4FF", icon: <FileText size={16} /> },
          { label: "Resolved Today", value: (alerts ?? []).filter((a: any) => a.status === "resolved").length, color: "#00FF88", icon: <CheckCircle size={16} /> },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AML Alerts */}
        <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
              <AlertTriangle size={14} style={{ color: "#FF4D4D" }} />
              AML Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" style={{ background: "#1A2744" }} />)
              : (alerts ?? []).slice(0, 8).map((alert: any) => {
                  const sevColor = SEV_COLORS[alert.severity] ?? "#8892A4";
                  return (
                    <div key={alert.id} className="p-3 rounded-xl" style={{ background: "#0A1628", border: `1px solid ${sevColor}22` }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="text-xs px-1.5 py-0" style={{ background: `${sevColor}22`, color: sevColor, border: `1px solid ${sevColor}44` }}>
                              {alert.severity}
                            </Badge>
                            <span className="text-xs font-medium" style={{ color: "#FFFFFF" }}>{alert.alertType}</span>
                          </div>
                          <div className="text-xs" style={{ color: "#8892A4" }}>{alert.description}</div>
                        </div>
                        <Badge className="ml-2 text-xs px-1.5 py-0 flex-shrink-0" style={{
                          background: alert.status === "open" ? "#FF4D4D22" : "#00FF8822",
                          color: alert.status === "open" ? "#FF4D4D" : "#00FF88",
                          border: "none"
                        }}>
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs" style={{ color: "#8892A4" }}>
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </div>
                        {alert.status === "open" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                              onClick={() => updateAlert.mutate({ id: alert.id, status: "investigating" })}
                              style={{ borderColor: "#FFB800", color: "#FFB800", background: "transparent" }}>
                              Investigate
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                              onClick={() => updateAlert.mutate({ id: alert.id, status: "resolved" })}
                              style={{ borderColor: "#00FF88", color: "#00FF88", background: "transparent" }}>
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
          </CardContent>
        </Card>

        {/* Compliance Reports */}
        <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
              <FileText size={14} style={{ color: "#00D4FF" }} />
              CBN Regulatory Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportsLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" style={{ background: "#1A2744" }} />)
              : (reports ?? []).slice(0, 8).map((r: any) => (
                  <div key={r.id} className="p-3 rounded-xl" style={{ background: "#0A1628", border: "1px solid #1A2744" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: "#FFFFFF" }}>{r.reportType}</span>
                      <Badge className="text-xs px-1.5 py-0" style={{
                        background: r.status === "submitted" ? "#00FF8822" : r.status === "approved" ? "#00D4FF22" : "#FFB80022",
                        color: r.status === "submitted" ? "#00FF88" : r.status === "approved" ? "#00D4FF" : "#FFB800",
                        border: "none"
                      }}>
                        {r.status}
                      </Badge>
                    </div>
                    <div className="text-xs" style={{ color: "#8892A4" }}>
                      Period: {r.reportPeriod} · Filed: {r.filedAt ? formatDistanceToNow(new Date(r.filedAt), { addSuffix: true }) : "Pending"}
                    </div>
                    {r.regulatoryRef && (
                      <div className="text-xs mt-1 font-mono" style={{ color: "#00D4FF" }}>Ref: {r.regulatoryRef}</div>
                    )}
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
