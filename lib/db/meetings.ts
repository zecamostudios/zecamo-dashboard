import { createClient } from "@/lib/supabase/server";
import type { Meeting, OwnerId } from "@/lib/types";

export async function getMeetings(): Promise<Meeting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reuniones")
    .select("id, dia, hora, titulo, persona, owner_initials, canal")
    .order("created_at");

  if (error || !data) return [];
  return data.map((row, i) => ({
    id: i + 1,
    day: String(row.dia ?? ""),
    time: String(row.hora ?? ""),
    title: String(row.titulo ?? ""),
    who: String(row.persona ?? ""),
    owner: (String(row.owner_initials ?? "JS")) as OwnerId,
    channel: (row.canal as "video" | "phone") ?? "video",
  }));
}
