import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatUSD, formatDate } from "@/lib/utils";
import { ESTADOS_CLIENTE_LABELS, ESTADOS_CLIENTE_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre");

  const mrrTotal = clientes?.filter(c => c.estado === "activo").reduce((acc, c) => acc + (c.mrr_usd || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">MRR total: {formatUSD(mrrTotal)}/mes</p>
        </div>
        <Link href="/clientes/nuevo">
          <Button><Plus className="size-4" />Nuevo cliente</Button>
        </Link>
      </div>

      {!clientes?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No hay clientes todavía</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {clientes.map(c => (
            <Link key={c.id} href={`/clientes/${c.id}`}
              className="bg-white rounded-xl border px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{c.nombre}</p>
                  <p className="text-sm text-muted-foreground">{c.contacto_nombre || "Sin contacto"}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-primary">{formatUSD(c.mrr_usd)}/mes</p>
                  <p className="text-xs text-muted-foreground">Desde {formatDate(c.fecha_inicio)}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADOS_CLIENTE_COLORS[c.estado as keyof typeof ESTADOS_CLIENTE_COLORS]}`}>
                  {ESTADOS_CLIENTE_LABELS[c.estado as keyof typeof ESTADOS_CLIENTE_LABELS]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
