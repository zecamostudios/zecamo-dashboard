import { NextResponse } from "next/server";
import { SITIOS, chequearSitio, estaPausado } from "@/lib/monitor/sitios";

export const dynamic = "force-dynamic";
const TIMEOUT_MS = 5000;

export type ServiceStatus = "online" | "degraded" | "offline";

/**
 * Tres grupos porque son tres preguntas distintas:
 *   servicio → ¿el dashboard va a andar?
 *   web      → ¿lo que ve un cliente de un cliente está en pie?
 *   panel    → ¿el dueño del local puede entrar a trabajar?
 * Mezclados en una sola grilla, un OpenAI caído se ve igual de grave que la
 * tienda de alguien caída, y no lo es.
 */
export type GrupoServicio = "servicio" | "web" | "panel";

export interface ServiceCheck {
  name: string;
  key: string;
  status: ServiceStatus;
  latencyMs: number | null;
  message?: string;
  grupo: GrupoServicio;
  /** Solo en webs y paneles: para poder abrirlos desde la pantalla. */
  url?: string;
}

async function check(
  name: string,
  key: string,
  fn: () => Promise<{ status: ServiceStatus; message?: string }>,
  grupo: GrupoServicio = "servicio",
  url?: string,
): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const result = await Promise.race([
      fn(),
      new Promise<{ status: ServiceStatus; message: string }>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), TIMEOUT_MS),
      ),
    ]);
    return { name, key, grupo, url, ...result, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name,
      key,
      grupo,
      url,
      status: "offline",
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

async function checkOpenAI(): Promise<{ status: ServiceStatus; message?: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { status: "offline", message: "API key no configurada" };
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.ok) return { status: "online" };
  return { status: res.status >= 500 ? "degraded" : "offline", message: `HTTP ${res.status}` };
}

async function checkSupabase(): Promise<{ status: ServiceStatus; message?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { status: "offline", message: "Credenciales no configuradas" };
  const res = await fetch(`${url}/rest/v1/content_posts?limit=1&select=id`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (res.ok) return { status: "online" };
  if (res.status < 500) return { status: "degraded", message: `HTTP ${res.status}` };
  return { status: "offline", message: `HTTP ${res.status}` };
}

async function checkN8n(): Promise<{ status: ServiceStatus; message?: string }> {
  // ⚠️ Hasta el 2026-08-21 esta clave estaba ESCRITA EN EL CÓDIGO como valor por
  // defecto, y commiteada. Un secreto en el código no se arregla borrándolo del
  // archivo: queda en la historia de git para siempre, y con éste se leían y
  // modificaban todos los workflows de n8n, incluidos los de LEVEL.
  //
  // Ahora es obligatoria por entorno. Si falta, el chequeo dice que falta —
  // que es información útil— en vez de funcionar con una clave escondida.
  const key = process.env.N8N_API_KEY;
  if (!key) return { status: "offline", message: "N8N_API_KEY no configurada" };

  const res = await fetch("https://zecamon8n.zecamostudios.com/api/v1/workflows", {
    headers: { "X-N8N-API-KEY": key },
  });
  if (res.ok) {
    const data = await res.json() as { data?: unknown[] };
    return { status: "online", message: `${data.data?.length ?? 0} workflows` };
  }

  // ⚠️ 401 NO es "n8n caído": es n8n vivo rechazando NUESTRA clave. Decir
  // "offline" ahí manda a revisar el servidor cuando el problema está de este
  // lado, y hace perder el tiempo justo cuando uno cree que hay una caída.
  // Pasó el 2026-08-24: el panel marcaba n8n caído y el servidor estaba
  // perfecto — la clave del archivo de accesos había vencido.
  if (res.status === 401 || res.status === 403) {
    return { status: "degraded", message: "n8n responde, pero rechaza la API key" };
  }
  return { status: res.status >= 500 ? "degraded" : "offline", message: `HTTP ${res.status}` };
}

async function checkVercel(): Promise<{ status: ServiceStatus; message?: string }> {
  const res = await fetch("https://www.vercel-status.com/api/v2/status.json");
  if (!res.ok) return { status: "degraded", message: "Status page inaccesible" };
  const data = await res.json() as { status?: { indicator?: string; description?: string } };
  const indicator = data.status?.indicator ?? "unknown";
  if (indicator === "none") return { status: "online", message: data.status?.description };
  if (indicator === "minor") return { status: "degraded", message: data.status?.description };
  return { status: "offline", message: data.status?.description };
}

export async function GET() {
  const [openai, supabase, n8n, vercel, ...sitios] = await Promise.all([
    check("OpenAI", "openai", checkOpenAI),
    check("Supabase", "supabase", checkSupabase),
    check("n8n", "n8n", checkN8n),
    check("Vercel", "vercel", checkVercel),
    // Los pausados siguen APARECIENDO en el panel, pero en amarillo y diciendo
    // por qué. Ocultarlos sería peor: Joaco buscaría Maximo B y no estaría, y
    // no hay nada peor que un tablero que calla.
    ...SITIOS.map((s) => check(s.name, s.key, async () => {
      if (estaPausado(s)) {
        return { status: "degraded" as const, message: "En pausa: probando si el monitor causa sus propias alertas" };
      }
      const r = await chequearSitio(s.url);
      return { status: r.estado, message: r.detalle };
    }, s.grupo, s.url)),
  ]);

  const services: ServiceCheck[] = [openai, supabase, n8n, vercel, ...sitios];

  const online   = services.filter((s) => s.status === "online").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const offline  = services.filter((s) => s.status === "offline").length;

  const overall: ServiceStatus =
    offline > 2 ? "offline" : degraded > 0 || offline > 0 ? "degraded" : "online";

  return NextResponse.json({
    overall,
    checkedAt: new Date().toISOString(),
    summary: { online, degraded, offline, total: services.length },
    services,
  });
}
