import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatUSD } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const CLASIFICACION_COLORS: Record<string, string> = {
  "Quick Win": "bg-green-100 text-green-700",
  "Big Win": "bg-blue-100 text-blue-700",
  "Nice to have": "bg-amber-100 text-amber-700",
  Despreciable: "bg-red-100 text-red-700",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: calculos } = await supabase
    .from("pricing_calculos")
    .select("id, nombre_solucion, area, clasificacion, precio_recomendado_usd, score_final, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calculadora de pricing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Calculá el valor de tus soluciones de IA</p>
        </div>
        <Link href="/pricing/nueva">
          <Button>
            <Plus className="size-4" />
            Nueva calculación
          </Button>
        </Link>
      </div>

      {!calculos?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No hay calculaciones todavía</p>
          <p className="text-sm mt-1">Creá la primera para calcular el valor de una solución.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          <div className="grid grid-cols-12 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span className="col-span-5">Solución</span>
            <span className="col-span-2">Área</span>
            <span className="col-span-2">Clasificación</span>
            <span className="col-span-2 text-right">Precio rec.</span>
            <span className="col-span-1 text-right">Score</span>
          </div>
          {calculos.map((c) => (
            <Link
              key={c.id}
              href={`/pricing/${c.id}`}
              className="grid grid-cols-12 px-4 py-3.5 hover:bg-slate-50 transition-colors items-center"
            >
              <div className="col-span-5">
                <p className="font-medium text-sm text-foreground">{c.nombre_solucion}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(c.created_at)}</p>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">{c.area || "—"}</div>
              <div className="col-span-2">
                {c.clasificacion ? (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${CLASIFICACION_COLORS[c.clasificacion] || "bg-slate-100 text-slate-600"}`}
                  >
                    {c.clasificacion}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </div>
              <div className="col-span-2 text-right text-sm font-medium">
                {formatUSD(c.precio_recomendado_usd)}
              </div>
              <div className="col-span-1 text-right">
                <span className="text-sm font-bold text-primary">{c.score_final ?? "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
