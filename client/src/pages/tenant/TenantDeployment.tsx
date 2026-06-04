import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Server, Cpu, MemoryStick, Network, Globe, CheckCircle, AlertTriangle,
  Clock, Shield, Database, Activity, Wifi, Lock, HardDrive, Zap
} from "lucide-react";

export default function TenantDeployment() {
  const { data: status, isLoading } = trpc.tenantDeployment.status.useQuery({ tenantId: DEMO_TENANT_ID });
  const { data: connectivity, isLoading: connLoading } = trpc.tenantDeployment.connectivity.useQuery({ tenantId: DEMO_TENANT_ID });

  const deploymentModelLabel: Record<string, string> = {
    on_premise: "On-Premise Installation",
    private_cloud: "Private Cloud Deployment",
    hybrid: "Hybrid Model",
    public_cloud: "Public Cloud",
  };

  const getStatusColor = (s: string) => s === "running" ? "#00FF88" : s === "degraded" ? "#FFB800" : "#FF4D4D";
  const getStatusBg = (s: string) => s === "running" ? "#00FF8822" : s === "degraded" ? "#FFB80022" : "#FF4D4D22";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Deployment Status</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
          Infrastructure health and connectivity for First Bank Nigeria's SmartBank AI deployment
        </p>
      </div>

      {/* Deployment Model Banner */}
      {isLoading ? (
        <Skeleton className="h-24" style={{ background: "#1A2744" }} />
      ) : (
        <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #0D1B3E, #1B365D33)", border: "1px solid #1B365D" }}>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#1B365D" }}>
                <Server size={22} style={{ color: "#00D4FF" }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: "#8892A4" }}>Deployment Model</div>
                <div className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
                  {deploymentModelLabel[status?.deploymentModel ?? "private_cloud"]}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 ml-auto">
              {[
                { label: "Region", value: status?.deploymentRegion ?? "Lagos, Nigeria", icon: <Globe size={14} /> },
                { label: "Version", value: status?.version ?? "v2.4.1", icon: <Zap size={14} /> },
                { label: "Uptime", value: status?.uptime ?? "99.97%", icon: <Activity size={14} /> },
                { label: "Status", value: status?.status ?? "operational", icon: <CheckCircle size={14} /> },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "#8892A4" }}>
                    <span style={{ color: "#00D4FF" }}>{item.icon}</span>
                    {item.label}
                  </div>
                  <div className="text-sm font-semibold capitalize" style={{ color: "#FFFFFF" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Server size={16} style={{ color: "#00D4FF" }} />
            Platform Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16" style={{ background: "#1A2744" }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {(status?.services ?? []).map((svc: any) => (
                <div key={svc.name} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "#0A1628", border: "1px solid #1A2744" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getStatusColor(svc.status) }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate" style={{ color: "#FFFFFF" }}>{svc.name}</span>
                      <Badge className="text-xs px-1.5 py-0 ml-2 flex-shrink-0" style={{ background: getStatusBg(svc.status), color: getStatusColor(svc.status), border: `1px solid ${getStatusColor(svc.status)}44` }}>
                        {svc.status}
                      </Badge>
                    </div>
                    <div className="text-xs mb-1" style={{ color: "#8892A4" }}>{svc.version}</div>
                    <div className="flex gap-4">
                      <div>
                        <div className="text-xs mb-0.5" style={{ color: "#8892A4" }}>CPU</div>
                        <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "#1A2744" }}>
                          <div className="h-full rounded-full" style={{ width: `${svc.cpu}%`, background: svc.cpu > 70 ? "#FF4D4D" : svc.cpu > 50 ? "#FFB800" : "#00D4FF" }} />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs mb-0.5" style={{ color: "#8892A4" }}>Memory</div>
                        <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "#1A2744" }}>
                          <div className="h-full rounded-full" style={{ width: `${svc.memory}%`, background: svc.memory > 80 ? "#FF4D4D" : svc.memory > 60 ? "#FFB800" : "#00FF88" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Stats */}
      {!isLoading && status?.networkStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Ingress", value: `${status.networkStats.ingressMbps} Mbps`, icon: <Network size={16} />, color: "#00D4FF" },
            { label: "Egress", value: `${status.networkStats.egressMbps} Mbps`, icon: <Network size={16} />, color: "#0066FF" },
            { label: "Active Connections", value: status.networkStats.activeConnections.toLocaleString(), icon: <Wifi size={16} />, color: "#00FF88" },
            { label: "TLS Handshakes/min", value: status.networkStats.tlsHandshakesPerMin.toLocaleString(), icon: <Lock size={16} />, color: "#FFB800" },
          ].map((stat) => (
            <Card key={stat.label} style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span className="text-xs" style={{ color: "#8892A4" }}>{stat.label}</span>
                </div>
                <div className="text-xl font-bold" style={{ color: "#FFFFFF" }}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Channel Connectivity */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Globe size={16} style={{ color: "#00D4FF" }} />
            Omnichannel Connectivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" style={{ background: "#1A2744" }} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Infinity AI Platform */}
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#0A1628", border: "1px solid #00D4FF33" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#00D4FF22" }}>
                    <Shield size={16} style={{ color: "#00D4FF" }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Infinity AI Platform (Super Admin)</div>
                    <div className="text-xs" style={{ color: "#8892A4" }}>
                      Latency: {connectivity?.infinityAiPlatform.latencyMs}ms · Last heartbeat: just now
                    </div>
                  </div>
                </div>
                <Badge style={{ background: "#00FF8822", color: "#00FF88", border: "1px solid #00FF8844" }}>Connected</Badge>
              </div>

              {/* Channels */}
              {(connectivity?.channels ?? []).map((ch: any) => (
                <div key={ch.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#0A1628", border: "1px solid #1A2744" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1A2744" }}>
                      <Globe size={16} style={{ color: "#8892A4" }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{ch.name}</div>
                      <div className="text-xs" style={{ color: "#8892A4" }}>
                        {ch.activeUsers.toLocaleString()} active users
                      </div>
                    </div>
                  </div>
                  <Badge style={{ background: "#00FF8822", color: "#00FF88", border: "1px solid #00FF8844" }}>
                    {ch.status}
                  </Badge>
                </div>
              ))}

              {/* Data Sources */}
              {(connectivity?.dataSources ?? []).slice(0, 3).map((ds: any) => (
                <div key={ds.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#0A1628", border: "1px solid #1A2744" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1A2744" }}>
                      <Database size={16} style={{ color: "#8892A4" }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{ds.name}</div>
                      <div className="text-xs" style={{ color: "#8892A4" }}>
                        {ds.type?.replace("_", " ")} · {Number(ds.recordsIngested).toLocaleString()} records
                      </div>
                    </div>
                  </div>
                  <Badge style={{
                    background: ds.status === "connected" ? "#00FF8822" : "#FFB80022",
                    color: ds.status === "connected" ? "#00FF88" : "#FFB800",
                    border: `1px solid ${ds.status === "connected" ? "#00FF8844" : "#FFB80044"}`
                  }}>
                    {ds.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
