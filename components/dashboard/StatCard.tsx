import { type ReactNode } from "react";
import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  currency?: string;
  icon?: LucideIcon;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  sub?: ReactNode;
  spark?: ReactNode;
  featured?: boolean;
  extra?: ReactNode;
}

export function StatCard({ label, value, unit, currency, icon: Icon, delta, sub, spark, featured, extra }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[20px] border p-5 overflow-hidden",
        featured
          ? "bg-gradient-to-b from-[rgba(43,91,255,0.10)] to-[rgba(43,91,255,0.02)] border-[rgba(43,91,255,0.25)] shadow-[0_0_0_1px_rgba(43,91,255,0.25),0_8px_28px_rgba(43,91,255,0.18)]"
          : "bg-[var(--color-surface)] border-[var(--color-border)]",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">{label}</div>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] grid place-items-center text-[var(--color-text-muted)]">
            <Icon size={15} />
          </div>
        )}
      </div>
      <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
        {currency && <span className="text-[var(--color-text-muted)] text-[18px] mr-0.5">{currency}</span>}
        {value}
        {unit && <span className="text-[var(--color-text-muted)] text-[14px] ml-1 font-normal">{unit}</span>}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[11.5px]">
        {delta && (
          <span
            className={cn(
              "font-mono font-medium inline-flex items-center gap-0.5",
              delta.direction === "up" && "text-[var(--color-success)]",
              delta.direction === "down" && "text-[var(--color-danger)]",
              delta.direction === "flat" && "text-[var(--color-text-muted)]",
            )}
          >
            {delta.direction === "up" && <ArrowUp size={10} />}
            {delta.direction === "down" && <ArrowDown size={10} />}
            {delta.value}
          </span>
        )}
        {sub && <span className="text-[var(--color-text-dim)]">{sub}</span>}
      </div>
      {spark && <div className="-mx-1 mt-2">{spark}</div>}
      {extra}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-4 gap-[14px] mb-[18px] max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">{children}</div>;
}
