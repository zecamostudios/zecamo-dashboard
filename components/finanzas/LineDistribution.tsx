import { ArrowUp } from "lucide-react";
import { Donut } from "@/components/charts/Donut";
import { Pill } from "@/components/ui-zecamo/Pill";
import type { ByLine } from "@/lib/types";

interface LineDistributionProps {
  items: ByLine[];
  totalFormatter: (n: number) => string;
}

const LINE_GRADIENT: Record<string, string> = {
  AIMA: "linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))",
  Webs: "linear-gradient(90deg, var(--color-success), #4FE0AA)",
  B2B: "linear-gradient(90deg, var(--color-purple), #C29DFF)",
  "Diagnóstico": "linear-gradient(90deg, var(--color-warning), #FFC459)",
};

export function LineDistribution({ items, totalFormatter }: LineDistributionProps) {
  const total = items.reduce((s, l) => s + (l.v ?? 0), 0);
  const topTwoPct = (items[0]?.pct ?? 0) + (items[1]?.pct ?? 0);

  return (
    <>
      <div className="flex items-center gap-4 mb-[18px]">
        <Donut
          pct={topTwoPct}
          label={`${topTwoPct}%`}
          sub="AIMA + Webs"
          color="var(--color-primary-hover)"
          size={120}
        />
        <div className="flex-1 flex flex-col gap-1">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
            Total mayo
          </div>
          <div className="font-[family-name:var(--font-display)] text-[22px] font-medium tracking-tight">
            {totalFormatter(total)}
          </div>
          <div className="text-[11px] text-[var(--color-success)] mt-0.5 flex items-center gap-1">
            <ArrowUp size={10} />+24% vs Abril
          </div>
        </div>
      </div>

      {items.map((it) => (
        <div key={it.id} className="mb-[11px]">
          <div className="flex justify-between items-center text-[12.5px] mb-1.5">
            <Pill variant={it.id}>{it.id}</Pill>
            <span>
              <span className="font-mono font-semibold">{totalFormatter(it.v ?? 0)}</span>{" "}
              <span className="text-[var(--color-text-muted)]">· {it.pct}%</span>
            </span>
          </div>
          <div className="bg-white/[0.05] rounded-full overflow-hidden" style={{ height: 5 }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${it.pct}%`, background: LINE_GRADIENT[it.id] ?? "var(--color-primary)" }}
            />
          </div>
        </div>
      ))}
    </>
  );
}
