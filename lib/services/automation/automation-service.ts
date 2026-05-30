/**
 * AutomationService — high-level entry point for triggering automations.
 * Logs every trigger to content_automation_runs and fires the n8n webhook.
 */
import { createClient } from "@/lib/supabase/server";
import { triggerN8nWorkflow } from "./webhook-service";
import type { AutomationRun } from "@/lib/types";

export interface TriggerResult {
  run: AutomationRun;
  webhookSent: boolean;
  webhookError?: string;
}

export async function triggerAutomation(
  automationId: string,
  payload: Record<string, unknown> = {},
  tipo: "manual" | "scheduled" | "n8n" = "manual",
): Promise<TriggerResult> {
  const supabase = await createClient();

  const { data: run, error } = await supabase
    .from("content_automation_runs")
    .insert({
      nombre:      automationId,
      tipo,
      estado:      "running",
      payload,
      iniciado_en: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !run) {
    throw new Error(`Failed to create automation run: ${error?.message}`);
  }

  const webhookResult = await triggerN8nWorkflow(automationId, {
    ...payload,
    run_id: run.id,
  });

  const finalEstado = webhookResult.success ? "success" : "error";

  await supabase
    .from("content_automation_runs")
    .update({
      estado:        finalEstado,
      finalizado_en: new Date().toISOString(),
      resultado: {
        webhook_sent:  webhookResult.success,
        webhook_error: webhookResult.error,
        attempts:      webhookResult.attempts,
      },
      error_msg: webhookResult.error ?? null,
    })
    .eq("id", run.id);

  return {
    run:          { ...run, estado: finalEstado } as AutomationRun,
    webhookSent:  webhookResult.success,
    webhookError: webhookResult.error,
  };
}

export async function triggerPublishingJobAutomation(
  postId: string,
  platform: string,
  jobId: string,
): Promise<TriggerResult> {
  return triggerAutomation("publish-content", {
    post_id:  postId,
    platform,
    job_id:   jobId,
  });
}

export async function triggerAnalyticsIngestionAutomation(
  postId: string,
  platform: string,
): Promise<TriggerResult> {
  return triggerAutomation("ingest-analytics", {
    post_id:  postId,
    platform,
  });
}

export async function triggerContentGenerationAutomation(
  tipo: string,
  platform: string,
  prompt: string,
): Promise<TriggerResult> {
  return triggerAutomation("generate-content", {
    tipo,
    platform,
    prompt,
  });
}
