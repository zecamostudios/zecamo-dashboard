"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: string[];
  active?: string;
}

export function Tabs({ tabs, active }: TabsProps) {
  const [val, setVal] = useState(active ?? tabs[0]);
  return (
    <div className="inline-flex gap-px p-[3px] bg-white/[0.025] border border-[var(--color-border)] rounded-xl">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setVal(t)}
          className={cn(
            "px-3 py-1 text-[12px] font-medium rounded-lg cursor-pointer border-0 transition-all",
            val === t
              ? "bg-[var(--color-surface-2)] text-[var(--color-text)] shadow-[0_0_0_1px_var(--color-border-2)]"
              : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
