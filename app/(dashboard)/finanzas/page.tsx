import { FinanzasView } from "@/components/finanzas/FinanzasView";
import { getClients } from "@/lib/db/clients";
import { getTransactions, getFinanceSeries, getByLine } from "@/lib/db/finance";

export default async function FinanzasPage() {
  const [clients, transactions, finance, byLine] = await Promise.all([
    getClients(),
    getTransactions(20),
    getFinanceSeries(),
    getByLine(),
  ]);
  return <FinanzasView initialClients={clients} initialTransactions={transactions} initialFinance={finance} initialByLine={byLine} />;
}
