import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatUSD, formatDate } from "@/lib/utils";
import { ESTADOS_PROYECTO, ESTADOS_PROYECTO_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ProyectosPage() {
  const supabase = await createClient();
  const { data: proyectos } = await supabase
    .from("proyectos")
    .select("*")
    .order("updated_at", { ascending: false });

  const { data: clientes } = await supabase.from("clientes").select("id, nombre");
  const clienteMap = Object.fromEntries((clientes || []).map(c => [c.id, c.nombre]));

  const byEstado = ESTADOS_PROYECTO.map(e => ({
    estado: e,
    items: (proyectos || []).filter(p => p.estado === e),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{proyectos?.length ?? 0} proyectos</p>
        </div>
        <Link href="/proyectos/nuevo">
          <Button><Plus className="size-4" />Nuevo proyecto</Button>
        </Link>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {byEstado.slice(0, 4).map(({ estado, items }) => (
          <div key={estado} className="bg-slate-100/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {ESTADOS_PROYECTO_LABELS[estado as keyof typeof ESTADOS_PROYECTO_LABELS]}
              </span>
              <span className="text-xs bg-white rounded-full px-2 py-0.5 font-medium">{items.length}</span>
            </div>
            {items.map(p => (
              <Link key={p.id} href={`/proyectos/${p.id}`}
                className="block bg-white rounded-lg p-3 hover:shadow-sm transition-shadow border">
                <p className="font-medium text-sm">{p.nombre}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {p.cliente_id ? clienteMap[p.cliente_id] || "Sin cliente" : "Sin cliente"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{formatDate(p.fecha_entrega)}</span>
                  {p.precio_total_usd && (
                    <span className="text-xs font-semibold text-primary">{formatUSD(p.precio_total_usd)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
