import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CrmDetalle } from "@/components/crm/crm-detalle";
import type { InteraccionProspecto, Prospecto } from "@/types/database";

interface Props {
  params: { id: string };
}

export default async function CrmDetallePage({ params }: Props) {
  const isNew = params.id === "nuevo";
  const supabase = await createClient();

  const { data: profiles } = await supabase.from("profiles").select("id, nombre");
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.nombre]));
  const { data: { user } } = await supabase.auth.getUser();

  let prospecto: (Prospecto & { profiles?: { id: string; nombre: string | null } | null }) | null = null;
  let interacciones: (InteraccionProspecto & { profiles?: { nombre: string | null } | null })[] = [];

  if (!isNew) {
    const { data: prospectoData } = await supabase
      .from("prospectos")
      .select("*")
      .eq("id", params.id)
      .single();
    if (!prospectoData) notFound();

    prospecto = {
      ...prospectoData,
      profiles: prospectoData.asignado_a
        ? { id: prospectoData.asignado_a, nombre: profileMap[prospectoData.asignado_a] || null }
        : null,
    };

    const { data: intsData } = await supabase
      .from("interacciones_prospecto")
      .select("*")
      .eq("prospecto_id", params.id)
      .order("fecha", { ascending: false });

    interacciones = (intsData || []).map(i => ({
      ...i,
      profiles: i.creado_por ? { nombre: profileMap[i.creado_por] || null } : null,
    }));
  }

  return (
    <CrmDetalle
      prospecto={prospecto}
      interacciones={interacciones}
      profiles={profiles || []}
      userId={user?.id || ""}
    />
  );
}
