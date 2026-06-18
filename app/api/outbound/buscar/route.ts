import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";

// Webhook del workflow WF-Outbound-SDR en n8n (scrapea Google Places + scoring IA).
// Hardcodeado con override por env (mismo criterio que lib/services/publishing/facebook.ts).
const SDR_WEBHOOK_URL =
  process.env.N8N_SDR_WEBHOOK_URL ??
  "https://zecamon8n.zecamostudios.com/webhook/sdr-prospeccion";

/**
 * Dispara la búsqueda de prospectos. Body opcional:
 *   { queries: string[] }          → lista de búsquedas a mano
 *   { nicho: string, ciudad: string } → genera 3 queries
 *   {}                              → usa las queries por defecto del workflow (gyms Tucumán)
 * El workflow responde al toque y corre en background; los leads caen en la tabla `leads`.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) ?? {};
  } catch {
    body = {};
  }

  try {
    const res = await fetch(SDR_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[outbound/buscar] webhook respondió", res.status, txt);
      return NextResponse.json(
        { error: `El workflow respondió ${res.status}` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[outbound/buscar]", err);
    return NextResponse.json(
      { error: "No se pudo contactar el workflow de prospección" },
      { status: 502 },
    );
  }
}
