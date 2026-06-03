import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users as UsersIcon, Shield, Search, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const roleColors: Record<string, string> = {
  platform_owner: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  tenant_admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  analyst: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  user: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const roleLabels: Record<string, string> = {
  platform_owner: "Platform Owner",
  admin: "Super Admin",
  tenant_admin: "Tenant Admin",
  analyst: "Analyst",
  user: "User",
};

export default function Users() {
  const [search, setSearch] = useState("");
  const usersQuery = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); usersQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const users = (usersQuery.data ?? []).filter((u) =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Role-based access control across all platform users</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 text-xs">
            <Shield className="h-3 w-3" /> RBAC Enforced
          </Badge>
        </div>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { role: "Platform Owner (Super Admin)", desc: "Full platform access, billing, all tenants, all agents", color: "border-amber-500/30 bg-amber-500/5" },
          { role: "Tenant Admin", desc: "Manage own tenant, configure agents, view reports", color: "border-blue-500/30 bg-blue-500/5" },
          { role: "Analyst", desc: "Read-only access to dashboards, reports, and agent outputs", color: "border-purple-500/30 bg-purple-500/5" },
        ].map((r) => (
          <div key={r.role} className={cn("rounded-xl border p-4", r.color)}>
            <div className="text-xs font-semibold text-white mb-1">{r.role}</div>
            <div className="text-[10px] text-slate-400">{r.desc}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
        <div className="flex items-center gap-3 p-4 border-b border-[#1E2A3A]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500 h-8 text-sm" />
          </div>
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">{users.length} users</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                {["User", "Login Method", "Role", "Joined", "Last Sign-in", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-[#1E2A3A]/50">
                    {Array.from({ length: 6 }, (_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-white/5 animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                          {(u.name ?? u.email ?? "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{u.name ?? "—"}</div>
                          <div className="text-xs text-slate-500">{u.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs capitalize">{u.loginMethod ?? "oauth"}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border", roleColors[u.role] ?? roleColors.user)}>
                        {roleLabels[u.role] ?? u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("en-NG")}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(u.lastSignedIn).toLocaleDateString("en-NG")}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role}
                        onValueChange={(v) => updateRoleMutation.mutate({ userId: u.id, role: v as any })}
                      >
                        <SelectTrigger className="w-36 bg-white/5 border-[#1E2A3A] text-white h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-[#1E2A3A]">
                          <SelectItem value="platform_owner" className="text-white text-xs">Platform Owner</SelectItem>
                          <SelectItem value="tenant_admin" className="text-white text-xs">Tenant Admin</SelectItem>
                          <SelectItem value="analyst" className="text-white text-xs">Analyst</SelectItem>
                          <SelectItem value="user" className="text-white text-xs">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
