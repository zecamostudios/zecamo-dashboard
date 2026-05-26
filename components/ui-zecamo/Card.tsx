import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-[22px] relative",
        glow
          ? "bg-gradient-to-b from-[rgba(43,91,255,0.08)] to-[rgba(43,91,255,0.02)] border-[var(--color-primary)]/25"
          : "bg-[var(--color-surface)] border-[var(--color-border)]",
        glow
          ? "shadow-[0_0_0_1px_rgba(43,91,255,0.25),0_8px_32px_rgba(43,91,255,0.18)]"
          : "shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, big, icon }: { children: ReactNode; big?: boolean; icon?: ReactNode }) {
  if (big) {
    return (
      <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight font-[family-name:var(--font-display)] text-[var(--color-text)]">
        {icon && <span className="text-[var(--color-primary-hover)]">{icon}</span>}
        {children}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
      {icon}
      {children}
    </div>
  );
}
