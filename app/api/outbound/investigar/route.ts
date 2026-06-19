import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";

// Webhook del workflow WF-SDR-Agent en n8n (research + propuesta + outreach).
const SDR_AGENT_WEBHOOK_URL =
  process.env.N8N_SDR_AGENT_WEBHOOK_URL ??
  "https://zecamon8n.zecamostudios.com/webhook/sdr-agent";

// Campos que el agente necesita de cada lead (se mandan completos para no
// depender de una lectura extra en n8n).
interface LeadPayload {
  id: string;
  nombre: string;
  categoria: string | null;
  zona: string | null;
  web: string | null;
  google_place_id: string | null;
  whatsapp: string | null;
  instagram: string | null;
  rating: number | null;
  num_reviews: number | null;
  tiene_web: boolean;
  opener: string | null;
  canal_sugerido: string | null;
}

/**
 * Dispara la investigación de una tanda de leads. Body: { leads: LeadPayload[] }.
 * El workflow responde al toque y corre en background; los resultados (research,
 * email, mensaje corto) caen en la tabla `leads`.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let leads: LeadPayload[] = [];
  try {
    const body = await req.json();
    leads = Array.isArray(body?.leads) ? body.leads : [];
  } catch {
    leads = [];
  }
  if (leads.length === 0) {
    return NextResponse.json({ error: "leads vacío" }, { status: 400 });
  }

  try {
    const res = await fetch(SDR_AGENT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leads }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[outbound/investigar] webhook", res.status, txt);
      return NextResponse.json(
        { error: `El agente respondió ${res.status}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, enviados: leads.length });
  } catch (err) {
    console.error("[outbound/investigar]", err);
    return NextResponse.json(
      { error: "No se pudo contactar el agente" },
      { status: 502 },
    );
  }
}
