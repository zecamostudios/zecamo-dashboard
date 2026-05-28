"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Target, Clock, Sparkles, Globe } from "lucide-react";
import { OWNERS, STAGES, PROSPECTS, LINES } from "@/lib/mock-data";
import type { FinancePoint, Prospect, StageId } from "@/lib/types";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Tabs } from "@/components/ui-zecamo/Tabs";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Pill } from "@/components/ui-zecamo/Pill";
import { KpiGrid } from "./KpiGrid";
import { FunnelChart, type StageTime } from "./FunnelChart";
import { RetentionTable } from "./RetentionTable";

type Period = "Mes" | "3M" | "6M" | "YTD";

const EXCLUDED: StageId[] = ["noresp", "noventa", "seguim"];

interface AnaliticasViewProps {
  initialProspects?: Prospect[];
  initialFinance?: FinancePoint[];
}

export function AnaliticasView({ initialProspects }: AnaliticasViewProps) {
  const [period, setPeriod] = useState<Period>("6M");

  const allProspects = initialProspects ?? PROSPECTS;

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

  const stageTime: StageTime[] = [
    { id: "lead", l: "Lead nuevo", d: 1.5 },
    { id: "discovery", l: "Discovery agendada", d: 3.2 },
    { id: "call1", l: "Llamada 1 hecha", d: 4.1 },
    { id: "propuesta", l: "Propuesta agendada", d: 5.8 },
    { id: "call2", l: "Llamada 2 (cierre)", d: 3.5 },
  ];
  const totalCycle = stageTime.reduce((s, t) => s + t.d, 0);

  const closeRate = allProspects.length
    ? Math.round((allProspects.filter((p) => p.stage === "venta").length / allProspects.length) * 100)
    : 0;
  const avgDeal = allProspects.length
    ? Math.round(allProspects.reduce((s, p) => s + p.value, 0) / allProspects.length)
    : 0;

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

  void period;

  return (
    <>
      <PageHead
        title="Analíticas"
        subtitle="Métricas operativas · funnel, tiempos y conversiones"
        actions={
          <>
            <Tabs
              value={period}
              onChange={(v) => setPeriod(v as Period)}
              tabs={(["Mes", "3M", "6M", "YTD"] as const).map((r) => ({ value: r, label: r }))}
            />
            <Button><ExternalLink size={12} />Exportar</Button>
          </>
        }
      />

      <KpiGrid closeRate={closeRate} totalCycle={totalCycle} avgDeal={avgDeal} />

      {/* Funnel + tiempos */}
      <div className="grid grid-cols-12 gap-[14px] mb-[14px]">
        <Card className="col-span-7 max-[1100px]:col-span-12">
          <CardHead>
            <CardTitle big icon={<Target size={16} />}>Funnel de conversión</CardTitle>
            <span className="font-mono text-[11.5px] text-[var(--color-text-muted)]">
              {PROSPECTS.length} prospectos · {PROSPECTS.filter((p) => p.stage === "venta").length} cerrados
            </span>
          </CardHead>
          <FunnelChart stages={cumulativeStages} stageTime={stageTime} mode="funnel" />
          <div className="mt-[18px] px-3.5 py-3 bg-white/[0.02] border border-[var(--color-border)] rounded-xl text-[12px] text-[var(--color-text-muted)]">
            <b className="text-[var(--color-text)]">Bottleneck:</b> mayor caída entre{" "}
            <span className="text-[var(--color-purple)]">Propuesta</span> y{" "}
            <span className="text-[var(--color-warning)]">Llamada 2</span> — revisar manejo de objeciones.
          </div>
        </Card>

        <Card className="col-span-5 max-[1100px]:col-span-12">
          <CardHead>
            <CardTitle big icon={<Clock size={16} />}>Tiempo promedio por etapa</CardTitle>
          </CardHead>
          <FunnelChart stages={cumulativeStages} stageTime={stageTime} mode="time" />
          <div className="pt-2 mt-2 border-t border-[var(--color-border)] flex justify-between text-[13px] font-semibold">
            <span>Total ciclo</span>
            <span className="font-mono text-[var(--color-primary-hover)]">{totalCycle.toFixed(1)} días</span>
          </div>
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
