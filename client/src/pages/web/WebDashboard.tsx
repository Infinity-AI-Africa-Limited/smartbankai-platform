import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import WebBankingLayout from "@/components/WebBankingLayout";
import {
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Zap, Eye, EyeOff,
  TrendingUp, TrendingDown, Shield, MessageSquare, CreditCard,
  PiggyBank, Bell, ChevronRight, Sparkles, AlertTriangle,
  Wallet, BarChart3, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

// Demo data — mirrors the seeded DB data
const DEMO_CUSTOMER = {
  name: "Adaeze Okonkwo",
  accountNumber: "3012847651",
  bank: "First Bank Nigeria",
  balance: 2847650.45,
  savingsBalance: 1250000.00,
  loanBalance: 500000.00,
  creditScore: 742,
  financialHealthScore: 78,
  currency: "NGN"
};

const SPENDING_TREND = [
  { month: "Jan", spend: 185000, income: 450000 },
  { month: "Feb", spend: 210000, income: 450000 },
  { month: "Mar", spend: 175000, income: 480000 },
  { month: "Apr", spend: 290000, income: 450000 },
  { month: "May", spend: 220000, income: 510000 },
  { month: "Jun", spend: 195000, income: 450000 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, desc: "Shoprite Ikeja", amount: -15400, type: "debit", category: "Shopping", time: "2 hrs ago", icon: "🛒", flagged: false },
  { id: 2, desc: "Salary — GTBank", amount: 450000, type: "credit", category: "Income", time: "1 day ago", icon: "💰", flagged: false },
  { id: 3, desc: "DSTV Subscription", amount: -24500, type: "debit", category: "Entertainment", time: "2 days ago", icon: "📺", flagged: false },
  { id: 4, desc: "MTN Airtime", amount: -5000, type: "debit", category: "Telecom", time: "2 days ago", icon: "📱", flagged: false },
  { id: 5, desc: "Uber Lagos", amount: -8200, type: "debit", category: "Transport", time: "3 days ago", icon: "🚗", flagged: true },
];

const AI_INSIGHTS = [
  {
    type: "savings",
    icon: TrendingUp,
    color: "emerald",
    title: "Savings Opportunity",
    message: "You spend ₦24,500/month on DSTV. Switching to a streaming bundle could save ₦8,000/month.",
    agent: "Personalization Agent"
  },
  {
    type: "fraud",
    icon: Shield,
    color: "amber",
    title: "Unusual Activity Detected",
    message: "Your Uber transaction at 11:47 PM in Victoria Island is outside your normal pattern. Was this you?",
    agent: "Fraud Detection Agent"
  },
  {
    type: "credit",
    icon: TrendingUp,
    color: "blue",
    title: "Credit Score Improved",
    message: "Your credit score increased by 12 points this month. You now qualify for our Prime Loan at 18% p.a.",
    agent: "Credit Risk Agent"
  }
];

const QUICK_ACTIONS = [
  { label: "Transfer", icon: ArrowLeftRight, href: "/banking/transfer", color: "#F47558" },
  { label: "Pay Bills", icon: Zap, href: "/banking/payments", color: "#3b82f6" },
  { label: "Cards", icon: CreditCard, href: "/banking/cards", color: "#8b5cf6" },
  { label: "Loans", icon: PiggyBank, href: "/banking/loans", color: "#10b981" },
  { label: "AI Chat", icon: MessageSquare, href: "/banking/assistant", color: "#F47558" },
  { label: "Analytics", icon: BarChart3, href: "/banking/transactions", color: "#06b6d4" },
];

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(amount);
}

export default function WebDashboard() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { data: transactions } = trpc.tenantCustomers.transactions.useQuery(
    { tenantId: 1, customerId: 1, limit: 5 },
    { retry: false }
  );

  const txns = transactions?.length ? transactions : RECENT_TRANSACTIONS;

  return (
    <WebBankingLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm">Good morning,</p>
            <h1 className="text-2xl font-bold text-white">{DEMO_CUSTOMER.name.split(" ")[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="mobile-ai-chip">
              <Sparkles className="w-3 h-3" />
              AI Active
            </div>
            <Button variant="outline" size="sm" className="web-btn-secondary border-0 gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Account Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Balance Card */}
          <div className="md:col-span-2 web-balance-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/50 text-sm mb-1">Current Account</p>
                <p className="text-white/40 text-xs">{DEMO_CUSTOMER.accountNumber} · First Bank Nigeria</p>
              </div>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-all"
              >
                {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/50 text-sm mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                {balanceVisible ? formatNaira(DEMO_CUSTOMER.balance) : "₦ ••••••••"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/8 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white/50 text-xs">Income (Jun)</span>
                </div>
                <p className="text-white font-semibold">{balanceVisible ? "₦450,000" : "₦ ••••"}</p>
              </div>
              <div className="bg-white/8 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#F47558]" />
                  <span className="text-white/50 text-xs">Expenses (Jun)</span>
                </div>
                <p className="text-white font-semibold">{balanceVisible ? "₦195,000" : "₦ ••••"}</p>
              </div>
            </div>
          </div>

          {/* Right Column — Savings + Credit Score */}
          <div className="space-y-4">
            <div className="web-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/50 text-xs">Savings Account</p>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-white mb-1">
                {balanceVisible ? formatNaira(DEMO_CUSTOMER.savingsBalance) : "₦ ••••••"}
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>+2.5% this month</span>
              </div>
            </div>

            <div className="web-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/50 text-xs">AI Credit Score</p>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">Good</Badge>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-white">{DEMO_CUSTOMER.creditScore}</p>
                <p className="text-white/40 text-sm mb-1">/850</p>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{ width: `${(DEMO_CUSTOMER.creditScore / 850) * 100}%` }}
                />
              </div>
              <p className="text-white/30 text-xs mt-1.5">Powered by Credit Risk Agent</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href, color }) => (
              <Link key={label} href={href}>
                <a className="web-quick-action group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-white/70 text-xs font-medium group-hover:text-white transition-colors">{label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Spending Trend + AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Spending Chart */}
          <div className="lg:col-span-3 web-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Spending vs Income</h3>
                <p className="text-white/40 text-xs mt-0.5">Last 6 months · Powered by Predictive Analytics Agent</p>
              </div>
              <Badge className="bg-[#F47558]/15 text-[#F47558] border-0 text-xs">AI Forecast</Badge>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={SPENDING_TREND}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F47558" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F47558" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", color: "white" }}
                  formatter={(v: number) => [`₦${(v/1000).toFixed(0)}k`, ""]}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="spend" stroke="#F47558" strokeWidth={2} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-white/50 text-xs">Income</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F47558]" /><span className="text-white/50 text-xs">Spending</span></div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">AI Insights</h3>
              <Badge className="bg-[#F47558]/15 text-[#F47558] border-0 text-xs">{AI_INSIGHTS.length} new</Badge>
            </div>
            {AI_INSIGHTS.map((insight, i) => {
              const Icon = insight.icon;
              const colors = {
                emerald: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", text: "#22c55e" },
                amber: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", text: "#f59e0b" },
                blue: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", text: "#3b82f6" },
              }[insight.color] || { bg: "", border: "", text: "" };
              return (
                <div key={i} className="web-card p-3.5 cursor-pointer hover:border-white/15 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                      <Icon className="w-4 h-4" style={{ color: colors.text }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold mb-0.5">{insight.title}</p>
                      <p className="text-white/50 text-xs leading-relaxed">{insight.message}</p>
                      <p className="text-white/25 text-xs mt-1.5">{insight.agent}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="web-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Transactions</h3>
            <Link href="/banking/transactions">
              <a className="text-[#F47558] text-sm hover:text-[#f5856a] flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </Link>
          </div>

          <div className="space-y-0">
            {RECENT_TRANSACTIONS.map((txn) => (
              <div key={txn.id} className="web-table-row flex items-center gap-4 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
                  {txn.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">{txn.desc}</p>
                    {txn.flagged && (
                      <Badge className="bg-amber-500/15 text-amber-400 border-0 text-xs shrink-0 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{txn.category} · {txn.time}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${txn.type === "credit" ? "text-emerald-400" : "text-white"}`}>
                    {txn.type === "credit" ? "+" : ""}{formatNaira(Math.abs(txn.amount))}
                  </p>
                  <span className={txn.type === "credit" ? "web-badge-credit" : "web-badge-debit"}>
                    {txn.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="web-card-accent p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#F47558" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${DEMO_CUSTOMER.financialHealthScore} 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{DEMO_CUSTOMER.financialHealthScore}</span>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">Financial Health Score</p>
                <p className="text-white/50 text-sm">Good — Above average for your income bracket</p>
                <p className="text-white/30 text-xs mt-1">Powered by SmartBank AI · Smart Dashboard Agent</p>
              </div>
            </div>
            <Link href="/banking/assistant">
              <a className="web-btn-primary px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
                <MessageSquare className="w-4 h-4" />
                Ask AI
              </a>
            </Link>
          </div>
        </div>

      </div>
    </WebBankingLayout>
  );
}
