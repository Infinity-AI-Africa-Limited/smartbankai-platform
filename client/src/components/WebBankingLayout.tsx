import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Receipt,
  Wallet, PiggyBank, Bell, Settings, LogOut, Menu, X,
  MessageSquare, Shield, TrendingUp, ChevronDown, User,
  Home, Landmark, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const navItems = [
  { path: "/web/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/web/accounts", icon: Landmark, label: "Accounts" },
  { path: "/web/transactions", icon: Receipt, label: "Transactions" },
  { path: "/web/transfer", icon: ArrowLeftRight, label: "Transfer" },
  { path: "/web/payments", icon: Zap, label: "Payments" },
  { path: "/web/cards", icon: CreditCard, label: "Cards" },
  { path: "/web/loans", icon: PiggyBank, label: "Loans" },
  { path: "/web/assistant", icon: MessageSquare, label: "AI Assistant" },
];

export default function WebBankingLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/web/login"; }
  });

  // Demo customer data
  const demoCustomer = {
    name: "Adaeze Okonkwo",
    accountNumber: "3012847651",
    bank: "First Bank Nigeria",
    initials: "AO"
  };

  if (!user) {
    return (
      <div className="min-h-screen web-banking-bg flex items-center justify-center">
        <div className="text-center">
          <div className="web-logo-mark mb-4 mx-auto w-12 h-12" />
          <p className="text-white/60 mb-4">Please sign in to access your banking portal</p>
          <Button
            className="web-btn-primary"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen web-banking-bg flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 web-sidebar flex flex-col
        transform transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F47558] to-[#1B365D] flex items-center justify-center">
            <Landmark className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SmartBank AI</p>
            <p className="text-white/40 text-xs">Web Banking</p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="web-card-subtle rounded-xl p-3 flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-[#F47558]/20 text-[#F47558] text-xs font-bold">
                {demoCustomer.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{demoCustomer.name}</p>
              <p className="text-white/40 text-xs truncate">{demoCustomer.accountNumber}</p>
            </div>
            <Badge className="ml-auto shrink-0 bg-emerald-500/20 text-emerald-400 border-0 text-xs">
              Active
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path || location.startsWith(path + "/");
            return (
              <Link key={path} href={path}>
                <a
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150 cursor-pointer
                    ${isActive
                      ? "bg-[#F47558] text-white shadow-lg shadow-[#F47558]/25"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                    }
                  `}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {label === "AI Assistant" && (
                    <Badge className="ml-auto bg-[#F47558]/20 text-[#F47558] border-0 text-xs">AI</Badge>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link href="/web/notifications">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
              <Bell className="w-4 h-4" />
              Notifications
              <Badge className="ml-auto bg-[#F47558] text-white border-0 text-xs">3</Badge>
            </a>
          </Link>
          <Link href="/web/profile">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
              <Settings className="w-4 h-4" />
              Settings
            </a>
          </Link>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <div className="pt-2">
            <Link href="/tenant/overview">
              <a className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 transition-all cursor-pointer">
                <Shield className="w-3 h-3" />
                Switch to Admin Portal
              </a>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="web-topbar flex items-center gap-4 px-6 py-4">
          <button
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* AI Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 web-card-subtle rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/60">8 AI Agents Active</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Security Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Secured</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/8 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F47558] rounded-full" />
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 web-card-subtle rounded-xl px-3 py-2 hover:bg-white/12 transition-all">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-[#F47558]/20 text-[#F47558] text-xs font-bold">
                      {demoCustomer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm text-white font-medium">{demoCustomer.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-white/40" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="web-dropdown w-48">
                <DropdownMenuItem asChild>
                  <Link href="/web/profile"><a className="cursor-pointer flex items-center gap-2"><User className="w-4 h-4" />Profile</a></Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/web/notifications"><a className="cursor-pointer flex items-center gap-2"><Bell className="w-4 h-4" />Notifications</a></Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="w-4 h-4 mr-2" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
