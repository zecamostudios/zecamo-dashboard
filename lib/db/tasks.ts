import { createClient } from "@/lib/supabase/server";
import type { Task, OwnerId, TaskStatus, Priority } from "@/lib/types";

// DB: todo/doing/review/done → UI: hacer/curso/review/hecho
const ESTADO_TO_STATUS: Record<string, TaskStatus> = {
  todo: "hacer",
  doing: "curso",
  review: "review",
  done: "hecho",
};

const STATUS_TO_ESTADO: Record<TaskStatus, string> = {
  hacer: "todo",
  curso: "doing",
  review: "review",
  hecho: "done",
};

let _idCounter = 100;

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: _idCounter++,
    text: String(row.titulo ?? ""),
    status: ESTADO_TO_STATUS[String(row.estado ?? "todo")] ?? "hacer",
    prio: (String(row.prioridad ?? "media")) as Priority,
    due: row.fecha_limite
      ? new Date(String(row.fecha_limite)).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
      : "Sin fecha",
    owner: (String(row.asignado_initials ?? "JS")) as OwnerId,
    proj: String(row.proyecto_nombre ?? "General"),
    tags: (row.etiquetas as string[]) ?? [],
    done: String(row.estado) === "done",
  };
}

export async function getTasks(): Promise<Task[]> {
  _idCounter = 100;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tareas")
    .select("id, titulo, estado, prioridad, fecha_limite, asignado_initials, proyecto_nombre, etiquetas")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => rowToTask(row as Record<string, unknown>));
}

export async function updateTaskStatus(dbId: string, status: TaskStatus): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("tareas")
    .update({ estado: STATUS_TO_ESTADO[status], updated_at: new Date().toISOString() })
    .eq("id", dbId);
}

export async function getTaskCounts(): Promise<{ pending: number; total: number }> {
  const supabase = await createClient();
  const { data } = await supabase.from("tareas").select("estado");
  const all = data ?? [];
  return {
    pending: all.filter((t) => t.estado !== "done").length,
    total: all.length,
  };
}
