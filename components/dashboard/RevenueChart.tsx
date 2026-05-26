"use client";

// TODO: migrar a Recharts si se necesita tooltip interactivo
import { AreaChart } from "@/components/charts/AreaChart";
import type { FinancePoint } from "@/lib/types";

interface RevenueChartProps {
  data: FinancePoint[];
  height?: number;
}

export function RevenueChart({ data, height = 240 }: RevenueChartProps) {
  return <AreaChart data={data} height={height} />;
}
