import { useState } from "react";
import { trpc } from "@/lib/trpc";
import WebBankingLayout from "@/components/WebBankingLayout";
import { Search, Filter, Download, AlertTriangle, ChevronDown, ArrowUpRight, ArrowDownLeft, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DEMO_TRANSACTIONS = [
  { id: 1, reference: "TXN-2024-001847", desc: "Shoprite Ikeja City Mall", amount: -15400, type: "debit", category: "Shopping", channel: "Web Banking", date: "2024-06-05", time: "14:23", fraudScore: 0.05, flagged: false, status: "completed" },
  { id: 2, reference: "TXN-2024-001846", desc: "Salary — GTBank Plc", amount: 450000, type: "credit", category: "Income", channel: "NIBSS", date: "2024-06-04", time: "09:00", fraudScore: 0.01, flagged: false, status: "completed" },
  { id: 3, reference: "TXN-2024-001845", desc: "DSTV Premium Subscription", amount: -24500, type: "debit", category: "Entertainment", channel: "Web Banking", date: "2024-06-03", time: "11:15", fraudScore: 0.03, flagged: false, status: "completed" },
  { id: 4, reference: "TXN-2024-001844", desc: "Uber Lagos — Victoria Island", amount: -8200, type: "debit", category: "Transport", channel: "Mobile App", date: "2024-06-02", time: "23:47", fraudScore: 0.72, flagged: true, status: "completed" },
  { id: 5, reference: "TXN-2024-001843", desc: "MTN Airtime Top-up", amount: -5000, type: "debit", category: "Telecom", channel: "USSD", date: "2024-06-02", time: "16:30", fraudScore: 0.02, flagged: false, status: "completed" },
  { id: 6, reference: "TXN-2024-001842", desc: "Chicken Republic Lekki", amount: -6800, type: "debit", category: "Food & Dining", channel: "Mobile App", date: "2024-06-01", time: "13:05", fraudScore: 0.04, flagged: false, status: "completed" },
  { id: 7, reference: "TXN-2024-001841", desc: "Transfer to Emeka Obi", amount: -50000, type: "debit", category: "Transfer", channel: "Web Banking", date: "2024-05-31", time: "10:22", fraudScore: 0.18, flagged: false, status: "completed" },
  { id: 8, reference: "TXN-2024-001840", desc: "EKEDC Electricity Bill", amount: -18500, type: "debit", category: "Utilities", channel: "Web Banking", date: "2024-05-30", time: "09:45", fraudScore: 0.02, flagged: false, status: "completed" },
  { id: 9, reference: "TXN-2024-001839", desc: "Amazon Purchase — USD 45", amount: -72450, type: "debit", category: "Shopping", channel: "Web Banking", date: "2024-05-29", time: "20:11", fraudScore: 0.45, flagged: true, status: "pending" },
  { id: 10, reference: "TXN-2024-001838", desc: "Freelance Payment — Flutterwave", amount: 125000, type: "credit", category: "Income", channel: "Flutterwave", date: "2024-05-28", time: "15:33", fraudScore: 0.06, flagged: false, status: "completed" },
  { id: 11, reference: "TXN-2024-001837", desc: "Jumia Online Shopping", amount: -32000, type: "debit", category: "Shopping", channel: "Mobile App", date: "2024-05-27", time: "12:00", fraudScore: 0.08, flagged: false, status: "completed" },
  { id: 12, reference: "TXN-2024-001836", desc: "Rent Payment — Landlord", amount: -150000, type: "debit", category: "Housing", channel: "Web Banking", date: "2024-05-25", time: "08:00", fraudScore: 0.03, flagged: false, status: "completed" },
];

const CATEGORIES = ["All", "Shopping", "Income", "Entertainment", "Transport", "Telecom", "Food & Dining", "Transfer", "Utilities", "Housing"];
const CHANNELS = ["All Channels", "Web Banking", "Mobile App", "USSD", "NIBSS", "Flutterwave"];

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Math.abs(amount));
}

function FraudScoreBadge({ score }: { score: number }) {
  if (score >= 0.7) return <span className="web-badge-flagged">High Risk {(score * 100).toFixed(0)}%</span>;
  if (score >= 0.4) return <span className="web-badge-pending">Medium {(score * 100).toFixed(0)}%</span>;
  return <span className="web-badge-credit">Low {(score * 100).toFixed(0)}%</span>;
}

export default function WebTransactions() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [channel, setChannel] = useState("All Channels");
  const [showFlagged, setShowFlagged] = useState(false);

  const { data: dbTransactions } = trpc.tenantCustomers.transactions.useQuery(
    { tenantId: 1, limit: 50 },
    { retry: false }
  );

  const allTxns = dbTransactions?.length ? dbTransactions.map((t: any) => ({
    id: t.id,
    reference: t.reference || `TXN-${t.id}`,
    desc: t.description,
    amount: t.type === "credit" ? Number(t.amount) : -Number(t.amount),
    type: t.type,
    category: t.category || "Other",
    channel: t.channel || "Web Banking",
    date: new Date(t.createdAt).toISOString().split("T")[0],
    time: new Date(t.createdAt).toTimeString().slice(0, 5),
    fraudScore: Number(t.fraudScore) || 0.05,
    flagged: t.isFlagged || false,
    status: t.status || "completed",
  })) : DEMO_TRANSACTIONS;

  const filtered = allTxns.filter(t => {
    const matchSearch = t.desc.toLowerCase().includes(search.toLowerCase()) || t.reference.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || t.category === category;
    const matchChannel = channel === "All Channels" || t.channel === channel;
    const matchFlagged = !showFlagged || t.flagged;
    return matchSearch && matchCat && matchChannel && matchFlagged;
  });

  const totalCredit = filtered.filter(t => t.type === "credit").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalDebit = filtered.filter(t => t.type === "debit").reduce((s, t) => s + Math.abs(t.amount), 0);
  const flaggedCount = filtered.filter(t => t.flagged).length;

  return (
    <WebBankingLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Transaction History</h1>
            <p className="text-white/40 text-sm mt-0.5">All transactions · AI fraud scoring active</p>
          </div>
          <Button className="web-btn-secondary border-0 gap-2">
            <Download className="w-4 h-4" />
            Export Statement
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="web-stat-card">
            <p className="text-white/40 text-xs mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-white">{filtered.length}</p>
          </div>
          <div className="web-stat-card">
            <div className="flex items-center gap-1.5 mb-1"><ArrowDownLeft className="w-3 h-3 text-emerald-400" /><p className="text-white/40 text-xs">Total Credits</p></div>
            <p className="text-xl font-bold text-emerald-400">{formatNaira(totalCredit)}</p>
          </div>
          <div className="web-stat-card">
            <div className="flex items-center gap-1.5 mb-1"><ArrowUpRight className="w-3 h-3 text-[#F47558]" /><p className="text-white/40 text-xs">Total Debits</p></div>
            <p className="text-xl font-bold text-[#F47558]">{formatNaira(totalDebit)}</p>
          </div>
          <div className="web-stat-card">
            <div className="flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3 h-3 text-amber-400" /><p className="text-white/40 text-xs">AI Flagged</p></div>
            <p className="text-2xl font-bold text-amber-400">{flaggedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="web-card p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              className="web-input pl-9 h-10"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="web-input h-10 px-3 rounded-xl text-sm bg-transparent border border-white/10 text-white/70 cursor-pointer"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d1b2a]">{c}</option>)}
          </select>
          <select
            className="web-input h-10 px-3 rounded-xl text-sm bg-transparent border border-white/10 text-white/70 cursor-pointer"
            value={channel}
            onChange={e => setChannel(e.target.value)}
          >
            {CHANNELS.map(c => <option key={c} value={c} className="bg-[#0d1b2a]">{c}</option>)}
          </select>
          <button
            onClick={() => setShowFlagged(!showFlagged)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
              showFlagged
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Flagged Only
          </button>
        </div>

        {/* Transaction Table */}
        <div className="web-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-white/40 text-xs font-medium px-5 py-3.5">Transaction</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3.5 hidden md:table-cell">Reference</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3.5 hidden lg:table-cell">Channel</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3.5 hidden lg:table-cell">AI Risk Score</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3.5">Date</th>
                  <th className="text-right text-white/40 text-xs font-medium px-5 py-3.5">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(txn => (
                  <tr key={txn.id} className="web-table-row">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          txn.type === "credit" ? "bg-emerald-500/10" : "bg-white/5"
                        }`}>
                          {txn.type === "credit"
                            ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                            : <ArrowUpRight className="w-4 h-4 text-white/40" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium">{txn.desc}</p>
                            {txn.flagged && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </div>
                          <p className="text-white/40 text-xs">{txn.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-white/50 text-xs font-mono">{txn.reference}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <Badge className="bg-white/8 text-white/60 border-0 text-xs">{txn.channel}</Badge>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <FraudScoreBadge score={txn.fraudScore} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white/60 text-sm">{txn.date}</p>
                      <p className="text-white/30 text-xs">{txn.time}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className={`text-sm font-semibold ${txn.type === "credit" ? "text-emerald-400" : "text-white"}`}>
                        {txn.type === "credit" ? "+" : "-"}{formatNaira(txn.amount)}
                      </p>
                      <Badge className={`text-xs border-0 ${txn.status === "pending" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        {txn.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No transactions match your filters</p>
            </div>
          )}

          <div className="px-5 py-3.5 border-t border-white/8 flex items-center justify-between">
            <p className="text-white/40 text-xs">Showing {filtered.length} transactions · AI fraud monitoring active</p>
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Shield className="w-3 h-3" />
              Fraud Detection Agent
            </div>
          </div>
        </div>
      </div>
    </WebBankingLayout>
  );
}
