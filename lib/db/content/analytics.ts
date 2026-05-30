import { createClient } from "@/lib/supabase/server";
import type { AnalyticsSnapshot } from "@/lib/types";

export async function getAnalyticsSnapshots(postId: string): Promise<AnalyticsSnapshot[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .eq("post_id", postId)
    .order("fecha", { ascending: true });
  return (data ?? []) as AnalyticsSnapshot[];
}

export async function getLatestSnapshot(postId: string): Promise<AnalyticsSnapshot | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .eq("post_id", postId)
    .order("fecha", { ascending: false })
    .limit(1)
    .single();
  return (data as AnalyticsSnapshot) ?? null;
}

export async function upsertSnapshot(
  snapshot: Omit<AnalyticsSnapshot, "id" | "created_at">,
): Promise<AnalyticsSnapshot | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analytics_snapshots")
    .upsert({ ...snapshot }, { onConflict: "post_id,fecha" })
    .select()
    .single();
  if (error) return null;
  return data as AnalyticsSnapshot;
}

export async function getTopPerformingPosts(limit = 10): Promise<AnalyticsSnapshot[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .order("engagement_rate", { ascending: false })
    .limit(limit);
  return (data ?? []) as AnalyticsSnapshot[];
}
