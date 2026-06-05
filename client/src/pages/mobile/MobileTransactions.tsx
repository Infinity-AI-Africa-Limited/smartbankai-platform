import { useState } from "react";
import MobileAppLayout from "@/components/MobileAppLayout";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Shield, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Transfers", "Payments", "POS", "ATM", "Online"];

export default function MobileTransactions() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data: txns, isLoading } = trpc.tenantCustomers.transactions.useQuery({ tenantId: 1, limit: 50 });
  const transactions = Array.isArray(txns) ? txns : [];

  const filtered = transactions.filter((t: any) => {
    const matchSearch = !search || (t.description || t.merchantName || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || (t.channel || "").toLowerCase().includes(category.toLowerCase()) ||
      (t.type || "").toLowerCase().includes(category.toLowerCase());
    return matchSearch && matchCat;
  });

  // Fallback static demo data
  const STATIC_TXNS = [
    { id: 1, desc: "Salary Credit — Accenture Nigeria", amount: 450000, type: "credit", date: "Jun 1, 2025", channel: "NIBSS", risk: 0 },
    { id: 2, desc: "Shoprite Ikeja Mall", amount: 15400, type: "debit", date: "Jun 2, 2025", channel: "POS", risk: 12 },
    { id: 3, desc: "Uber Lagos", amount: 8200, type: "debit", date: "Jun 2, 2025", channel: "Mobile App", risk: 72 },
    { id: 4, desc: "DSTV Premium Subscription", amount: 24500, type: "debit", date: "Jun 1, 2025", channel: "Web Banking", risk: 5 },
    { id: 5, desc: "Transfer from Emeka Obi", amount: 50000, type: "credit", date: "May 31, 2025", channel: "Mobile App", risk: 8 },
    { id: 6, desc: "GTBank ATM Withdrawal", amount: 20000, type: "debit", date: "May 31, 2025", channel: "ATM", risk: 15 },
    { id: 7, desc: "Jumia Online Shopping", amount: 35600, type: "debit", date: "May 30, 2025", channel: "Online", risk: 22 },
    { id: 8, desc: "Airtel Airtime Top-up", amount: 2000, type: "debit", date: "May 30, 2025", channel: "USSD", risk: 0 },
    { id: 9, desc: "Loan Repayment — First Bank", amount: 25000, type: "debit", date: "May 28, 2025", channel: "Auto-Debit", risk: 0 },
    { id: 10, desc: "Dividend Credit — Dangote", amount: 125000, type: "credit", date: "May 27, 2025", channel: "NIBSS", risk: 0 },
    { id: 11, desc: "Restaurant — Yellow Chilli", amount: 18500, type: "debit", date: "May 26, 2025", channel: "POS", risk: 5 },
    { id: 12, desc: "EKEDC Electricity Bill", amount: 12000, type: "debit", date: "May 25, 2025", channel: "Web Banking", risk: 0 },
    { id: 13, desc: "International Transfer — Wise", amount: 85000, type: "debit", date: "May 24, 2025", channel: "Web Banking", risk: 45 },
    { id: 14, desc: "Savings Interest Credit", amount: 8750, type: "credit", date: "May 23, 2025", channel: "System", risk: 0 },
    { id: 15, desc: "Bolt Ride — Victoria Island", amount: 5400, type: "debit", date: "May 22, 2025", channel: "Mobile App", risk: 8 },
  ];

  const displayTxns = filtered.length > 0 ? filtered : STATIC_TXNS.filter(t => {
    const matchSearch = !search || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || t.channel.toLowerCase().includes(category.toLowerCase());
    return matchSearch && matchCat;
  });

  const totalCredit = STATIC_TXNS.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit = STATIC_TXNS.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  return (
    <MobileAppLayout title="Transactions" showBack>
      <div className="px-4 pt-2 pb-6 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-2xl p-3.5">
            <p className="text-white/40 text-xs mb-1">Total Credit (Jun)</p>
            <p className="text-emerald-400 font-bold text-base">₦{(totalCredit / 1000).toFixed(0)}k</p>
          </div>
          <div className="bg-red-500/8 border border-red-500/15 rounded-2xl p-3.5">
            <p className="text-white/40 text-xs mb-1">Total Debit (Jun)</p>
            <p className="text-red-400 font-bold text-base">₦{(totalDebit / 1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input className="web-input h-11 rounded-2xl pl-10" placeholder="Search transactions..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                category === cat
                  ? "bg-[#F47558]/15 border border-[#F47558]/30 text-[#F47558]"
                  : "bg-white/5 border border-white/10 text-white/50"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-white/4 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {(displayTxns as any[]).map((txn: any, i: number) => {
              const isCredit = txn.type === "credit";
              const desc = txn.desc || txn.description || txn.merchantName || "Transaction";
              const amount = txn.amount;
              const channel = txn.channel || "Banking";
              const date = txn.date || (txn.createdAt ? new Date(txn.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : "");
              const risk = txn.risk ?? txn.fraudScore ?? 0;

              return (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/4 border border-white/6 active:bg-white/6 transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCredit ? "bg-emerald-500/15" : "bg-red-500/8"
                  }`}>
                    {isCredit
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      : <ArrowUpRight className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{desc}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-white/30 text-xs">{channel}</p>
                      {date && <p className="text-white/20 text-xs">· {date}</p>}
                      {risk > 50 && (
                        <div className="flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5 text-amber-400" />
                          <span className="text-amber-400 text-[10px]">{risk}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${isCredit ? "text-emerald-400" : "text-white"}`}>
                      {isCredit ? "+" : "-"}₦{Number(amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {displayTxns.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-white/30 text-sm">No transactions found</p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
}
