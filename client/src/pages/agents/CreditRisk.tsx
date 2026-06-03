import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AgentBadge } from "@/components/AgentBadge";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, CheckCircle, XCircle, AlertCircle, Calculator } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const recColors = { approve: "text-emerald-400", decline: "text-red-400", review: "text-amber-400" };
const recBg = { approve: "bg-emerald-500/10 border-emerald-500/20", decline: "bg-red-500/10 border-red-500/20", review: "bg-amber-500/10 border-amber-500/20" };

export default function CreditRisk() {
  const [form, setForm] = useState({ applicantName: "", monthlyIncome: "", requestedAmount: "", employmentStatus: "employed", mobileMoneyScore: "65" });
  const [scoreResult, setScoreResult] = useState<any>(null);
  const appsQuery = trpc.credit.applications.useQuery({});
  const scoreMutation = trpc.credit.score.useMutation({
    onSuccess: (data) => { setScoreResult(data); toast.success("Credit score computed"); },
    onError: (e) => toast.error(e.message),
  });

  const apps = appsQuery.data ?? [];
  const approvedCount = apps.filter((a) => a.recommendation === "approve").length;
  const declinedCount = apps.filter((a) => a.recommendation === "decline").length;
  const reviewCount = apps.filter((a) => a.recommendation === "review").length;

  const scoreGaugeData = scoreResult ? [{ value: scoreResult.score, fill: scoreResult.score >= 650 ? "#10B981" : scoreResult.score >= 500 ? "#F59E0B" : "#EF4444" }] : [];

  return (
    <div className="space-y-6 animate-fade-up">
      <AgentBadge name="Credit Risk" size="lg" showDesc />

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Applications" value={apps.length} icon={TrendingUp} color="blue" />
        <StatCard title="Approved" value={approvedCount} icon={CheckCircle} color="green" />
        <StatCard title="Declined" value={declinedCount} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scoring form */}
        <div className="rounded-xl border border-[#1E2A3A] p-5" style={{ background: "#111827" }}>
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Credit Score Calculator</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-slate-400">Applicant Name</Label>
              <Input value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                placeholder="Full name" className="mt-1 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500 h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400">Monthly Income (₦)</Label>
                <Input type="number" value={form.monthlyIncome} onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                  placeholder="150000" className="mt-1 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Requested Amount (₦)</Label>
                <Input type="number" value={form.requestedAmount} onChange={(e) => setForm({ ...form, requestedAmount: e.target.value })}
                  placeholder="500000" className="mt-1 bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500 h-8 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400">Employment Status</Label>
                <Select value={form.employmentStatus} onValueChange={(v) => setForm({ ...form, employmentStatus: v })}>
                  <SelectTrigger className="mt-1 bg-white/5 border-[#1E2A3A] text-white h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-[#1E2A3A]">
                    <SelectItem value="employed" className="text-white">Employed</SelectItem>
                    <SelectItem value="self_employed" className="text-white">Self-Employed</SelectItem>
                    <SelectItem value="unemployed" className="text-white">Unemployed</SelectItem>
                    <SelectItem value="student" className="text-white">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-400">Mobile Money Score (0–100)</Label>
                <Input type="number" value={form.mobileMoneyScore} onChange={(e) => setForm({ ...form, mobileMoneyScore: e.target.value })}
                  min="0" max="100" className="mt-1 bg-white/5 border-[#1E2A3A] text-white h-8 text-sm" />
              </div>
            </div>
            <Button className="w-full gradient-brand text-white h-9 text-sm"
              disabled={!form.monthlyIncome || !form.requestedAmount || scoreMutation.isPending}
              onClick={() => scoreMutation.mutate({
                applicantName: form.applicantName || "Anonymous",
                monthlyIncome: parseFloat(form.monthlyIncome),
                requestedAmount: parseFloat(form.requestedAmount),
                employmentStatus: form.employmentStatus,
                mobileMoneyScore: parseFloat(form.mobileMoneyScore),
              })}>
              {scoreMutation.isPending ? "Computing..." : "Compute Credit Score"}
            </Button>
          </div>
        </div>

        {/* Score result */}
        <div className="rounded-xl border border-[#1E2A3A] p-5 flex flex-col" style={{ background: "#111827" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Score Result</h3>
          {!scoreResult ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Run the calculator to see results
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <ResponsiveContainer width={100} height={100}>
                    <RadialBarChart innerRadius={30} outerRadius={45} data={scoreGaugeData} startAngle={90} endAngle={-270}>
                      <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#1E2A3A" }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{scoreResult.score}</span>
                  </div>
                </div>
                <div>
                  <div className={cn("text-2xl font-bold capitalize", recColors[scoreResult.recommendation as keyof typeof recColors])}>
                    {scoreResult.recommendation === "approve" ? "✓ Approve" : scoreResult.recommendation === "decline" ? "✗ Decline" : "⚠ Review"}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Confidence: {scoreResult.confidence}%</div>
                  <Badge className={cn("text-[10px] border mt-1 capitalize", recBg[scoreResult.recommendation as keyof typeof recBg], recColors[scoreResult.recommendation as keyof typeof recColors])}>
                    {scoreResult.recommendation}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Scoring Factors</p>
                {scoreResult.factors.map((f: any) => (
                  <div key={f.factor} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{f.factor}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 rounded-full bg-white/10">
                        <div className={cn("h-full rounded-full", f.impact === "positive" ? "bg-emerald-400" : f.impact === "negative" ? "bg-red-400" : "bg-slate-400")}
                          style={{ width: `${f.weight}%` }} />
                      </div>
                      <span className={cn("font-mono w-6 text-right", f.impact === "positive" ? "text-emerald-400" : f.impact === "negative" ? "text-red-400" : "text-slate-400")}>
                        {f.weight}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applications table */}
      <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#111827" }}>
        <div className="p-4 border-b border-[#1E2A3A]">
          <h3 className="text-sm font-semibold text-white">Recent Applications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                {["Applicant", "Amount Requested", "Credit Score", "Alt. Data Score", "Recommendation", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.slice(0, 8).map((a) => (
                <tr key={a.id} className="border-b border-[#1E2A3A]/50 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white text-sm">{a.applicantName}</div>
                    <div className="text-xs text-slate-500">{a.applicantId}</div>
                  </td>
                  <td className="px-4 py-3 text-white">₦{parseFloat(String(a.requestedAmount ?? "0")).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn("font-mono font-semibold text-sm",
                      (a.creditScore ?? 0) >= 650 ? "text-emerald-400" : (a.creditScore ?? 0) >= 500 ? "text-amber-400" : "text-red-400")}>
                      {a.creditScore ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-sm">{a.alternativeDataScore ?? "—"}</td>
                  <td className="px-4 py-3">
                    {a.recommendation ? (
                      <Badge className={cn("text-[10px] border capitalize", recBg[a.recommendation as keyof typeof recBg], recColors[a.recommendation as keyof typeof recColors])}>
                        {a.recommendation === "approve" ? "✓ " : a.recommendation === "decline" ? "✗ " : "⚠ "}{a.recommendation}
                      </Badge>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn("text-[10px] border capitalize",
                      a.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      a.status === "declined" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      a.status === "under_review" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    )}>
                      {a.status?.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
