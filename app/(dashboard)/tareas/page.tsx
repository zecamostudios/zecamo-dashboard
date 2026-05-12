import { createClient } from "@/lib/supabase/server";
import { TareasKanban } from "@/components/dashboard/tareas-kanban";

export default async function TareasPage() {
  const supabase = await createClient();
  const { data: tareas } = await supabase
    .from("tareas")
    .select("*")
    .order("prioridad", { ascending: false });

  const { data: profiles } = await supabase.from("profiles").select("id, nombre");
  const { data: proyectos } = await supabase.from("proyectos").select("id, nombre").order("nombre");
  const { data: { user } } = await supabase.auth.getUser();

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.nombre || ""]));
  const proyectoMap = Object.fromEntries((proyectos || []).map(p => [p.id, p.nombre]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tareas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Board del equipo</p>
      </div>
      <TareasKanban
        tareas={(tareas || []).map(t => ({
          ...t,
          asignado_nombre: t.asignado_a ? profileMap[t.asignado_a] : undefined,
          proyecto_nombre: t.proyecto_id ? proyectoMap[t.proyecto_id] : undefined,
        }))}
        profiles={profiles || []}
        proyectos={proyectos || []}
        userId={user?.id || ""}
      />
    </div>
  );
}
