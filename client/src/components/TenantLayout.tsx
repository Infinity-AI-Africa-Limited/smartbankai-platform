import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Server, Users, Activity, ShieldCheck, CreditCard,
  BarChart3, MessageSquare, AlertTriangle, Database, Network, Settings,
  ChevronDown, ChevronRight, Menu, X, Bell, LogOut, Building2,
  Cpu, Globe, Zap, FileText, TrendingUp
} from "lucide-react";

const TENANT_ID = 4; // First Bank Nigeria demo tenant

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  children?: { label: string; path: string; icon?: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { label: "Overview", icon: <LayoutDashboard size={16} />, path: "/tenant/overview" },
  { label: "Deployment", icon: <Server size={16} />, path: "/tenant/deployment" },
  {
    label: "AI Agent Network",
    icon: <Cpu size={16} />,
    path: "/tenant/agents",
    children: [
      { label: "Conversational AI", path: "/tenant/agents/conversational", icon: <MessageSquare size={14} /> },
      { label: "Fraud Detection", path: "/tenant/agents/fraud", icon: <ShieldCheck size={14} /> },
      { label: "Credit Risk", path: "/tenant/agents/credit", icon: <CreditCard size={14} /> },
      { label: "Personalization", path: "/tenant/agents/personalization", icon: <Zap size={14} /> },
      { label: "Predictive Analytics", path: "/tenant/agents/predictive", icon: <TrendingUp size={14} /> },
      { label: "Compliance & Reporting", path: "/tenant/agents/compliance", icon: <FileText size={14} /> },
      { label: "Data Aggregation", path: "/tenant/agents/data", icon: <Database size={14} /> },
      { label: "Smart Dashboard", path: "/tenant/agents/smartdashboard", icon: <BarChart3 size={14} /> },
    ],
  },
  { label: "Customers", icon: <Users size={16} />, path: "/tenant/customers" },
  { label: "Transactions", icon: <Activity size={16} />, path: "/tenant/transactions" },
  { label: "Channel Analytics", icon: <Globe size={16} />, path: "/tenant/channels" },
  { label: "AML & Compliance", icon: <AlertTriangle size={16} />, path: "/tenant/aml-compliance", badge: "3" },
  { label: "Agent Event Log", icon: <Activity size={16} />, path: "/tenant/agent-events" },
  { label: "Data Sources", icon: <Network size={16} />, path: "/tenant/data-sources" },
  { label: "Settings", icon: <Settings size={16} />, path: "/tenant/settings" },
];

export const DEMO_TENANT_ID = TENANT_ID;

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["/tenant/agents"]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A1A" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: "#00D4FF", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "#8892A4" }}>Loading SmartBank AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "#0A0A1A" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1B365D, #00D4FF22)" }}>
            <Building2 size={32} style={{ color: "#00D4FF" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>SmartBank AI</h1>
          <p className="text-sm" style={{ color: "#8892A4" }}>Tenant Operations Portal</p>
          <p className="text-xs" style={{ color: "#F47558" }}>Powered by Infinity AI</p>
        </div>
        <Button
          onClick={() => window.location.href = getLoginUrl()}
          className="px-8 py-3 font-semibold"
          style={{ background: "linear-gradient(135deg, #00D4FF, #0066FF)", color: "#FFFFFF" }}
        >
          Sign In to Tenant Portal
        </Button>
      </div>
    );
  }

  const toggleSection = (path: string) => {
    setExpandedSections(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b" style={{ borderColor: "#1A2744" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1B365D, #00D4FF33)" }}>
            <Building2 size={16} style={{ color: "#00D4FF" }} />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold" style={{ color: "#FFFFFF" }}>First Bank Nigeria</div>
              <div className="text-xs" style={{ color: "#F47558" }}>Tenant Portal</div>
            </div>
          )}
        </div>
      </div>

      {/* Platform badge */}
      {!collapsed && (
        <div className="px-4 py-2 border-b" style={{ borderColor: "#1A2744" }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "#0D1B3E" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00FF88" }} />
            <span className="text-xs" style={{ color: "#8892A4" }}>SmartBank AI v2.4.1</span>
            <Badge className="ml-auto text-xs px-1.5 py-0" style={{ background: "#00FF8822", color: "#00FF88", border: "1px solid #00FF8844" }}>Live</Badge>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => (
          <div key={item.path}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleSection(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150"
                  style={{
                    color: isActive(item.path) ? "#00D4FF" : "#8892A4",
                    background: isActive(item.path) ? "#00D4FF11" : "transparent",
                  }}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {expandedSections.includes(item.path) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </>
                  )}
                </button>
                {!collapsed && expandedSections.includes(item.path) && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l pl-3" style={{ borderColor: "#1A2744" }}>
                    {item.children.map((child) => (
                      <Link key={child.path} href={child.path}>
                        <div
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 text-xs"
                          style={{
                            color: location === child.path ? "#00D4FF" : "#8892A4",
                            background: location === child.path ? "#00D4FF11" : "transparent",
                          }}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.icon}
                          {child.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link href={item.path}>
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
                  style={{
                    color: isActive(item.path) ? "#00D4FF" : "#8892A4",
                    background: isActive(item.path) ? "#00D4FF11" : "transparent",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <Badge className="text-xs px-1.5 py-0" style={{ background: "#FF4D4D22", color: "#FF4D4D", border: "1px solid #FF4D4D44" }}>{item.badge}</Badge>
                  )}
                </div>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: "#1A2744" }}>
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg mb-2" style={{ background: "#0D1B3E" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #1B365D, #00D4FF)" }}>
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: "#FFFFFF" }}>{user?.name ?? "User"}</div>
              <div className="text-xs truncate" style={{ color: "#F47558" }}>Tenant Admin</div>
            </div>
            <button onClick={() => logout()} className="p-1 rounded hover:bg-white/10 transition-colors">
              <LogOut size={12} style={{ color: "#8892A4" }} />
            </button>
          </div>
        )}
        <Link href="/dashboard">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all" style={{ color: "#8892A4" }}>
            <LayoutDashboard size={12} />
            {!collapsed && "Switch to Admin Portal"}
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0A0A1A", fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? 64 : 240,
          background: "#0D1527",
          borderRight: "1px solid #1A2744",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col" style={{ background: "#0D1527", borderRight: "1px solid #1A2744" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 h-14 flex-shrink-0" style={{ background: "#0D1527", borderBottom: "1px solid #1A2744" }}>
          <button onClick={() => { setCollapsed(c => !c); setMobileOpen(o => !o); }} className="p-2 rounded-lg transition-colors" style={{ color: "#8892A4" }}>
            <Menu size={18} />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>SmartBank AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F4755822", color: "#F47558" }}>Tenant Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#0A1628", border: "1px solid #1A2744" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00FF88" }} />
              <span className="text-xs" style={{ color: "#00FF88" }}>All Systems Operational</span>
            </div>
            <button className="relative p-2 rounded-lg" style={{ color: "#8892A4" }}>
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#F47558" }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: "#0A0A1A" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
