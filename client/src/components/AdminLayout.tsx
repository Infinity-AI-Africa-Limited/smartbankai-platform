import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Bot, Users, CreditCard, Activity,
  MessageSquare, ShieldAlert, TrendingUp, FileText, Database,
  BarChart3, ChevronLeft, ChevronRight, LogOut, Bell, Settings,
  Menu, X, ChevronDown, Cpu, Globe, Lock, Monitor, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "/manus-storage/infinity-ai-logo_887c04f1.png";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeColor?: string;
  children?: { label: string; href: string; icon?: React.ElementType }[];
};

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Tenants", icon: Building2, href: "/tenants" },
  {
    label: "AI Agents", icon: Bot, href: "/agents",
    children: [
      { label: "Agent Control Center", href: "/agents", icon: Cpu },
      { label: "Conversational AI", href: "/agents/conversational", icon: MessageSquare },
      { label: "Fraud Detection", href: "/agents/fraud", icon: ShieldAlert },
      { label: "Credit Risk", href: "/agents/credit", icon: TrendingUp },
      { label: "Personalization", href: "/agents/personalization", icon: Globe },
      { label: "Predictive Analytics", href: "/agents/predictive", icon: BarChart3 },
      { label: "Compliance & Reporting", href: "/agents/compliance", icon: FileText },
      { label: "Data Aggregation", href: "/agents/data", icon: Database },
      { label: "Smart Dashboard", href: "/agents/smartdashboard", icon: LayoutDashboard },
    ],
  },
  { label: "Monitoring", icon: Activity, href: "/monitoring" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Audit Logs", icon: Lock, href: "/audit" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["AI Agents"]);

  const statsQuery = trpc.platform.stats.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A1A" }}>
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Infinity AI" className="h-12 w-auto animate-pulse" />
          <div className="text-sm text-slate-400">Loading SmartBank AI...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A1A" }}>
        <div className="text-center space-y-6 max-w-md px-6">
          <img src={LOGO_URL} alt="Infinity AI" className="h-16 w-auto mx-auto" />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">SmartBank AI</h1>
            <p className="text-slate-400 text-sm">Agentic Financial Intelligence Platform</p>
            <p className="text-slate-500 text-xs mt-1">Powered by Infinity AI</p>
          </div>
          <p className="text-slate-300 text-sm">
            Sign in to access the backoffice admin portal and manage your AI-powered financial platform.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full gradient-brand text-white font-semibold py-3 rounded-lg glow-blue transition-all hover:opacity-90">
              Sign In to SmartBank AI
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/" || location === "/dashboard";
    return location.startsWith(href);
  };

  const roleLabel = {
    platform_owner: "Platform Owner",
    admin: "Platform Owner",
    tenant_admin: "Tenant Admin",
    analyst: "Analyst",
    user: "User",
  }[user?.role ?? "user"] ?? "User";

  const roleColor = {
    platform_owner: "text-amber-400",
    admin: "text-amber-400",
    tenant_admin: "text-cyan-400",
    analyst: "text-blue-400",
    user: "text-slate-400",
  }[user?.role ?? "user"] ?? "text-slate-400";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-[#1E2A3A]", collapsed && "justify-center px-2")}>
        <img src={LOGO_URL} alt="Infinity AI" className={cn("object-contain flex-shrink-0", collapsed ? "h-8 w-8" : "h-9 w-auto max-w-[36px]")} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-base leading-tight">SmartBank AI</div>
            <div className="text-[10px] text-slate-500 leading-tight">by Infinity AI</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedGroups.includes(item.label);

          if (hasChildren && !collapsed) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isExpanded && "rotate-180")} />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-[#1E2A3A] pl-3">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = location === child.href || location.startsWith(child.href + "/");
                      return (
                        <Link key={child.href} href={child.href}>
                          <div
                            className={cn(
                              "flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer",
                              childActive
                                ? "bg-blue-600/20 text-blue-400"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {ChildIcon && <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />}
                            {child.label}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-blue-600/20 text-blue-400 glow-blue"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <Badge className={cn("text-[10px] px-1.5 py-0", item.badgeColor ?? "bg-blue-600/30 text-blue-400 border-0")}>
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Channel Portal Switches */}
      <div className="px-3 pb-1 space-y-1">
        <Link href="/banking/login">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all hover:bg-white/5" style={{ color: "#8892A4" }}>
            <Monitor className="h-3.5 w-3.5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Web Banking Portal</span>}
          </div>
        </Link>
        <Link href="/app/home">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all hover:bg-white/5" style={{ color: "#8892A4" }}>
            <Smartphone className="h-3.5 w-3.5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Mobile Super-App</span>}
          </div>
        </Link>
      </div>

      {/* Tenant Portal Switch */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <Link href="/tenant/overview">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all hover:bg-white/5" style={{ color: "#F47558", border: "1px solid #F4755833" }}>
              <Globe className="h-3.5 w-3.5" />
              <span className="font-medium">View Tenant Portal</span>
            </div>
          </Link>
        </div>
      )}

      {/* User footer */}
      <div className={cn("border-t border-[#1E2A3A] p-3", collapsed && "px-2")}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-blue-600/30 text-blue-400 text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name ?? "User"}</div>
              <div className={cn("text-[10px] font-medium", roleColor)}>{roleLabel}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-400" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600/30 text-blue-400 text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0A0A1A" }}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col flex-shrink-0 transition-all duration-300 border-r border-[#1E2A3A]",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ background: "#080818" }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full z-10 hidden md:flex items-center justify-center w-5 h-10 bg-[#1E2A3A] border border-[#2A3A4A] rounded-r-md text-slate-400 hover:text-white transition-colors"
          style={{ left: collapsed ? "64px" : "240px" }}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r border-[#1E2A3A]" style={{ background: "#080818" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-[#1E2A3A]" style={{ background: "#080818" }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 text-slate-400" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span className="text-slate-400 font-medium">SmartBank AI</span>
              <span>/</span>
              <span className="text-slate-300 capitalize">{location.split("/")[1] || "Overview"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">All Systems Operational</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-2 px-2 text-slate-400 hover:text-white">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-600/30 text-blue-400 text-[10px] font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-xs font-medium">{user?.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#111827] border-[#1E2A3A]">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className={cn("text-xs", roleColor)}>{roleLabel}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#1E2A3A]" />
                <DropdownMenuItem className="text-slate-300 hover:text-white focus:bg-white/5 cursor-pointer">
                  <Settings className="h-3.5 w-3.5 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#1E2A3A]" />
                <DropdownMenuItem className="text-red-400 hover:text-red-300 focus:bg-red-500/10 cursor-pointer" onClick={logout}>
                  <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
