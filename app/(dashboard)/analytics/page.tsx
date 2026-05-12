import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PROSPECTO_LABELS, ESTADOS_PROYECTO_LABELS } from "@/lib/constants";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: transacciones },
    { data: prospectos },
    { data: proyectos },
    { data: clientes },
  ] = await Promise.all([
    supabase.from("transacciones").select("fecha, tipo, monto_usd").order("fecha", { ascending: true }),
    supabase.from("prospectos").select("estado"),
    supabase.from("proyectos").select("estado, precio_total_usd"),
    supabase.from("clientes").select("nombre, mrr_usd").eq("estado", "activo").order("mrr_usd", { ascending: false }).limit(8),
  ]);

  // Revenue últimos 12 meses
  const now = new Date();
  const revenueMap: Record<string, { mes: string; ingresos: number; egresos: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenueMap[key] = { mes: key, ingresos: 0, egresos: 0 };
  }
  (transacciones || []).forEach(t => {
    const key = t.fecha.slice(0, 7);
    if (revenueMap[key]) {
      if (t.tipo === "ingreso") revenueMap[key].ingresos += t.monto_usd;
      else revenueMap[key].egresos += t.monto_usd;
    }
  });
  const revenueData = Object.values(revenueMap);

  // CRM funnel
  const crmCount: Record<string, number> = {};
  (prospectos || []).forEach(p => { crmCount[p.estado] = (crmCount[p.estado] || 0) + 1; });
  const crmFunnel = Object.entries(crmCount).map(([estado, cantidad]) => ({
    estado,
    label: ESTADOS_PROSPECTO_LABELS[estado as keyof typeof ESTADOS_PROSPECTO_LABELS] || estado,
    cantidad,
  }));

  // Proyectos por estado
  const proyCount: Record<string, { cantidad: number; valor: number }> = {};
  (proyectos || []).forEach(p => {
    if (!proyCount[p.estado]) proyCount[p.estado] = { cantidad: 0, valor: 0 };
    proyCount[p.estado].cantidad++;
    proyCount[p.estado].valor += p.precio_total_usd || 0;
  });
  const proyectosEstado = Object.entries(proyCount).map(([estado, v]) => ({
    estado,
    label: ESTADOS_PROYECTO_LABELS[estado as keyof typeof ESTADOS_PROYECTO_LABELS] || estado,
    ...v,
  }));

  // KPIs
  const allTx = transacciones || [];
  const totalIngresos = allTx.filter(t => t.tipo === "ingreso").reduce((s, t) => s + t.monto_usd, 0);
  const totalEgresos = allTx.filter(t => t.tipo === "egreso").reduce((s, t) => s + t.monto_usd, 0);
  const ingresosList = allTx.filter(t => t.tipo === "ingreso");
  const ticketPromedio = ingresosList.length > 0 ? totalIngresos / ingresosList.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analíticas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resumen financiero y operativo del negocio</p>
      </div>
      <AnalyticsClient
        revenueData={revenueData}
        crmFunnel={crmFunnel}
        proyectosEstado={proyectosEstado}
        topClientes={clientes || []}
        kpis={{ totalIngresos, totalEgresos, margenBruto: totalIngresos - totalEgresos, ticketPromedio }}
      />
    </div>
  );
}
