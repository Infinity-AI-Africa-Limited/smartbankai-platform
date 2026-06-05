import { useState } from "react";
import MobileAppLayout from "@/components/MobileAppLayout";
import { CreditCard, Eye, EyeOff, Lock, Unlock, Wifi, Plus, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CARDS = [
  {
    id: 1,
    type: "Visa Debit",
    number: "**** **** **** 4521",
    expiry: "09/27",
    name: "ADAEZE OKONKWO",
    balance: 2847650.45,
    color: "from-[#1B365D] to-[#0d2444]",
    accent: "#F47558",
    active: true,
    contactless: true,
    limit: 500000,
    spent: 124500,
  },
  {
    id: 2,
    type: "Mastercard Credit",
    number: "**** **** **** 8834",
    expiry: "03/26",
    name: "ADAEZE OKONKWO",
    balance: 750000,
    color: "from-[#2d1b4e] to-[#1a0f30]",
    accent: "#a78bfa",
    active: true,
    contactless: true,
    limit: 1000000,
    spent: 312500,
  },
];

export default function MobileCards() {
  const [selectedCard, setSelectedCard] = useState(0);
  const [showNumber, setShowNumber] = useState(false);
  const [cards, setCards] = useState(CARDS);

  const card = cards[selectedCard];

  const toggleLock = () => {
    setCards(prev => prev.map((c, i) => i === selectedCard ? { ...c, active: !c.active } : c));
    toast.success(card.active ? "Card frozen successfully" : "Card unfrozen successfully");
  };

  return (
    <MobileAppLayout title="My Cards" showBack>
      <div className="px-4 pt-2 pb-6 space-y-5">

        {/* Card Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedCard(i)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                i === selectedCard
                  ? "bg-[#F47558]/15 border border-[#F47558]/30 text-[#F47558]"
                  : "bg-white/5 border border-white/10 text-white/50"
              }`}
            >
              {c.type}
            </button>
          ))}
          <button className="shrink-0 px-4 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/50 flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> Add Card
          </button>
        </div>

        {/* Card Visual */}
        {card && (
          <div
            className={`relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br ${card.color}`}
            style={{ minHeight: 200 }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
              style={{ background: card.accent }} />
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-5 translate-y-1/2 -translate-x-1/2"
              style={{ background: card.accent }} />

            {!card.active && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-white/60 text-sm font-medium">Card Frozen</p>
                </div>
              </div>
            )}

            <div className="relative z-10 flex justify-between items-start mb-8">
              <div>
                <p className="text-white/50 text-xs">{card.type}</p>
                <p className="text-white font-bold text-lg mt-0.5">
                  {showNumber ? "4521 8834 9012 4521" : card.number}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {card.contactless && <Wifi className="w-5 h-5 text-white/50 rotate-90" />}
                <button onClick={() => setShowNumber(!showNumber)}>
                  {showNumber ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
                </button>
              </div>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-white/40 text-xs">Card Holder</p>
                <p className="text-white font-medium text-sm">{card.name}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs">Expires</p>
                <p className="text-white font-medium text-sm">{card.expiry}</p>
              </div>
            </div>
          </div>
        )}

        {/* Spending Limit */}
        {card && (
          <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-white text-sm font-medium">Monthly Spending</p>
              <p className="text-white/50 text-xs">₦{card.spent.toLocaleString()} / ₦{card.limit.toLocaleString()}</p>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(card.spent / card.limit) * 100}%`, background: card.accent }}
              />
            </div>
            <p className="text-white/30 text-xs mt-1.5">{((card.spent / card.limit) * 100).toFixed(1)}% of limit used</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: card?.active ? "Freeze Card" : "Unfreeze Card", icon: card?.active ? Lock : Unlock, action: toggleLock, danger: card?.active },
            { label: "Change PIN", icon: Shield, action: () => toast.info("PIN change OTP sent to +234 803 *** 7654") },
            { label: "Spending Limits", icon: TrendingUp, action: () => toast.info("Feature coming soon") },
            { label: "Virtual Card", icon: CreditCard, action: () => toast.info("Virtual card creation coming soon") },
          ].map(({ label, icon: Icon, action, danger }) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                danger
                  ? "bg-red-500/8 border-red-500/20 hover:bg-red-500/12"
                  : "bg-white/4 border-white/8 hover:bg-white/6"
              }`}
            >
              <Icon className={`w-5 h-5 ${danger ? "text-red-400" : "text-white/60"}`} />
              <span className={`text-sm font-medium ${danger ? "text-red-400" : "text-white/80"}`}>{label}</span>
            </button>
          ))}
        </div>

        {/* AI Insight */}
        <div className="bg-[#F47558]/8 border border-[#F47558]/15 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-3.5 h-3.5 text-[#F47558]" />
            <p className="text-[#F47558] text-xs font-medium">SmartBank AI · Fraud Detection</p>
          </div>
          <p className="text-white/60 text-xs">Your card activity looks normal. 3 transactions were verified in the last 24 hours. No suspicious patterns detected.</p>
        </div>
      </div>
    </MobileAppLayout>
  );
}
