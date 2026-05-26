"use client";

import { cn } from "@/lib/utils";

interface Tab { value: string; label: string; }

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("inline-flex gap-[2px] p-[3px] bg-white/[0.025] border border-[var(--color-border)] rounded-xl", className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "px-[14px] py-[6px] text-[12.5px] font-medium rounded-[9px] border-0 cursor-pointer transition-all duration-[140ms]",
            value === t.value
              ? "bg-[var(--color-surface-2)] text-[var(--color-text)] shadow-[0_0_0_1px_var(--color-border-2),0_2px_6px_rgba(0,0,0,0.3)]"
              : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
