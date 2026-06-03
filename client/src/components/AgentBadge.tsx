import { cn } from "@/lib/utils";
import { MessageSquare, ShieldAlert, TrendingUp, Globe, BarChart3, FileText, Database, LayoutDashboard } from "lucide-react";

export type AgentName =
  | "Conversational"
  | "Fraud Detection"
  | "Credit Risk"
  | "Personalization"
  | "Predictive Analytics"
  | "Compliance & Reporting"
  | "Data Aggregation"
  | "Smart Dashboard";

const agentConfig: Record<AgentName, { icon: React.ElementType; color: string; bg: string; border: string; desc: string }> = {
  "Conversational":        { icon: MessageSquare, color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   desc: "AI-powered financial chat assistant" },
  "Fraud Detection":       { icon: ShieldAlert,   color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    desc: "Real-time transaction risk scoring" },
  "Credit Risk":           { icon: TrendingUp,    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  desc: "Alternative data credit scoring engine" },
  "Personalization":       { icon: Globe,         color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", desc: "Hyper-personalized product recommendations" },
  "Predictive Analytics":  { icon: BarChart3,     color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   desc: "Cash flow forecasting & churn prediction" },
  "Compliance & Reporting":{ icon: FileText,      color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",desc: "CBN regulatory reporting & AML monitoring" },
  "Data Aggregation":      { icon: Database,      color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", desc: "Multi-source financial data ingestion" },
  "Smart Dashboard":       { icon: LayoutDashboard,color:"text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", desc: "Unified financial intelligence dashboard" },
};

interface AgentBadgeProps {
  name: AgentName;
  isEnabled?: boolean;
  showDesc?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AgentBadge({ name, isEnabled, showDesc, size = "md", className }: AgentBadgeProps) {
  const cfg = agentConfig[name];
  const Icon = cfg.icon;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("rounded-lg flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border, "border",
        size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2")}>
        <Icon className={cn(cfg.color, size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
      </div>
      <div className="min-w-0">
        <div className={cn("font-semibold text-white", size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm")}>{name}</div>
        {showDesc && <div className="text-xs text-slate-500 truncate">{cfg.desc}</div>}
      </div>
      {isEnabled !== undefined && (
        <div className={cn("ml-auto flex-shrink-0 h-2 w-2 rounded-full", isEnabled ? "bg-emerald-400" : "bg-slate-600")} />
      )}
    </div>
  );
}

export { agentConfig };
