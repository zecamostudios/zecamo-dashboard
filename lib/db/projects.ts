import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { PROJECT_COLS, rowToProject } from "./mappers";

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proyectos")
    .select(PROJECT_COLS)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row, i) => rowToProject(row as Record<string, unknown>, i));
}

export async function updateProjectStage(id: string, ui_estado: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("proyectos").update({ ui_estado, updated_at: new Date().toISOString() }).eq("id", id);
}
