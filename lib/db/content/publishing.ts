import { createClient } from "@/lib/supabase/server";
import type { PublishingJob, PlatformAccount, PublishingJobStatus, ContentPlatform } from "@/lib/types";

export async function getPlatformAccounts(): Promise<PlatformAccount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_accounts")
    .select("*")
    .eq("activo", true)
    .order("plataforma");
  return (data ?? []) as PlatformAccount[];
}

export async function getPlatformAccountByPlatform(
  plataforma: ContentPlatform,
): Promise<PlatformAccount | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_accounts")
    .select("*")
    .eq("plataforma", plataforma)
    .eq("activo", true)
    .limit(1)
    .single();
  return (data as PlatformAccount) ?? null;
}

export async function getPublishingJobs(postId?: string): Promise<PublishingJob[]> {
  const supabase = await createClient();
  let query = supabase
    .from("publishing_jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (postId) query = query.eq("post_id", postId);
  const { data } = await query;
  return (data ?? []) as PublishingJob[];
}

export async function createPublishingJob(job: {
  post_id: string;
  plataforma: ContentPlatform;
  account_id?: string;
  programado_para?: string;
}): Promise<PublishingJob | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publishing_jobs")
    .insert({
      ...job,
      estado: "pending" as PublishingJobStatus,
      intentos: 0,
      max_intentos: 3,
    })
    .select()
    .single();
  if (error) return null;
  return data as PublishingJob;
}

export async function updatePublishingJob(
  id: string,
  updates: Partial<Pick<PublishingJob, "estado" | "external_post_id" | "error_msg" | "procesado_en" | "intentos" | "resultado">>,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("publishing_jobs").update(updates).eq("id", id);
}
