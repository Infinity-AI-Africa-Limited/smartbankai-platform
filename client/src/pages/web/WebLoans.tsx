import { useState } from "react";
import WebBankingLayout from "@/components/WebBankingLayout";
import { PiggyBank, TrendingUp, CheckCircle2, Clock, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LOAN_PRODUCTS = [
  {
    id: "salary",
    name: "Salary Advance",
    description: "Get up to 50% of your next salary instantly",
    maxAmount: 225000,
    rate: "2% flat/month",
    tenure: "1 month",
    color: "#10b981",
    eligibility: "Eligible",
    preApproved: true,
  },
  {
    id: "personal",
    name: "Personal Loan",
    description: "Flexible personal loan for any purpose",
    maxAmount: 2000000,
    rate: "18% p.a.",
    tenure: "Up to 24 months",
    color: "#F47558",
    eligibility: "Eligible",
    preApproved: true,
  },
  {
    id: "business",
    name: "SME Business Loan",
    description: "Grow your business with affordable financing",
    maxAmount: 10000000,
    rate: "22% p.a.",
    tenure: "Up to 36 months",
    color: "#3b82f6",
    eligibility: "Conditional",
    preApproved: false,
  },
  {
    id: "asset",
    name: "Asset Finance",
    description: "Finance vehicles, equipment, and assets",
    maxAmount: 5000000,
    rate: "20% p.a.",
    tenure: "Up to 48 months",
    color: "#8b5cf6",
    eligibility: "Eligible",
    preApproved: false,
  },
];

const ACTIVE_LOANS = [
  {
    id: "LN-2024-00142",
    type: "Personal Loan",
    amount: 500000,
    outstanding: 312500,
    monthlyPayment: 25000,
    nextPayment: "Jun 15, 2024",
    progress: 37.5,
    status: "current",
  },
];

type Step = "select" | "apply" | "scoring" | "offer" | "success";

function formatNaira(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

export default function WebLoans() {
  const [step, setStep] = useState<Step>("select");
  const [selectedProduct, setSelectedProduct] = useState<typeof LOAN_PRODUCTS[0] | null>(null);
  const [loanAmount, setLoanAmount] = useState("");
  const [tenure, setTenure] = useState("12");
  const [purpose, setPurpose] = useState("");
  const [scoring, setScoring] = useState(false);
  const [scoreResult] = useState({ score: 742, approved: true, rate: "18%", maxAmount: 2000000 });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("scoring");
    setScoring(true);
    setTimeout(() => { setScoring(false); setStep("offer"); }, 2500);
  };

  const monthlyPayment = selectedProduct && loanAmount && tenure
    ? (Number(loanAmount) * (1 + (parseFloat(selectedProduct.rate) / 100))) / Number(tenure)
    : 0;

  return (
    <WebBankingLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Loans & Credit</h1>
          <p className="text-white/40 text-sm mt-0.5">AI-powered credit scoring · Instant decisions</p>
        </div>

        {/* Active Loans */}
        {ACTIVE_LOANS.length > 0 && (
          <div className="web-card p-5">
            <h3 className="text-white font-semibold mb-4">Active Loans</h3>
            {ACTIVE_LOANS.map(loan => (
              <div key={loan.id} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">{loan.type}</p>
                    <p className="text-white/40 text-xs mt-0.5">{loan.id}</p>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-xs">Current</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-white/40 text-xs">Original Amount</p>
                    <p className="text-white font-semibold text-sm">{formatNaira(loan.amount)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Outstanding</p>
                    <p className="text-[#F47558] font-semibold text-sm">{formatNaira(loan.outstanding)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Next Payment</p>
                    <p className="text-white font-semibold text-sm">{loan.nextPayment}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>Repayment Progress</span>
                    <span>{loan.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${loan.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === "select" && (
          <div>
            {/* AI Credit Score Banner */}
            <div className="web-card-accent p-4 mb-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#F47558]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">You are pre-approved for up to {formatNaira(2000000)}</p>
                <p className="text-white/50 text-sm">Based on your AI credit score of 742 · Credit Risk Agent</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold text-white">742</p>
                <p className="text-emerald-400 text-xs">Good Score</p>
              </div>
            </div>

            <h3 className="text-white font-semibold mb-3">Available Loan Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LOAN_PRODUCTS.map(product => (
                <div key={product.id} className="web-card p-5 hover:border-white/15 transition-all cursor-pointer" onClick={() => { setSelectedProduct(product); setStep("apply"); }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${product.color}20` }}>
                      <PiggyBank className="w-5 h-5" style={{ color: product.color }} />
                    </div>
                    <Badge className={`border-0 text-xs ${product.preApproved ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/50"}`}>
                      {product.preApproved ? "Pre-Approved" : product.eligibility}
                    </Badge>
                  </div>
                  <h4 className="text-white font-semibold mb-1">{product.name}</h4>
                  <p className="text-white/50 text-sm mb-3">{product.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-white/30">Max Amount</p><p className="text-white font-medium">{formatNaira(product.maxAmount)}</p></div>
                    <div><p className="text-white/30">Interest Rate</p><p className="text-white font-medium">{product.rate}</p></div>
                    <div><p className="text-white/30">Tenure</p><p className="text-white font-medium">{product.tenure}</p></div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-[#F47558] text-sm font-medium">
                    Apply Now <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "apply" && selectedProduct && (
          <form onSubmit={handleApply} className="web-card p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <button type="button" onClick={() => setStep("select")} className="text-white/40 hover:text-white text-sm transition-colors">← Back</button>
              <h3 className="text-white font-semibold">{selectedProduct.name} Application</h3>
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Loan Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-medium">₦</span>
                <Input className="web-input h-11 pl-7" placeholder="0.00" value={loanAmount} onChange={e => setLoanAmount(e.target.value.replace(/[^\d.]/g, ""))} required />
              </div>
              <p className="text-white/30 text-xs mt-1">Maximum: {formatNaira(selectedProduct.maxAmount)}</p>
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Tenure (Months)</label>
              <select className="w-full web-input h-11 px-3 rounded-xl text-sm bg-transparent border border-white/10 text-white cursor-pointer" value={tenure} onChange={e => setTenure(e.target.value)}>
                {[3, 6, 12, 18, 24, 36].map(m => <option key={m} value={m} className="bg-[#0d1b2a]">{m} months</option>)}
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Loan Purpose</label>
              <Input className="web-input h-11" placeholder="e.g. Home renovation, Business expansion..." value={purpose} onChange={e => setPurpose(e.target.value)} required />
            </div>

            {loanAmount && tenure && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-2">Estimated Monthly Payment</p>
                <p className="text-2xl font-bold text-white">{formatNaira(monthlyPayment)}</p>
                <p className="text-white/30 text-xs mt-1">at {selectedProduct.rate} · {tenure} months</p>
              </div>
            )}

            <Button type="submit" className="web-btn-primary w-full h-11">
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Credit Decision
            </Button>
          </form>
        )}

        {step === "scoring" && (
          <div className="web-card p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-2 border-[#F47558]/30 border-t-[#F47558] rounded-full animate-spin" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-2">AI Credit Scoring in Progress</h3>
              <p className="text-white/50 text-sm">Analysing 47 data points including transaction history, income patterns, and alternative data signals...</p>
            </div>
            <div className="flex justify-center gap-6 text-xs text-white/40">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Transaction History</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Income Verification</div>
              <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#F47558]" />Credit Bureau Check</div>
            </div>
          </div>
        )}

        {step === "offer" && selectedProduct && (
          <div className="web-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Loan Approved!</h3>
                <p className="text-white/50 text-sm">AI Credit Score: 742 · Decision time: 2.3 seconds</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-5 space-y-3">
              {[
                { label: "Approved Amount", value: formatNaira(Number(loanAmount)), highlight: true },
                { label: "Interest Rate", value: selectedProduct.rate },
                { label: "Tenure", value: `${tenure} months` },
                { label: "Monthly Payment", value: formatNaira(monthlyPayment) },
                { label: "Total Repayment", value: formatNaira(monthlyPayment * Number(tenure)) },
                { label: "Disbursement", value: "Instant to your account" },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between">
                  <p className="text-white/50 text-sm">{label}</p>
                  <p className={`text-sm font-semibold ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="web-ai-insight flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#F47558] mt-0.5 shrink-0" />
              <p className="text-white/60 text-xs">
                This offer is valid for 24 hours. Based on your spending pattern, the Credit Risk Agent recommends a {tenure}-month tenure to keep your debt-to-income ratio below 30%.
              </p>
            </div>

            <div className="flex gap-3">
              <Button className="web-btn-secondary border-0 flex-1 h-11" onClick={() => setStep("select")}>Decline</Button>
              <Button className="web-btn-primary flex-1 h-11" onClick={() => { setStep("success"); toast.success("Loan disbursed to your account!"); }}>
                Accept & Disburse
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="web-card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-2">Loan Disbursed!</h3>
              <p className="text-white/50">{formatNaira(Number(loanAmount))} has been credited to your account</p>
            </div>
            <Button className="web-btn-primary h-11 px-8" onClick={() => setStep("select")}>View All Loans</Button>
          </div>
        )}
      </div>
    </WebBankingLayout>
  );
}
