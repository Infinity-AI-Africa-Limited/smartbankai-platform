import { trpc } from "@/lib/trpc";
import { DEMO_TENANT_ID } from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Smartphone, Monitor, Phone, Building2, Clock, Users, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { formatDistanceToNow } from "date-fns";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  mobile_app: <Smartphone size={16} />,
  web_banking: <Monitor size={16} />,
  ussd: <Phone size={16} />,
  branch: <Building2 size={16} />,
  atm: <Activity size={16} />,
};

const CHANNEL_COLORS: Record<string, string> = {
  mobile_app: "#00D4FF",
  web_banking: "#0066FF",
  ussd: "#F47558",
  branch: "#FFB800",
  atm: "#A855F7",
};

const sessionTrend = [
  { day: "Mon", mobile: 4200, web: 1800, ussd: 890 },
  { day: "Tue", mobile: 4800, web: 2100, ussd: 920 },
  { day: "Wed", mobile: 5200, web: 2400, ussd: 1050 },
  { day: "Thu", mobile: 4900, web: 2200, ussd: 980 },
  { day: "Fri", mobile: 6100, web: 2800, ussd: 1200 },
  { day: "Sat", mobile: 5400, web: 1900, ussd: 760 },
  { day: "Sun", mobile: 3800, web: 1400, ussd: 620 },
];

export default function TenantChannels() {
  const { data: stats, isLoading: statsLoading } = trpc.tenantChannels.stats.useQuery({ tenantId: DEMO_TENANT_ID });
  const { data: sessions, isLoading: sessionsLoading } = trpc.tenantChannels.sessions.useQuery({ tenantId: DEMO_TENANT_ID, limit: 30 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Channel Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
          Omnichannel session data from Web Banking Portal, Mobile Super App, USSD, and Branch systems
        </p>
      </div>

      {/* Channel Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
                <CardContent className="p-4"><Skeleton className="h-16" style={{ background: "#1A2744" }} /></CardContent>
              </Card>
            ))
          : Object.entries(stats ?? {}).map(([channel, count]) => {
              const color = CHANNEL_COLORS[channel] ?? "#8892A4";
              return (
                <Card key={channel} style={{ background: "#0D1527", border: `1px solid ${color}33` }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg" style={{ background: `${color}22` }}>
                        <span style={{ color }}>{CHANNEL_ICONS[channel] ?? <Globe size={16} />}</span>
                      </div>
                    </div>
                    <div className="text-xl font-bold mb-1" style={{ color: "#FFFFFF" }}>
                      {Number(count).toLocaleString()}
                    </div>
                    <div className="text-xs capitalize" style={{ color: "#8892A4" }}>
                      {channel.replace("_", " ")}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Weekly Trend */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Weekly Session Trend by Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
              <XAxis dataKey="day" tick={{ fill: "#8892A4", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8892A4", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0D1527", border: "1px solid #1A2744", borderRadius: 8 }} labelStyle={{ color: "#FFFFFF" }} itemStyle={{ color: "#8892A4" }} />
              <Bar dataKey="mobile" fill="#00D4FF" radius={[2, 2, 0, 0]} name="Mobile App" stackId="a" />
              <Bar dataKey="web" fill="#0066FF" radius={[2, 2, 0, 0]} name="Web Banking" stackId="a" />
              <Bar dataKey="ussd" fill="#F47558" radius={[2, 2, 0, 0]} name="USSD" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card style={{ background: "#0D1527", border: "1px solid #1A2744" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Recent Channel Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #1A2744" }}>
                  {["Session ID", "Channel", "Device", "Duration", "Transactions", "AI Interactions", "Status", "Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "#8892A4" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessionsLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1A2744" }}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-16" style={{ background: "#1A2744" }} /></td>
                        ))}
                      </tr>
                    ))
                  : (sessions ?? []).map((s: any) => {
                      const color = CHANNEL_COLORS[s.channel] ?? "#8892A4";
                      return (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid #1A2744" }}>
                          <td className="px-4 py-3 font-mono" style={{ color: "#00D4FF" }}>{s.sessionId?.slice(0, 16)}…</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span style={{ color }}>{CHANNEL_ICONS[s.channel] ?? <Globe size={12} />}</span>
                              <span className="capitalize" style={{ color }}>{s.channel?.replace("_", " ")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize" style={{ color: "#8892A4" }}>{s.deviceType ?? "unknown"}</td>
                          <td className="px-4 py-3" style={{ color: "#FFFFFF" }}>
                            {s.durationSeconds ? `${Math.floor(s.durationSeconds / 60)}m ${s.durationSeconds % 60}s` : "—"}
                          </td>
                          <td className="px-4 py-3 text-center" style={{ color: "#FFFFFF" }}>{s.transactionCount ?? 0}</td>
                          <td className="px-4 py-3 text-center" style={{ color: "#00D4FF" }}>{s.aiInteractions ?? 0}</td>
                          <td className="px-4 py-3">
                            <Badge className="text-xs px-1.5 py-0" style={{
                              background: s.status === "active" ? "#00FF8822" : "#1A2744",
                              color: s.status === "active" ? "#00FF88" : "#8892A4",
                              border: "none"
                            }}>
                              {s.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3" style={{ color: "#8892A4" }}>
                            {formatDistanceToNow(new Date(s.startedAt), { addSuffix: true })}
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
