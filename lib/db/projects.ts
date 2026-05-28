import { createClient } from "@/lib/supabase/server";
import type { Project, OwnerId, ServiceLine, ProjectStatus, Priority } from "@/lib/types";

function rowToProject(row: Record<string, unknown>, idx: number): Project {
  const start = row.fecha_inicio
    ? new Date(String(row.fecha_inicio)).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const due = row.fecha_entrega
    ? new Date(String(row.fecha_entrega)).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return {
    id: idx + 1,
    name: String(row.nombre ?? ""),
    client: String(row.cliente_nombre ?? ""),
    line: (String(row.linea_servicio ?? "Webs")) as ServiceLine,
    owner: (String(row.asignado_initials ?? "JS")) as OwnerId,
    start,
    due,
    progress: Number(row.progreso ?? 0),
    status: (String(row.ui_estado ?? "backlog")) as ProjectStatus,
    priority: (String(row.prioridad ?? "media")) as Priority,
    team: ((row.equipo as string[]) ?? []) as OwnerId[],
  };
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proyectos")
    .select("id, nombre, cliente_id, linea_servicio, asignado_initials, equipo, progreso, prioridad, ui_estado, fecha_inicio, fecha_entrega, clientes(nombre)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row, i) => {
    const r = row as Record<string, unknown>;
    const clientRow = r.clientes as Record<string, unknown> | null;
    r.cliente_nombre = clientRow?.nombre ?? "";
    return rowToProject(r, i);
  });
}

export async function updateProjectStage(id: string, ui_estado: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("proyectos").update({ ui_estado, updated_at: new Date().toISOString() }).eq("id", id);
}
