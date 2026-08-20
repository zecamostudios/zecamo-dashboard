"use client";

import Link from "next/link";
import { Sparkles, Plus, DollarSign, Briefcase, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";
import { fmtN, fmtUsd } from "@/lib/utils";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Tabs } from "@/components/dashboard/TabsLocal";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";
import { Sparkline } from "@/components/charts/Sparkline";
import { PipelineStrip } from "@/components/dashboard/PipelineStrip";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { MeetingsWidget } from "@/components/dashboard/MeetingsWidget";
import { ProspectsRecent } from "@/components/dashboard/ProspectsRecent";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { ProjectsInProgress } from "@/components/dashboard/ProjectsInProgress";
import { MonthGoal } from "@/components/dashboard/MonthGoal";
import { LineDistribution } from "@/components/dashboard/LineDistribution";
import type { DashboardStats } from "@/lib/db/dashboard";
import type { Meeting, ActivityItem, Project, Task, Prospect, ByLine } from "@/lib/types";

interface DashboardHomeProps {
  stats?: DashboardStats;
  meetings?: Meeting[];
  activity?: ActivityItem[];
  projects?: Project[];
  tasks?: Task[];
  prospects?: Prospect[];
  byLine?: ByLine[];
  monthTarget?: number;
}

export function DashboardHome({ stats, meetings, activity, projects, tasks, prospects, byLine, monthTarget }: DashboardHomeProps) {
  const MONTH_TARGET = monthTarget ?? 15000;
  const activeClients = stats?.activeClients ?? 0;
  const totalMrr = stats?.totalMrr ?? 0;
  const allFinance = stats?.financeData ?? [];
  const totalIn = allFinance.reduce((s, d) => s + d.in, 0);
  const totalOut = allFinance.reduce((s, d) => s + d.out, 0);
  const netto = totalIn - totalOut;
  const monthRevenue = stats?.monthRevenue ?? (allFinance.length > 0 ? allFinance[allFinance.length - 1].in : 0);

  const inFunnel = stats?.inFunnel ?? 0;
  const inFunnelValue = stats?.inFunnelValue ?? 0;

  const allProspects = prospects ?? [];

  // Mes actual en vivo (ej. "Agosto 2026")
  const now = new Date();
  const monthLabel = `${now.toLocaleDateString("es-AR", { month: "long" }).replace(/^\w/, (c) => c.toUpperCase())} ${now.getFullYear()}`;

  return (
    <>
      <PageHead
        title={
          <>
            Buen día, <em className="not-italic font-light text-[var(--color-primary-hover)] [text-shadow:0_0_18px_var(--color-glow)]">Joaco</em>.
          </>
        }
        subtitle="Esto es lo que pasa en Zecamo Studios hoy."
        actions={
          <>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[rgba(43,91,255,0.10)] border border-[rgba(43,91,255,0.25)] text-[var(--color-primary-hover)] text-[11.5px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-hover)] shadow-[0_0_8px_var(--color-glow)]" />
              {monthLabel} · en vivo
            </div>
            <Button onClick={() => toast.info(`MRR $${fmtN(totalMrr)} · ${activeClients} clientes activos · Pipeline ${inFunnel} prospectos · Margen ${Math.round(((totalIn - totalOut) / (totalIn || 1)) * 100)}%`, { duration: 6000, description: `Resumen · ${monthLabel}` })}>
              <Sparkles size={14} />Resumen IA
            </Button>
            <Link href="/crm">
              <Button variant="primary">
                <Plus size={14} />Nuevo prospecto
              </Button>
            </Link>
          </>
        }
      />

      <StatGrid>
        <StatCard
          featured
          label="MRR · recurrente"
          icon={DollarSign}
          currency="$"
          value={fmtN(totalMrr)}
          unit="/mo"
          sub="recurrente mensual"
        />
        <StatCard
          label="Clientes activos"
          icon={Briefcase}
          value={activeClients}
          sub="con contrato vigente"
        />
        <StatCard
          label="Ingresos del mes"
          icon={TrendingUp}
          currency="$"
          value={fmtN(monthRevenue)}
          sub={`meta: $${fmtN(MONTH_TARGET)}`}
          spark={<Sparkline data={allFinance.map((d) => d.in)} color="#A47BFF" height={32} />}
        />
        <StatCard
          label="Pipeline activo"
          icon={Target}
          value={inFunnel}
          delta={{ value: fmtUsd(inFunnelValue), direction: "flat" }}
          sub="potencial"
        />
      </StatGrid>

      <Card className="mb-[18px]">
        <CardHead>
          <CardTitle big icon={<Target size={14} />}>
            Pipeline de prospectos
            <span className="ml-2 font-normal text-[12.5px] text-[var(--color-text-dim)] normal-case tracking-normal font-sans">
              {allProspects.length} prospectos · {fmtUsd(allProspects.reduce((s, p) => s + p.value, 0))} en juego
            </span>
          </CardTitle>
        </CardHead>
        <PipelineStrip prospects={allProspects} />
      </Card>

      <div className="grid grid-cols-12 gap-[18px] mb-[18px]">
        <div className="col-span-8 max-[1100px]:col-span-12">
          <Card>
            <CardHead>
              <CardTitle big>Ingresos vs egresos
                <span className="ml-2 font-normal text-[12.5px] text-[var(--color-text-dim)] normal-case tracking-normal font-sans">últimos 6 meses</span>
              </CardTitle>
              <Tabs tabs={["3M", "6M", "YTD"]} active="6M" />
            </CardHead>
            <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-[var(--color-border)]">
              <Summary label="Ingresos" value={fmtUsd(totalIn)} dot="primary" />
              <Summary label="Egresos" value={fmtUsd(totalOut)} dot="purple" />
              <Summary label="Neto" value={`+${fmtUsd(netto)}`} valueColor="var(--color-success)" />
              <Summary label="Margen" value={`${Math.round((netto / totalIn) * 100)}%`} />
            </div>
            <RevenueChart data={allFinance} />
          </Card>
        </div>
        <div className="col-span-4 max-[1100px]:col-span-12">
          <TasksWidget initialTasks={tasks} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-[18px] mb-[18px]">
        <div className="col-span-4 max-[1100px]:col-span-12"><MeetingsWidget meetings={meetings} /></div>
        <div className="col-span-4 max-[1100px]:col-span-12"><ProspectsRecent prospects={allProspects} /></div>
        <div className="col-span-4 max-[1100px]:col-span-12"><ActivityTimeline activity={activity} /></div>
      </div>

      <div className="grid grid-cols-12 gap-[18px]">
        <div className="col-span-8 max-[1100px]:col-span-12"><ProjectsInProgress projects={projects} /></div>
        <div className="col-span-4 max-[1100px]:col-span-12 flex flex-col gap-[18px]">
          <MonthGoal monthRevenue={monthRevenue} monthTarget={MONTH_TARGET} />
          <LineDistribution byLine={byLine} />
        </div>
      </div>
    </>
  );
}

function Summary({ label, value, dot, valueColor }: { label: string; value: string; dot?: "primary" | "purple"; valueColor?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1 flex items-center gap-1.5">
        {dot === "primary" && <span className="w-2 h-2 rounded-sm bg-[var(--color-primary-hover)] shadow-[0_0_6px_var(--color-glow)]" />}
        {dot === "purple" && <span className="w-2 h-2 rounded-sm bg-[var(--color-purple)]" />}
        {label}
      </div>
      <div className="font-[family-name:var(--font-display)] text-[20px] font-medium tracking-tight" style={{ color: valueColor }}>{value}</div>
    </div>
  );
}
