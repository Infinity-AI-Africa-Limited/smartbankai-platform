import { Link, useLocation } from "wouter";
import {
  Home,
  ArrowLeftRight,
  CreditCard,
  PiggyBank,
  Sparkles,
  Bell,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const NAV_ITEMS = [
  { path: "/mobile", label: "Home", icon: Home },
  { path: "/mobile/transfer", label: "Transfer", icon: ArrowLeftRight },
  { path: "/mobile/cards", label: "Cards", icon: CreditCard },
  { path: "/mobile/loans", label: "Loans", icon: PiggyBank },
  { path: "/mobile/assistant", label: "AI", icon: Sparkles },
];

interface MobileAppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
}

export default function MobileAppLayout({
  children,
  title,
  showBack = false,
  showNotification = true,
}: MobileAppLayoutProps) {
  const [location] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F47558]/30 border-t-[#F47558] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0F1A] flex flex-col max-w-[430px] mx-auto relative overflow-hidden">
      {/* Status Bar Simulation */}
      <div className="h-10 bg-[#0A0F1A] flex items-center justify-between px-5 shrink-0">
        <span className="text-white/60 text-xs font-medium">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 items-end">
            {[3, 5, 7, 9].map((h, i) => (
              <div key={i} className={`w-1 rounded-sm ${i < 3 ? "bg-white" : "bg-white/30"}`} style={{ height: h }} />
            ))}
          </div>
          <svg className="w-4 h-3 text-white" fill="currentColor" viewBox="0 0 24 12">
            <path d="M1 4C1 2.9 1.9 2 3 2h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V4zm2 0v4h16V4H3zm18 1.5c.8.4 1 1 1 1.5s-.2 1.1-1 1.5V5.5z"/>
          </svg>
        </div>
      </div>

      {/* App Header */}
      <header className="px-5 py-3 flex items-center justify-between shrink-0">
        {showBack ? (
          <Link href="/mobile">
            <button className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <circle cx="8" cy="12" r="5" stroke="#F47558" strokeWidth="2" fill="none"/>
                <circle cx="16" cy="12" r="5" stroke="#1B365D" strokeWidth="2" fill="none"/>
                <path d="M11 9.5c.5.7.8 1.5.8 2.5s-.3 1.8-.8 2.5" stroke="#F47558" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">SmartBank AI</p>
              <p className="text-white/30 text-[10px]">by Infinity AI</p>
            </div>
          </div>
        )}

        {title && <h1 className="text-white font-semibold text-base">{title}</h1>}

        <div className="flex items-center gap-2">
          {showNotification && (
            <button className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-white/70" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F47558]" />
            </button>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center"
          >
            {menuOpen ? <X className="w-4 h-4 text-white/70" /> : <Menu className="w-4 h-4 text-white/70" />}
          </button>
        </div>
      </header>

      {/* Slide-in Menu */}
      {menuOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-[#0d1b2a] border-l border-white/10 p-6 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <p className="text-white font-bold">Menu</p>
              <button onClick={() => setMenuOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-1 flex-1">
              {[
                { label: "Account Settings", path: "/mobile" },
                { label: "Security & Privacy", path: "/mobile" },
                { label: "Notifications", path: "/mobile" },
                { label: "Statements", path: "/mobile/transactions" },
                { label: "Help & Support", path: "/mobile" },
                { label: "Switch to Web Banking", path: "/web" },
                { label: "Admin Portal", path: "/tenant/overview" },
              ].map(item => (
                <Link key={item.label} href={item.path}>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm"
                  >
                    {item.label}
                  </button>
                </Link>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-[#F47558]/15 flex items-center justify-center">
                  <span className="text-[#F47558] font-bold text-sm">AO</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Adaeze Okonkwo</p>
                  <p className="text-white/40 text-xs">3012847651 · Current</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0d1b2a]/95 backdrop-blur-xl border-t border-white/10 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location === path || (path !== "/mobile" && location.startsWith(path));
            return (
              <Link key={path} href={path}>
                <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-[#F47558]/15 border border-[#F47558]/30"
                      : "hover:bg-white/5"
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#F47558]" : "text-white/40"}`} />
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-[#F47558]" : "text-white/30"}`}>
                    {label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
        {/* Home Indicator */}
        <div className="flex justify-center pb-1">
          <div className="w-32 h-1 rounded-full bg-white/20" />
        </div>
      </nav>
    </div>
  );
}
