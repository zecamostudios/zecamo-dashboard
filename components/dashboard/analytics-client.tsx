"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { formatUSD } from "@/lib/utils";

interface Props {
  revenueData: { mes: string; ingresos: number; egresos: number }[];
  crmFunnel: { estado: string; cantidad: number }[];
  proyectosEstado: { estado: string; cantidad: number; valor: number }[];
  topClientes: { nombre: string; mrr_usd: number }[];
  kpis: {
    totalIngresos: number;
    totalEgresos: number;
    margenBruto: number;
    ticketPromedio: number;
  };
}

const PROYECTO_COLORS = ["#6366f1","#22c55e","#3b82f6","#f59e0b","#ef4444"];
const CRM_COLORS = ["#94a3b8","#60a5fa","#a78bfa","#34d399","#f87171","#fbbf24"];

export function AnalyticsClient({ revenueData, crmFunnel, proyectosEstado, topClientes, kpis }: Props) {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ingresos totales" value={formatUSD(kpis.totalIngresos)} color="text-green-600" />
        <KpiCard label="Egresos totales" value={formatUSD(kpis.totalEgresos)} color="text-red-500" />
        <KpiCard label="Margen bruto" value={formatUSD(kpis.margenBruto)} color={kpis.margenBruto >= 0 ? "text-primary" : "text-red-500"} />
        <KpiCard label="Ticket promedio" value={formatUSD(kpis.ticketPromedio)} color="text-foreground" />
      </div>

      {/* Revenue chart */}
      {revenueData.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold mb-4">Ingresos vs Egresos — últimos 12 meses</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v) => formatUSD(Number(v))} />
              <Legend />
              <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" radius={[4,4,0,0]} />
              <Bar dataKey="egresos" fill="#ef4444" name="Egresos" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Funnel */}
        {crmFunnel.length > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold mb-4">Funnel CRM</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={crmFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="cantidad" radius={[0,4,4,0]}>
                  {crmFunnel.map((_, i) => (
                    <Cell key={i} fill={CRM_COLORS[i % CRM_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Proyectos por estado */}
        {proyectosEstado.length > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold mb-4">Proyectos por estado</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={proyectosEstado} dataKey="cantidad" nameKey="label"
                  cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {proyectosEstado.map((_, i) => (
                    <Cell key={i} fill={PROYECTO_COLORS[i % PROYECTO_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top clientes */}
      {topClientes.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold mb-4">Top clientes por MRR</h2>
          <div className="space-y-2">
            {topClientes.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{c.nombre}</span>
                    <span className="text-sm font-semibold text-primary">{formatUSD(c.mrr_usd)}/mes</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, (c.mrr_usd / (topClientes[0]?.mrr_usd || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
