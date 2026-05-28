import { createClient } from "@/lib/supabase/server";
import type { OutboundMessage, Template, OwnerId, OutboundStatus, OutboundChannel, ServiceLine } from "@/lib/types";

export async function getOutboundMessages(): Promise<OutboundMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outbound_mensajes")
    .select("id, para_nombre, para_empresa, owner_initials, canal, estado, enviado_hace, template_nombre")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row, i) => ({
    id: i + 1,
    to: String(row.para_nombre ?? ""),
    company: String(row.para_empresa ?? ""),
    owner: (String(row.owner_initials ?? "JS")) as OwnerId,
    channel: (String(row.canal ?? "Email")) as OutboundChannel,
    status: (String(row.estado ?? "enviado")) as OutboundStatus,
    sent: String(row.enviado_hace ?? "Hoy"),
    template: String(row.template_nombre ?? ""),
  }));
}

export async function updateOutboundStatus(id: string, estado: OutboundStatus): Promise<void> {
  const supabase = await createClient();
  await supabase.from("outbound_mensajes").update({ estado }).eq("id", id);
}

export async function getTemplates(): Promise<Template[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outbound_templates")
    .select("id, nombre, uses, reply_rate, linea_servicio, owner_initials")
    .order("uses", { ascending: false });

  if (error || !data) return [];
  return data.map((row, i) => ({
    id: i + 1,
    name: String(row.nombre ?? ""),
    uses: Number(row.uses ?? 0),
    reply: Number(row.reply_rate ?? 0),
    line: (String(row.linea_servicio ?? "AIMA")) as ServiceLine,
    owner: (String(row.owner_initials ?? "JS")) as OwnerId,
  }));
}
