import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import { CLIENT_COLS, rowToClient } from "./mappers";

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select(CLIENT_COLS)
    .order("mrr_usd", { ascending: false });

  if (error || !data) return [];
  return data.map((row, i) => rowToClient(row as Record<string, unknown>, i));
}

export async function getClientMrrStats(): Promise<{ totalMrr: number; activeCount: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("mrr_usd, ui_status");
  const all = data ?? [];
  const active = all.filter((c) => c.ui_status === "active");
  return {
    totalMrr: active.reduce((s, c) => s + Number(c.mrr_usd ?? 0), 0),
    activeCount: active.length,
  };
}
