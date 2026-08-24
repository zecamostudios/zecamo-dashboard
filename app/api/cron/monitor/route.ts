import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITIOS, chequearSitio, type EstadoSitio } from "@/lib/monitor/sitios";
import { avisar } from "@/lib/monitor/telegram";

/**
 * Cron del monitor de sitios.
 *
 * GET /api/cron/monitor
 *
 * ⚠️ NO LO DISPARA VERCEL, y no es un olvido: el plan Hobby solo admite crons
 * diarios. Una expresión de cada 5 minutos en vercel.json no falla al correr:
 * hace que Vercel RECHACE EL DEPLOY ENTERO con `cron_jobs_limits_reached`, y el
 * síntoma es que los push dejan de publicarse sin que nadie relacione una cosa
 * con la otra. Ya pasó el 2026-08-21: dos commits quedaron sin desplegar.
 *
 * Lo dispara un cron externo cada 5 minutos (ver docs/monitor.md).
 *
 * POR QUÉ EXISTE APARTE DE /api/health
 * `/api/health` responde cuando alguien abre la pantalla. Sirve para mirar, no
 * para enterarse: si un sitio se cae un domingo a las 3 de la mañana, nadie
 * tiene el dashboard abierto. Este endpoint corre solo y avisa.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cuántas corridas seguidas tiene que fallar un sitio para declararlo caído.
 *
 * Con el cron cada 5 minutos, 2 = diez minutos de caída sostenida.
 *
 * EXISTE PORQUE LA PRIMERA VERSIÓN AVISABA DEMASIADO (2026-08-24). Un timeout
 * aislado —una red que hipa un segundo, un Worker arrancando en frío— se veía
 * igual que una caída real, y el canal se llenó de ruido. Un monitor que grita
 * por cada hipo termina silenciado, y el día que hay una caída de verdad el
 * aviso llega a un canal que nadie mira.
 */
const FALLOS_PARA_AVISAR = 2;

/** Cuánto hace que está así, en palabras. */
function hace(desde: string): string {
  const min = Math.round((Date.now() - new Date(desde).getTime()) / 60000);
  if (min < 60) return `${min} min`;
  const hs = Math.round(min / 60);
  if (hs < 48) return `${hs} h`;
  return `${Math.round(hs / 24)} días`;
}

export async function GET(req: NextRequest) {
  // Vercel manda `Authorization: Bearer ${CRON_SECRET}` en cada ejecución, y el
  // Worker de Cloudflare hace lo mismo. Sin esto el endpoint queda abierto y
  // cualquiera puede disparar los avisos.
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
    .select("clave, estado, desde, fallos_seguidos");
  const antes = new Map((previos ?? []).map((p) => [p.clave, p]));

  const avisos: string[] = [];

  for (const r of resultados) {
    const previo = antes.get(r.sitio.key);
    const caidoAhora = r.estado === "offline";
    const fallos = caidoAhora ? (previo?.fallos_seguidos ?? 0) + 1 : 0;

    // Un solo fallo todavía no cuenta como caída: se registra el intento pero
    // el estado guardado sigue siendo el anterior, para no ensuciar el panel
    // con un rojo que se va a ir solo en cinco minutos.
    const confirmado = caidoAhora && fallos < FALLOS_PARA_AVISAR
      ? (previo?.estado as EstadoSitio | undefined) ?? r.estado
      : r.estado;

    const cambio = previo?.estado !== confirmado;

    await supabase.from("monitor_estado").upsert({
      clave: r.sitio.key,
      nombre: r.sitio.name,
      estado: confirmado,
      // `desde` solo se pisa cuando el estado cambia: si no, se perdería cuánto
      // hace que está caído, que es la mitad de la información.
      desde: cambio ? ahora : (previo?.desde ?? ahora),
      ultimo_chequeo: ahora,
      latencia_ms: r.latenciaMs,
      detalle: r.detalle ?? null,
      fallos_seguidos: fallos,
    });

    if (!cambio) continue;

    // La primera corrida no avisa: sin estado previo, todo "cambia" y llegarían
    // ocho mensajes de sitios que están perfectos.
    if (!previo) continue;

    // ⚠️ SOLO SE AVISA POR CAÍDO Y RECUPERADO, NUNCA POR LENTO.
    // Un sitio que tarda 2,9 s en una corrida y 3,1 s en la siguiente rebota
    // entre `online` y `degraded` para siempre, y cada rebote eran dos mensajes.
    // La lentitud importa, pero se mira cuando uno quiere: está en el panel.
    const eraCaido = previo.estado === "offline";
    const esCaido = confirmado === "offline";
    if (!eraCaido && !esCaido) continue;

    avisos.push(
      esCaido
        ? `🔴 *${r.sitio.name}* está caído\n${r.detalle ?? ""}\n${r.sitio.url}`
        : `🟢 *${r.sitio.name}* volvió\nEstuvo caído ${hace(previo.desde)}.`,
    );
  }

  if (avisos.length > 0) await avisar(avisos.join("\n\n"));

  return NextResponse.json({
    revisados: resultados.length,
    avisos: avisos.length,
    estado: resultados.map((r) => ({ sitio: r.sitio.key, estado: r.estado, ms: r.latenciaMs })),
  });
}
