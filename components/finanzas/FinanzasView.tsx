"use client";

import { useState, useMemo } from "react";
import {
  Target,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Plus,
  BarChart3,
  Sparkles,
  Wallet,
  Filter,
  ArrowRight,
  Clock,
} from "lucide-react";
import { CLIENTS, FINANCE, TRANSACTIONS, BY_LINE } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { fmtN } from "@/lib/utils";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Tabs } from "@/components/ui-zecamo/Tabs";
import { AreaChart } from "@/components/charts/AreaChart";
import { MrrCard } from "./MrrCard";
import { TransactionRow } from "./TransactionRow";
import { LineDistribution } from "./LineDistribution";
import type { Client, Transaction, FinancePoint, ByLine, ServiceLine } from "@/lib/types";

type Currency = "USD" | "ARS";
type Range = "Mes" | "3M" | "6M" | "YTD";

function exportCSV(transactions: Transaction[], fmt: (n: number) => string) {
  const rows = [
    ["Fecha", "Concepto", "Línea", "Owner", "Tipo", "Monto"],
    ...transactions.map((tx) => [tx.d, tx.c, tx.line, tx.owner, tx.type, fmt(tx.a)]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finanzas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const MODAL_INPUT = "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition";

const RATE = 1180;

// Etiquetas completas y claras para el selector de línea (el value sigue siendo el código corto que espera la DB)
const LINE_LABELS: { id: ServiceLine; label: string }[] = [
  { id: "AIMA", label: "Automatización con IA" },
  { id: "B2B", label: "Outbound y ventas B2B" },
  { id: "Webs", label: "Diseño y desarrollo web" },
  { id: "Diagnóstico", label: "Diagnóstico (Express / Premium)" },
];

interface FinanzasViewProps {
  initialClients?: Client[];
  initialTransactions?: Transaction[];
  initialFinance?: FinancePoint[];
  initialByLine?: ByLine[];
}

export function FinanzasView({ initialClients, initialTransactions, initialFinance, initialByLine }: FinanzasViewProps) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [range, setRange] = useState<Range>("6M");
  const [showAll, setShowAll] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txForm, setTxForm] = useState({ date: "", concept: "", line: "Webs", owner: "JS", type: "ingreso", amount: "" });

  const conv = (n: number) => (currency === "USD" ? n : Math.round(n * RATE));
  const symbol = currency;
  const fmt = (n: number) => `${symbol} ${fmtN(conv(n))}`;

  const allClients = initialClients ?? CLIENTS;
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(initialTransactions ?? TRANSACTIONS);
  const allFinance = initialFinance ?? FINANCE;
  const allByLine = initialByLine ?? BY_LINE;

  const totalIn = useMemo(() => allFinance.reduce((s, d) => s + d.in, 0), [allFinance]);
  const totalOut = useMemo(() => allFinance.reduce((s, d) => s + d.out, 0), [allFinance]);
  const netto = totalIn - totalOut;
  const margin = totalIn > 0 ? Math.round((netto / totalIn) * 100) : 0;

  const currentMrr = allClients.filter((c) => c.status === "active").reduce((s, c) => s + c.mrr, 0);
  const targetMrr = 8500;
  const growth = 16.7;

  const upcoming: { c: string; d: string; a: number }[] = [
    { c: "Salud Norte", d: "22 Jun", a: 1500 },
    { c: "Café Atlas", d: "22 Jun", a: 1200 },
    { c: "Inmobiliaria Casas", d: "22 Jun", a: 1800 },
    { c: "Estudio Mendoza", d: "22 Jun", a: 850 },
    { c: "Clínica Vet. Sol", d: "22 Jun", a: 1100 },
  ];

  void range; // used for UI filter — data filtering TODO: Supabase

  return (
    <>
      <PageHead
        title="Finanzas"
        subtitle="MRR, ingresos, egresos · vista consolidada"
        actions={
          <>
            <Tabs
              value={currency}
              onChange={(v) => setCurrency(v as Currency)}
              tabs={[
                { value: "USD", label: "USD" },
                { value: "ARS", label: "ARS" },
              ]}
            />
            <Tabs
              value={range}
              onChange={(v) => setRange(v as Range)}
              tabs={(["Mes", "3M", "6M", "YTD"] as const).map((r) => ({ value: r, label: r }))}
            />
            <Button onClick={() => exportCSV(allTransactions, fmt)}>
              <ExternalLink size={12} />Exportar
            </Button>
            <Button variant="primary" onClick={() => setShowTxModal(true)}>
              <Plus size={14} />Nueva transacción
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-[14px] mb-[18px] max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
        <MrrCard
          symbol={symbol}
          value={conv(currentMrr)}
          growth={growth}
          spark={[2400, 2900, 3200, 3600, 4100, 4400, currentMrr]}
        />
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">MRR objetivo M3</div>
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] grid place-items-center text-[var(--color-text-muted)]"><Target size={15} /></div>
          </div>
          <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
            {symbol} {fmtN(conv(targetMrr))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11.5px]">
            <span className="font-mono text-[var(--color-text-muted)]">{Math.round((currentMrr / targetMrr) * 100)}% del objetivo</span>
            <span className="text-[var(--color-text-dim)]">en 3 meses</span>
          </div>
          <div className="bg-white/[0.05] rounded-full overflow-hidden h-1.5 mt-[6px]">
            <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] shadow-[0_0_6px_var(--color-glow)]"
              style={{ width: `${(currentMrr / targetMrr) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">Ingresos 6M</div>
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] grid place-items-center text-[var(--color-text-muted)]"><TrendingUp size={15} /></div>
          </div>
          <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
            <span className="text-[var(--color-text-muted)] text-[18px] mr-0.5">{symbol}</span>{fmtN(conv(totalIn))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11.5px]">
            <span className="font-mono text-[var(--color-success)] inline-flex items-center gap-0.5"><ArrowUp size={10} />+24%</span>
            <span className="text-[var(--color-text-dim)]">vs período anterior</span>
          </div>
        </div>
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">Egresos 6M</div>
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] grid place-items-center text-[var(--color-text-muted)]"><ArrowDown size={15} /></div>
          </div>
          <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
            <span className="text-[var(--color-text-muted)] text-[18px] mr-0.5">{symbol}</span>{fmtN(conv(totalOut))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11.5px]">
            <span className="font-mono text-[var(--color-success)] inline-flex items-center gap-0.5"><ArrowUp size={10} />+8%</span>
            <span className="text-[var(--color-text-dim)]">controlado</span>
          </div>
        </div>
      </div>

      {/* Chart + por línea */}
      <div className="grid grid-cols-12 gap-[14px] mb-[14px]">
        <Card className="col-span-8 max-[1100px]:col-span-12">
          <CardHead>
            <CardTitle big icon={<BarChart3 size={16} />}>Flujo · ingresos vs egresos</CardTitle>
            <span className="font-mono text-[11.5px] text-[var(--color-text-muted)]">
              Neto +{fmt(netto)} · margen {margin}%
            </span>
          </CardHead>
          <div className="flex gap-6 mb-3 flex-wrap">
            <Summary label="Ingresos" value={fmt(totalIn)} dotColor="var(--color-primary-hover)" />
            <Summary label="Egresos" value={fmt(totalOut)} dotColor="var(--color-purple)" />
            <Summary label="Neto" value={`+${fmt(netto)}`} valueColor="var(--color-success)" />
            <Summary label="Margen" value={`${margin}%`} />
          </div>
          <AreaChart data={allFinance} height={260} />
        </Card>

        <Card className="col-span-4 max-[1100px]:col-span-12">
          <CardHead>
            <CardTitle big icon={<Sparkles size={16} />}>Por línea de servicio</CardTitle>
          </CardHead>
          <LineDistribution items={allByLine} totalFormatter={fmt} />
        </Card>
      </div>

      {/* Transacciones */}
      <div className="grid grid-cols-12 gap-[14px]">
        <Card className="col-span-8 p-0 max-[1100px]:col-span-12">
          <div className="p-[22px_22px_0]">
            <CardHead>
              <CardTitle big icon={<Wallet size={16} />}>Transacciones recientes</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" className="px-2 py-1" onClick={() => toast.info("Filtros disponibles: seleccioná rango y moneda en el encabezado.")}>
                  <Filter size={12} />Filtrar
                </Button>
                <Button variant="ghost" className="px-2 py-1" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Ver menos" : "Ver todas"} <ArrowRight size={12} />
                </Button>
              </div>
            </CardHead>
          </div>
          <div className="overflow-x-auto px-[22px] pb-[22px]">
            <table className="w-full text-[13px]">
              <thead className="text-left text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="py-2 font-medium">Fecha</th>
                  <th className="py-2 font-medium">Concepto</th>
                  <th className="py-2 font-medium">Línea</th>
                  <th className="py-2 font-medium">Owner</th>
                  <th className="py-2 font-medium">Tipo</th>
                  <th className="py-2 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? allTransactions : allTransactions.slice(0, 8)).map((tx, i) => (
                  <TransactionRow key={i} tx={tx} format={fmt} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="col-span-4 flex flex-col gap-[14px] max-[1100px]:col-span-12">
          <Card>
            <CardHead>
              <CardTitle big icon={<Clock size={16} />}>Próximos cobros</CardTitle>
            </CardHead>
            {upcoming.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-[9px] border-b border-[var(--color-border)] last:border-b-0">
                <div>
                  <div className="text-[13px]">{p.c}</div>
                  <div className="font-mono text-[10.5px] text-[var(--color-text-muted)]">{p.d}</div>
                </div>
                <span className="font-mono text-[12px] font-semibold text-[var(--color-success)]">+{fmt(p.a)}</span>
              </div>
            ))}
            <div className="pt-[10px] flex justify-between text-[12.5px] font-semibold">
              <span>Total esperado</span>
              <span className="font-mono text-[var(--color-success)]">{fmt(6450)}</span>
            </div>
          </Card>

          <Card glow>
            <CardHead>
              <CardTitle big icon={<Sparkles size={16} />}>
                <span className="text-[var(--color-primary-hover)]">Insight</span>
              </CardTitle>
            </CardHead>
            <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
              Si mantenés el crecimiento del {growth}% mensual, llegás al MRR objetivo en{" "}
              <b className="text-[var(--color-primary-hover)]">~9 semanas</b>.
            </p>
            <div className="mt-3.5 px-3 py-2.5 bg-[rgba(34,197,139,0.08)] border border-[rgba(34,197,139,0.2)] rounded-[10px] text-[11.5px] text-[var(--color-text-muted)]">
              <b className="text-[var(--color-success)]">Recomendación:</b> el costo Ops es 3.7% de ingresos. Hay margen para invertir en herramientas.
            </div>
          </Card>
        </div>
      </div>

      {/* Nueva transacción modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowTxModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">Nueva transacción</h2>
              <button onClick={() => setShowTxModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Concepto *</label>
                <input value={txForm.concept} onChange={(e) => setTxForm((f) => ({ ...f, concept: e.target.value }))} placeholder="Ej: Mensualidad cliente X" className={MODAL_INPUT} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Tipo</label>
                  <select value={txForm.type} onChange={(e) => setTxForm((f) => ({ ...f, type: e.target.value }))} className={MODAL_INPUT}>
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Monto (USD)</label>
                  <input type="number" value={txForm.amount} onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" className={MODAL_INPUT} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Línea</label>
                  <select value={txForm.line} onChange={(e) => setTxForm((f) => ({ ...f, line: e.target.value }))} className={MODAL_INPUT}>
                    {LINE_LABELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Fecha</label>
                  <input type="date" value={txForm.date} onChange={(e) => setTxForm((f) => ({ ...f, date: e.target.value }))} className={MODAL_INPUT} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowTxModal(false)} className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer transition hover:border-[var(--color-border-2)]">Cancelar</button>
              <button
                onClick={async () => {
                  if (!txForm.concept.trim()) return;
                  const supabase = createClient();
                  const saved = { ...txForm };
                  const today = saved.date || new Date().toISOString().slice(0, 10);
                  const [, , dd] = today.split("-");
                  const MONTHS: Record<string, string> = { "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun", "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic" };
                  const optimistic: Transaction = {
                    d: `${dd} ${MONTHS[today.slice(5, 7)] ?? ""}`,
                    c: saved.concept.trim(),
                    line: saved.line as Transaction["line"],
                    a: Number(saved.amount) || 0,
                    type: saved.type === "egreso" ? "out" : "in",
                    owner: saved.owner as Transaction["owner"],
                  };
                  setAllTransactions((prev) => [optimistic, ...prev]);
                  setShowTxModal(false);
                  setTxForm({ date: "", concept: "", line: "Webs", owner: "JS", type: "ingreso", amount: "" });
                  toast.success(`Transacción "${saved.concept}" registrada`);
                  const { error } = await supabase.from("transacciones").insert({
                    fecha: today,
                    tipo: saved.type as "ingreso" | "egreso",
                    concepto: saved.concept.trim(),
                    monto_usd: Number(saved.amount) || 0,
                    linea_servicio: saved.line,
                    owner_initials: saved.owner,
                  });
                  if (error) toast.error("Error al guardar en Supabase");
                }}
                className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Summary({ label, value, dotColor, valueColor }: { label: string; value: string; dotColor?: string; valueColor?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
        {dotColor && <span className="w-2 h-2 rounded-[2px]" style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />}
        {label}
      </div>
      <div className="font-mono text-[14px] font-semibold mt-1" style={{ color: valueColor ?? "var(--color-text)" }}>{value}</div>
    </div>
  );
}
