import { useState } from "react";
import WebBankingLayout from "@/components/WebBankingLayout";
import { CreditCard, Lock, Unlock, Eye, EyeOff, Settings, Shield, AlertTriangle, Plus, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CARDS = [
  {
    id: 1,
    type: "Visa Debit",
    number: "4532 •••• •••• 8741",
    expiry: "09/27",
    holder: "ADAEZE OKONKWO",
    balance: 2847650.45,
    status: "active",
    color: ["#1B365D", "#2a4a7f"],
    network: "visa",
    limit: 500000,
    spent: 195000,
  },
  {
    id: 2,
    type: "Mastercard Credit",
    number: "5412 •••• •••• 3219",
    expiry: "03/26",
    holder: "ADAEZE OKONKWO",
    balance: 350000,
    status: "active",
    color: ["#343A40", "#4a5568"],
    network: "mastercard",
    limit: 1000000,
    spent: 350000,
  },
  {
    id: 3,
    type: "Verve Prepaid",
    number: "5061 •••• •••• 6672",
    expiry: "12/25",
    holder: "ADAEZE OKONKWO",
    balance: 50000,
    status: "frozen",
    color: ["#7c3aed", "#5b21b6"],
    network: "verve",
    limit: 100000,
    spent: 50000,
  },
];

const CARD_TRANSACTIONS = [
  { desc: "Shoprite Ikeja", amount: 15400, date: "Jun 5", category: "Shopping" },
  { desc: "Uber Lagos", amount: 8200, date: "Jun 2", category: "Transport" },
  { desc: "Chicken Republic", amount: 6800, date: "Jun 1", category: "Dining" },
  { desc: "MTN Airtime", amount: 5000, date: "May 31", category: "Telecom" },
  { desc: "Netflix Subscription", amount: 4600, date: "May 30", category: "Entertainment" },
];

export default function WebCards() {
  const [selectedCard, setSelectedCard] = useState(0);
  const [showNumber, setShowNumber] = useState(false);
  const [cards, setCards] = useState(CARDS);

  const card = cards[selectedCard];

  const toggleFreeze = () => {
    setCards(prev => prev.map((c, i) => i === selectedCard
      ? { ...c, status: c.status === "active" ? "frozen" : "active" }
      : c
    ));
    toast.success(card.status === "active" ? "Card frozen successfully" : "Card unfrozen successfully");
  };

  return (
    <WebBankingLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Cards</h1>
            <p className="text-white/40 text-sm mt-0.5">Manage your debit, credit, and prepaid cards</p>
          </div>
          <Button className="web-btn-primary gap-2 h-10">
            <Plus className="w-4 h-4" />
            Request Card
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Card Selector */}
          <div className="lg:col-span-2 space-y-4">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelectedCard(i)}
                className={`w-full text-left transition-all ${selectedCard === i ? "scale-[1.02]" : "opacity-70 hover:opacity-90"}`}
              >
                {/* Physical Card Design */}
                <div
                  className="relative rounded-2xl p-5 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})`, minHeight: 160 }}
                >
                  {/* Decorative circles */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />

                  {c.status === "frozen" && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                        <Lock className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">Card Frozen</span>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-white/60 text-xs">{c.type}</p>
                        <p className="text-white font-bold text-sm mt-0.5">First Bank Nigeria</p>
                      </div>
                      <Wifi className="w-5 h-5 text-white/60 rotate-90" />
                    </div>

                    <p className="text-white font-mono text-sm tracking-widest mb-4">
                      {showNumber ? c.number.replace(/•/g, "7") : c.number}
                    </p>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/40 text-xs">Card Holder</p>
                        <p className="text-white text-xs font-medium">{c.holder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-xs">Expires</p>
                        <p className="text-white text-xs font-medium">{c.expiry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Card Details */}
          <div className="lg:col-span-3 space-y-4">
            {/* Card Controls */}
            <div className="web-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Card Controls</h3>
                <Badge className={`border-0 text-xs ${card.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {card.status === "active" ? "Active" : "Frozen"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setShowNumber(!showNumber)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all"
                >
                  {showNumber ? <EyeOff className="w-4 h-4 text-white/60" /> : <Eye className="w-4 h-4 text-white/60" />}
                  <span className="text-white/70 text-sm">{showNumber ? "Hide" : "Reveal"} Number</span>
                </button>
                <button
                  onClick={toggleFreeze}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                    card.status === "active"
                      ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
                      : "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15"
                  }`}
                >
                  {card.status === "active"
                    ? <><Lock className="w-4 h-4 text-red-400" /><span className="text-red-400 text-sm">Freeze Card</span></>
                    : <><Unlock className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 text-sm">Unfreeze Card</span></>
                  }
                </button>
                <button className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all">
                  <Shield className="w-4 h-4 text-white/60" />
                  <span className="text-white/70 text-sm">Set PIN</span>
                </button>
                <button className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all">
                  <Settings className="w-4 h-4 text-white/60" />
                  <span className="text-white/70 text-sm">Limits</span>
                </button>
              </div>

              {/* Spending Limit */}
              <div className="bg-white/5 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-xs">Monthly Spending Limit</p>
                  <p className="text-white text-xs font-medium">
                    ₦{card.spent.toLocaleString()} / ₦{card.limit.toLocaleString()}
                  </p>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(card.spent / card.limit) * 100}%`,
                      background: card.spent / card.limit > 0.8 ? "#ef4444" : "#F47558"
                    }}
                  />
                </div>
                <p className="text-white/30 text-xs mt-1.5">
                  {((1 - card.spent / card.limit) * 100).toFixed(0)}% remaining this month
                </p>
              </div>
            </div>

            {/* AI Fraud Alert */}
            <div className="web-card p-4 border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/80 text-sm font-medium">AI Fraud Alert — Uber Transaction</p>
                  <p className="text-white/50 text-xs mt-0.5">
                    A transaction at 11:47 PM in Victoria Island was flagged as unusual (Risk: 72%). Your card was not blocked as it matched your registered device.
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                      Yes, it was me
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                      Report Fraud
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Card Transactions */}
            <div className="web-card p-5">
              <h3 className="text-white font-semibold mb-4">Recent Card Transactions</h3>
              <div className="space-y-0">
                {CARD_TRANSACTIONS.map((txn, i) => (
                  <div key={i} className="web-table-row flex items-center justify-between py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{txn.desc}</p>
                      <p className="text-white/40 text-xs">{txn.category} · {txn.date}</p>
                    </div>
                    <p className="text-white text-sm font-semibold">-₦{txn.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WebBankingLayout>
  );
}
