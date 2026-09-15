import { TareasView } from "@/components/tareas/TareasView";
import { getTasks } from "@/lib/db/tasks";
import { createClient } from "@/lib/supabase/server";

export default async function TareasPage() {
  const supabase = await createClient();
  // Los proyectos alimentan el selector del formulario: una tarea suelta no
  // dice para quien es.
  const [tasks, proyectosRes] = await Promise.all([
    getTasks(),
    supabase.from("proyectos").select("id, nombre").order("nombre"),
  ]);

  return (
    <TareasView
      initialTasks={tasks}
      proyectos={(proyectosRes.data ?? []) as { id: string; nombre: string }[]}
    />
  );
}
