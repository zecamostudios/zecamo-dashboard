import { createClient } from "@/lib/supabase/server";
import type { Transaction, FinancePoint, ByLine, OwnerId, ServiceLine } from "@/lib/types";

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

function rowToTransaction(row: Record<string, unknown>): Transaction {
  const fecha = String(row.fecha ?? "").slice(0, 10);
  const [, , dd] = fecha.split("-");
  const monthKey = String(row.fecha ?? "").slice(5, 7);
  const monthLabel = MONTH_LABELS[monthKey] ?? monthKey;
  const d = `${dd} ${monthLabel}`;

  return {
    dbId: String(row.id ?? ""),
    d,
    c: String(row.concepto ?? row.descripcion ?? ""),
    line: (String(row.linea_servicio ?? "Ops")) as ServiceLine | "Ops",
    a: Number(row.monto_usd ?? 0),
    type: row.tipo === "egreso" ? "out" : "in",
    owner: (String(row.owner_initials ?? "JS")) as OwnerId,
  };
}

export async function getTransactions(limit = 20): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transacciones")
    .select("id, fecha, tipo, concepto, descripcion, monto_usd, linea_servicio, owner_initials")
    .order("fecha", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => rowToTransaction(row as Record<string, unknown>));
}

export async function getFinanceSeries(): Promise<FinancePoint[]> {
  const supabase = await createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data, error } = await supabase
    .from("transacciones")
    .select("fecha, tipo, monto_usd")
    .gte("fecha", sixMonthsAgo.toISOString().slice(0, 10))
    .order("fecha");

  if (error || !data) {
    // Fallback: return last 6 months empty
    const months: FinancePoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ m: MONTH_LABELS[String(d.getMonth() + 1).padStart(2, "0")] ?? "", in: 0, out: 0 });
    }
    return months;
  }

  // Aggregate by month
  const byMonth = new Map<string, { in: number; out: number }>();
  for (const row of data) {
    const monthKey = String(row.fecha).slice(0, 7); // YYYY-MM
    if (!byMonth.has(monthKey)) byMonth.set(monthKey, { in: 0, out: 0 });
    const m = byMonth.get(monthKey)!;
    if (row.tipo === "ingreso") m.in += Number(row.monto_usd);
    else m.out += Number(row.monto_usd);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, vals]) => ({
      m: MONTH_LABELS[key.slice(5, 7)] ?? key.slice(5, 7),
      in: Math.round(vals.in),
      out: Math.round(vals.out),
    }));
}

export async function getByLine(): Promise<ByLine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transacciones")
    .select("linea_servicio, monto_usd, tipo")
    .eq("tipo", "ingreso");

  if (error || !data) return [];

  const totals = new Map<string, number>();
  let grandTotal = 0;
  for (const row of data) {
    const line = String(row.linea_servicio ?? "Ops");
    if (line === "Ops") continue;
    const v = Number(row.monto_usd ?? 0);
    totals.set(line, (totals.get(line) ?? 0) + v);
    grandTotal += v;
  }

  return Array.from(totals.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([id, v]) => ({
      id: id as ServiceLine,
      v: Math.round(v),
      pct: grandTotal > 0 ? Math.round((v / grandTotal) * 100) : 0,
    }));
}
