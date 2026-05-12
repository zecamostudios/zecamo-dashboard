import { createClient } from "@/lib/supabase/server";
import { formatUSD, formatDate } from "@/lib/utils";
import { ESTADOS_PROSPECTO_LABELS, ESTADOS_PROSPECTO_COLORS } from "@/lib/constants";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import {
  Users, Building2, FolderKanban, Wallet, CheckSquare, TrendingUp,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: prospectos },
    { data: clientes },
    { data: proyectos },
    { data: transacciones },
    { data: tareas },
    { data: { user } },
  ] = await Promise.all([
    supabase.from("prospectos").select("id, negocio, estado, updated_at").order("updated_at", { ascending: false }),
    supabase.from("clientes").select("id, nombre, mrr_usd, estado"),
    supabase.from("proyectos").select("id, nombre, estado, precio_total_usd"),
    supabase.from("transacciones").select("fecha, tipo, monto_usd"),
    supabase.from("tareas").select("id, titulo, prioridad, estado, fecha_limite, asignado_a"),
    supabase.auth.getUser(),
  ]);

  const clientesActivos = (clientes || []).filter(c => c.estado === "activo");
  const mrrTotal = clientesActivos.reduce((a, c) => a + (c.mrr_usd || 0), 0);
  const proyectosActivos = (proyectos || []).filter(p => p.estado === "en_desarrollo" || p.estado === "en_soporte");

  const now = new Date();
  const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const txMes = (transacciones || []).filter(t => t.fecha >= primerDiaMes);
  const ingresosMes = txMes.filter(t => t.tipo === "ingreso").reduce((a, t) => a + t.monto_usd, 0);

  const misTareas = (tareas || []).filter(t => t.asignado_a === user?.id && t.estado !== "done");

  const prospectosByEstado = ["initiated", "engaged", "calendly", "booked"].map(estado => ({
    estado,
    count: (prospectos || []).filter(p => p.estado === estado).length,
  }));

  const kpis = [
    { label: "Clientes activos", value: clientesActivos.length, icon: Building2, sub: `MRR: ${formatUSD(mrrTotal)}/mes` },
    { label: "Proyectos en curso", value: proyectosActivos.length, icon: FolderKanban, sub: "En desarrollo / soporte" },
    { label: "Ingresos del mes", value: formatUSD(ingresosMes), icon: Wallet, sub: "USD facturado este mes" },
    { label: "Mis tareas pendientes", value: misTareas.length, icon: CheckSquare, sub: "Sin completar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Vista general de Zecamo Studios</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon className="size-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline CRM */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-4 text-primary" />
          <h2 className="font-semibold text-sm">Pipeline de prospectos</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {prospectosByEstado.map(({ estado, count }) => (
            <div key={estado} className="text-center">
              <div className="text-3xl font-black text-primary">{count}</div>
              <div className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${ESTADOS_PROSPECTO_COLORS[estado as keyof typeof ESTADOS_PROSPECTO_COLORS]}`}>
                {ESTADOS_PROSPECTO_LABELS[estado as keyof typeof ESTADOS_PROSPECTO_LABELS]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico finanzas */}
        <DashboardChart transacciones={transacciones || []} />

        {/* Últimas actualizaciones CRM */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="font-semibold text-sm">Prospectos recientes</h2>
          </div>
          <div className="space-y-2">
            {(prospectos || []).slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm font-medium">{p.negocio}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADOS_PROSPECTO_COLORS[p.estado as keyof typeof ESTADOS_PROSPECTO_COLORS]}`}>
                  {ESTADOS_PROSPECTO_LABELS[p.estado as keyof typeof ESTADOS_PROSPECTO_LABELS]}
                </span>
              </div>
            ))}
            {(!prospectos || prospectos.length === 0) && (
              <p className="text-sm text-muted-foreground">Sin prospectos todavía</p>
            )}
          </div>
        </div>
      </div>

      {/* Mis tareas */}
      {misTareas.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="size-4 text-primary" />
            <h2 className="font-semibold text-sm">Mis tareas pendientes</h2>
          </div>
          <div className="space-y-2">
            {misTareas.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm">{t.titulo}</span>
                <span className="text-xs text-muted-foreground">{formatDate(t.fecha_limite)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
