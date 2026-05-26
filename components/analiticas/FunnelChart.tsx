"use client";

import { Funnel } from "@/components/charts/Funnel";
import { Pill } from "@/components/ui-zecamo/Pill";
import type { StageId } from "@/lib/types";

export interface StageTime {
  id: StageId;
  l: string;
  d: number;
}

interface FunnelChartProps {
  stages: { id: StageId; label: string; count: number }[];
  stageTime: StageTime[];
  mode: "funnel" | "time";
}

export function FunnelChart({ stages, stageTime, mode }: FunnelChartProps) {
  if (mode === "funnel") {
    return <Funnel stages={stages} />;
  }
  const max = Math.max(...stageTime.map((t) => t.d), 1);
  return (
    <div>
      {stageTime.map((t) => (
        <div key={t.id} className="mb-3.5 last:mb-2">
          <div className="flex justify-between text-[12.5px] mb-1.5">
            <Pill variant={t.id}>{t.l}</Pill>
            <span className="font-mono font-semibold">{t.d.toFixed(1)}d</span>
          </div>
          <div className="bg-white/[0.05] rounded-full overflow-hidden" style={{ height: 5 }}>
            <div
              className="h-full bg-gradient-to-r from-[rgba(43,91,255,0.4)] to-[var(--color-primary-hover)]"
              style={{ width: `${(t.d / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
