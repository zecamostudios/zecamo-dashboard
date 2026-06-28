import { createClient } from "@/lib/supabase/server";
import type { Prospect, ServiceLine, StageId } from "@/lib/types";
import { PROSPECT_COLS, rowToProspect } from "./mappers";

export async function getProspects(): Promise<Prospect[]> {
  const supabase = await createClient();
  // Leemos la tabla directa: la vista prospectos_ext no existe en esta base
  // (la migración que la creaba no se aplicó), y consultarla devolvía [] en
  // silencio dejando el CRM vacío. Las iniciales del asignado caen al default.
  const { data, error } = await supabase
    .from("prospectos")
    .select(PROSPECT_COLS)
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
