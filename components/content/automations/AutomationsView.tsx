"use client";

import { useState } from "react";
import {
  Workflow,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Plus,
  ExternalLink,
  ChevronRight,
  Bot,
  Calendar,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import type { AutomationRun } from "@/lib/types";

interface AutomationDef {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: "n8n" | "scheduled" | "manual";
  trigger: string;
  activo: boolean;
  lastRun?: string;
  icon: typeof Zap;
  comingSoon?: boolean;
}

const AUTOMATIONS: AutomationDef[] = [
  {
    id: "publish-linkedin",
    nombre: "Publicar en LinkedIn",
    descripcion: "Publica los posts aprobados en LinkedIn según el calendario programado",
    tipo: "scheduled",
    trigger: "Diario a las 9:00 AM",
    activo: false,
    icon: Zap,
    comingSoon: true,
  },
  {
    id: "publish-twitter",
    nombre: "Publicar en X / Twitter",
    descripcion: "Publica threads y posts aprobados en X/Twitter",
    tipo: "scheduled",
    trigger: "Según planner",
    activo: false,
    icon: Bot,
    comingSoon: true,
  },
  {
    id: "ai-score",
    nombre: "AI Score automático",
    descripcion: "Evalúa cada post nuevo con Claude y asigna score de calidad 1-10",
    tipo: "n8n",
    trigger: "Nuevo post en estado revisión",
    activo: false,
    icon: BarChart3,
    comingSoon: true,
  },
  {
    id: "weekly-report",
    nombre: "Reporte semanal",
    descripcion: "Genera y envía un reporte de performance de contenido todos los lunes",
    tipo: "scheduled",
    trigger: "Lunes 8:00 AM",
    activo: false,
    icon: Calendar,
    comingSoon: true,
  },
];

const INTEGRATIONS = [
  { name: "n8n",        status: "ready",    desc: "Orquestación de workflows", url: "#" },
  { name: "LinkedIn",   status: "pending",  desc: "Publicación directa" },
  { name: "X / Twitter", status: "pending", desc: "Posts y threads" },
  { name: "Instagram",  status: "pending",  desc: "Posts y stories" },
  { name: "Claude API", status: "ready",    desc: "Generación de contenido", url: "#" },
  { name: "OpenAI",     status: "pending",  desc: "Modelos adicionales" },
];

interface AutomationsViewProps {
  recentRuns?: AutomationRun[];
}

export function AutomationsView({ recentRuns = [] }: AutomationsViewProps) {
  const [runs] = useState<AutomationRun[]>(recentRuns);

  async function triggerManual(id: string) {
    toast.info("Ejecutando automación...");
    const res = await fetch("/api/content/automations/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ automation_id: id }),
    });
    if (res.ok) {
      toast.success("Automación ejecutada correctamente");
    } else {
      toast.error("Error al ejecutar la automación");
    }
  }

  return (
    <>
      <PageHead
        title="Automations"
        subtitle="Workflows de publicación, scoring y reporting — conectados con n8n"
        actions={
          <Button>
            <ExternalLink size={13} /> Abrir n8n
          </Button>
        }
      />

      <div className="grid grid-cols-12 gap-[14px]">
        {/* Left: automation cards */}
        <div className="col-span-8 max-[1100px]:col-span-12 flex flex-col gap-[14px]">
          <Card>
            <CardHead>
              <CardTitle big icon={<Workflow size={16} />}>
                Workflows
              </CardTitle>
              <Button variant="primary" className="px-3 py-1.5">
                <Plus size={13} /> Nuevo workflow
              </Button>
            </CardHead>
            <div className="flex flex-col gap-3">
              {AUTOMATIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-2)] transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[rgba(43,91,255,0.08)] border border-[rgba(43,91,255,0.15)] grid place-items-center shrink-0">
                      <Icon size={18} className="text-[var(--color-primary-hover)]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13.5px] font-medium">{a.nombre}</span>
                        {a.comingSoon && (
                          <span className="text-[10px] px-2 py-0.5 bg-[rgba(164,123,255,0.10)] border border-[rgba(164,123,255,0.2)] rounded-full text-[var(--color-purple)] font-medium">
                            Próximamente
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[var(--color-text-muted)]">{a.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--color-text-dim)]">
                        <Clock size={11} />
                        <span>{a.trigger}</span>
                        <span className="text-[var(--color-border-2)]">·</span>
                        <span className="uppercase tracking-[0.06em]">{a.tipo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={
                          "w-2 h-2 rounded-full " +
                          (a.activo ? "bg-[var(--color-success)] shadow-[0_0_6px_var(--color-success)]" : "bg-[var(--color-text-dim)]")
                        }
                      />
                      <Button
                        variant="ghost"
                        className="px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition"
                        disabled={a.comingSoon}
                        onClick={() => triggerManual(a.id)}
                      >
                        <Play size={11} /> Ejecutar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent runs */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Clock size={16} />}>
                Ejecuciones recientes
              </CardTitle>
            </CardHead>
            {runs.length === 0 ? (
              <p className="text-[13px] text-[var(--color-text-dim)] text-center py-8">
                Sin ejecuciones aún
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {runs.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0"
                  >
                    {r.estado === "success" ? (
                      <CheckCircle2 size={15} className="text-[var(--color-success)] shrink-0" />
                    ) : r.estado === "error" ? (
                      <XCircle size={15} className="text-[var(--color-danger)] shrink-0" />
                    ) : (
                      <Clock size={15} className="text-[var(--color-text-muted)] shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">{r.nombre}</div>
                      {r.error_msg && (
                        <div className="text-[11.5px] text-[var(--color-danger)] mt-0.5">
                          {r.error_msg}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-[var(--color-text-dim)]">
                      {r.iniciado_en
                        ? new Date(r.iniciado_en).toLocaleString("es-AR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: integrations */}
        <div className="col-span-4 max-[1100px]:col-span-12 flex flex-col gap-[14px]">
          <Card>
            <CardHead>
              <CardTitle big icon={<Zap size={16} />}>
                Integraciones
              </CardTitle>
            </CardHead>
            <div className="flex flex-col gap-2.5">
              {INTEGRATIONS.map((intg) => (
                <div
                  key={intg.name}
                  className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0"
                >
                  <div
                    className={
                      "w-2 h-2 rounded-full shrink-0 " +
                      (intg.status === "ready"
                        ? "bg-[var(--color-success)] shadow-[0_0_6px_var(--color-success)]"
                        : "bg-[var(--color-text-dim)]")
                    }
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{intg.name}</div>
                    <div className="text-[11.5px] text-[var(--color-text-muted)]">{intg.desc}</div>
                  </div>
                  <span
                    className={
                      "text-[10px] px-2 py-0.5 rounded-full font-medium " +
                      (intg.status === "ready"
                        ? "bg-[rgba(34,197,139,0.10)] text-[var(--color-success)] border border-[rgba(34,197,139,0.2)]"
                        : "bg-white/[0.04] text-[var(--color-text-dim)] border border-[var(--color-border)]")
                    }
                  >
                    {intg.status === "ready" ? "Activo" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card glow>
            <CardHead>
              <CardTitle big icon={<Bot size={16} />}>
                <span className="text-[var(--color-primary-hover)]">Arquitectura</span>
              </CardTitle>
            </CardHead>
            <div className="flex flex-col gap-2.5 text-[12.5px] text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <ChevronRight size={13} className="text-[var(--color-primary-hover)] shrink-0" />
                Claude API para generación de contenido
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight size={13} className="text-[var(--color-primary-hover)] shrink-0" />
                n8n como orquestador de workflows
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight size={13} className="text-[var(--color-primary-hover)] shrink-0" />
                Supabase Realtime para actualizaciones live
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight size={13} className="text-[var(--color-primary-hover)] shrink-0" />
                APIs nativas de plataformas (próximamente)
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
