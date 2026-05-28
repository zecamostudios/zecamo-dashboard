import { AnaliticasView } from "@/components/analiticas/AnaliticasView";
import { getProspects } from "@/lib/db/prospects";
import { getFinanceSeries } from "@/lib/db/finance";

export default async function AnalyticsPage() {
  const [prospects, finance] = await Promise.all([
    getProspects(),
    getFinanceSeries(),
  ]);
  return <AnaliticasView initialProspects={prospects} initialFinance={finance} />;
}
