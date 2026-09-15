import { FinanzasView } from "@/components/finanzas/FinanzasView";
import { getClients } from "@/lib/db/clients";
import { getTransactions, getFinanceSeries } from "@/lib/db/finance";
import { getMrrObjetivo } from "@/lib/db/config";

export default async function FinanzasPage() {
  // Sin getByLine(): la tarjeta "Por línea de servicio" salio junto con el campo
  // que la alimentaba.
  const [clients, transactions, finance, mrrObjetivo] = await Promise.all([
    getClients(),
    getTransactions(20),
    getFinanceSeries(),
    getMrrObjetivo(),
  ]);
  return (
    <FinanzasView
      initialClients={clients}
      initialTransactions={transactions}
      initialFinance={finance}
      initialMrrObjetivo={mrrObjetivo}
    />
  );
}
