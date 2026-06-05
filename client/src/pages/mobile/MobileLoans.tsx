import { useState } from "react";
import MobileAppLayout from "@/components/MobileAppLayout";
import { PiggyBank, Sparkles, CheckCircle2, Clock, TrendingUp, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const LOAN_PRODUCTS = [
  { name: "Quick Cash", max: 500000, rate: "2.5%/month", duration: "1–6 months", icon: "⚡", color: "#F47558" },
  { name: "Salary Advance", max: 2000000, rate: "1.8%/month", duration: "1–12 months", icon: "💼", color: "#3b82f6" },
  { name: "Business Loan", max: 10000000, rate: "2.2%/month", duration: "6–24 months", icon: "🏢", color: "#10b981" },
  { name: "Asset Finance", max: 5000000, rate: "1.5%/month", duration: "12–36 months", icon: "🏠", color: "#8b5cf6" },
];

type View = "overview" | "apply" | "status";

export default function MobileLoans() {
  const [view, setView] = useState<View>("overview");
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [loanAmount, setLoanAmount] = useState("");
  const [tenure, setTenure] = useState("6");
  const [scoring, setScoring] = useState(false);
  const [scored, setScored] = useState(false);

  const { data: creditApps } = trpc.credit.applications.useQuery({ tenantId: 1 });
  const applications = Array.isArray(creditApps) ? creditApps.slice(0, 3) : [];

  const monthly = loanAmount && tenure
    ? (Number(loanAmount) * (1 + 0.025 * Number(tenure))) / Number(tenure)
    : 0;

  const handleScore = () => {
    setScoring(true);
    setTimeout(() => { setScoring(false); setScored(true); }, 2000);
  };

  const handleApply = () => {
    toast.success("Loan application submitted! Reference: LA" + Date.now().toString().slice(-8));
    setView("status");
  };

  return (
    <MobileAppLayout title="Loans" showBack>
      <div className="px-4 pt-2 pb-6">

        {view === "overview" && (
          <div className="space-y-5">
            {/* Active Loan */}
            <div className="bg-gradient-to-br from-[#1B365D] to-[#0d2444] rounded-3xl p-5 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white/50 text-xs">Active Loan</p>
                  <p className="text-white font-bold text-2xl mt-0.5">₦312,500</p>
                  <p className="text-white/40 text-xs mt-0.5">Salary Advance · 12% p.a.</p>
                </div>
                <span className="bg-emerald-500/15 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20">Current</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/40">
                  <span>Repaid: ₦187,500</span>
                  <span>Remaining: ₦312,500</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F47558] rounded-full" style={{ width: "37.5%" }} />
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>37.5% repaid</span>
                  <span>Next: ₦25,000 · Jun 15</span>
                </div>
              </div>
            </div>

            {/* Credit Score */}
            <div className="bg-white/4 border border-white/8 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 font-bold text-xl">742</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Credit Score: Good</p>
                <p className="text-white/40 text-xs mt-0.5">Eligible for up to ₦2,000,000</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Sparkles className="w-3 h-3 text-[#F47558]" />
                  <p className="text-[#F47558] text-xs">SmartBank AI Credit Agent</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>

            {/* Loan Products */}
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Available Products</p>
              <div className="space-y-2">
                {LOAN_PRODUCTS.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => { setSelectedProduct(i); setView("apply"); }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/6 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${p.color}15` }}>
                      {p.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-white/40 text-xs">Up to ₦{(p.max / 1000000).toFixed(1)}M · {p.rate}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            {applications.length > 0 && (
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Recent Applications</p>
                <div className="space-y-2">
                  {applications.map((app: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/4 border border-white/6">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        app.status === "approved" ? "bg-emerald-500/15" :
                        app.status === "rejected" ? "bg-red-500/10" : "bg-amber-500/10"
                      }`}>
                        {app.status === "approved" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                         app.status === "rejected" ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                         <Clock className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">₦{Number(app.requestedAmount).toLocaleString()}</p>
                        <p className="text-white/40 text-xs capitalize">{app.status} · Score: {app.creditScore}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "apply" && (
          <div className="space-y-4">
            <div className="bg-white/4 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{LOAN_PRODUCTS[selectedProduct].icon}</span>
              <div>
                <p className="text-white font-semibold">{LOAN_PRODUCTS[selectedProduct].name}</p>
                <p className="text-white/40 text-xs">{LOAN_PRODUCTS[selectedProduct].rate} · {LOAN_PRODUCTS[selectedProduct].duration}</p>
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs font-medium block mb-2">Loan Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">₦</span>
                <Input className="web-input h-12 rounded-2xl pl-8 text-lg font-semibold" placeholder="0"
                  value={loanAmount} onChange={e => { setLoanAmount(e.target.value.replace(/\D/g, "")); setScored(false); }} />
              </div>
              <p className="text-white/30 text-xs mt-1">Max: ₦{(LOAN_PRODUCTS[selectedProduct].max / 1000000).toFixed(1)}M</p>
            </div>

            <div>
              <label className="text-white/60 text-xs font-medium block mb-2">Tenure (months)</label>
              <div className="flex gap-2">
                {["3", "6", "12", "24"].map(t => (
                  <button key={t} onClick={() => setTenure(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      tenure === t ? "bg-[#F47558]/15 border border-[#F47558]/30 text-[#F47558]" : "bg-white/5 border border-white/10 text-white/50"
                    }`}>{t}m</button>
                ))}
              </div>
            </div>

            {loanAmount && (
              <div className="bg-white/4 border border-white/8 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Monthly Repayment</span>
                  <span className="text-white font-semibold">₦{monthly.toLocaleString("en-NG", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Repayment</span>
                  <span className="text-white font-semibold">₦{(monthly * Number(tenure)).toLocaleString("en-NG", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Interest</span>
                  <span className="text-[#F47558] font-semibold">₦{((monthly * Number(tenure)) - Number(loanAmount)).toLocaleString("en-NG", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            )}

            {scored && (
              <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">AI Pre-Approval: Likely Approved</p>
                  <p className="text-white/50 text-xs mt-0.5">Credit Score 742 · Debt-to-Income 28% · SmartBank AI recommends approval with standard terms.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button className="web-btn-secondary border-0 flex-1 h-12 rounded-2xl" onClick={() => setView("overview")}>Back</Button>
              {!scored ? (
                <Button className="web-btn-primary flex-1 h-12 rounded-2xl" onClick={handleScore} disabled={!loanAmount || scoring}>
                  {scoring ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Scoring...</span> : "Check Eligibility"}
                </Button>
              ) : (
                <Button className="web-btn-primary flex-1 h-12 rounded-2xl" onClick={handleApply}>Apply Now</Button>
              )}
            </div>
          </div>
        )}

        {view === "status" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl">Application Submitted!</p>
              <p className="text-white/50 mt-1 text-sm">SmartBank AI Credit Agent is reviewing your application</p>
            </div>
            <div className="w-full space-y-3">
              {["Application Received", "AI Credit Scoring", "Risk Assessment", "Decision"].map((s, i) => (
                <div key={s} className="flex items-center gap-3 p-3 rounded-2xl bg-white/4 border border-white/6">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/30"}`}>
                    {i < 2 ? "✓" : i + 1}
                  </div>
                  <p className={`text-sm ${i < 2 ? "text-white" : "text-white/40"}`}>{s}</p>
                  {i === 1 && <Sparkles className="w-3.5 h-3.5 text-[#F47558] ml-auto" />}
                </div>
              ))}
            </div>
            <Button className="web-btn-primary w-full h-12 rounded-2xl" onClick={() => setView("overview")}>Back to Loans</Button>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
}
