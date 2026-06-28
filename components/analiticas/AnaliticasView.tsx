"use client";

import { useMemo } from "react";
import { ExternalLink, Target, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";
import { OWNERS, STAGES, LINES } from "@/lib/mock-data";
import { useLiveRows } from "@/lib/hooks/useLiveRows";
import { PROSPECT_COLS, rowToProspect } from "@/lib/db/mappers";
import type { FinancePoint, Prospect, StageId } from "@/lib/types";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Pill } from "@/components/ui-zecamo/Pill";
import { KpiGrid } from "./KpiGrid";
import { FunnelChart } from "./FunnelChart";
import { RetentionTable } from "./RetentionTable";

const EXCLUDED: StageId[] = ["noresp", "noventa", "seguim"];

interface AnaliticasViewProps {
  initialProspects?: Prospect[];
  initialFinance?: FinancePoint[];
}

export function AnaliticasView({ initialProspects }: AnaliticasViewProps) {
  const [allProspects] = useLiveRows(initialProspects ?? [], {
    table: "prospectos", columns: PROSPECT_COLS, order: { column: "created_at" }, map: rowToProspect,
  });

  const cumulativeStages = useMemo(() => {
    const active = STAGES.filter((s) => !EXCLUDED.includes(s.id));
    const counts = active.map((s) => ({
      id: s.id,
      label: s.label,
      count: allProspects.filter((p) => p.stage === s.id).length,
    }));
    let acc = 0;
    return [...counts]
      .reverse()
      .map((s) => {
        acc += s.count;
        return { ...s, count: acc };
      })
      .reverse();
  }, [allProspects]);

  const closeRate = allProspects.length
    ? Math.round((allProspects.filter((p) => p.stage === "venta").length / allProspects.length) * 100)
    : 0;
  const avgDeal = allProspects.length
    ? Math.round(allProspects.reduce((s, p) => s + p.value, 0) / allProspects.length)
    : 0;
  const totalProspects = allProspects.length;
  const pipelineValue = allProspects
    .filter((p) => !["venta", "noresp", "noventa", "seguim"].includes(p.stage))
    .reduce((s, p) => s + p.value, 0);

  const closeByOwner = useMemo(
    () =>
      OWNERS.map((o) => {
        const own = allProspects.filter((p) => p.owner === o.id);
        const won = own.filter((p) => p.stage === "venta").length;
        const lost = own.filter((p) => p.stage === "noventa" || p.stage === "noresp").length;
        return {
          id: o.id,
          name: o.name,
          short: o.short,
          total: own.length,
          won,
          lost,
          rate: own.length ? won / own.length : 0,
          value: own.filter((p) => p.stage === "venta").reduce((s, p) => s + p.value, 0),
        };
      }),
    [allProspects],
  );

  const sourcesArr = useMemo(() => {
    const map: Record<string, { n: number; won: number; value: number }> = {};
    allProspects.forEach((p) => {
      if (!map[p.source]) map[p.source] = { n: 0, won: 0, value: 0 };
      map[p.source].n++;
      if (p.stage === "venta") {
        map[p.source].won++;
        map[p.source].value += p.value;
      }
    });
    return Object.entries(map)
      .map(([k, v]) => ({ name: k, ...v, rate: v.won / v.n }))
      .sort((a, b) => b.n - a.n);
  }, [allProspects]);

  const byLine = useMemo(
    () =>
      LINES.map((l) => {
        const ps = allProspects.filter((p) => p.line === l.id);
        const won = ps.filter((p) => p.stage === "venta").length;
        return {
          id: l.id,
          total: ps.length,
          won,
          rate: ps.length ? won / ps.length : 0,
          value: ps.filter((p) => p.stage === "venta").reduce((s, p) => s + p.value, 0),
          pipeline: ps
            .filter((p) => !["venta", "noresp", "noventa", "seguim"].includes(p.stage))
            .reduce((s, p) => s + p.value, 0),
        };
      }),
    [allProspects],
  );

  function exportCSV() {
    const headers = ["Nombre", "Stage", "Valor", "Owner", "Línea", "Fuente"];
    const rows = allProspects.map((p) => [p.name, p.stage, p.value, p.owner, p.line, p.source]);
    const csv = [headers, ...rows].map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analiticas.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  }

  return (
    <>
      <PageHead
        title="Analíticas"
        subtitle="Métricas operativas · funnel y conversiones"
        actions={<Button onClick={exportCSV}><ExternalLink size={12} />Exportar</Button>}
      />

      <KpiGrid closeRate={closeRate} totalProspects={totalProspects} avgDeal={avgDeal} pipelineValue={pipelineValue} />

      {/* Funnel */}
      <div className="grid grid-cols-12 gap-[14px] mb-[14px]">
        <Card className="col-span-12">
          <CardHead>
            <CardTitle big icon={<Target size={16} />}>Funnel de conversión</CardTitle>
            <span className="font-mono text-[11.5px] text-[var(--color-text-muted)]">
              {allProspects.length} prospectos · {allProspects.filter((p) => p.stage === "venta").length} cerrados
            </span>
          </CardHead>
          <FunnelChart stages={cumulativeStages} stageTime={[]} mode="funnel" />
        </Card>
      </div>

      {/* Cierre por owner + Fuentes */}
      <div className="grid grid-cols-12 gap-[14px] mb-[14px]">
        <RetentionTable rows={closeByOwner.sort((a, b) => b.rate - a.rate)} />

        <Card className="col-span-5 max-[1100px]:col-span-12">
          <CardHead>
            <CardTitle big icon={<Globe size={16} />}>Top fuentes de leads</CardTitle>
          </CardHead>
          {sourcesArr.map((s) => {
            const max = sourcesArr[0].n;
            return (
              <div key={s.name} className="mb-3.5 last:mb-0">
                <div className="flex justify-between text-[12.5px] mb-1.5">
                  <span>{s.name}</span>
                  <span>
                    <span className="font-mono font-semibold">{s.n} leads</span>{" "}
                    <span className="text-[var(--color-text-muted)]">· {Math.round(s.rate * 100)}% cierre</span>
                  </span>
                </div>
                <div className="bg-white/[0.05] rounded-full overflow-hidden" style={{ height: 5 }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${(s.n / max) * 100}%`,
                      background:
                        s.rate > 0.2
                          ? "linear-gradient(90deg, var(--color-success), #4FE0AA)"
                          : "linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Por línea */}
      <Card>
        <CardHead>
          <CardTitle big icon={<Sparkles size={16} />}>Performance por línea de servicio</CardTitle>
        </CardHead>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="py-2 font-medium">Línea</th>
                <th className="py-2 font-medium">Prospectos</th>
                <th className="py-2 font-medium">Cerrados</th>
                <th className="py-2 font-medium">Tasa</th>
                <th className="py-2 font-medium text-right">Valor ganado</th>
                <th className="py-2 font-medium text-right">Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {byLine.map((l) => (
                <tr key={l.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="py-3"><Pill variant={l.id}>{l.id}</Pill></td>
                  <td className="py-3 font-mono">{l.total}</td>
                  <td className="py-3 font-mono text-[var(--color-success)] font-semibold">{l.won}</td>
                  <td className="py-3 w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/[0.05] rounded-full overflow-hidden" style={{ height: 4 }}>
                        <div
                          className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]"
                          style={{ width: `${l.rate * 100}%` }}
                        />
                      </div>
                      <span
                        className="font-mono text-[11.5px] w-10 text-right font-semibold"
                        style={{ color: l.rate > 0.15 ? "var(--color-success)" : "var(--color-text)" }}
                      >
                        {Math.round(l.rate * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono text-[var(--color-success)] font-semibold">
                    ${l.value.toLocaleString("en-US")}
                  </td>
                  <td className="py-3 text-right font-mono text-[var(--color-primary-hover)] font-semibold">
                    ${l.pipeline.toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
