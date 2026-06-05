import { useState } from "react";
import MobileAppLayout from "@/components/MobileAppLayout";
import { ArrowLeftRight, CheckCircle2, Sparkles, AlertTriangle, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BENEFICIARIES = [
  { name: "Emeka Obi", bank: "GTBank", account: "0123456789", initial: "EO" },
  { name: "Ngozi Adeyemi", bank: "Zenith Bank", account: "2109876543", initial: "NA" },
  { name: "Chukwudi Eze", bank: "Access Bank", account: "0987654321", initial: "CE" },
  { name: "Fatima Bello", bank: "UBA", account: "3012345678", initial: "FB" },
];

const BANKS = ["First Bank Nigeria", "GTBank", "Zenith Bank", "Access Bank", "UBA", "Fidelity Bank", "FCMB", "Sterling Bank", "Wema Bank", "Polaris Bank", "Kuda Bank", "Opay", "PalmPay", "Moniepoint"];

type Step = "form" | "confirm" | "processing" | "success";

function formatNaira(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

export default function MobileTransfer() {
  const [step, setStep] = useState<Step>("form");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [aiWarning, setAiWarning] = useState(false);

  const handleAccountBlur = () => {
    if (account.length >= 10 && bank) {
      setResolving(true);
      setTimeout(() => {
        setResolvedName("EMEKA CHUKWUDI OBI");
        setResolving(false);
      }, 800);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > 500000) setAiWarning(true);
    setStep("confirm");
  };

  const handleSend = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      toast.success("Transfer successful!");
    }, 2000);
  };

  return (
    <MobileAppLayout title="Transfer" showBack>
      <div className="px-4 pt-2 pb-6">

        {step === "form" && (
          <div className="space-y-4">
            {/* Beneficiaries */}
            <div>
              <p className="text-white/40 text-xs font-medium mb-3 uppercase tracking-wider">Recent Beneficiaries</p>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {BENEFICIARIES.map(b => (
                  <button
                    key={b.name}
                    onClick={() => { setBank(b.bank); setAccount(b.account); setResolvedName(b.name.toUpperCase()); }}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center">
                      <span className="text-[#F47558] font-bold text-sm">{b.initial}</span>
                    </div>
                    <span className="text-white/50 text-[10px] font-medium text-center w-14 truncate">{b.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleContinue} className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-medium block mb-2">Destination Bank</label>
                <select
                  className="w-full h-12 px-4 rounded-2xl text-sm bg-white/6 border border-white/10 text-white cursor-pointer"
                  value={bank}
                  onChange={e => setBank(e.target.value)}
                  required
                >
                  <option value="" className="bg-[#0d1b2a]">Select bank...</option>
                  {BANKS.map(b => <option key={b} value={b} className="bg-[#0d1b2a]">{b}</option>)}
                </select>
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium block mb-2">Account Number</label>
                <Input
                  className="web-input h-12 rounded-2xl"
                  placeholder="10-digit account number"
                  value={account}
                  onChange={e => setAccount(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onBlur={handleAccountBlur}
                  maxLength={10}
                  required
                />
                {resolving && <p className="text-white/40 text-xs mt-1.5 animate-pulse">Verifying account...</p>}
                {resolvedName && !resolving && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <p className="text-emerald-400 text-xs font-medium">{resolvedName}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium block mb-2">Amount (NGN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">₦</span>
                  <Input
                    className="web-input h-12 rounded-2xl pl-8 text-lg font-semibold"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                    required
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[5000, 10000, 20000, 50000].map(v => (
                    <button key={v} type="button" onClick={() => setAmount(v.toString())}
                      className="flex-1 py-1.5 rounded-xl bg-white/5 border border-white/8 text-white/50 text-xs hover:bg-white/8 transition-all">
                      ₦{v >= 1000 ? `${v/1000}k` : v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium block mb-2">Narration (optional)</label>
                <Input
                  className="web-input h-12 rounded-2xl"
                  placeholder="What's this for?"
                  value={narration}
                  onChange={e => setNarration(e.target.value)}
                />
              </div>

              <Button type="submit" className="web-btn-primary w-full h-12 rounded-2xl text-base" disabled={!bank || !account || !amount || !resolvedName}>
                Continue
              </Button>
            </form>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Transfer Details</p>
              {[
                { label: "To", value: resolvedName || "EMEKA CHUKWUDI OBI" },
                { label: "Bank", value: bank },
                { label: "Account", value: account },
                { label: "Amount", value: formatNaira(Number(amount)), highlight: true },
                { label: "Fee", value: "₦52.50" },
                { label: "Total Debit", value: formatNaira(Number(amount) + 52.5), bold: true },
                { label: "Narration", value: narration || "Transfer" },
              ].map(({ label, value, highlight, bold }) => (
                <div key={label} className="flex justify-between items-center">
                  <p className="text-white/40 text-sm">{label}</p>
                  <p className={`text-sm ${highlight ? "text-[#F47558] font-bold text-lg" : bold ? "text-white font-bold" : "text-white font-medium"}`}>{value}</p>
                </div>
              ))}
            </div>

            {aiWarning && (
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">AI Fraud Alert</p>
                  <p className="text-white/50 text-xs mt-0.5">This transfer is larger than your usual pattern. Fraud Detection Agent flagged it for review. Proceed only if you initiated this.</p>
                </div>
              </div>
            )}

            <div className="bg-[#F47558]/8 border border-[#F47558]/15 rounded-2xl p-3.5 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#F47558] shrink-0" />
              <p className="text-white/60 text-xs">AI verification complete. Account name matches your saved beneficiary. Transaction cleared by SmartBank AI.</p>
            </div>

            <div className="flex gap-3">
              <Button className="web-btn-secondary border-0 flex-1 h-12 rounded-2xl" onClick={() => setStep("form")}>Back</Button>
              <Button className="web-btn-primary flex-1 h-12 rounded-2xl text-base" onClick={handleSend}>Send Money</Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-20 space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#F47558]/30 border-t-[#F47558] rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">Processing Transfer</p>
              <p className="text-white/40 text-sm mt-1">Routing via NIBSS...</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-2xl">{formatNaira(Number(amount))}</p>
              <p className="text-white/50 mt-1">Sent to {resolvedName || "Beneficiary"}</p>
              <p className="text-white/30 text-sm mt-0.5">{bank} · {account}</p>
            </div>
            <div className="w-full bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
              <p className="text-white/40 text-xs">Transaction Reference</p>
              <p className="text-white font-mono text-sm mt-0.5">TXN{Date.now().toString().slice(-10)}</p>
            </div>
            <Button className="web-btn-primary w-full h-12 rounded-2xl" onClick={() => setStep("form")}>
              New Transfer
            </Button>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
}
