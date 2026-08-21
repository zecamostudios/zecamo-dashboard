import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const TIMEOUT_MS = 5000;

export type ServiceStatus = "online" | "degraded" | "offline";

export interface ServiceCheck {
  name: string;
  key: string;
  status: ServiceStatus;
  latencyMs: number | null;
  message?: string;
}

async function check(
  name: string,
  key: string,
  fn: () => Promise<{ status: ServiceStatus; message?: string }>,
): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const result = await Promise.race([
      fn(),
      new Promise<{ status: ServiceStatus; message: string }>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), TIMEOUT_MS),
      ),
    ]);
    return { name, key, ...result, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name,
      key,
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

// ── Los sitios de clientes ──────────────────────────────────────────────────
// Agregado el 2026-08-21. Antes esta pantalla miraba solo la infraestructura
// (OpenAI, Supabase, n8n): servía para saber si el dashboard iba a andar, no si
// las webs que le cobramos a alguien están en pie.
//
// ⚠️ LOS PANELES SE MIDEN POR /sign-in, NO POR /dashboard.
// Clerk protege /dashboard devolviendo **404 a propósito** cuando no hay sesión.
// Un monitor apuntando ahí diría "caído" las veinticuatro horas estando todo
// perfecto — y un monitor que grita siempre deja de mirarse en una semana.
const SITIOS: Array<{ name: string; key: string; url: string }> = [
  { name: "Maximo B",          key: "maximob",        url: "https://maximob.com.ar" },
  { name: "Maximo B · panel",  key: "maximob-panel",  url: "https://maximob.com.ar/sign-in" },
  { name: "Cabañas",           key: "cabanas",        url: "https://cabañaslasflores.com" },
  { name: "Cabañas · panel",   key: "cabanas-panel",  url: "https://panel.cabañaslasflores.com" },
  { name: "Finca Cajal",       key: "fincacajal",     url: "https://www.fincacajal.com.ar" },
  { name: "Zecamo",            key: "zecamo",         url: "https://www.zecamostudios.com" },
  { name: "LEVEL",             key: "level",          url: "https://www.levelstudios.site" },
  { name: "Descubrir Tucumán", key: "descubrirtuc",   url: "https://descubrirtucuman.vercel.app" },
];

/**
 * Un sitio está bien si responde 2xx o 3xx.
 *
 * "Degradado" es por LENTITUD, no por código de estado: arriba de 3 segundos el
 * visitante ya se fue, aunque técnicamente el sitio conteste. Un semáforo que
 * solo distingue vivo de muerto no avisa del caso que más plata cuesta, que es
 * el sitio que anda pero tarda.
 */
async function checkSitio(url: string): Promise<{ status: ServiceStatus; message?: string }> {
  const res = await fetch(url, { redirect: "follow", cache: "no-store" });
  if (res.status >= 400) return { status: "offline", message: `HTTP ${res.status}` };
  return { status: "online" };
}

export async function GET() {
  const [openai, supabase, n8n, vercel, ...sitios] = await Promise.all([
    check("OpenAI", "openai", checkOpenAI),
    check("Supabase", "supabase", checkSupabase),
    check("n8n", "n8n", checkN8n),
    check("Vercel", "vercel", checkVercel),
    ...SITIOS.map((s) => check(s.name, s.key, () => checkSitio(s.url))),
  ]);

  // La lentitud se evalúa acá y no adentro de `checkSitio` porque el tiempo lo
  // mide `check`, que es quien envuelve la llamada.
  const conLatencia = sitios.map((s) =>
    s.status === "online" && (s.latencyMs ?? 0) > 3000
      ? { ...s, status: "degraded" as ServiceStatus, message: `Lento: ${(s.latencyMs! / 1000).toFixed(1)}s` }
      : s,
  );

  const services: ServiceCheck[] = [openai, supabase, n8n, vercel, ...conLatencia];

  const online   = services.filter((s) => s.status === "online").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const offline  = services.filter((s) => s.status === "offline").length;

  const overall: ServiceStatus =
    offline > 2 ? "offline" : degraded > 0 || offline > 0 ? "degraded" : "online";

  return NextResponse.json({
    overall,
    checkedAt: new Date().toISOString(),
    summary: { online, degraded, offline, total: services.length },
    // Separados para que la pantalla pueda mostrar los sitios de clientes
    // aparte de la infraestructura: son dos preguntas distintas.
    infraestructura: [openai, supabase, n8n, vercel].map((x) => x.key),
    sitios: conLatencia.map((x) => x.key),
    services,
  });
}
