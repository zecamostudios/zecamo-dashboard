import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types/database";

const LEAD_COLS =
  "id, created_at, nombre, categoria, zona, google_place_id, telefono, whatsapp, instagram, web, rating, num_reviews, tiene_web, score, gancho, opener, canal_sugerido, estado, aprobado_por, fecha_contacto, notas";

/** Cola de aprobación: leads pendientes, los de más dolor (score alto) primero. */
export async function getPendingLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLS)
    .eq("estado", "prospecto_pendiente")
    .order("score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Lead[];
}

/** Conteos para la barra de métricas del header. */
export async function getLeadCounts(): Promise<{
  pendientes: number;
  contactados: number;
  respondio: number;
}> {
  const supabase = await createClient();
  const count = async (estado: string) => {
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("estado", estado);
    return count ?? 0;
  };
  const [pendientes, contactados, respondio] = await Promise.all([
    count("prospecto_pendiente"),
    count("contactado"),
    count("respondio"),
  ]);
  return { pendientes, contactados, respondio };
}
