/**
 * Incoming webhook endpoint — receives events from n8n.
 * Validates HMAC-SHA256 signature if WEBHOOK_SECRET is set.
 * Routes events to the appropriate handler.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function verifySignature(body: string, signature: string | null): Promise<boolean> {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || !signature) return !secret; // pass if no secret configured
  if (typeof crypto === "undefined") return true;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = Buffer.from(signature, "hex");
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(body));
}

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("x-webhook-signature");

  const valid = await verifySignature(body, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event?: string; data?: Record<string, unknown> };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data = {} } = payload;
  const supabase = await createClient();

  // Log the incoming webhook (fire and forget, swallow errors)
  void supabase.from("content_automation_runs").insert({
    nombre:      `webhook:${event ?? "unknown"}`,
    tipo:        "n8n",
    estado:      "success",
    payload:     { event, data },
    iniciado_en:  new Date().toISOString(),
    finalizado_en: new Date().toISOString(),
  });

  // Route to handlers
  switch (event) {
    case "publish:complete": {
      const { job_id, post_id, external_id, url } = data as Record<string, string>;
      if (post_id) {
        await supabase.from("content_posts").update({
          estado:      "publicado",
          external_id,
          publicado_en: new Date().toISOString(),
          updated_at:  new Date().toISOString(),
        }).eq("id", post_id);
      }
      if (job_id) {
        await supabase.from("publishing_jobs").update({
          estado:          "success",
          external_post_id: external_id,
          procesado_en:    new Date().toISOString(),
          resultado:       { url, source: "n8n" },
        }).eq("id", job_id);
      }
      break;
    }

    case "publish:error": {
      const { job_id, error_msg } = data as Record<string, string>;
      if (job_id) {
        await supabase.from("publishing_jobs").update({
          estado:      "error",
          error_msg,
          procesado_en: new Date().toISOString(),
        }).eq("id", job_id);
      }
      break;
    }

    // `analytics:ingest` salió el 2026-08-21 junto con Content OS: traía las
    // métricas de los posts publicados en redes, y ya no hay posts que medir.
    // El webhook sigue vivo para el resto de los eventos.

    default:
      break;
  }

  return NextResponse.json({ ok: true, event });
}
