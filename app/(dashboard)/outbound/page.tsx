import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function OutboundPage() {
  const supabase = await createClient();
  const { data: campanas } = await supabase
    .from("outbound_campanas")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: envios } = await supabase
    .from("outbound_envios")
    .select("campana_id, id, estado");

  const enviosPorCampana = (envios || []).reduce((acc, e) => {
    if (!acc[e.campana_id]) acc[e.campana_id] = [];
    acc[e.campana_id].push(e);
    return acc;
  }, {} as Record<string, { id: string; estado: string | null }[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outbound</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Campañas y envíos de prospección</p>
        </div>
        <Link href="/outbound/nuevo">
          <Button><Plus className="size-4" />Nueva campaña</Button>
        </Link>
      </div>

      {!campanas?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No hay campañas todavía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campanas.map(c => {
            const camEnvios = enviosPorCampana[c.id] || [];
            const total = camEnvios.length;
            const respondidos = camEnvios.filter(e => e.estado === "respondido" || e.estado === "interesado").length;
            const responseRate = total > 0 ? Math.round((respondidos / total) * 100) : 0;

            return (
              <Link key={c.id} href={`/outbound/${c.id}`}
                className="bg-white rounded-xl border px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow block">
                <div>
                  <p className="font-medium">{c.nombre}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {c.canal || "Sin canal"} · {formatDate(c.fecha_inicio)}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold">{total}</p>
                    <p className="text-xs text-muted-foreground">envíos</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold text-green-600">{responseRate}%</p>
                    <p className="text-xs text-muted-foreground">respuesta</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
