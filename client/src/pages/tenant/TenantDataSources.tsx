import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, RefreshCw, CheckCircle, AlertTriangle, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const TYPE_COLORS: Record<string, string> = {
  core_banking: "#00D4FF", payment_gateway: "#0066FF", credit_bureau: "#FFB800",
  kyc_provider: "#00FF88", mobile_money: "#F47558", data_warehouse: "#A855F7",
};

export default function TenantDataSources() {
  const { data: sources, isLoading, refetch } = trpc.tenantDataSources.list.useQuery({ tenantId: DEMO_TENANT_ID });
  const syncMutation = trpc.tenantDataSources.sync.useMutation({
    onSuccess: () => { toast.success("Sync initiated successfully"); refetch(); },
    onError: () => toast.error("Failed to initiate sync"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Data Sources</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
          Integration connectors feeding the AI agent network — core banking, payment gateways, credit bureaus, and KYC providers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
                <CardContent className="p-4"><Skeleton className="h-24" style={{ background: "#1A2744" }} /></CardContent>
              </Card>
            ))
          : (sources ?? []).map((ds: any) => {
              const color = TYPE_COLORS[ds.type] ?? "#8892A4";
              const statusColor = ds.status === "connected" ? "#00FF88" : ds.status === "syncing" ? "#FFB800" : "#FF4D4D";
              return (
                <Card key={ds.id} style={{ background: "#0D1527", border: `1px solid ${color}22` }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                          <Database size={18} style={{ color }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>{ds.name}</div>
                          <div className="text-xs capitalize" style={{ color: "#8892A4" }}>
                            {ds.type?.replace("_", " ")} · {ds.provider}
                          </div>
                        </div>
                      </div>
                      <Badge style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44` }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        {ds.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ background: "#0A1628" }}>
                        <div className="text-xs mb-0.5" style={{ color: "#8892A4" }}>Records</div>
                        <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                          {Number(ds.recordsIngested).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: "#0A1628" }}>
                        <div className="text-xs mb-0.5" style={{ color: "#8892A4" }}>Frequency</div>
                        <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>{ds.syncFrequency}</div>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: "#0A1628" }}>
                        <div className="text-xs mb-0.5" style={{ color: "#8892A4" }}>Last Sync</div>
                        <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                          {ds.lastSyncAt ? formatDistanceToNow(new Date(ds.lastSyncAt), { addSuffix: true }) : "Never"}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => syncMutation.mutate({ tenantId: DEMO_TENANT_ID, sourceId: ds.id })}
                      disabled={syncMutation.isPending}
                      style={{ borderColor: color, color, background: `${color}11` }}
                    >
                      <RefreshCw size={12} className="mr-2" />
                      Trigger Manual Sync
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
