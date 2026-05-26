"use client";

import { useState } from "react";
import { ConfigSection } from "./_shared";

interface NotifPref {
  id: string;
  l: string;
  d: string;
}

const NOTIFS: NotifPref[] = [
  { id: "pipelineMove", l: "Prospecto cambia de etapa", d: "Cuando alguien mueve un prospecto en el pipeline." },
  { id: "newMessage", l: "Mensaje nuevo · outbound", d: "Cuando un prospecto responde a un mensaje." },
  { id: "paymentReceived", l: "Pago recibido", d: "Avisame cada vez que entra un cobro." },
  { id: "taskDue", l: "Tarea vence hoy", d: "Aviso 30 min antes del deadline." },
  { id: "weeklyDigest", l: "Resumen semanal", d: "Cada lunes 8am · MRR, cierres, alertas." },
  { id: "productUpdates", l: "Updates de producto", d: "Anuncios y cambios al dashboard." },
];

const DEFAULTS: Record<string, boolean> = {
  pipelineMove: true,
  newMessage: true,
  paymentReceived: true,
  taskDue: true,
  weeklyDigest: false,
  productUpdates: false,
};

export function NotifSection() {
  // TODO: Conectar Supabase tabla `notification_prefs` (por user_id)
  const [prefs, setPrefs] = useState<Record<string, boolean>>(DEFAULTS);
  const toggle = (k: string) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <ConfigSection title="Notificaciones" sub="Decidí qué te avisamos y cómo.">
      {NOTIFS.map((n) => (
        <div
          key={n.id}
          className="flex items-center justify-between py-3.5 border-b border-[var(--color-border)] last:border-b-0"
        >
          <div className="flex-1">
            <div className="text-[13.5px] font-medium">{n.l}</div>
            <div className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">{n.d}</div>
          </div>
          <button
            onClick={() => toggle(n.id)}
            className="relative w-[42px] h-6 rounded-full p-0 cursor-pointer border-0"
            style={{
              background: prefs[n.id]
                ? "linear-gradient(180deg, var(--color-primary-hover), var(--color-primary))"
                : "rgba(255,255,255,0.08)",
              boxShadow: prefs[n.id] ? "0 0 12px var(--color-glow)" : "none",
            }}
            aria-pressed={prefs[n.id]}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-[left] duration-150"
              style={{ left: prefs[n.id] ? 20 : 2 }}
            />
          </button>
        </div>
      ))}
    </ConfigSection>
  );
}
