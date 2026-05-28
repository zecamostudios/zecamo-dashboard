import { createClient } from "@/lib/supabase/server";
import type { ActivityItem, OwnerId } from "@/lib/types";

export async function getActivityLog(limit = 10): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, icon_name, owner_initials, texto, cuando")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row, i) => ({
    id: i + 1,
    ico: String(row.icon_name ?? "Activity"),
    who: (String(row.owner_initials ?? "JS")) as OwnerId,
    text: String(row.texto ?? ""),
    when: String(row.cuando ?? ""),
  }));
}

export async function logActivity(
  icon_name: string,
  owner_initials: OwnerId,
  texto: string,
  cuando: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("activity_log").insert({ icon_name, owner_initials, texto, cuando });
}
