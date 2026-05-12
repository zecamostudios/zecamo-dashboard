import { createClient } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/utils";
import { FinanzasClient } from "@/components/dashboard/finanzas-client";

export default async function FinanzasPage() {
  const supabase = await createClient();
  const { data: transacciones } = await supabase
    .from("transacciones")
    .select("*")
    .order("fecha", { ascending: false });

  const { data: clientes } = await supabase.from("clientes").select("id, nombre").order("nombre");
  const clienteMap = Object.fromEntries((clientes || []).map(c => [c.id, c.nombre]));

  // KPIs del mes actual
  const now = new Date();
  const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const txMes = (transacciones || []).filter(t => t.fecha >= primerDiaMes);

  const ingresosMes = txMes.filter(t => t.tipo === "ingreso").reduce((a, t) => a + t.monto_usd, 0);
  const egresosMes = txMes.filter(t => t.tipo === "egreso").reduce((a, t) => a + t.monto_usd, 0);
  const margenMes = ingresosMes - egresosMes;
  const mrrTotal = (await supabase.from("clientes").select("mrr_usd").eq("estado", "activo")).data?.reduce((a, c) => a + (c.mrr_usd || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finanzas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ingresos y egresos del estudio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos del mes", value: formatUSD(ingresosMes), color: "text-green-600" },
          { label: "Egresos del mes", value: formatUSD(egresosMes), color: "text-red-600" },
          { label: "Margen del mes", value: formatUSD(margenMes), color: margenMes >= 0 ? "text-green-600" : "text-red-600" },
          { label: "MRR total", value: formatUSD(mrrTotal), color: "text-primary" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <FinanzasClient
        transacciones={(transacciones || []).map(t => ({
          ...t,
          cliente_nombre: t.cliente_id ? clienteMap[t.cliente_id] : undefined,
        }))}
        clientes={clientes || []}
      />
    </div>
  );
}
