import { Target, Clock, DollarSign, TrendingUp } from "lucide-react";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";

interface KpiGridProps {
  closeRate: number;
  totalCycle: number;
  avgDeal: number;
}

export function KpiGrid({ closeRate, totalCycle, avgDeal }: KpiGridProps) {
  return (
    <StatGrid>
      <StatCard
        label="Tasa de cierre"
        icon={Target}
        value={closeRate}
        unit="%"
        delta={{ value: "+2%", direction: "up" }}
        sub="vs período anterior"
      />
      <StatCard
        label="Ciclo promedio"
        icon={Clock}
        value={totalCycle.toFixed(1)}
        unit="d"
        delta={{ value: "-2.1d", direction: "down" }}
        sub="más rápido"
      />
      <StatCard
        label="Deal promedio"
        icon={DollarSign}
        currency="$"
        value={avgDeal.toLocaleString("en-US")}
        delta={{ value: "+18%", direction: "up" }}
      />
      <StatCard
        label="LTV / CAC"
        icon={TrendingUp}
        value="4.8"
        unit="x"
        delta={{ value: "Healthy", direction: "up" }}
      />
    </StatGrid>
  );
}
