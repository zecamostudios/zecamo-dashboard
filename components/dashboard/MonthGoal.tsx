"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { fmtN } from "@/lib/utils";
import { Donut } from "@/components/charts/Donut";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";

interface MonthGoalProps {
  monthRevenue?: number;
  monthTarget?: number;
}

export function MonthGoal({ monthRevenue: initialRevenue, monthTarget: initialTarget }: MonthGoalProps) {
  const monthRevenue = initialRevenue ?? 0;
  const [target, setTarget] = useState<number>(initialTarget ?? 15000);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState<string>(String(initialTarget ?? 15000));

  const pct = target > 0 ? (monthRevenue / target) * 100 : 0;
  const restante = Math.max(0, target - monthRevenue);

  // Días reales que faltan para cerrar el mes
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const diasRestantes = lastDay - now.getDate();
  // ¿Vamos adelantados? Comparamos el % de ingreso vs el % de mes transcurrido
  const pctMesTranscurrido = (now.getDate() / lastDay) * 100;
  const adelantado = pct >= pctMesTranscurrido;

  const save = async () => {
    const val = Math.max(0, Math.round(Number(input) || 0));
    setTarget(val);
    setEditing(false);
    const supabase = createClient();
    const { error } = await supabase.from("app_config").update({ valor: val }).eq("clave", "ingresos_objetivo");
    if (error) toast.error("No se pudo guardar la meta"); else toast.success("Meta del mes actualizada");
  };

  return (
    <Card>
      <CardHead>
        <CardTitle big>Meta del mes</CardTitle>
        <button
          onClick={() => { setInput(String(target)); setEditing((v) => !v); }}
          className="w-7 h-7 rounded-lg bg-white/[0.04] grid place-items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-0 cursor-pointer transition"
          title="Editar meta"
        >
          <Target size={14} />
        </button>
      </CardHead>
      {editing && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            className="w-full rounded-lg bg-white/[0.04] border border-[var(--color-border)] text-[15px] px-2 py-1.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)]"
          />
          <button onClick={save} className="text-[12px] px-2.5 py-1.5 rounded-lg bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer">OK</button>
        </div>
      )}
      <div className="flex items-center gap-[18px]">
        <Donut pct={pct} label={`${Math.round(pct)}%`} sub="del objetivo" />
        <div className="flex-1">
          <div className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-[0.06em] mb-1">Faltan</div>
          <div className="font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight">${fmtN(restante)}</div>
          <div className="text-xs text-[var(--color-text-dim)] mt-0.5">en {diasRestantes} {diasRestantes === 1 ? "día" : "días"}</div>
          {adelantado ? (
            <div className="mt-2.5 text-xs text-[var(--color-success)] flex items-center gap-1">
              <TrendingUp size={12} />Vas adelantado
            </div>
          ) : (
            <div className="mt-2.5 text-xs text-[var(--color-warning)] flex items-center gap-1">
              <TrendingDown size={12} />Vas atrasado
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
