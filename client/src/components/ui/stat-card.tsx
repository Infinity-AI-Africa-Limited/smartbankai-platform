import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  color?: "blue" | "cyan" | "gold" | "green" | "red" | "purple";
  className?: string;
}

const colorMap = {
  blue:   { icon: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   glow: "shadow-blue-500/10" },
  cyan:   { icon: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   glow: "shadow-cyan-500/10" },
  gold:   { icon: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  glow: "shadow-amber-500/10" },
  green:  { icon: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",glow: "shadow-emerald-500/10" },
  red:    { icon: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    glow: "shadow-red-500/10" },
  purple: { icon: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/10" },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = "blue", className }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("rounded-xl border p-5 transition-all duration-200 hover:shadow-lg", c.border, c.glow, className)}
      style={{ background: "#111827" }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={cn("p-2 rounded-lg", c.bg)}>
            <Icon className={cn("h-4 w-4", c.icon)} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      {trend && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.value >= 0 ? "text-emerald-400" : "text-red-400")}>
          <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
          {trend.label && <span className="text-slate-500">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
