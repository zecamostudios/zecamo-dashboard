import { createClient } from "@/lib/supabase/server";
import type { Prospect, OwnerId, ServiceLine, StageId } from "@/lib/types";

function rowToProspect(row: Record<string, unknown>, idx: number): Prospect {
  return {
    id: idx + 1,
    dbId: String(row.id ?? ""),
    name: String(row.nombre_dueno ?? row.negocio ?? ""),
    company: String(row.negocio ?? ""),
    owner: (String(row.asignado_initials ?? "JS")) as OwnerId,
    line: (String(row.linea_servicio ?? "Webs")) as ServiceLine,
    stage: (String(row.etapa ?? "lead")) as StageId,
    value: Number(row.valor_estimado ?? 0),
    date: row.fecha_contacto
      ? new Date(String(row.fecha_contacto)).toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : String(row.created_at ?? "").slice(0, 10),
    last: String(row.last_activity ?? "—"),
    source: String(row.fuente ?? "Web"),
    recall: Boolean(String(row.volver_a_llamar ?? "").trim()),
  };
}

export async function getProspects(): Promise<Prospect[]> {
  const supabase = await createClient();
  // Leemos la tabla directa: la vista prospectos_ext no existe en esta base
  // (la migración que la creaba no se aplicó), y consultarla devolvía [] en
  // silencio dejando el CRM vacío. Las iniciales del asignado caen al default.
  const { data, error } = await supabase
    .from("prospectos")
    .select(
      "id, negocio, nombre_dueno, fuente, etapa, linea_servicio, valor_estimado, fecha_contacto, created_at, volver_a_llamar, asignado_a",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[getProspects]", error.message);
    return [];
  }
  return data.map((row, i) => rowToProspect(row as unknown as Record<string, unknown>, i));
}

export async function updateProspectStage(id: string, etapa: StageId): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("prospectos")
    .update({ etapa, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function updateProspect(
  id: string,
  data: Partial<{
    linea_servicio: ServiceLine;
    etapa: StageId;
    valor_estimado: number;
    notas: string;
  }>,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("prospectos")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function getProspectCounts(): Promise<{ active: number; total: number }> {
  const supabase = await createClient();
  const { data } = await supabase.from("prospectos").select("etapa");
  const all = data ?? [];
  const inactive = ["venta", "noresp", "noventa", "seguim"];
  const active = all.filter((p) => !inactive.includes(String(p.etapa))).length;
  return { active, total: all.length };
}
