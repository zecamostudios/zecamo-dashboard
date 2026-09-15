import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PricingCalculadora } from "@/components/pricing/calculadora";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PricingDetailPage({ params }: Props) {
  // Next 16: params es una Promise (ver crm/[id]/page.tsx).
  const { id } = await params;
  const isNew = id === "nueva";
  const supabase = await createClient();

  let calculo = null;
  if (!isNew) {
    const { data } = await supabase
      .from("pricing_calculos")
      .select("*")
      .eq("id", id)
      .single();
    if (!data) notFound();
    calculo = data;
  }

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre")
    .eq("estado", "activo")
    .order("nombre");

  const { data: prospectos } = await supabase
    .from("prospectos")
    .select("id, negocio")
    .order("negocio");

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <PricingCalculadora
      calculo={calculo}
      clientes={clientes || []}
      prospectos={prospectos || []}
      userId={user?.id || ""}
    />
  );
}
