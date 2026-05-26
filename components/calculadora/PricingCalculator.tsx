"use client";

import { useMemo } from "react";
import { Sliders, DollarSign, Sparkles } from "lucide-react";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { ServiceToggle } from "./ServiceToggle";

export type ServiceId = "AIMA" | "B2B" | "Webs" | "Diagnóstico";
export type Size = "chico" | "medio" | "grande" | "enterprise";

interface PricingCalculatorProps {
  service: ServiceId;
  setService: (s: ServiceId) => void;
  size: Size;
  setSize: (s: Size) => void;
  scope: number;
  setScope: (s: number) => void;
  diagTier: "Express" | "Premium";
  setDiagTier: (t: "Express" | "Premium") => void;
  rush: boolean;
  setRush: (r: boolean) => void;
}

const BASE: Record<ServiceId, Record<Size, number>> = {
  AIMA: { chico: 1200, medio: 2500, grande: 5000, enterprise: 9000 },
  B2B: { chico: 900, medio: 1800, grande: 3500, enterprise: 6500 },
  Webs: { chico: 700, medio: 1500, grande: 3200, enterprise: 6500 },
  "Diagnóstico": { chico: 400, medio: 700, grande: 1200, enterprise: 2200 },
};

const DELIVERY: Record<ServiceId, Record<Size, number>> = {
  AIMA: { chico: 10, medio: 21, grande: 35, enterprise: 60 },
  B2B: { chico: 7, medio: 14, grande: 28, enterprise: 45 },
  Webs: { chico: 10, medio: 21, grande: 40, enterprise: 70 },
  "Diagnóstico": { chico: 3, medio: 5, grande: 7, enterprise: 10 },
};

const MODEL: Record<ServiceId, string> = {
  AIMA: "Setup + mantenimiento mensual",
  B2B: "Fijo + comisión por venta",
  Webs: "Precio fijo (40% anticipo)",
  "Diagnóstico": "Precio fijo (100% al inicio)",
};

const SIZE_OPTS: { id: Size; l: string; sub: string }[] = [
  { id: "chico", l: "Chico", sub: "< 10 personas" },
  { id: "medio", l: "Medio", sub: "10-50" },
  { id: "grande", l: "Grande", sub: "50-200" },
  { id: "enterprise", l: "Enterprise", sub: "200+" },
];

const SCOPE_LABEL = ["Mínimo", "Básico", "Estándar", "Avanzado", "Premium"];

const fmt = (n: number) => n.toLocaleString("en-US");

export function PricingCalculator(props: PricingCalculatorProps) {
  const { service, setService, size, setSize, scope, setScope, diagTier, setDiagTier, rush, setRush } = props;

  const { final, floor, high, delivery, monthly } = useMemo(() => {
    let baseN = BASE[service][size];
    if (service === "Diagnóstico" && diagTier === "Premium") baseN = baseN * 2.2;
    const scopeMul = 0.7 + (scope - 1) * 0.15;
    const rushMul = rush ? 1.25 : 1;
    return {
      final: Math.round(baseN * scopeMul * rushMul),
      floor: Math.round(baseN * 0.7 * scopeMul),
      high: Math.round(baseN * 1.2 * scopeMul * rushMul),
      delivery: DELIVERY[service][size] * (rush ? 0.65 : 1),
      monthly: service === "AIMA" ? Math.round(baseN * scopeMul * rushMul * 0.18) : 0,
    };
  }, [service, size, scope, diagTier, rush]);

  const quoteId = useMemo(() => Math.floor(Math.random() * 900 + 100), []);

  return (
    <div className="grid grid-cols-12 gap-[14px]">
      {/* Params */}
      <Card className="col-span-7 max-[1100px]:col-span-12">
        <CardHead>
          <CardTitle big icon={<Sliders size={16} />}>Parámetros del proyecto</CardTitle>
        </CardHead>

        <ServiceToggle value={service} onChange={setService} />

        {service === "Diagnóstico" && (
          <div className="mb-[22px]">
            <Label>Nivel de diagnóstico</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "Express", sub: "3-5 días · audit + 3 quick wins" },
                { id: "Premium", sub: "7-10 días · roadmap completo + presentación" },
              ] as const).map((t) => {
                const active = diagTier === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDiagTier(t.id)}
                    className={
                      "p-3 rounded-xl text-left cursor-pointer border transition " +
                      (active
                        ? "bg-[rgba(43,91,255,0.10)] border-[rgba(43,91,255,0.4)] shadow-[0_0_0_1px_rgba(43,91,255,0.4)]"
                        : "bg-[var(--color-surface)] border-[var(--color-border-2)]")
                    }
                  >
                    <div className={"text-[13px] font-medium " + (active ? "text-[var(--color-primary-hover)]" : "text-[var(--color-text)]")}>
                      Zecamo {t.id}
                    </div>
                    <div className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">{t.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-[22px]">
          <Label>Tamaño del cliente</Label>
          <div className="grid grid-cols-4 gap-2">
            {SIZE_OPTS.map((s) => {
              const active = size === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={
                    "p-2.5 rounded-[10px] text-center cursor-pointer border transition " +
                    (active
                      ? "bg-[rgba(43,91,255,0.10)] border-[rgba(43,91,255,0.4)] shadow-[0_0_0_1px_rgba(43,91,255,0.4)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border-2)]")
                  }
                >
                  <div className={"text-[13px] font-medium " + (active ? "text-[var(--color-primary-hover)]" : "text-[var(--color-text)]")}>{s.l}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{s.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-[22px]">
          <div className="flex justify-between mb-2.5">
            <Label inline>Alcance</Label>
            <span className="font-mono text-[13px] font-medium text-[var(--color-primary-hover)]">
              {SCOPE_LABEL[scope - 1]} · ×{(0.7 + (scope - 1) * 0.15).toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={scope}
            onChange={(e) => setScope(Number(e.target.value))}
            className="w-full accent-[var(--color-primary)]"
          />
          <div className="flex justify-between text-[10.5px] text-[var(--color-text-dim)] mt-1.5 font-mono">
            {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.02] rounded-xl border border-[var(--color-border-2)]">
          <div>
            <div className="text-[13px] font-medium">Delivery rush</div>
            <div className="text-[11.5px] text-[var(--color-text-muted)]">Entrega prioritaria · +25% precio · -35% tiempo</div>
          </div>
          <InlineToggle on={rush} onClick={() => setRush(!rush)} />
        </div>
      </Card>

      {/* Resultados */}
      <Card glow className="col-span-5 max-[1100px]:col-span-12">
        <CardHead>
          <CardTitle big icon={<DollarSign size={16} />}>
            <span className="text-[var(--color-primary-hover)]">Cotización</span>
          </CardTitle>
          <span className="font-mono text-[11px] text-[var(--color-text-muted)]">#ZS-{quoteId}</span>
        </CardHead>

        <div className="py-[8px_0]">
          <div className="text-[11px] uppercase tracking-[0.07em] text-[var(--color-text-muted)] mb-1.5">Rango sugerido</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-[var(--color-text-dim)] text-[13px]">USD {fmt(floor)}</span>
            <span className="text-[var(--color-text-dim)]">→</span>
            <span className="font-[family-name:var(--font-display)] text-[42px] font-medium tracking-tight leading-none">
              <span className="text-[var(--color-text-muted)] text-[20px]">$</span>
              {fmt(final)}
            </span>
            <span className="text-[var(--color-text-dim)]">→</span>
            <span className="font-mono text-[var(--color-text-dim)] text-[13px]">USD {fmt(high)}</span>
          </div>
          <div className="text-[12px] text-[var(--color-primary-hover)] mt-2 font-mono">
            Precio recomendado · {service} {size}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-[var(--color-border)] pt-4">
          <Row label="Modelo de cobro" v={MODEL[service]} />
          <Row label="Tiempo de delivery" v={`${Math.round(delivery)} días${rush ? " (rush)" : ""}`} />
          <Row label="Floor (no bajar de)" v={`USD ${fmt(floor)}`} tone="warning" />
          {monthly > 0 && <Row label="Mantenimiento" v={`USD ${fmt(monthly)}/mo`} tone="success" />}
          {service === "Webs" && <Row label="Anticipo (40%)" v={`USD ${fmt(Math.round(final * 0.4))}`} />}
          {service === "B2B" && <Row label="Comisión sugerida" v="5-10% por venta" />}
          <Row label="Validez de la oferta" v="30 días" />
        </div>

        <div className="mt-4 px-3.5 py-3 bg-[rgba(43,91,255,0.08)] border border-[rgba(43,91,255,0.4)] rounded-xl text-[11.5px] text-[var(--color-text-muted)] flex gap-2">
          <Sparkles size={14} className="text-[var(--color-primary-hover)] shrink-0 mt-0.5" />
          <span>
            <b className="text-[var(--color-primary-hover)]">Insight:</b>{" "}
            {service === "AIMA" && "AIMA conviene siempre con retainer. Mantenimiento mensual = ARR predecible."}
            {service === "B2B" && "B2B con comisión alinea incentivos. Pedí mínimo 3 meses para juzgar resultados."}
            {service === "Webs" && "Pedí 40% anticipo. Sin eso, no arrancás."}
            {service === "Diagnóstico" && "Diagnóstico es entry-point. Si lo cobrás bien, abre la puerta a AIMA o B2B."}
          </span>
        </div>
      </Card>
    </div>
  );
}

function Label({ children, inline }: { children: React.ReactNode; inline?: boolean }) {
  return (
    <div className={"text-[12px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] " + (inline ? "" : "mb-2.5")}>
      {children}
    </div>
  );
}

function Row({ label, v, tone }: { label: string; v: string; tone?: "warning" | "success" }) {
  const color = tone === "warning" ? "var(--color-warning)" : tone === "success" ? "var(--color-success)" : "var(--color-text)";
  return (
    <div className="flex justify-between text-[13px] items-center">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-mono" style={{ color, fontWeight: tone ? 600 : 500 }}>{v}</span>
    </div>
  );
}

function InlineToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-[42px] h-6 rounded-full p-0 cursor-pointer border-0"
      style={{
        background: on ? "linear-gradient(180deg, var(--color-primary-hover), var(--color-primary))" : "rgba(255,255,255,0.08)",
        boxShadow: on ? "0 0 12px var(--color-glow)" : "none",
      }}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-[left] duration-150"
        style={{ left: on ? 20 : 2 }}
      />
    </button>
  );
}
