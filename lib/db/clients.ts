import { createClient } from "@/lib/supabase/server";
import type { Client, ClientStatus, ServiceLine } from "@/lib/types";

function rowToClient(row: Record<string, unknown>, idx: number): Client {
  const since = row.fecha_inicio
    ? new Date(String(row.fecha_inicio)).toLocaleDateString("es-AR", { month: "short", year: "numeric" })
    : "—";

  const projectsCount = typeof row.projects_count === "number" ? row.projects_count : 1;

  return {
    id: idx + 1,
    dbId: String(row.id ?? ""),
    name: String(row.nombre ?? ""),
    contact: String(row.contacto_nombre ?? ""),
    line: (String(row.linea_servicio ?? "Webs")) as ServiceLine,
    mrr: Number(row.mrr_usd ?? 0),
    since,
    status: (String(row.ui_status ?? "active")) as ClientStatus,
    projects: Number(projectsCount),
    health: Number(row.health_score ?? 80),
    next: String(row.next_action ?? "—"),
  };
}

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nombre, contacto_nombre, mrr_usd, ui_status, linea_servicio, health_score, next_action, fecha_inicio")
    .order("mrr_usd", { ascending: false });

  if (error || !data) return [];
  return data.map((row, i) => rowToClient(row as Record<string, unknown>, i));
}

export async function getClientMrrStats(): Promise<{ totalMrr: number; activeCount: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("mrr_usd, ui_status");
  const all = data ?? [];
  const active = all.filter((c) => c.ui_status === "active");
  return {
    totalMrr: active.reduce((s, c) => s + Number(c.mrr_usd ?? 0), 0),
    activeCount: active.length,
  };
}
