import Link from "next/link";
import { Sparkles, Plus, DollarSign, Briefcase, TrendingUp, Target } from "lucide-react";
import { CLIENTS, FINANCE, PROSPECTS } from "@/lib/mock-data";
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

const MONTH_TARGET = 15000;

export function DashboardHome() {
  // TODO: reemplazar por queries a Supabase
  const activeClients = CLIENTS.filter((c) => c.status === "active").length;
  const totalMrr = CLIENTS.filter((c) => c.status === "active").reduce((s, c) => s + c.mrr, 0);
  const totalIn = FINANCE.reduce((s, d) => s + d.in, 0);
  const totalOut = FINANCE.reduce((s, d) => s + d.out, 0);
  const netto = totalIn - totalOut;
  const monthRevenue = FINANCE[FINANCE.length - 1].in;

  const inFunnel = PROSPECTS.filter(
    (p) => !["venta", "noresp", "noventa", "seguim"].includes(p.stage),
  ).length;
  const inFunnelValue = PROSPECTS.filter(
    (p) => !["venta", "noresp", "noventa", "seguim"].includes(p.stage),
  ).reduce((s, p) => s + p.value, 0);

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
              Mayo 2026 · en vivo
            </div>
            <Button>
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
          delta={{ value: "+16.7%", direction: "up" }}
          sub="vs Abril"
          spark={<Sparkline data={[2400, 2900, 3200, 3600, 4100, 4400, totalMrr]} color="#3F6FFF" height={32} />}
        />
        <StatCard
          label="Clientes activos"
          icon={Briefcase}
          value={activeClients}
          delta={{ value: "+2", direction: "up" }}
          sub="en onboarding: 2"
          spark={<Sparkline data={[3, 4, 4, 5, 5, 6, activeClients]} color="#22C58B" height={32} />}
        />
        <StatCard
          label="Ingresos del mes"
          icon={TrendingUp}
          currency="$"
          value={fmtN(monthRevenue)}
          delta={{ value: "+24%", direction: "up" }}
          sub={`meta: $${fmtN(MONTH_TARGET)}`}
          spark={<Sparkline data={FINANCE.map((d) => d.in)} color="#A47BFF" height={32} />}
        />
        <StatCard
          label="Pipeline activo"
          icon={Target}
          value={inFunnel}
          delta={{ value: fmtUsd(inFunnelValue), direction: "flat" }}
          sub="potencial"
          spark={<Sparkline data={[8, 10, 11, 12, 14, 15, inFunnel]} color="#F0A82A" height={32} />}
        />
      </StatGrid>

      <Card className="mb-[18px]">
        <CardHead>
          <CardTitle big icon={<Target size={14} />}>
            Pipeline de prospectos
            <span className="ml-2 font-normal text-[12.5px] text-[var(--color-text-dim)] normal-case tracking-normal font-sans">
              {PROSPECTS.length} prospectos · {fmtUsd(PROSPECTS.reduce((s, p) => s + p.value, 0))} en juego
            </span>
          </CardTitle>
        </CardHead>
        <PipelineStrip />
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
            <RevenueChart data={FINANCE} />
          </Card>
        </div>
        <div className="col-span-4 max-[1100px]:col-span-12">
          <TasksWidget />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-[18px] mb-[18px]">
        <div className="col-span-4 max-[1100px]:col-span-12"><MeetingsWidget /></div>
        <div className="col-span-4 max-[1100px]:col-span-12"><ProspectsRecent /></div>
        <div className="col-span-4 max-[1100px]:col-span-12"><ActivityTimeline /></div>
      </div>

      <div className="grid grid-cols-12 gap-[18px]">
        <div className="col-span-8 max-[1100px]:col-span-12"><ProjectsInProgress /></div>
        <div className="col-span-4 max-[1100px]:col-span-12 flex flex-col gap-[18px]">
          <MonthGoal />
          <LineDistribution />
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
