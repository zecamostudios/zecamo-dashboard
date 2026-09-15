import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProyectoFicha } from "@/components/proyectos/ProyectoFicha";
import type { Proyecto, Tarea } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProyectoDetallePage({ params }: Props) {
  // Next 16: params es una Promise.
  const { id } = await params;
  const isNew = id === "nuevo";
  const supabase = await createClient();

  const { data: clientesData } = await supabase.from("clientes").select("id, nombre").order("nombre");
  const clientes = (clientesData ?? []) as { id: string; nombre: string }[];

  let proyecto: Proyecto | null = null;
  let tareas: Tarea[] = [];

  if (!isNew) {
    const { data } = await supabase.from("proyectos").select("*").eq("id", id).single();
    if (!data) notFound();
    proyecto = data;

    const { data: tareasData } = await supabase
      .from("tareas")
      .select("*")
      .eq("proyecto_id", id)
      .order("fecha_limite", { ascending: true, nullsFirst: false });
    tareas = tareasData ?? [];
  }

  return <ProyectoFicha proyecto={proyecto} clientes={clientes} tareas={tareas} />;
}
