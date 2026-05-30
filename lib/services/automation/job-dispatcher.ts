/**
 * JobDispatcher — routes different job types to the right service.
 * Central place for all async work: publishing, analytics, generation.
 */
import type { PublishingJob, ContentPlatform } from "@/lib/types";
import { publishPost }          from "@/lib/services/publishing/publishing-service";
import { ingestPlatformMetrics } from "@/lib/services/analytics/metrics-ingestion";
import { triggerN8nWorkflow }    from "./webhook-service";

export type JobType =
  | "publish"
  | "analytics_ingest"
  | "content_generate"
  | "n8n_workflow";

export interface DispatchResult {
  success: boolean;
  jobType: JobType;
  error?:  string;
  data?:   Record<string, unknown>;
}

export async function dispatchPublishJob(
  job: PublishingJob,
  actor?: string,
): Promise<DispatchResult> {
  try {
    const result = await publishPost(
      job.post_id,
      job.plataforma as ContentPlatform,
      { accountId: job.account_id ?? undefined, actor },
    );
    return {
      success: result.success,
      jobType: "publish",
      data: {
        externalId: result.externalId,
        url:        result.url,
        isMock:     result.isMock,
      },
    };
  } catch (err) {
    return {
      success: false,
      jobType: "publish",
      error:   err instanceof Error ? err.message : "dispatch failed",
    };
  }
}

export async function dispatchAnalyticsJob(
  postId: string,
  platform: ContentPlatform,
): Promise<DispatchResult> {
  try {
    const result = await ingestPlatformMetrics(postId, platform);
    return {
      success: true,
      jobType: "analytics_ingest",
      data:    { snapshot_id: result?.id },
    };
  } catch (err) {
    return {
      success: false,
      jobType: "analytics_ingest",
      error:   err instanceof Error ? err.message : "ingest failed",
    };
  }
}

export async function dispatchN8nWorkflow(
  workflowId: string,
  payload: Record<string, unknown> = {},
): Promise<DispatchResult> {
  const result = await triggerN8nWorkflow(workflowId, payload);
  return {
    success: result.success,
    jobType: "n8n_workflow",
    error:   result.error,
    data:    { attempts: result.attempts, statusCode: result.statusCode },
  };
}
