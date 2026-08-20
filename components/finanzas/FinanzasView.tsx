"use client";

import { useState, useMemo, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { useLiveRows } from "@/lib/hooks/useLiveRows";
import { TX_COLS, rowToTransaction } from "@/lib/db/mappers";
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

const RATE = 1180; // fallback si la API del blue no responde

// Etiquetas completas y claras para el selector de línea (el value sigue siendo el código corto que espera la DB)
const LINE_LABELS: { id: ServiceLine; label: string }[] = [
  { id: "AIMA", label: "Automatización con IA" },
  { id: "B2B", label: "Outbound y ventas B2B" },
  { id: "Webs", label: "Diseño y desarrollo web" },
  { id: "Diagnóstico", label: "Diagnóstico (Express / Premium)" },
];

// Categorías de gasto para egresos (la línea de servicio no aplica a egresos)
const CATEGORIAS_EGRESO = [
  "Herramientas",
  "Sueldos",
  "Publicidad",
  "Subcontratación",
  "Impuestos",
  "Infraestructura",
  "Otros",
] as const;

type TxForm = {
  dbId: string;
  date: string;
  concept: string;
  line: string;
  owner: string;
  type: "ingreso" | "egreso";
  amount: string;
  moneda: Currency;
  cotizacion: string;
  claseEgreso: "fijo" | "variable";
  lineas: string[];
  categoria: string;
  clienteId: string;
  esMensualidad: boolean;
};

const MONTHS: Record<string, string> = { "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun", "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic" };

function emptyForm(rate: number): TxForm {
  return { dbId: "", date: "", concept: "", line: "Webs", owner: "JS", type: "ingreso", amount: "", moneda: "USD", cotizacion: String(rate), claseEgreso: "variable", lineas: ["Webs"], categoria: "Herramientas", clienteId: "", esMensualidad: false };
}

interface FinanzasViewProps {
  initialClients?: Client[];
  initialTransactions?: Transaction[];
  initialFinance?: FinancePoint[];
  initialByLine?: ByLine[];
  initialMrrObjetivo?: number;
}

export function FinanzasView({ initialClients, initialTransactions, initialFinance, initialByLine, initialMrrObjetivo }: FinanzasViewProps) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [range, setRange] = useState<Range>("6M");
  const [showAll, setShowAll] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [blueRate, setBlueRate] = useState<number>(RATE);
  const [blueLoading, setBlueLoading] = useState(false);
  const [txForm, setTxForm] = useState<TxForm>(emptyForm(RATE));

  // Cotización del dólar blue en vivo (autocompleta el modal y la vista en ARS)
  useEffect(() => {
    let alive = true;
    setBlueLoading(true);
    fetch("https://dolarapi.com/v1/dolares/blue")
      .then((r) => r.json())
      .then((d) => { if (alive && d?.venta) setBlueRate(Math.round(Number(d.venta))); })
      .catch(() => {})
      .finally(() => { if (alive) setBlueLoading(false); });
    return () => { alive = false; };
  }, []);

  const conv = (n: number) => (currency === "USD" ? n : Math.round(n * blueRate));
  const symbol = currency;
  const fmt = (n: number) => `${symbol} ${fmtN(conv(n))}`;

  function openCreate() {
    setIsEditing(false);
    setTxForm({ ...emptyForm(blueRate) });
    setShowTxModal(true);
  }

  function openEdit(tx: Transaction) {
    setIsEditing(true);
    setTxForm({
      dbId: tx.dbId ?? "",
      date: tx.fecha ?? "",
      concept: tx.c,
      line: tx.line === "Ops" ? "Webs" : tx.line,
      owner: tx.owner,
      type: tx.type === "out" ? "egreso" : "ingreso",
      amount: String(tx.montoOriginal ?? tx.a),
      moneda: tx.moneda ?? "USD",
      cotizacion: String(tx.cotizacion ?? blueRate),
      claseEgreso: tx.claseEgreso ?? "variable",
      lineas: (() => {
        const ls = (tx.lineas && tx.lineas.length ? tx.lineas : [tx.line]).filter((l) => l !== "Ops");
        return ls.length ? ls : ["Webs"];
      })(),
      categoria: tx.categoria ?? "Herramientas",
      clienteId: tx.clienteId ?? "",
      esMensualidad: tx.esMensualidad ?? false,
    });
    setShowTxModal(true);
  }

  const allClients = initialClients ?? [];
  const [allTransactions, setAllTransactions] = useLiveRows(initialTransactions ?? [], {
    table: "transacciones", columns: TX_COLS, order: { column: "fecha" }, limit: 100, map: rowToTransaction,
  });
  const allFinance = initialFinance ?? [];
  const allByLine = initialByLine ?? [];

  // Objetivo de MRR editable (persistido en app_config)
  const [mrrObjetivo, setMrrObjetivo] = useState<number>(initialMrrObjetivo ?? 8500);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState<string>(String(initialMrrObjetivo ?? 8500));

  const saveGoal = async () => {
    const val = Math.max(0, Math.round(Number(goalInput) || 0));
    setMrrObjetivo(val);
    setEditingGoal(false);
    const supabase = createClient();
    const { error } = await supabase.from("app_config").update({ valor: val }).eq("clave", "mrr_objetivo");
    if (error) toast.error("No se pudo guardar el objetivo"); else toast.success("Objetivo de MRR actualizado");
  };

  const totalIn = useMemo(() => allFinance.reduce((s, d) => s + d.in, 0), [allFinance]);
  const totalOut = useMemo(() => allFinance.reduce((s, d) => s + d.out, 0), [allFinance]);
  const netto = totalIn - totalOut;
  const margin = totalIn > 0 ? Math.round((netto / totalIn) * 100) : 0;

  const currentMrr = allClients.filter((c) => c.status === "active").reduce((s, c) => s + c.mrr, 0);
  const targetMrr = mrrObjetivo;

  // Crecimiento real: último mes de ingresos vs el anterior
  const growth = useMemo(() => {
    if (allFinance.length < 2) return 0;
    const last = allFinance[allFinance.length - 1].in;
    const prev = allFinance[allFinance.length - 2].in;
    if (prev <= 0) return 0;
    return Math.round(((last - prev) / prev) * 1000) / 10;
  }, [allFinance]);

  // Deltas reales mes contra mes para las tarjetas de ingresos/egresos
  const inDelta = useMemo(() => {
    if (allFinance.length < 2) return null;
    const a = allFinance[allFinance.length - 1].in, b = allFinance[allFinance.length - 2].in;
    return b > 0 ? Math.round(((a - b) / b) * 100) : null;
  }, [allFinance]);
  const outDelta = useMemo(() => {
    if (allFinance.length < 2) return null;
    const a = allFinance[allFinance.length - 1].out, b = allFinance[allFinance.length - 2].out;
    return b > 0 ? Math.round(((a - b) / b) * 100) : null;
  }, [allFinance]);

  // Sparkline real del MRR (ingresos mensuales), con el MRR actual al final
  const mrrSpark = useMemo(() => {
    const s = allFinance.map((f) => f.in);
    return s.length ? [...s, currentMrr] : [currentMrr];
  }, [allFinance, currentMrr]);

  // Próximos cobros reales: clientes activos con mensualidad (mrr > 0)
  const upcoming = useMemo(
    () =>
      allClients
        .filter((c) => c.status === "active" && c.mrr > 0)
        .sort((a, b) => b.mrr - a.mrr)
        .map((c) => ({ c: c.name, d: "Mensual", a: c.mrr })),
    [allClients],
  );
  const upcomingTotal = useMemo(() => upcoming.reduce((s, p) => s + p.a, 0), [upcoming]);

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
            <Button variant="primary" onClick={openCreate}>
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
          spark={mrrSpark}
        />
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">MRR objetivo</div>
            <button
              onClick={() => { setGoalInput(String(targetMrr)); setEditingGoal((v) => !v); }}
              className="w-7 h-7 rounded-lg bg-white/[0.04] grid place-items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-0 cursor-pointer transition"
              title="Editar objetivo"
            >
              <Target size={15} />
            </button>
          </div>
          {editingGoal ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                autoFocus
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveGoal(); if (e.key === "Escape") setEditingGoal(false); }}
                className="w-full rounded-lg bg-white/[0.04] border border-[var(--color-border)] text-[20px] font-medium px-2 py-1 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)]"
              />
              <button onClick={saveGoal} className="text-[12px] px-2.5 py-1.5 rounded-lg bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer">OK</button>
            </div>
          ) : (
            <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
              {symbol} {fmtN(conv(targetMrr))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 text-[11.5px]">
            <span className="font-mono text-[var(--color-text-muted)]">{targetMrr > 0 ? Math.round((currentMrr / targetMrr) * 100) : 0}% del objetivo</span>
            <span className="text-[var(--color-text-dim)]">MRR actual {symbol} {fmtN(conv(currentMrr))}</span>
          </div>
          <div className="bg-white/[0.05] rounded-full overflow-hidden h-1.5 mt-[6px]">
            <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] shadow-[0_0_6px_var(--color-glow)]"
              style={{ width: `${targetMrr > 0 ? Math.min(100, (currentMrr / targetMrr) * 100) : 0}%` }} />
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
            {inDelta != null ? (
              <span className={`font-mono inline-flex items-center gap-0.5 ${inDelta >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                {inDelta >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{inDelta >= 0 ? "+" : ""}{inDelta}%
              </span>
            ) : (
              <span className="font-mono text-[var(--color-text-dim)]">—</span>
            )}
            <span className="text-[var(--color-text-dim)]">vs mes anterior</span>
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
            {outDelta != null ? (
              <span className={`font-mono inline-flex items-center gap-0.5 ${outDelta <= 0 ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"}`}>
                {outDelta >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{outDelta >= 0 ? "+" : ""}{outDelta}%
              </span>
            ) : (
              <span className="font-mono text-[var(--color-text-dim)]">—</span>
            )}
            <span className="text-[var(--color-text-dim)]">vs mes anterior</span>
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
                  <TransactionRow key={tx.dbId || i} tx={tx} format={fmt} onEdit={openEdit} />
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
            {upcoming.length === 0 ? (
              <p className="text-[12.5px] text-[var(--color-text-muted)] py-2">
                No hay mensualidades activas. Marcá clientes con MRR &gt; 0 para verlos acá.
              </p>
            ) : (
              <>
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
                  <span>Total esperado / mes</span>
                  <span className="font-mono text-[var(--color-success)]">{fmt(upcomingTotal)}</span>
                </div>
              </>
            )}
          </Card>

          <Card glow>
            <CardHead>
              <CardTitle big icon={<Sparkles size={16} />}>
                <span className="text-[var(--color-primary-hover)]">Resumen</span>
              </CardTitle>
            </CardHead>
            <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
              MRR actual <b className="text-[var(--color-text)]">{symbol} {fmtN(conv(currentMrr))}</b> ·
              objetivo <b className="text-[var(--color-primary-hover)]">{symbol} {fmtN(conv(targetMrr))}</b>
              {currentMrr < targetMrr
                ? <> — faltan <b className="text-[var(--color-text)]">{symbol} {fmtN(conv(targetMrr - currentMrr))}</b>.</>
                : <> — objetivo alcanzado ✅</>}
            </p>
            <div className="mt-3.5 px-3 py-2.5 bg-[rgba(34,197,139,0.08)] border border-[rgba(34,197,139,0.2)] rounded-[10px] text-[11.5px] text-[var(--color-text-muted)]">
              <b className="text-[var(--color-success)]">Margen neto:</b> {margin}% · Neto {fmt(netto)} en el período.
            </div>
          </Card>
        </div>
      </div>

      {/* Nueva / editar transacción modal */}
      {showTxModal && (() => {
        const montoOrig = Number(txForm.amount) || 0;
        const cot = Number(txForm.cotizacion) || blueRate;
        const montoUsdPreview = txForm.moneda === "ARS" ? (cot > 0 ? montoOrig / cot : 0) : montoOrig;

        const save = async () => {
          if (!txForm.concept.trim()) return;
          const supabase = createClient();
          const saved = { ...txForm };
          const today = saved.date || new Date().toISOString().slice(0, 10);
          const [, , dd] = today.split("-");
          const dLabel = `${dd} ${MONTHS[today.slice(5, 7)] ?? ""}`;
          const montoUsd = saved.moneda === "ARS" ? (cot > 0 ? Math.round((montoOrig / cot) * 100) / 100 : 0) : montoOrig;
          const isEgreso = saved.type === "egreso";
          const claseEgreso = isEgreso ? saved.claseEgreso : null;
          const categoria = isEgreso ? saved.categoria : null;
          const lineas = isEgreso ? null : (saved.lineas.length ? saved.lineas : ["Webs"]);
          const lineaServicio = isEgreso ? null : (lineas?.[0] ?? null);
          const clienteId = !isEgreso && saved.clienteId ? saved.clienteId : null;
          const esMensualidad = !isEgreso && saved.esMensualidad;
          const clienteNombre = clienteId ? allClients.find((c) => c.dbId === clienteId)?.name : undefined;

          const optimistic: Transaction = {
            dbId: saved.dbId || undefined,
            d: dLabel,
            fecha: today,
            c: saved.concept.trim(),
            line: (lineaServicio ?? "Ops") as Transaction["line"],
            lineas: (lineas ?? undefined) as Transaction["lineas"],
            a: montoUsd,
            type: isEgreso ? "out" : "in",
            owner: saved.owner as Transaction["owner"],
            moneda: saved.moneda,
            montoOriginal: montoOrig,
            cotizacion: saved.moneda === "ARS" ? cot : undefined,
            claseEgreso: claseEgreso ?? undefined,
            categoria: categoria ?? undefined,
            clienteId: clienteId ?? undefined,
            clienteNombre,
            esMensualidad,
          };

          const payload = {
            fecha: today,
            tipo: saved.type,
            concepto: saved.concept.trim(),
            monto_usd: montoUsd,
            monto_original: montoOrig,
            moneda: saved.moneda,
            cotizacion: saved.moneda === "ARS" ? cot : null,
            clase_egreso: claseEgreso,
            categoria,
            linea_servicio: lineaServicio,
            lineas_servicio: lineas,
            owner_initials: saved.owner,
            cliente_id: clienteId,
            es_mensualidad: esMensualidad,
          };

          setShowTxModal(false);

          if (isEditing && saved.dbId) {
            setAllTransactions((prev) => prev.map((t) => (t.dbId === saved.dbId ? optimistic : t)));
            toast.success(`Transacción "${saved.concept}" actualizada`);
            const { error } = await supabase.from("transacciones").update(payload).eq("id", saved.dbId);
            if (error) toast.error("Error al actualizar en Supabase");
          } else {
            setAllTransactions((prev) => [optimistic, ...prev]);
            toast.success(`Transacción "${saved.concept}" registrada`);
            const { data, error } = await supabase.from("transacciones").insert(payload).select("id").single();
            if (error) toast.error("Error al guardar en Supabase");
            else if (data?.id) {
              const newId = String(data.id);
              setAllTransactions((prev) => prev.map((t) => (t === optimistic ? { ...t, dbId: newId } : t)));
            }
          }
        };

        const handleDelete = async () => {
          if (!txForm.dbId) return;
          const supabase = createClient();
          const id = txForm.dbId;
          setAllTransactions((prev) => prev.filter((t) => t.dbId !== id));
          setShowTxModal(false);
          const { error } = await supabase.from("transacciones").delete().eq("id", id);
          if (error) toast.error("Error al eliminar"); else toast.success("Transacción eliminada");
        };

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowTxModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">{isEditing ? "Editar transacción" : "Nueva transacción"}</h2>
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
                  <select value={txForm.type} onChange={(e) => setTxForm((f) => ({ ...f, type: e.target.value as TxForm["type"] }))} className={MODAL_INPUT}>
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Moneda</label>
                  <select value={txForm.moneda} onChange={(e) => setTxForm((f) => ({ ...f, moneda: e.target.value as Currency, cotizacion: f.cotizacion || String(blueRate) }))} className={MODAL_INPUT}>
                    <option value="USD">USD (dólares)</option>
                    <option value="ARS">ARS (pesos)</option>
                  </select>
                </div>
              </div>

              {txForm.type === "egreso" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Categoría</label>
                    <select value={txForm.categoria} onChange={(e) => setTxForm((f) => ({ ...f, categoria: e.target.value }))} className={MODAL_INPUT}>
                      {CATEGORIAS_EGRESO.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Tipo de gasto</label>
                    <select value={txForm.claseEgreso} onChange={(e) => setTxForm((f) => ({ ...f, claseEgreso: e.target.value as TxForm["claseEgreso"] }))} className={MODAL_INPUT}>
                      <option value="fijo">Fijo</option>
                      <option value="variable">Variable</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Monto ({txForm.moneda})</label>
                  <input type="number" value={txForm.amount} onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" className={MODAL_INPUT} />
                </div>
                {txForm.moneda === "ARS" ? (
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">
                      Cotización {blueLoading ? "…" : "(blue)"}
                    </label>
                    <input type="number" value={txForm.cotizacion} onChange={(e) => setTxForm((f) => ({ ...f, cotizacion: e.target.value }))} placeholder={String(blueRate)} className={MODAL_INPUT} />
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Fecha</label>
                    <input type="date" value={txForm.date} onChange={(e) => setTxForm((f) => ({ ...f, date: e.target.value }))} className={MODAL_INPUT} />
                  </div>
                )}
              </div>

              {txForm.moneda === "ARS" && (
                <>
                  <div className="text-[11.5px] text-[var(--color-text-muted)] font-mono -mt-1">
                    ≈ USD {montoUsdPreview.toLocaleString("en-US", { maximumFractionDigits: 2 })} <span className="text-[var(--color-text-dim)]">(se guarda convertido al blue)</span>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Fecha</label>
                    <input type="date" value={txForm.date} onChange={(e) => setTxForm((f) => ({ ...f, date: e.target.value }))} className={MODAL_INPUT} />
                  </div>
                </>
              )}

              {txForm.type === "ingreso" && (
                <>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">
                      Servicios <span className="text-[var(--color-text-dim)] normal-case tracking-normal">(podés elegir varios)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LINE_LABELS.map((l) => {
                        const active = txForm.lineas.includes(l.id);
                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() =>
                              setTxForm((f) => ({
                                ...f,
                                lineas: active ? f.lineas.filter((x) => x !== l.id) : [...f.lineas, l.id],
                              }))
                            }
                            className={`px-3 py-1.5 rounded-full text-[12px] border cursor-pointer transition ${
                              active
                                ? "bg-[var(--color-primary-hover)] text-white border-[var(--color-primary-hover)]"
                                : "bg-white/[0.03] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-border-2)]"
                            }`}
                          >
                            {l.label}
                          </button>
                        );
                      })}
                    </div>
                    {txForm.lineas.length === 0 && (
                      <div className="text-[11px] text-[var(--color-warning)] mt-1.5">Elegí al menos un servicio</div>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Pago de cliente</label>
                    <select
                      value={txForm.clienteId}
                      onChange={(e) => {
                        const clienteId = e.target.value;
                        const cli = allClients.find((c) => c.dbId === clienteId);
                        setTxForm((f) => ({
                          ...f,
                          clienteId,
                          // si aún no escribió concepto y eligió cliente, autocompletamos
                          concept: f.concept.trim() || (cli ? `Mensualidad · ${cli.name}` : f.concept),
                          esMensualidad: clienteId ? f.esMensualidad : false,
                        }));
                      }}
                      className={MODAL_INPUT}
                    >
                      <option value="">— Sin cliente (ingreso suelto) —</option>
                      {allClients.map((c) => (
                        <option key={c.dbId} value={c.dbId}>{c.name}{c.mrr > 0 ? ` · ${c.mrr} USD/mes` : ""}</option>
                      ))}
                    </select>
                  </div>
                  {txForm.clienteId && (
                    <label className="flex items-center gap-2 text-[12.5px] text-[var(--color-text-muted)] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={txForm.esMensualidad}
                        onChange={(e) => setTxForm((f) => ({ ...f, esMensualidad: e.target.checked }))}
                        className="accent-[var(--color-primary-hover)] w-4 h-4"
                      />
                      Es la mensualidad recurrente de este cliente
                    </label>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              {isEditing && (
                <button onClick={handleDelete} className="py-2 px-3 rounded-xl text-[13px] text-[var(--color-danger)] border border-[rgba(255,84,102,0.3)] bg-transparent cursor-pointer transition hover:bg-[rgba(255,84,102,0.08)]">Eliminar</button>
              )}
              <button onClick={() => setShowTxModal(false)} className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer transition hover:border-[var(--color-border-2)]">Cancelar</button>
              <button
                onClick={save}
                className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition"
              >
                {isEditing ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}
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
