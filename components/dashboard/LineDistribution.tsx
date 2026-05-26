import { Sparkles } from "lucide-react";
import { BY_LINE } from "@/lib/mock-data";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { fmtN } from "@/lib/utils";

const LINE_GRADIENT: Record<string, string> = {
  AIMA: "linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))",
  Webs: "linear-gradient(90deg, var(--color-success), #4FE0AA)",
  B2B: "linear-gradient(90deg, var(--color-purple), #C29DFF)",
  "Diagnóstico": "linear-gradient(90deg, var(--color-warning), #FFC459)",
};

export function LineDistribution() {
  // TODO: reemplazar por agregación de Supabase (vista `finance_by_line`)
  return (
    <Card>
      <CardHead>
        <CardTitle big icon={<Sparkles size={14} />}>Por línea de servicio</CardTitle>
      </CardHead>
      {BY_LINE.map((it) => (
        <div key={it.id} className="mb-3 last:mb-0">
          <div className="flex justify-between text-[12.5px] mb-1.5">
            <Pill variant={it.id}>{it.id}</Pill>
            <span>
              <span className="font-mono font-semibold">${fmtN(it.v ?? 0)}</span>{" "}
              <span className="text-[var(--color-text-muted)]">· {it.pct}%</span>
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full shadow-[0_0_6px_var(--color-glow)]"
              style={{ width: `${it.pct}%`, background: LINE_GRADIENT[it.id] ?? "var(--color-primary)" }}
            />
          </div>
        </div>
      ))}
    </Card>
  );
}
