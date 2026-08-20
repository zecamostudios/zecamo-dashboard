import { FinanzasView } from "@/components/finanzas/FinanzasView";
import { getClients } from "@/lib/db/clients";
import { getTransactions, getFinanceSeries, getByLine } from "@/lib/db/finance";
import { getMrrObjetivo } from "@/lib/db/config";

export default async function FinanzasPage() {
  const [clients, transactions, finance, byLine, mrrObjetivo] = await Promise.all([
    getClients(),
    getTransactions(20),
    getFinanceSeries(),
    getByLine(),
    getMrrObjetivo(),
  ]);
  return <FinanzasView initialClients={clients} initialTransactions={transactions} initialFinance={finance} initialByLine={byLine} initialMrrObjetivo={mrrObjetivo} />;
}
