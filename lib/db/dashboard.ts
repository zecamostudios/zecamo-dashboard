import { createClient } from "@/lib/supabase/server";
import type { FinancePoint } from "@/lib/types";

export interface DashboardStats {
  totalMrr: number;
  activeClients: number;
  monthRevenue: number;
  inFunnel: number;
  inFunnelValue: number;
  pendingTasks: number;
  activeProspects: number;
  financeData: FinancePoint[];
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [clientesRes, prospectoRes, tareasRes, transRes] = await Promise.all([
    supabase.from("clientes").select("mrr_usd, ui_status"),
    supabase.from("prospectos").select("etapa, valor_estimado"),
    supabase.from("tareas").select("estado"),
    supabase.from("transacciones").select("fecha, tipo, monto_usd").order("fecha"),
  ]);

  const clientes = clientesRes.data ?? [];
  const prospectos = prospectoRes.data ?? [];
  const tareas = tareasRes.data ?? [];
  const transacciones = transRes.data ?? [];

  const activeClients = clientes.filter((c) => c.ui_status === "active");
  const totalMrr = activeClients.reduce((s, c) => s + Number(c.mrr_usd ?? 0), 0);

  const inactiveStages = ["venta", "noresp", "noventa", "seguim"];
  const funnelProspects = prospectos.filter((p) => !inactiveStages.includes(String(p.etapa)));
  const inFunnel = funnelProspects.length;
  const inFunnelValue = funnelProspects.reduce((s, p) => s + Number(p.valor_estimado ?? 0), 0);

  const pendingTasks = tareas.filter((t) => t.estado !== "done").length;
  const activeProspects = inFunnel;

  // Build 6-month finance series
  const byMonth = new Map<string, { in: number; out: number }>();
  for (const tx of transacciones) {
    const monthKey = String(tx.fecha).slice(0, 7);
    if (!byMonth.has(monthKey)) byMonth.set(monthKey, { in: 0, out: 0 });
    const m = byMonth.get(monthKey)!;
    if (tx.tipo === "ingreso") m.in += Number(tx.monto_usd);
    else m.out += Number(tx.monto_usd);
  }

  const financeData: FinancePoint[] = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, vals]) => ({
      m: MONTH_LABELS[key.slice(5, 7)] ?? key.slice(5, 7),
      in: Math.round(vals.in),
      out: Math.round(vals.out),
    }));

  const monthRevenue = financeData.length > 0 ? financeData[financeData.length - 1].in : 0;

  return {
    totalMrr,
    activeClients: activeClients.length,
    monthRevenue,
    inFunnel,
    inFunnelValue,
    pendingTasks,
    activeProspects,
    financeData,
  };
}
