/**
 * WorkflowService — records state transitions for content posts and
 * updates post status atomically with the audit trail.
 * Server-side only.
 */
import { updatePostStatus } from "@/lib/db/content/posts";
import { recordWorkflowEvent } from "@/lib/db/content/workflow";
import type { ContentStatus } from "@/lib/types";

const VALID_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  borrador:   ["revision", "rechazado"],
  revision:   ["aprobado", "rechazado", "borrador"],
  aprobado:   ["programado", "rechazado", "revision"],
  programado: ["publicado", "aprobado", "rechazado"],
  publicado:  [],
  rechazado:  ["borrador"],
};

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowError";
  }
}

export async function transitionPost(
  postId: string,
  from: ContentStatus,
  to: ContentStatus,
  actor?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new WorkflowError(`Transition "${from}" → "${to}" is not allowed`);
  }

  await updatePostStatus(postId, to);

  await recordWorkflowEvent({
    entidad_tipo:    "content_post",
    entidad_id:      postId,
    evento:          `estado:${from}→${to}`,
    estado_anterior: from,
    estado_nuevo:    to,
    actor,
    metadata,
  });
}

export async function submitForReview(postId: string, actor?: string): Promise<void> {
  return transitionPost(postId, "borrador", "revision", actor);
}

export async function approvePost(postId: string, actor?: string): Promise<void> {
  return transitionPost(postId, "revision", "aprobado", actor);
}

export async function rejectPost(
  postId: string,
  from: ContentStatus,
  actor?: string,
  reason?: string,
): Promise<void> {
  return transitionPost(postId, from, "rechazado", actor, { reason });
}

export async function schedulePost(
  postId: string,
  scheduledFor: string,
  actor?: string,
): Promise<void> {
  return transitionPost(postId, "aprobado", "programado", actor, { programado_para: scheduledFor });
}

export async function markPublished(
  postId: string,
  externalId?: string,
  actor?: string,
): Promise<void> {
  return transitionPost(postId, "programado", "publicado", actor, { external_id: externalId });
}
