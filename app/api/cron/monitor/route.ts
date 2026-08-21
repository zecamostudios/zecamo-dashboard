import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITIOS, chequearSitio, type EstadoSitio } from "@/lib/monitor/sitios";
import { avisar } from "@/lib/monitor/telegram";

/**
 * Cron del monitor de sitios.
 *
 * GET /api/cron/monitor — lo dispara Vercel Cron (ver vercel.json).
 *
 * POR QUÉ EXISTE APARTE DE /api/health
 * `/api/health` responde cuando alguien abre la pantalla. Sirve para mirar, no
 * para enterarse: si un sitio se cae un domingo a las 3 de la mañana, nadie
 * tiene el dashboard abierto. Este endpoint corre solo y avisa.
 *
 * AVISA SOLO EN LOS CAMBIOS
 * Compara contra `monitor_estado` y manda Telegram únicamente cuando algo pasa
 * de bien a mal o de mal a bien. Sin esa comparación, un sitio caído mandaría
 * 288 mensajes por día, el canal se silenciaría, y el día que se cayera otra
 * cosa el aviso llegaría a un canal que nadie mira. Un monitor ruidoso es peor
 * que ninguno: da la sensación de estar cubierto.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Cuánto hace que está así, en palabras. */
function hace(desde: string): string {
  const min = Math.round((Date.now() - new Date(desde).getTime()) / 60000);
  if (min < 60) return `${min} min`;
  const hs = Math.round(min / 60);
  if (hs < 48) return `${hs} h`;
  return `${Math.round(hs / 24)} días`;
}

export async function GET(req: NextRequest) {
  // Vercel manda `Authorization: Bearer ${CRON_SECRET}` en cada ejecución. Sin
  // esto el endpoint queda abierto y cualquiera puede disparar los avisos.
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const supabase = createAdminClient();
  const ahora = new Date().toISOString();

  const resultados = await Promise.all(
    SITIOS.map(async (s) => ({ sitio: s, ...(await chequearSitio(s.url)) })),
  );

  const { data: previos } = await supabase
    .from("monitor_estado")
    .select("clave, estado, desde");
  const antes = new Map((previos ?? []).map((p) => [p.clave, p]));

  const cambios: string[] = [];

  for (const r of resultados) {
    const previo = antes.get(r.sitio.key);
    const cambio = previo?.estado !== r.estado;

    await supabase.from("monitor_estado").upsert({
      clave: r.sitio.key,
      nombre: r.sitio.name,
      estado: r.estado,
      // `desde` solo se pisa cuando el estado cambia: si no, se perdería
      // cuánto hace que está caído, que es la mitad de la información.
      desde: cambio ? ahora : (previo?.desde ?? ahora),
      ultimo_chequeo: ahora,
      latencia_ms: r.latenciaMs,
      detalle: r.detalle ?? null,
    });

    if (!cambio) continue;

    // La primera corrida no avisa: sin estado previo, todo "cambia" y llegarían
    // ocho mensajes de sitios que están perfectos.
    if (!previo) continue;

    const volvio = r.estado === "online";
    const icono: Record<EstadoSitio, string> = { online: "🟢", degraded: "🟡", offline: "🔴" };
    cambios.push(
      volvio
        ? `${icono.online} *${r.sitio.name}* volvió\nEstuvo mal ${hace(previo.desde)}.`
        : `${icono[r.estado]} *${r.sitio.name}* ${r.estado === "offline" ? "está caído" : "está lento"}\n${r.detalle ?? ""}\n${r.sitio.url}`,
    );
  }

  if (cambios.length > 0) await avisar(cambios.join("\n\n"));

  return NextResponse.json({
    revisados: resultados.length,
    cambios: cambios.length,
    estado: resultados.map((r) => ({ sitio: r.sitio.key, estado: r.estado, ms: r.latenciaMs })),
  });
}
