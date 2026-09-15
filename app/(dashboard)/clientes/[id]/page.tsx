import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClienteFicha } from "@/components/clientes/ClienteFicha";
import type { Cliente, Proyecto, Transaccion } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetallePage({ params }: Props) {
  // Next 16: params es una Promise (mismo caso que rompia el CRM con un 404).
  const { id } = await params;
  const isNew = id === "nuevo";
  const supabase = await createClient();

  let cliente: Cliente | null = null;
  let proyectos: Proyecto[] = [];
  let transacciones: Transaccion[] = [];

  if (!isNew) {
    const { data } = await supabase.from("clientes").select("*").eq("id", id).single();
    if (!data) notFound();
    cliente = data;

    const [proyRes, transRes] = await Promise.all([
      supabase.from("proyectos").select("*").eq("cliente_id", id).order("created_at", { ascending: false }),
      supabase.from("transacciones").select("*").eq("cliente_id", id).order("fecha", { ascending: false }).limit(5),
    ]);
    proyectos = proyRes.data ?? [];
    transacciones = transRes.data ?? [];
  }

  return <ClienteFicha cliente={cliente} proyectos={proyectos} transacciones={transacciones} />;
}
