import { TrendingUp } from "lucide-react";
import { FINANCE } from "@/lib/mock-data";
import { fmtN } from "@/lib/utils";
import { Donut } from "@/components/charts/Donut";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";

const MONTH_TARGET = 15000;

export function MonthGoal() {
  // TODO: reemplazar por valor real (revenue del mes actual)
  const monthRevenue = FINANCE[FINANCE.length - 1].in;
  const pct = (monthRevenue / MONTH_TARGET) * 100;

  return (
    <Card>
      <CardHead>
        <CardTitle big>Meta del mes</CardTitle>
      </CardHead>
      <div className="flex items-center gap-[18px]">
        <Donut pct={pct} label={`${Math.round(pct)}%`} sub="del objetivo" />
        <div className="flex-1">
          <div className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-[0.06em] mb-1">Faltan</div>
          <div className="font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight">${fmtN(MONTH_TARGET - monthRevenue)}</div>
          <div className="text-xs text-[var(--color-text-dim)] mt-0.5">en 7 días</div>
          <div className="mt-2.5 text-xs text-[var(--color-success)] flex items-center gap-1">
            <TrendingUp size={12} />Vas adelantado
          </div>
        </div>
      </div>
    </Card>
  );
}
