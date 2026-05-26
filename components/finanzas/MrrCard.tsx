import { DollarSign, ArrowUp } from "lucide-react";
import { fmtN } from "@/lib/utils";
import { Sparkline } from "@/components/charts/Sparkline";

interface MrrCardProps {
  symbol: string;
  value: number;
  growth: number;
  spark: number[];
}

export function MrrCard({ symbol, value, growth, spark }: MrrCardProps) {
  return (
    <div className="relative rounded-[20px] border border-[rgba(43,91,255,0.25)] p-5 overflow-hidden bg-gradient-to-b from-[rgba(43,91,255,0.10)] to-[rgba(43,91,255,0.02)] shadow-[0_0_0_1px_rgba(43,91,255,0.25),0_8px_28px_rgba(43,91,255,0.18)]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">
          MRR actual
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/[0.06] grid place-items-center text-[var(--color-primary-hover)]">
          <DollarSign size={15} />
        </div>
      </div>
      <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
        <span className="text-[var(--color-text-muted)] text-[18px] mr-0.5">{symbol}</span>
        {fmtN(value)}
        <span className="text-[var(--color-text-muted)] text-[14px] ml-1 font-normal">/mo</span>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[11.5px]">
        <span className="font-mono font-medium text-[var(--color-success)] inline-flex items-center gap-0.5">
          <ArrowUp size={10} />+{growth}%
        </span>
        <span className="text-[var(--color-text-dim)]">vs mes anterior</span>
      </div>
      <div className="-mx-1 mt-2">
        <Sparkline data={spark} color="var(--color-primary-hover)" height={32} />
      </div>
    </div>
  );
}
