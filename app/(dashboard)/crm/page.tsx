import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ESTADOS_PROSPECTO_LABELS, ESTADOS_PROSPECTO_COLORS, FUENTES_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CrmPage() {
  const supabase = await createClient();
  const { data: prospectos } = await supabase
    .from("prospectos")
    .select("id, negocio, nombre_dueno, estado, fuente, fecha_contacto, asignado_a")
    .order("updated_at", { ascending: false });

  const { data: profiles } = await supabase.from("profiles").select("id, nombre");
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.nombre || ""]));

  const estadoColors = ESTADOS_PROSPECTO_COLORS;
  const estadoLabels = ESTADOS_PROSPECTO_LABELS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {prospectos?.length ?? 0} prospectos
          </p>
        </div>
        <Link href="/crm/nuevo">
          <Button>
            <Plus className="size-4" />
            Nuevo prospecto
          </Button>
        </Link>
      </div>

      {!prospectos?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No hay prospectos todavía</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-medium">Negocio</th>
                  <th className="px-4 py-3 text-left font-medium">Contacto</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Fuente</th>
                  <th className="px-4 py-3 text-left font-medium">Primer contacto</th>
                  <th className="px-4 py-3 text-left font-medium">Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {prospectos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/crm/${p.id}`} className="font-medium text-foreground hover:text-primary">
                        {p.negocio}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.nombre_dueno || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoColors[p.estado as keyof typeof estadoColors]}`}>
                        {estadoLabels[p.estado as keyof typeof estadoLabels]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.fuente ? FUENTES_LABELS[p.fuente as keyof typeof FUENTES_LABELS] || p.fuente : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.fecha_contacto)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.asignado_a ? profileMap[p.asignado_a] || "—" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
