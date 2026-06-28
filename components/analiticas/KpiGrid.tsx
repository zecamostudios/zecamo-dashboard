import { Target, Users, DollarSign, TrendingUp } from "lucide-react";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";

interface KpiGridProps {
  closeRate: number;
  totalProspects: number;
  avgDeal: number;
  pipelineValue: number;
}

export function KpiGrid({ closeRate, totalProspects, avgDeal, pipelineValue }: KpiGridProps) {
  return (
    <StatGrid>
      <StatCard label="Tasa de cierre" icon={Target} value={closeRate} unit="%" sub="prospectos ganados" />
      <StatCard label="Prospectos" icon={Users} value={totalProspects} sub="en total" />
      <StatCard label="Deal promedio" icon={DollarSign} currency="$" value={avgDeal.toLocaleString("en-US")} sub="valor medio" />
      <StatCard label="Pipeline activo" icon={TrendingUp} currency="$" value={pipelineValue.toLocaleString("en-US")} sub="potencial en curso" />
    </StatGrid>
  );
}
