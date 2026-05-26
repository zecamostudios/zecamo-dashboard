"use client";

import { Zap, MessageSquare, Code, Stethoscope, type LucideIcon } from "lucide-react";
import type { ServiceId } from "./PricingCalculator";

interface ServiceToggleProps {
  value: ServiceId;
  onChange: (s: ServiceId) => void;
}

const OPTS: { id: ServiceId; ico: LucideIcon; sub: string }[] = [
  { id: "AIMA", ico: Zap, sub: "Automatizaciones IA" },
  { id: "B2B", ico: MessageSquare, sub: "Outbound y ventas" },
  { id: "Webs", ico: Code, sub: "Diseño + desarrollo" },
  { id: "Diagnóstico", ico: Stethoscope, sub: "Audit + roadmap" },
];

export function ServiceToggle({ value, onChange }: ServiceToggleProps) {
  return (
    <div className="mb-[22px]">
      <div className="text-[12px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-2.5">
        Tipo de servicio
      </div>
      <div className="grid grid-cols-4 gap-2 max-[640px]:grid-cols-2">
        {OPTS.map((s) => {
          const Ic = s.ico;
          const active = value === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={
                "p-3.5 rounded-2xl text-left cursor-pointer border flex flex-col items-start gap-1.5 transition " +
                (active
                  ? "bg-gradient-to-b from-[rgba(43,91,255,0.12)] to-[rgba(43,91,255,0.02)] border-[rgba(43,91,255,0.4)] shadow-[0_0_0_1px_rgba(43,91,255,0.4),0_0_18px_rgba(43,91,255,0.2)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border-2)]")
              }
            >
              <div
                className="w-8 h-8 rounded-lg grid place-items-center"
                style={{
                  background: active ? "rgba(43,91,255,0.18)" : "rgba(255,255,255,0.04)",
                  color: active ? "var(--color-primary-hover)" : "var(--color-text-muted)",
                }}
              >
                <Ic size={16} />
              </div>
              <div className="text-[13.5px] font-medium">{s.id}</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">{s.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
