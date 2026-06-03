import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatCard } from "@/components/ui/stat-card";
import { Building2, Plus, Search, MoreHorizontal, Eye, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  trial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  suspended: "bg-red-500/10 text-red-400 border-red-500/20",
};

const tierColors: Record<string, string> = {
  starter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  growth: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  enterprise: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function Tenants() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const tenantsQuery = trpc.tenants.list.useQuery();
  const statsQuery = trpc.tenants.stats.useQuery();
  const createMutation = trpc.tenants.create.useMutation({
    onSuccess: () => {
      toast.success("Tenant created successfully");
      setShowCreate(false);
      tenantsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const { register, handleSubmit, reset, setValue } = useForm<any>();

  const tenants = (tenantsQuery.data ?? []).filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.contactEmail?.toLowerCase().includes(search.toLowerCase()) ||
    t.country?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = statsQuery.data;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tenant Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage financial institution clients on SmartBank AI</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gradient-brand text-white gap-2">
          <Plus className="h-4 w-4" /> Onboard Tenant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tenants" value={stats?.total ?? "—"} icon={Building2} color="blue" />
        <StatCard title="Active" value={stats?.active ?? "—"} icon={TrendingUp} color="green" />
        <StatCard title="On Trial" value={stats?.trial ?? "—"} icon={Settings} color="gold" />
        <StatCard title="Suspended" value={stats?.suspended ?? "—"} icon={Building2} color="red" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
        <div className="flex items-center gap-3 p-4 border-b border-[#1E2A3A]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500 h-8 text-sm"
            />
          </div>
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
            {tenants.length} tenants
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                {["Institution", "Country", "Tier", "Status", "MAU", "Transactions", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenantsQuery.isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-[#1E2A3A]/50">
                    {Array.from({ length: 7 }, (_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No tenants found. Onboard your first financial institution.</p>
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{t.country ?? "Nigeria"}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border capitalize", tierColors[t.subscriptionTier] ?? tierColors.starter)}>
                        {t.subscriptionTier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] border capitalize", statusColors[t.status] ?? statusColors.inactive)}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{(t.monthlyActiveUsers ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-300">{(t.totalTransactions ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#111827] border-[#1E2A3A]">
                          <Link href={`/tenants/${t.id}`}>
                            <DropdownMenuItem className="text-slate-300 hover:text-white focus:bg-white/5 cursor-pointer gap-2">
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/agents?tenant=${t.id}`}>
                            <DropdownMenuItem className="text-slate-300 hover:text-white focus:bg-white/5 cursor-pointer gap-2">
                              <Settings className="h-3.5 w-3.5" /> Manage Agents
                            </DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tenant Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111827] border-[#1E2A3A] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Onboard New Tenant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-slate-300 text-xs">Institution Name *</Label>
                <Input {...register("name", { required: true })} placeholder="e.g. First Bank Nigeria" className="mt-1 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Slug *</Label>
                <Input {...register("slug", { required: true })} placeholder="first-bank-ng" className="mt-1 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Industry</Label>
                <Input {...register("industry")} placeholder="Commercial Banking" className="mt-1 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Country</Label>
                <Input {...register("country")} defaultValue="Nigeria" className="mt-1 bg-white/5 border-[#1E2A3A] text-white" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Subscription Tier</Label>
                <Select onValueChange={(v) => setValue("subscriptionTier", v)} defaultValue="starter">
                  <SelectTrigger className="mt-1 bg-white/5 border-[#1E2A3A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-[#1E2A3A]">
                    <SelectItem value="starter" className="text-white">Starter</SelectItem>
                    <SelectItem value="growth" className="text-white">Growth</SelectItem>
                    <SelectItem value="enterprise" className="text-white">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Contact Email</Label>
                <Input {...register("contactEmail")} type="email" placeholder="admin@bank.com" className="mt-1 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Contact Phone</Label>
                <Input {...register("contactPhone")} placeholder="+234..." className="mt-1 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" className="text-slate-400" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
              <Button type="submit" className="gradient-brand text-white" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Onboard Tenant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
