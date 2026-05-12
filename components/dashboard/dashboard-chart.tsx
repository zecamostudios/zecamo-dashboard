"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatUSD } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface Tx {
  fecha: string;
  tipo: string;
  monto_usd: number;
}

function buildChartData(txs: Tx[]) {
  const months: Record<string, { mes: string; ingresos: number; egresos: number }> = {};
  txs.forEach(t => {
    const key = t.fecha.slice(0, 7);
    if (!months[key]) months[key] = { mes: key, ingresos: 0, egresos: 0 };
    if (t.tipo === "ingreso") months[key].ingresos += t.monto_usd;
    else months[key].egresos += t.monto_usd;
  });
  return Object.values(months).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);
}

export function DashboardChart({ transacciones }: { transacciones: Tx[] }) {
  const data = buildChartData(transacciones);

  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="size-4 text-primary" />
        <h2 className="font-semibold text-sm">Ingresos vs egresos (6 meses)</h2>
      </div>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          Sin datos todavía
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v) => formatUSD(Number(v))} />
            <Legend />
            <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" radius={[4,4,0,0]} />
            <Bar dataKey="egresos" fill="#ef4444" name="Egresos" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
