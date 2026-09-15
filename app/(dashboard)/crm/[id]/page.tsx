import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProspectoFicha } from "@/components/crm/ProspectoFicha";
import type { Prospecto } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CrmDetallePage({ params }: Props) {
  // Next 16: params es una Promise. Sin await, params.id era undefined, el id
  // no matcheaba "nuevo" y la pagina caia en notFound() -> 404 al crear prospectos.
  const { id } = await params;
  const isNew = id === "nuevo";
  const supabase = await createClient();

  let prospecto: Prospecto | null = null;

  if (!isNew) {
    const { data } = await supabase.from("prospectos").select("*").eq("id", id).single();
    if (!data) notFound();
    prospecto = data;
  }

  return <ProspectoFicha prospecto={prospecto} />;
}
