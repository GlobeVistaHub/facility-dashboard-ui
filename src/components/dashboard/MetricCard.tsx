import React from "react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  highlight?: "primary" | "secondary" | "error";
}

export default function MetricCard({ title, value, unit, icon, trend, highlight }: MetricCardProps) {
  return (
    <div className="bg-surface-container rounded-xl p-6 ghost-border relative overflow-hidden group hover:bg-surface-container-highest transition-colors duration-300">
      {/* Optional Glow/Highlight effect */}
      {highlight === "error" && (
        <div className="absolute top-0 right-0 w-full h-full bg-error/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      {highlight === "primary" && (
        <div className="absolute top-0 right-0 w-full h-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="font-sans text-sm font-medium text-on-surface-variant">
          {title}
        </h3>
        <span className={`material-symbols-outlined text-[24px] ${
          highlight === "error" ? "text-error" : highlight === "primary" ? "text-primary" : highlight === "secondary" ? "text-secondary-container" : "text-outline"
        }`}>
          {icon}
        </span>
      </div>

      <div className="flex items-baseline gap-2 relative z-10">
        <span className="font-display text-4xl font-bold tracking-tight text-on-surface">
          {value}
        </span>
        {unit && (
          <span className="font-sans text-sm text-on-surface-variant">{unit}</span>
        )}
      </div>

      {trend && (
        <div className={`mt-4 flex items-center gap-1 text-xs font-sans font-medium relative z-10 ${
          trend.isUp ? "text-primary-container" : "text-error"
        }`}>
          <span className="material-symbols-outlined text-[16px]">
            {trend.isUp ? "trending_up" : "trending_down"}
          </span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
