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
  const url = "https://zecamon8n.zecamostudios.com/api/v1/workflows";
  const key = process.env.N8N_API_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MmUxMDhhZS1kYWI4LTRhZGItODJmZi0yYmQ5OTUxODMwMDciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNzliMjE4ZWYtZWYzNy00ZTk4LWIyMGYtZTA5ZjEyNzQ3NDUwIiwiaWF0IjoxNzgwMTYyNDI1fQ.ThW_y8NT2nV-mHKoL62T0NMbluug88U50XzBIRxwaNo";
  const res = await fetch(url, { headers: { "X-N8N-API-KEY": key } });
  if (res.ok) {
    const data = await res.json() as { data?: unknown[] };
    const count = data.data?.length ?? 0;
    return { status: "online", message: `${count} workflows` };
  }
  return { status: res.status >= 500 ? "degraded" : "offline", message: `HTTP ${res.status}` };
}

async function checkZernio(): Promise<{ instagram: ServiceStatus; linkedin: ServiceStatus; facebook: ServiceStatus; x: ServiceStatus; message?: string }> {
  const key = process.env.ZERNIO_API_KEY ?? "sk_449ab552e5f6ee5226690c34be0c585d3636660cb611b361d751258b69f24251";
  const res = await fetch("https://zernio.com/api/v1/accounts", {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!res.ok) {
    return { instagram: "offline", linkedin: "offline", facebook: "offline", x: "offline", message: `Zernio HTTP ${res.status}` };
  }

  const data = await res.json() as { accounts?: Array<{ platform: string; isActive?: boolean; enabled?: boolean; platformStatus?: string }> };
  const accounts = data.accounts ?? [];

  const isActive = (platform: string) => {
    const acc = accounts.find((a) => a.platform === platform);
    if (!acc) return "offline" as ServiceStatus;
    return (acc.enabled !== false && acc.platformStatus === "active") ? "online" : "degraded";
  };

  return {
    instagram: isActive("instagram"),
    linkedin:  isActive("linkedin"),
    facebook:  isActive("facebook"),
    x:         isActive("x"),
    message: `${accounts.length} cuentas conectadas`,
  };
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
  const zernioCheck = await checkZernio().catch(() => ({
    instagram: "offline" as ServiceStatus,
    linkedin: "offline" as ServiceStatus,
    facebook: "offline" as ServiceStatus,
    x: "offline" as ServiceStatus,
    message: "Error al conectar con Zernio",
  }));

  const [openai, supabase, n8n, vercel] = await Promise.all([
    check("OpenAI", "openai", checkOpenAI),
    check("Supabase", "supabase", checkSupabase),
    check("n8n", "n8n", checkN8n),
    check("Vercel", "vercel", checkVercel),
  ]);

  const services: ServiceCheck[] = [
    openai,
    supabase,
    n8n,
    { name: "Instagram",  key: "instagram", status: zernioCheck.instagram, latencyMs: null, message: zernioCheck.message },
    { name: "LinkedIn",   key: "linkedin",  status: zernioCheck.linkedin,  latencyMs: null, message: zernioCheck.message },
    { name: "Facebook",   key: "facebook",  status: zernioCheck.facebook,  latencyMs: null, message: "No conectado a Zernio" },
    { name: "X / Twitter", key: "x",        status: zernioCheck.x,         latencyMs: null, message: "No conectado a Zernio" },
    vercel,
  ];

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
