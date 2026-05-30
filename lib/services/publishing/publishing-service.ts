/**
 * PublishingService — orchestrates the full publish workflow:
 * create job → validate → run adapter → update job status → log event.
 * All operations are retry-safe and write to publishing_jobs + workflow_events.
 */
import { createClient } from "@/lib/supabase/server";
import { getPublishingAdapter } from "./factory";
import {
  createPublishingJob,
  updatePublishingJob,
  getPlatformAccountByPlatform,
} from "@/lib/db/content/publishing";
import { recordWorkflowEvent } from "@/lib/db/content/workflow";
import type { ContentPlatform, PublishingJob } from "@/lib/types";

export interface PublishOptions {
  accountId?: string;
  programadoPara?: string;
  actor?: string;
}

export interface PublishResponse {
  job: PublishingJob;
  success: boolean;
  externalId?: string;
  url?: string;
  errorMsg?: string;
  isMock: boolean;
}

export class PublishingError extends Error {
  constructor(
    message: string,
    public readonly jobId?: string,
  ) {
    super(message);
    this.name = "PublishingError";
  }
}

export async function publishPost(
  postId: string,
  platform: ContentPlatform,
  options: PublishOptions = {},
): Promise<PublishResponse> {
  const supabase = await createClient();

  // 1. Load post
  const { data: post, error: postErr } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (postErr || !post) {
    throw new PublishingError(`Post ${postId} not found`);
  }

  // Cast DB row (nulls → undefined) to satisfy ContentPost type
  const typedPost = post as unknown as import("@/lib/types").ContentPost;

  // 2. Validate via adapter
  const adapter = getPublishingAdapter(platform);
  const validation = adapter.validate(typedPost);
  if (!validation.valid) {
    throw new PublishingError(
      `Validation failed: ${validation.errors.join("; ")}`,
    );
  }

  // 3. Load platform account (optional for Zernio-backed adapters)
  const account = await getPlatformAccountByPlatform(platform) ?? {
    id: "zernio",
    plataforma: platform,
    account_id: "zernio",
    access_token: "",
    is_mock: false,
    activo: true,
    nombre_cuenta: "Zernio",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 4. Create publishing_job record
  const job = await createPublishingJob({
    post_id:         postId,
    plataforma:      platform,
    account_id:      options.accountId ?? account.id,
    programado_para: options.programadoPara,
  });

  if (!job) throw new PublishingError("Failed to create publishing job");

  // 5. Update job to processing
  await updatePublishingJob(job.id, {
    estado:   "processing",
    intentos: 1,
  });

  // 6. Execute publish
  let result;
  try {
    result = await adapter.publish(typedPost, account);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    await updatePublishingJob(job.id, {
      estado:      "error",
      error_msg:   errorMsg,
      procesado_en: new Date().toISOString(),
    });

    await recordWorkflowEvent({
      entidad_tipo:    "publishing_job",
      entidad_id:      job.id,
      evento:          "publish:error",
      estado_anterior: "processing",
      estado_nuevo:    "error",
      actor:           options.actor,
      metadata:        { error: errorMsg, platform },
    });

    return {
      job:      { ...job, estado: "error", error_msg: errorMsg },
      success:  false,
      errorMsg,
      isMock:   adapter.isMock,
    };
  }

  // 7. Update job outcome
  const finalEstado = result.success ? "success" : "error";
  await updatePublishingJob(job.id, {
    estado:          finalEstado as "success" | "error",
    external_post_id: result.externalId,
    error_msg:       result.errorMsg,
    procesado_en:    new Date().toISOString(),
    resultado:       result as unknown as Record<string, unknown>,
  });

  // 8. If success, mark post as published
  if (result.success) {
    await supabase
      .from("content_posts")
      .update({
        estado:      "publicado",
        publicado_en: new Date().toISOString(),
        external_id: result.externalId,
        updated_at:  new Date().toISOString(),
      })
      .eq("id", postId);
  }

  // 9. Log workflow event
  await recordWorkflowEvent({
    entidad_tipo:    "publishing_job",
    entidad_id:      job.id,
    evento:          result.success ? "publish:success" : "publish:error",
    estado_anterior: "processing",
    estado_nuevo:    finalEstado,
    actor:           options.actor,
    metadata:        {
      platform,
      externalId: result.externalId,
      url:        result.url,
      isMock:     adapter.isMock,
    },
  });

  return {
    job:        { ...job, estado: finalEstado as "success" | "error" },
    success:    result.success,
    externalId: result.externalId,
    url:        result.url,
    errorMsg:   result.errorMsg,
    isMock:     adapter.isMock,
  };
}

export async function retryPublishingJob(jobId: string, actor?: string): Promise<PublishResponse> {
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("publishing_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !job) throw new PublishingError(`Job ${jobId} not found`);
  if (job.estado !== "error") {
    throw new PublishingError(`Job ${jobId} is not in error state`);
  }
  if ((job.intentos ?? 0) >= (job.max_intentos ?? 3)) {
    throw new PublishingError(`Job ${jobId} has exceeded max retries`);
  }

  return publishPost(job.post_id, job.plataforma as ContentPlatform, { actor });
}

export async function validateForPublish(
  postId: string,
  platform: ContentPlatform,
): Promise<{ valid: boolean; errors: string[] }> {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (!post) return { valid: false, errors: ["Post not found"] };

  const adapter = getPublishingAdapter(platform);
  return adapter.validate(post as unknown as import("@/lib/types").ContentPost);
}
