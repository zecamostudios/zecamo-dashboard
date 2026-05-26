"use client";

import Link from "next/link";
import { STAGES, PROSPECTS } from "@/lib/mock-data";

export function PipelineStrip() {
  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: PROSPECTS.filter((p) => p.stage === s.id).length,
  }));

  return (
    <div className="grid grid-cols-9 gap-1.5 max-[1100px]:grid-cols-3 max-[640px]:grid-cols-2">
      {stageCounts.map((s) => (
        <Link
          key={s.id}
          href="/crm"
          className="bg-white/[0.025] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text)] transition-all hover:bg-white/[0.05] hover:-translate-y-0.5 hover:border-[rgba(43,91,255,0.25)] hover:shadow-[0_4px_14px_rgba(43,91,255,0.18)]"
        >
          <div className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium leading-tight mb-2 line-clamp-2 min-h-[26px]">
            {s.label}
          </div>
          <div className="font-[family-name:var(--font-display)] text-[22px] font-medium leading-none tracking-tight">{s.count}</div>
          <div className="mt-2 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] shadow-[0_0_6px_var(--color-glow)]"
              style={{ width: Math.min(100, s.count * 15 + 10) + "%" }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
