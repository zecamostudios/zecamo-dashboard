"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import {
  RefreshCw,
  Cpu,
  Database,
  Workflow,
  Camera,
  Briefcase,
  Users,
  MessageSquare,
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import type { ServiceCheck, ServiceStatus } from "@/app/api/health/route";

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
  instagram: Camera,
  linkedin:  Briefcase,
  facebook:  Users,
  x:         MessageSquare,
  vercel:    Server,
};

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  online:   { label: "Online",    color: "text-[var(--color-success)]",  bg: "bg-[rgba(34,197,139,0.1)]",  border: "border-[rgba(34,197,139,0.2)]",  Icon: CheckCircle2 },
  degraded: { label: "Degradado", color: "text-[var(--color-warning)]",  bg: "bg-[rgba(240,168,42,0.1)]",  border: "border-[rgba(240,168,42,0.2)]",  Icon: AlertTriangle },
  offline:  { label: "Offline",   color: "text-[var(--color-danger)]",   bg: "bg-[rgba(255,84,102,0.1)]",  border: "border-[rgba(255,84,102,0.2)]",  Icon: XCircle },
};

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(data?.services ?? Array.from({ length: 8 })).map((svc, i) => {
            if (!svc) return <ServiceCardSkeleton key={i} />;
            const s = svc as ServiceCheck;
            return <ServiceCard key={s.key} service={s} />;
          })}
        </div>
      )}
    </>
  );
}

function ServiceCard({ service }: { service: ServiceCheck }) {
  const cfg  = STATUS_CONFIG[service.status];
  const Icon = SERVICE_ICONS[service.key] ?? Server;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-3">
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

      {/* Latency */}
      {service.latencyMs !== null && (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)]">
          <Clock size={10} />
          <span className="font-mono">{service.latencyMs}ms</span>
        </div>
      )}
    </div>
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
