"use client";

import Link from "next/link";
import { Plus, Bell, Target, TrendingUp } from "lucide-react";
import { fmtN, fmtUsd } from "@/lib/utils";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";
import { HoyWidget } from "@/components/dashboard/HoyWidget";
import { RellamarWidget } from "@/components/dashboard/RellamarWidget";
import { MeetingsWidget } from "@/components/dashboard/MeetingsWidget";
import type { DashboardStats } from "@/lib/db/dashboard";
import type { Meeting, Task, Prospect } from "@/lib/types";

/**
 * Home corta a proposito (15/09/2026). Antes tenia 11 widgets: KPIs, meta del
 * mes, ingresos vs egresos, pipeline, proyectos, tareas, reuniones, timeline de
 * actividad, distribucion por linea y prospectos recientes. Casi todos repetian
 * lo que ya muestra su propia seccion.
 *
 * Ahora responde una sola pregunta: que hay que hacer hoy. Tres numeros arriba
 * y abajo solo lo accionable. Los componentes que salieron siguen en el repo
 * (ActivityTimeline, LineDistribution, PipelineStrip, RevenueChart, MonthGoal,
 * ProjectsInProgress, ProspectsRecent, TasksWidget) por si vuelven.
 */

interface DashboardHomeProps {
  stats?: DashboardStats;
  meetings?: Meeting[];
  tasks?: Task[];
  prospects?: Prospect[];
  monthTarget?: number;
}

export function DashboardHome({ stats, meetings, tasks, prospects, monthTarget }: DashboardHomeProps) {
  const META = monthTarget ?? 15000;
  const allProspects = prospects ?? [];
  const porRellamar = allProspects.filter((p) => p.recall).length;
  const enFunnel = stats?.inFunnel ?? 0;
  const enFunnelValor = stats?.inFunnelValue ?? 0;
  const finanzas = stats?.financeData ?? [];
  const delMes = stats?.monthRevenue ?? (finanzas.length > 0 ? finanzas[finanzas.length - 1].in : 0);

  const mes = new Date().toLocaleDateString("es-AR", { month: "long" });

  return (
    <>
      <PageHead
        title={
          <>
            Buen día,{" "}
            <em className="not-italic font-light text-[var(--color-primary-hover)] [text-shadow:0_0_18px_var(--color-glow)]">
              Joaco
            </em>
            .
          </>
        }
        subtitle="Esto es lo que hay que hacer hoy."
        actions={
          <Link href="/crm/nuevo">
            <Button variant="primary">
              <Plus size={14} />
              Nuevo prospecto
            </Button>
          </Link>
        }
      />

      <StatGrid cols={3}>
        <StatCard
          featured
          label="Por rellamar"
          icon={Bell}
          value={porRellamar}
          sub={porRellamar === 1 ? "prospecto esperando" : "prospectos esperando"}
        />
        <StatCard
          label="Pipeline activo"
          icon={Target}
          value={enFunnel}
          sub={`${fmtUsd(enFunnelValor)} en juego`}
        />
        <StatCard
          label="Ingresos del mes"
          icon={TrendingUp}
          currency="$"
          value={fmtN(delMes)}
          sub={`meta de ${mes}: $${fmtN(META)}`}
        />
      </StatGrid>

      <div className="grid grid-cols-12 gap-[18px] mb-[18px]">
        <div className="col-span-7 max-[1100px]:col-span-12">
          <HoyWidget tasks={tasks} />
        </div>
        <div className="col-span-5 max-[1100px]:col-span-12">
          <RellamarWidget prospects={allProspects} />
        </div>
      </div>

      <MeetingsWidget meetings={meetings} />
    </>
  );
}
