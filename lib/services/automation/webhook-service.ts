/**
 * WebhookService — sends outgoing webhooks to n8n (or any webhook receiver).
 * Signs payloads with HMAC-SHA256 if WEBHOOK_SECRET is set.
 * Retries up to 3 times with exponential backoff.
 */

export interface WebhookPayload {
  event:     string;
  timestamp: string;
  source:    "zecamo-dashboard";
  data:      Record<string, unknown>;
}

export interface WebhookResult {
  success:    boolean;
  statusCode?: number;
  error?:     string;
  attempts:   number;
}

const MAX_RETRIES   = 3;
const BASE_DELAY_MS = 500;

async function signPayload(body: string): Promise<string | null> {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || typeof crypto === "undefined") return null;
  const key  = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Buffer.from(sig).toString("hex");
}

export async function sendWebhook(
  url: string,
  event: string,
  data: Record<string, unknown>,
): Promise<WebhookResult> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    source:    "zecamo-dashboard",
    data,
  };

  const body      = JSON.stringify(payload);
  const signature = await signPayload(body);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Webhook-Source": "zecamo-dashboard",
    "X-Webhook-Event":  event,
  };
  if (signature) headers["X-Webhook-Signature"] = signature;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers, body });
      if (res.ok) return { success: true, statusCode: res.status, attempts: attempt };
      if (attempt === MAX_RETRIES || res.status < 500) {
        return { success: false, statusCode: res.status, error: `HTTP ${res.status}`, attempts: attempt };
      }
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        return { success: false, error: err instanceof Error ? err.message : "fetch failed", attempts: attempt };
      }
    }
    await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** (attempt - 1)));
  }

  return { success: false, error: "Max retries exceeded", attempts: MAX_RETRIES };
}

export async function triggerN8nWorkflow(
  workflowId: string,
  data: Record<string, unknown> = {},
): Promise<WebhookResult> {
  const base = process.env.N8N_WEBHOOK_URL;
  if (!base) return { success: false, error: "N8N_WEBHOOK_URL not configured", attempts: 0 };
  return sendWebhook(`${base}/${workflowId}`, `n8n:${workflowId}`, data);
}
