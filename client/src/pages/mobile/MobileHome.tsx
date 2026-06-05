import { useState } from "react";
import { Link } from "wouter";
import MobileAppLayout from "@/components/MobileAppLayout";
import { trpc } from "@/lib/trpc";
import {
  Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
  Phone, Zap, Tv, Send, Sparkles, TrendingUp, Shield,
  ChevronRight, Plus
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Transfer", icon: ArrowLeftRight, path: "/mobile/transfer", color: "#3b82f6" },
  { label: "Pay Bills", icon: Zap, path: "/mobile/payments", color: "#f59e0b" },
  { label: "Airtime", icon: Phone, path: "/mobile/payments", color: "#10b981" },
  { label: "Cable TV", icon: Tv, path: "/mobile/payments", color: "#8b5cf6" },
  { label: "Send Money", icon: Send, path: "/mobile/transfer", color: "#F47558" },
  { label: "More", icon: Plus, path: "/mobile", color: "#6b7280" },
];

function formatNaira(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

export default function MobileHome() {
  const [hideBalance, setHideBalance] = useState(false);
  const { data: txns } = trpc.tenantCustomers.transactions.useQuery({ tenantId: 1, limit: 5 });

  const recentTxns = Array.isArray(txns) ? txns.slice(0, 5) : [];

  return (
    <MobileAppLayout>
      <div className="px-4 space-y-5 pt-2 pb-4">

        {/* Account Card */}
        <div
          className="relative rounded-3xl p-5 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1B365D 0%, #0d2444 50%, #0A0F1A 100%)" }}
        >
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#F47558]/8 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/3 translate-y-1/2 -translate-x-1/2" />

          {/* AI Insight Badge */}
          <div className="relative z-10 flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5 bg-[#F47558]/15 border border-[#F47558]/20 rounded-full px-3 py-1">
              <Sparkles className="w-3 h-3 text-[#F47558]" />
              <span className="text-[#F47558] text-xs font-medium">Financial Health: 78/100</span>
            </div>
            <button onClick={() => setHideBalance(!hideBalance)} className="text-white/50 hover:text-white transition-colors">
              {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative z-10 mb-5">
            <p className="text-white/50 text-xs mb-1">Available Balance</p>
            <p className="text-white font-bold text-3xl tracking-tight">
              {hideBalance ? "₦ ••••••" : formatNaira(2847650.45)}
            </p>
            <p className="text-white/40 text-xs mt-1">3012847651 · Current Account · First Bank</p>
          </div>

          <div className="relative z-10 flex gap-3">
            <div className="flex-1 bg-white/8 rounded-2xl p-3 border border-white/10">
              <p className="text-white/40 text-xs mb-0.5">Savings</p>
              <p className="text-white font-semibold text-sm">{hideBalance ? "••••••" : formatNaira(1250000)}</p>
            </div>
            <div className="flex-1 bg-white/8 rounded-2xl p-3 border border-white/10">
              <p className="text-white/40 text-xs mb-0.5">Credit Score</p>
              <p className="text-emerald-400 font-semibold text-sm">742 <span className="text-white/30 text-xs">Good</span></p>
            </div>
          </div>
        </div>

        {/* AI Insight Strip */}
        <div className="bg-[#F47558]/8 border border-[#F47558]/15 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F47558]/15 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-[#F47558]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium leading-tight">You saved 18% more than last month</p>
            <p className="text-white/40 text-xs mt-0.5">SmartBank AI · Personalization Agent</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wider">Quick Actions</p>
          <div className="grid grid-cols-6 gap-2">
            {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
              <Link key={label} href={path}>
                <button className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                    style={{ background: `${color}15`, borderColor: `${color}25` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-white/50 text-[10px] font-medium text-center leading-tight">{label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Fraud Alert */}
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Unusual activity detected</p>
            <p className="text-white/50 text-xs mt-0.5">Uber Lagos at 11:47 PM flagged (Risk: 72%). Tap to review.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30 shrink-0 mt-1" />
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Recent Transactions</p>
            <Link href="/mobile/transactions">
              <button className="text-[#F47558] text-xs font-medium">See All</button>
            </Link>
          </div>

          <div className="space-y-1">
            {recentTxns.length > 0 ? recentTxns.map((txn: any, i: number) => {
              const isCredit = txn.type === "credit" || txn.transactionType === "credit";
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/4 border border-white/6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCredit ? "bg-emerald-500/15" : "bg-red-500/10"
                  }`}>
                    {isCredit
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      : <ArrowUpRight className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{txn.description || txn.merchantName || "Transaction"}</p>
                    <p className="text-white/40 text-xs">{txn.channel || "Web Banking"} · {new Date(txn.createdAt || txn.transactionDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${isCredit ? "text-emerald-400" : "text-white"}`}>
                      {isCredit ? "+" : "-"}₦{Number(txn.amount).toLocaleString()}
                    </p>
                    {txn.fraudScore > 60 && (
                      <p className="text-amber-400 text-[10px]">⚠ Risk {txn.fraudScore}%</p>
                    )}
                  </div>
                </div>
              );
            }) : (
              // Fallback static demo data
              [
                { desc: "Salary Credit — Accenture Nigeria", amount: 450000, type: "credit", date: "Jun 1", channel: "NIBSS" },
                { desc: "Shoprite Ikeja Mall", amount: 15400, type: "debit", date: "Jun 2", channel: "POS" },
                { desc: "Uber Lagos", amount: 8200, type: "debit", date: "Jun 2", channel: "Mobile App", risk: 72 },
                { desc: "DSTV Premium Subscription", amount: 24500, type: "debit", date: "Jun 1", channel: "Web Banking" },
                { desc: "Transfer from Emeka Obi", amount: 50000, type: "credit", date: "May 31", channel: "Mobile App" },
              ].map((txn, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/4 border border-white/6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    txn.type === "credit" ? "bg-emerald-500/15" : "bg-red-500/10"
                  }`}>
                    {txn.type === "credit"
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      : <ArrowUpRight className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{txn.desc}</p>
                    <p className="text-white/40 text-xs">{txn.channel} · {txn.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${txn.type === "credit" ? "text-emerald-400" : "text-white"}`}>
                      {txn.type === "credit" ? "+" : "-"}₦{txn.amount.toLocaleString()}
                    </p>
                    {txn.risk && <p className="text-amber-400 text-[10px]">⚠ Risk {txn.risk}%</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Loan Reminder */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm font-semibold">Personal Loan</p>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">Current</span>
          </div>
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Outstanding: ₦312,500</span>
            <span>Next payment: Jun 15</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#F47558] rounded-full" style={{ width: "37.5%" }} />
          </div>
          <p className="text-white/30 text-xs mt-1.5">37.5% repaid · ₦25,000 due in 10 days</p>
        </div>
      </div>
    </MobileAppLayout>
  );
}
