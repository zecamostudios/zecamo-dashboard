import { createClient } from "@/lib/supabase/server";
import type { WorkflowEvent } from "@/lib/types";

export async function getWorkflowEvents(
  entidadId: string,
  entidadTipo?: string,
): Promise<WorkflowEvent[]> {
  const supabase = await createClient();
  let query = supabase
    .from("workflow_events")
    .select("*")
    .eq("entidad_id", entidadId)
    .order("created_at", { ascending: false });
  if (entidadTipo) query = query.eq("entidad_tipo", entidadTipo);
  const { data } = await query;
  return (data ?? []) as WorkflowEvent[];
}

export async function recordWorkflowEvent(event: {
  entidad_tipo: string;
  entidad_id: string;
  evento: string;
  estado_anterior?: string;
  estado_nuevo?: string;
  actor?: string;
  metadata?: Record<string, unknown>;
}): Promise<WorkflowEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workflow_events")
    .insert(event)
    .select()
    .single();
  if (error) return null;
  return data as WorkflowEvent;
}
