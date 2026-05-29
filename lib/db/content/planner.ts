import { createClient } from "@/lib/supabase/server";
import type { PlannerSlot } from "@/lib/types";

export async function getPlannerSlots(startDate: string, endDate: string): Promise<PlannerSlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_planner")
    .select("*, post:content_posts(*)")
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .order("fecha", { ascending: true })
    .order("orden", { ascending: true });

  if (error || !data) return [];
  return data as PlannerSlot[];
}

export async function createPlannerSlot(
  slot: Omit<PlannerSlot, "id" | "created_at" | "post">,
): Promise<PlannerSlot | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_planner")
    .insert(slot)
    .select()
    .single();
  if (error) return null;
  return data as PlannerSlot;
}

export async function updatePlannerSlot(
  id: string,
  updates: Partial<Omit<PlannerSlot, "id" | "created_at" | "post_id" | "post">>,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("content_planner").update(updates).eq("id", id);
}

export async function deletePlannerSlot(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("content_planner").delete().eq("id", id);
}
