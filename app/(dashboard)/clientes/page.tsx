import { ClientesView } from "@/components/clientes/ClientesView";
import { getClients } from "@/lib/db/clients";

export default async function ClientesPage() {
  const clients = await getClients();
  return <ClientesView initialClients={clients} />;
}
