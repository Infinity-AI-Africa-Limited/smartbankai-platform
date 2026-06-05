import { useState } from "react";
import WebBankingLayout from "@/components/WebBankingLayout";
import { ArrowLeftRight, Shield, CheckCircle2, AlertTriangle, ChevronRight, Clock, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const RECENT_RECIPIENTS = [
  { name: "Emeka Obi", bank: "Access Bank", account: "0123456789", initials: "EO", color: "#F47558" },
  { name: "Fatima Abdullahi", bank: "Zenith Bank", account: "2109876543", initials: "FA", color: "#3b82f6" },
  { name: "Chukwudi Eze", bank: "GTBank", account: "0567891234", initials: "CE", color: "#10b981" },
  { name: "Ngozi Adeyemi", bank: "UBA", account: "3456789012", initials: "NA", color: "#8b5cf6" },
];

const BANKS = ["Access Bank", "GTBank", "Zenith Bank", "First Bank", "UBA", "Fidelity Bank", "Sterling Bank", "Wema Bank", "Polaris Bank", "FCMB"];

type Step = "form" | "review" | "otp" | "success";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(amount);
}

export default function WebTransfer() {
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("Access Bank");
  const [narration, setNarration] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskScore] = useState(0.08);
  const [resolvedName] = useState("Emeka Obi");

  const handleResolveAccount = () => {
    if (accountNumber.length === 10) {
      toast.success("Account resolved: Emeka Obi");
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountNumber) return;
    setStep("review");
  };

  const handleConfirm = () => {
    setStep("otp");
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 1500);
  };

  const handleReset = () => {
    setStep("form");
    setAmount("");
    setAccountNumber("");
    setNarration("");
    setOtp("");
  };

  return (
    <WebBankingLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Fund Transfer</h1>
          <p className="text-white/40 text-sm mt-0.5">Inter-bank and intra-bank transfers · AI anomaly detection active</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {(["form", "review", "otp", "success"] as Step[]).map((s, i) => {
            const labels = ["Details", "Review", "Verify", "Done"];
            const current = ["form", "review", "otp", "success"].indexOf(step);
            const isActive = i === current;
            const isDone = i < current;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${i < 3 ? "flex-1" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone ? "bg-emerald-500 text-white" : isActive ? "bg-[#F47558] text-white" : "bg-white/10 text-white/40"
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-white" : "text-white/40"}`}>{labels[i]}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px ${isDone ? "bg-emerald-500/50" : "bg-white/10"}`} />}
              </div>
            );
          })}
        </div>

        {step === "form" && (
          <form onSubmit={handleProceed} className="space-y-5">
            {/* Recent Recipients */}
            <div className="web-card p-4">
              <p className="text-white/50 text-sm font-medium mb-3">Recent Recipients</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RECENT_RECIPIENTS.map(r => (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => { setAccountNumber(r.account); setSelectedBank(r.bank); }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `${r.color}25` }}>
                      {r.initials}
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs font-medium truncate w-full">{r.name.split(" ")[0]}</p>
                      <p className="text-white/30 text-xs truncate">{r.bank.split(" ")[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Form */}
            <div className="web-card p-5 space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium block mb-2">Destination Bank</label>
                <select
                  className="w-full web-input h-11 px-3 rounded-xl text-sm bg-transparent border border-white/10 text-white cursor-pointer"
                  value={selectedBank}
                  onChange={e => setSelectedBank(e.target.value)}
                >
                  {BANKS.map(b => <option key={b} value={b} className="bg-[#0d1b2a]">{b}</option>)}
                </select>
              </div>

              <div>
                <label className="text-white/70 text-sm font-medium block mb-2">Account Number</label>
                <div className="flex gap-2">
                  <Input
                    className="web-input h-11 flex-1"
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                  />
                  <Button type="button" className="web-btn-secondary border-0 h-11 px-4" onClick={handleResolveAccount}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                {accountNumber.length === 10 && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <p className="text-emerald-400 text-xs font-medium">{resolvedName}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-white/70 text-sm font-medium block mb-2">Amount (NGN)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-medium">₦</span>
                  <Input
                    className="web-input h-11 pl-7"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  />
                </div>
                {amount && Number(amount) > 0 && (
                  <p className="text-white/40 text-xs mt-1">
                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(amount))}
                  </p>
                )}
              </div>

              <div>
                <label className="text-white/70 text-sm font-medium block mb-2">Narration (Optional)</label>
                <Input
                  className="web-input h-11"
                  placeholder="e.g. Rent payment, School fees..."
                  value={narration}
                  onChange={e => setNarration(e.target.value)}
                />
              </div>

              {/* AI Risk Assessment */}
              <div className="web-ai-insight flex items-start gap-3">
                <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/80 text-xs font-medium">AI Fraud Assessment</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    Risk score: <span className="text-emerald-400 font-medium">Low ({(riskScore * 100).toFixed(0)}%)</span> — Transfer pattern matches your history
                  </p>
                </div>
              </div>

              <Button type="submit" className="web-btn-primary w-full h-11" disabled={!amount || !accountNumber}>
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        )}

        {step === "review" && (
          <div className="web-card p-6 space-y-5">
            <h2 className="text-white font-semibold text-lg">Review Transfer</h2>

            <div className="space-y-3">
              {[
                { label: "Recipient", value: resolvedName },
                { label: "Bank", value: selectedBank },
                { label: "Account Number", value: accountNumber },
                { label: "Amount", value: formatNaira(Number(amount)) },
                { label: "Narration", value: narration || "No narration" },
                { label: "Transaction Fee", value: "₦52.50" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/6">
                  <p className="text-white/50 text-sm">{label}</p>
                  <p className="text-white text-sm font-medium">{value}</p>
                </div>
              ))}
              <div className="flex items-center justify-between py-2.5">
                <p className="text-white font-semibold">Total Debit</p>
                <p className="text-[#F47558] font-bold text-lg">{formatNaira(Number(amount) + 52.5)}</p>
              </div>
            </div>

            <div className="web-ai-insight flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white/80 text-xs font-medium">AI Fraud Check Passed</p>
                <p className="text-white/40 text-xs mt-0.5">This transfer has been verified by the Fraud Detection Agent. Risk score: Low</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="web-btn-secondary border-0 flex-1 h-11" onClick={() => setStep("form")}>Back</Button>
              <Button className="web-btn-primary flex-1 h-11" onClick={handleConfirm}>Confirm Transfer</Button>
            </div>
          </div>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtp} className="web-card p-6 space-y-5">
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">Verify Transfer</h2>
              <p className="text-white/50 text-sm">Enter the OTP sent to ••••7823</p>
            </div>

            <Input
              className="web-input h-14 text-center text-2xl tracking-[0.5em] font-bold"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
            />

            <div className="flex gap-3">
              <Button type="button" className="web-btn-secondary border-0 flex-1 h-11" onClick={() => setStep("review")}>Back</Button>
              <Button type="submit" className="web-btn-primary flex-1 h-11" disabled={otp.length < 6 || loading}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Authorize"}
              </Button>
            </div>
          </form>
        )}

        {step === "success" && (
          <div className="web-card p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl mb-2">Transfer Successful!</h2>
              <p className="text-white/50">
                {formatNaira(Number(amount))} has been sent to <strong className="text-white">{resolvedName}</strong> at {selectedBank}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Reference</span>
                <span className="text-white font-mono">TXN-{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Time</span>
                <span className="text-white">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">AI Fraud Score</span>
                <span className="text-emerald-400">Low (8%)</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="web-btn-secondary border-0 flex-1 h-11" onClick={handleReset}>New Transfer</Button>
              <Button className="web-btn-primary flex-1 h-11" onClick={() => window.location.href = "/web/transactions"}>View Transactions</Button>
            </div>
          </div>
        )}
      </div>
    </WebBankingLayout>
  );
}
