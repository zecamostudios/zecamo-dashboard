"use client";

import { cn } from "@/lib/utils";

interface ViewToggleProps {
  value: "kanban" | "lista";
  onChange: (v: "kanban" | "lista") => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex gap-px p-[3px] bg-white/[0.025] border border-[var(--color-border)] rounded-xl">
      {(["kanban", "lista"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "px-3.5 py-1.5 text-[12.5px] font-medium rounded-lg border-0 cursor-pointer capitalize transition-all",
            value === v
              ? "bg-[var(--color-surface-2)] text-[var(--color-text)] shadow-[0_0_0_1px_var(--color-border-2)]"
              : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
