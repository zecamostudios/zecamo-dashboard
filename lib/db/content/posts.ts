import { createClient } from "@/lib/supabase/server";
import type { ContentPost, ContentStatus, ContentPlatform } from "@/lib/types";

export async function getContentPosts(filters?: {
  estado?: ContentStatus;
  plataforma?: ContentPlatform;
}): Promise<ContentPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("content_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.estado) query = query.eq("estado", filters.estado);
  if (filters?.plataforma) query = query.eq("plataforma", filters.plataforma);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as ContentPost[];
}

export async function getQueuePosts(): Promise<ContentPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_posts")
    .select("*")
    .in("estado", ["borrador", "revision", "aprobado", "programado"])
    .order("created_at", { ascending: false });
  return (data ?? []) as ContentPost[];
}

export async function createContentPost(
  post: Omit<ContentPost, "id" | "created_at" | "updated_at">,
): Promise<ContentPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_posts")
    .insert(post)
    .select()
    .single();
  if (error) return null;
  return data as ContentPost;
}

export async function updateContentPost(
  id: string,
  updates: Partial<ContentPost>,
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, creado_por: _cp, ...safeUpdates } = updates as Record<string, unknown>;
  await supabase
    .from("content_posts")
    .update({ ...safeUpdates, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function updatePostStatus(id: string, estado: ContentStatus): Promise<void> {
  return updateContentPost(id, { estado });
}

export async function deleteContentPost(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("content_posts").delete().eq("id", id);
}

export async function getContentPostCounts(): Promise<Record<ContentStatus, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("content_posts").select("estado");
  const counts: Record<string, number> = {
    borrador: 0,
    revision: 0,
    aprobado: 0,
    programado: 0,
    publicado: 0,
    rechazado: 0,
  };
  (data ?? []).forEach((r) => {
    const e = r.estado as string;
    if (e in counts) counts[e]++;
  });
  return counts as Record<ContentStatus, number>;
}
