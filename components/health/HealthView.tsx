"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import {
  RefreshCw,
  Cpu,
  Database,
  Workflow,
  Server,
  Globe,
  LayoutDashboard,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import type { ServiceCheck, ServiceStatus, GrupoServicio } from "@/app/api/health/route";

interface HealthData {
  overall: ServiceStatus;
  checkedAt: string;
  summary: { online: number; degraded: number; offline: number; total: number };
  services: ServiceCheck[];
}

const SERVICE_ICONS: Record<string, React.ElementType> = {
  openai:    Cpu,
  supabase:  Database,
  n8n:       Workflow,
  vercel:    Server,
};

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  online:   { label: "Online",    color: "text-[var(--color-success)]",  bg: "bg-[rgba(34,197,139,0.1)]",  border: "border-[rgba(34,197,139,0.2)]",  Icon: CheckCircle2 },
  degraded: { label: "Degradado", color: "text-[var(--color-warning)]",  bg: "bg-[rgba(240,168,42,0.1)]",  border: "border-[rgba(240,168,42,0.2)]",  Icon: AlertTriangle },
  offline:  { label: "Offline",   color: "text-[var(--color-danger)]",   bg: "bg-[rgba(255,84,102,0.1)]",  border: "border-[rgba(255,84,102,0.2)]",  Icon: XCircle },
};

/**
 * Tres secciones, porque son tres preguntas distintas — y mezcladas en una sola
 * grilla, un OpenAI caído se ve igual de grave que la tienda de un cliente
 * caída, que no lo es ni por asomo.
 */
const GRUPOS: Array<{ grupo: GrupoServicio; titulo: string; bajada: string; Icon: React.ElementType }> = [
  { grupo: "web",      titulo: "Webs y landings", bajada: "Lo que ve el público. Si esto se cae, se cae la cara del cliente.", Icon: Globe },
  { grupo: "panel",    titulo: "Paneles",         bajada: "Donde el cliente entra a trabajar. Se miden por el login.",        Icon: LayoutDashboard },
  { grupo: "servicio", titulo: "Servicios",       bajada: "La infraestructura de la que dependemos nosotros.",                Icon: Server },
];

const OVERALL_LABELS: Record<ServiceStatus, string> = {
  online:   "Todos los sistemas operativos",
  degraded: "Degradación parcial del sistema",
  offline:  "Múltiples servicios caídos",
};

export function HealthView() {
  const [data, setData]       = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json() as HealthData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al obtener estado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
    const interval = setInterval(() => void fetchHealth(), 60_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const overall = data?.overall ?? "offline";
  const cfg     = STATUS_CONFIG[overall];

  return (
    <>
      <PageHead
        title="System Health"
        subtitle="Estado en tiempo real de todos los servicios de Zecamo"
        actions={
          <Button variant="ghost" onClick={() => void fetchHealth()} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Verificando..." : "Actualizar"}
          </Button>
        }
      />

      {/* Overall status banner */}
      <div
        className={`rounded-2xl border ${cfg.bg} ${cfg.border} px-6 py-4 flex items-center gap-4 mb-6`}
      >
        <cfg.Icon size={22} className={cfg.color} />
        <div className="flex-1">
          <p className={`text-[15px] font-semibold ${cfg.color}`}>{OVERALL_LABELS[overall]}</p>
          {data && (
            <p className="text-[12px] text-[var(--color-text-dim)] mt-0.5">
              {data.summary.online}/{data.summary.total} servicios online
              {data.summary.degraded > 0 ? ` · ${data.summary.degraded} degradados` : ""}
              {data.summary.offline > 0 ? ` · ${data.summary.offline} offline` : ""}
            </p>
          )}
        </div>
        {data && (
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)]">
            <Clock size={11} />
            {new Date(data.checkedAt).toLocaleTimeString("es-AR")}
          </div>
        )}
      </div>

      {/* KPI strip */}
      {data && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Online",    value: data.summary.online,   color: "var(--color-success)" },
            { label: "Degradado", value: data.summary.degraded, color: "var(--color-warning)" },
            { label: "Offline",   value: data.summary.offline,  color: "var(--color-danger)",  cfg: STATUS_CONFIG.offline },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium mb-2">{label}</p>
              <div className="flex items-end gap-2">
                <span className="text-[36px] font-[family-name:var(--font-display)] font-medium leading-none" style={{ color }}>{value}</span>
                <span className="text-[13px] text-[var(--color-text-dim)] mb-0.5">/ {data.summary.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service grid */}
      {error ? (
        <div className="rounded-2xl border border-[rgba(255,84,102,0.2)] bg-[rgba(255,84,102,0.06)] p-6 text-center">
          <XCircle size={24} className="mx-auto mb-2 text-[var(--color-danger)]" />
          <p className="text-[13.5px] text-[var(--color-danger)]">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {GRUPOS.map(({ grupo, titulo, bajada, Icon }) => {
            const items = (data?.services ?? []).filter((s) => s.grupo === grupo);
            const cargando = !data;
            if (!cargando && items.length === 0) return null;
            const caidos = items.filter((s) => s.status !== "online").length;

            return (
              <section key={grupo}>
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={15} className="text-[var(--color-text-muted)] shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-semibold text-[var(--color-text)] leading-tight">{titulo}</h2>
                    <p className="text-[11.5px] text-[var(--color-text-dim)] leading-snug">{bajada}</p>
                  </div>
                  {!cargando && (
                    <span className={`ml-auto shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                      caidos === 0
                        ? "bg-[rgba(34,197,139,0.1)] border-[rgba(34,197,139,0.2)] text-[var(--color-success)]"
                        : "bg-[rgba(255,84,102,0.1)] border-[rgba(255,84,102,0.2)] text-[var(--color-danger)]"
                    }`}>
                      {caidos === 0 ? `${items.length} OK` : `${caidos} con problemas`}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {cargando
                    ? Array.from({ length: grupo === "web" ? 6 : grupo === "panel" ? 2 : 4 }).map((_, i) => (
                        <ServiceCardSkeleton key={i} />
                      ))
                    : items.map((s) => <ServiceCard key={s.key} service={s} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function ServiceCard({ service }: { service: ServiceCheck }) {
  const cfg  = STATUS_CONFIG[service.status];
  const Icon = SERVICE_ICONS[service.key]
    ?? (service.grupo === "panel" ? LayoutDashboard : service.grupo === "web" ? Globe : Server);

  const base = "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-3";

  // Las webs y los paneles se abren; los servicios no tienen una URL nuestra a
  // la que ir. Va como <a> y no como onClick para que el clic derecho, el
  // "abrir en pestaña nueva" y el teclado funcionen como en cualquier link.
  const cuerpo = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-[var(--color-border)] grid place-items-center">
          <Icon size={17} className="text-[var(--color-text-muted)]" />
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${
            service.status === "online"   ? "bg-[var(--color-success)]" :
            service.status === "degraded" ? "bg-[var(--color-warning)]" :
                                            "bg-[var(--color-danger)]"
          }`} />
          {cfg.label}
        </span>
      </div>

      {/* Name */}
      <div>
        <p className="text-[14px] font-semibold text-[var(--color-text)] leading-tight">{service.name}</p>
        {service.message && (
          <p className="text-[11.5px] text-[var(--color-text-dim)] mt-0.5 leading-snug">{service.message}</p>
        )}
      </div>

      {/* Latencia, y el link si lo hay */}
      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-dim)] mt-auto">
        {service.latencyMs !== null && (
          <span className="flex items-center gap-1.5">
            <Clock size={10} />
            <span className="font-mono">{service.latencyMs}ms</span>
          </span>
        )}
        {service.url && (
          <span className="flex items-center gap-1 ml-auto">
            Abrir <ExternalLink size={10} />
          </span>
        )}
      </div>
    </>
  );

  if (!service.url) return <div className={base}>{cuerpo}</div>;

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} transition-colors hover:border-[var(--color-text-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-muted)]`}
    >
      {cuerpo}
    </a>
  );
}

function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
        <div className="h-6 w-20 rounded-full bg-white/[0.06]" />
      </div>
      <div className="h-4 w-24 rounded bg-white/[0.06] mb-1.5" />
      <div className="h-3 w-32 rounded bg-white/[0.04]" />
    </div>
  );
}
