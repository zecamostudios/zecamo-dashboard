import { createClient } from "@/lib/supabase/server";
import type { Task, TaskStatus } from "@/lib/types";
import { TASK_COLS, rowToTask } from "./mappers";

const STATUS_TO_ESTADO: Record<TaskStatus, string> = {
  hacer: "todo",
  curso: "doing",
  review: "review",
  hecho: "done",
};

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tareas")
    .select(TASK_COLS)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row, i) => rowToTask(row as Record<string, unknown>, i));
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
