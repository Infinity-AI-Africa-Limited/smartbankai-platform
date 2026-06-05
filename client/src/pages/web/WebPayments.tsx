import { useState } from "react";
import WebBankingLayout from "@/components/WebBankingLayout";
import { Zap, Wifi, Tv, Phone, GraduationCap, ShoppingBag, CheckCircle2, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BILL_CATEGORIES = [
  { id: "electricity", label: "Electricity", icon: Zap, color: "#f59e0b", providers: ["EKEDC", "IKEDC", "AEDC", "PHEDC", "EEDC"] },
  { id: "internet", label: "Internet", icon: Wifi, color: "#3b82f6", providers: ["MTN Broadband", "Airtel Broadband", "Spectranet", "Swift Networks"] },
  { id: "tv", label: "Cable TV", icon: Tv, color: "#8b5cf6", providers: ["DSTV", "GOtv", "Startimes", "Showmax"] },
  { id: "airtime", label: "Airtime", icon: Phone, color: "#10b981", providers: ["MTN", "Airtel", "Glo", "9mobile"] },
  { id: "education", label: "Education", icon: GraduationCap, color: "#F47558", providers: ["WAEC", "JAMB", "NECO", "School Fees"] },
  { id: "shopping", label: "Vouchers", icon: ShoppingBag, color: "#06b6d4", providers: ["Jumia Voucher", "Konga Voucher", "Amazon Gift Card"] },
];

const RECENT_BILLS = [
  { label: "DSTV Premium", amount: 24500, provider: "DSTV", icon: Tv, color: "#8b5cf6", lastPaid: "Jun 1" },
  { label: "MTN Airtime", amount: 5000, provider: "MTN", icon: Phone, color: "#10b981", lastPaid: "Jun 2" },
  { label: "EKEDC Electricity", amount: 18500, provider: "EKEDC", icon: Zap, color: "#f59e0b", lastPaid: "May 30" },
];

export default function WebPayments() {
  const [selected, setSelected] = useState<string | null>(null);
  const [provider, setProvider] = useState("");
  const [accountRef, setAccountRef] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedCat = BILL_CATEGORIES.find(c => c.id === selected);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaid(true);
      toast.success(`${provider} payment of ₦${Number(amount).toLocaleString()} successful!`);
    }, 1500);
  };

  return (
    <WebBankingLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bill Payments</h1>
          <p className="text-white/40 text-sm mt-0.5">Pay bills, buy airtime, and manage subscriptions</p>
        </div>

        {/* Quick Pay Recent */}
        <div className="web-card p-5">
          <p className="text-white/60 text-sm font-medium mb-3">Quick Pay — Recent Bills</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RECENT_BILLS.map(bill => {
              const Icon = bill.icon;
              return (
                <button
                  key={bill.label}
                  onClick={() => { setSelected(BILL_CATEGORIES.find(c => c.providers.includes(bill.provider))?.id || null); setProvider(bill.provider); setAmount(bill.amount.toString()); }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${bill.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: bill.color }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{bill.label}</p>
                    <p className="text-white/40 text-xs">₦{bill.amount.toLocaleString()} · Last: {bill.lastPaid}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Grid */}
        <div>
          <p className="text-white/60 text-sm font-medium mb-3">Select Category</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {BILL_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelected(cat.id); setProvider(""); setAmount(""); setPaid(false); }}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all ${
                    selected === cat.id
                      ? "border-[#F47558]/50 bg-[#F47558]/10"
                      : "border-white/8 bg-white/5 hover:bg-white/8 hover:border-white/15"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cat.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <span className="text-white/70 text-xs font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Form */}
        {selected && selectedCat && !paid && (
          <form onSubmit={handlePay} className="web-card p-5 space-y-4">
            <h3 className="text-white font-semibold">{selectedCat.label} Payment</h3>

            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Provider</label>
              <select
                className="w-full web-input h-11 px-3 rounded-xl text-sm bg-transparent border border-white/10 text-white cursor-pointer"
                value={provider}
                onChange={e => setProvider(e.target.value)}
                required
              >
                <option value="" className="bg-[#0d1b2a]">Select provider...</option>
                {selectedCat.providers.map(p => <option key={p} value={p} className="bg-[#0d1b2a]">{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">
                {selected === "airtime" ? "Phone Number" : selected === "electricity" ? "Meter Number" : "Account / Smart Card Number"}
              </label>
              <Input
                className="web-input h-11"
                placeholder={selected === "airtime" ? "08012345678" : "Enter reference number"}
                value={accountRef}
                onChange={e => setAccountRef(e.target.value)}
                required
              />
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
                  required
                />
              </div>
            </div>

            <Button type="submit" className="web-btn-primary w-full h-11" disabled={loading || !provider || !accountRef || !amount}>
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Zap className="w-4 h-4 mr-2" />Pay Now</>
              }
            </Button>
          </form>
        )}

        {paid && (
          <div className="web-card p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Payment Successful!</h3>
              <p className="text-white/50 text-sm">{provider} · ₦{Number(amount).toLocaleString()}</p>
            </div>
            <Button className="web-btn-primary h-11 px-8" onClick={() => { setPaid(false); setSelected(null); setProvider(""); setAmount(""); setAccountRef(""); }}>
              Pay Another Bill
            </Button>
          </div>
        )}
      </div>
    </WebBankingLayout>
  );
}
