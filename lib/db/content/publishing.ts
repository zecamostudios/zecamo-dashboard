import { createClient } from "@/lib/supabase/server";
import type { PublishingJob, PlatformAccount, PublishingJobStatus } from "@/lib/types";

export async function getPlatformAccounts(): Promise<PlatformAccount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_accounts")
    .select("*")
    .eq("activo", true)
    .order("plataforma");
  return (data ?? []) as PlatformAccount[];
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
  platform_account_id: string;
  programado_para?: string;
}): Promise<PublishingJob | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publishing_jobs")
    .insert({ ...job, estado: "pending" as PublishingJobStatus, intentos: 0 })
    .select()
    .single();
  if (error) return null;
  return data as PublishingJob;
}

export async function updatePublishingJob(
  id: string,
  updates: Partial<Pick<PublishingJob, "estado" | "external_id" | "error_msg" | "procesado_en" | "intentos">>,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("publishing_jobs").update(updates).eq("id", id);
}
