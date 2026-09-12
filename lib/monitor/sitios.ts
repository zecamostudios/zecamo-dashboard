/**
 * Los sitios que monitoreamos, y cómo se decide si están bien.
 *
 * Vive acá y no adentro de una ruta para que lo compartan `/api/health` (que
 * responde cuando alguien mira la pantalla) y `/api/cron/monitor` (que corre
 * solo y avisa). Dos listas separadas se desincronizan: el día que se suma un
 * cliente, se agrega en una y no en la otra, y el monitor queda mintiendo.
 */

export type EstadoSitio = "online" | "degraded" | "offline";

/** Una web pública o un panel privado: se miran con preguntas distintas. */
export type GrupoSitio = "web" | "panel";

export interface Sitio {
  name: string;
  key: string;
  url: string;
  grupo: GrupoSitio;
  /** A quién le pertenece. Ordena la pantalla por cliente y no por azar. */
  cliente: string;
  /**
   * Fecha ISO hasta la cual NO se chequea este sitio.
   *
   * Existe para poder hacer un experimento honesto: sacar un sitio del monitor
   * y ver si sus fallas desaparecen. Es una pausa con vencimiento y no un
   * borrado, justamente para que nadie se olvide de volver a prenderlo.
   */
  pausadoHasta?: string;
}

/** ¿Este sitio está en pausa AHORA? Vencida la fecha, vuelve solo. */
export function estaPausado(s: Sitio, ahora = new Date()): boolean {
  return !!s.pausadoHasta && ahora < new Date(s.pausadoHasta);
}

/**
 * ⚠️ LOS PANELES SE MIDEN POR /sign-in, NO POR /dashboard.
 *
 * Clerk protege /dashboard devolviendo **404 a propósito** cuando no hay
 * sesión. Un monitor apuntando ahí diría "caído" las veinticuatro horas
 * estando todo perfecto — y un monitor que grita siempre deja de mirarse en
 * una semana.
 */

/**
 * MAXIMO B — DADO DE BAJA DEL MONITOR (2026-09-12).
 *
 * El proyecto se cayó: ya no existe. No está en pausa y no vuelve solo, por eso
 * salió de la lista en vez de quedar con un `pausadoHasta` que vence y lo
 * reactiva sin que nadie lo pida. (Eso ya pasó: la pausa del 2026-08-28 venció
 * el 29 y el monitor volvió a avisar dos semanas sin que nadie leyera el
 * resultado del experimento.)
 *
 * Se va con la causa raíz cerrada, y conviene no perderla porque el mecanismo
 * sigue vivo para cualquier sitio nuestro que corra sobre Cloudflare Workers:
 *
 *   Desde el 2026-08-24 este dashboard vive en Workers. Un Worker pidiéndole
 *   una página a OTRO Worker de la misma cuenta enruta internamente y los dos
 *   COMPARTEN el presupuesto de recursos. El render dinámico del otro lado
 *   empuja la suma por encima del techo y muere con `exceededResources` → 503.
 *
 *   Medido el 2026-08-27: 98% de fallas en los minutos en que corría el
 *   monitor, 0% en todos los demás. Los visitantes reales nunca vieron nada.
 *
 * Y el razonamiento del 2026-08-28 que descartaba el plan —"si el plan fuera
 * chico, los de 38ms tampoco pasarían"— ESTABA MAL: Cloudflare mide CPU por
 * invocación, no wall time, así que esperar a Supabase o a Clerk no suma. Por
 * eso conviven invocaciones de 38ms que pasan con otras clavadas en 10,0ms,
 * que es exactamente el techo del plan Free.
 *
 * O sea: el día que otro sitio nuestro se mude a Workers, esto vuelve.
 */
export const SITIOS: Sitio[] = [
  { name: "Cabañas Las Flores", key: "cabanas",      url: "https://cabañaslasflores.com",        grupo: "web",   cliente: "Cabañas Las Flores" },
  { name: "Finca Cajal",       key: "fincacajal",    url: "https://www.fincacajal.com.ar",       grupo: "web",   cliente: "Finca Cajal" },
  { name: "Zecamo Studios",    key: "zecamo",        url: "https://www.zecamostudios.com",       grupo: "web",   cliente: "Zecamo" },
  { name: "LEVEL",             key: "level",         url: "https://www.levelstudios.site",       grupo: "web",   cliente: "LEVEL" },
  { name: "Descubrir Tucumán", key: "descubrirtuc",  url: "https://descubrirtucuman.vercel.app", grupo: "web",   cliente: "Descubrir Tucumán" },

  { name: "Panel Cabañas",     key: "cabanas-panel", url: "https://panel.cabañaslasflores.com",  grupo: "panel", cliente: "Cabañas Las Flores" },
];

/**
 * Arriba de esto se marca como lento, aunque el sitio conteste.
 *
 * Subido de 3 a 5 segundos el 2026-08-24. Con 3 s, los sitios que viven en
 * Workers cruzaban el umbral cada vez que arrancaban en frío —lo normal en un
 * sitio con poco tráfico— y el panel los mostraba en amarillo sin que pasara
 * nada. 5 s sigue siendo malo de verdad: a esa altura la mitad de la gente ya
 * cerró la pestaña.
 */
const LENTO_MS = 5000;
const TIMEOUT_MS = 15000;

export interface Chequeo {
  estado: EstadoSitio;
  latenciaMs: number;
  detalle?: string;
}

/**
 * Chequea un sitio.
 *
 * "Degradado" es por LENTITUD, no por código de estado. Un semáforo que solo
 * distingue vivo de muerto no avisa del caso que más plata cuesta: el sitio que
 * anda pero tarda seis segundos, donde la mitad de la gente ya cerró la pestaña.
 */
export async function chequearSitio(url: string): Promise<Chequeo> {
  const primero = await intentar(url);
  if (primero.estado !== "offline") return primero;

  // ⚠️ UN SOLO FALLO NO ALCANZA — y acá el motivo no es genérico.
  //
  // Medido el 2026-08-27 con los datos de Cloudflare, minuto a minuto:
  //
  //   minutos en que corre este monitor →  59 fallos,  1 OK  (98% falla)
  //   todos los demás minutos           →   0 fallos,  5 OK  ( 0% falla)
  //
  // Exactamente 2 fallos por tick: las 2 URLs de Maximo B. Los visitantes
  // reales NO se veían afectados nunca. O sea que las caídas que reportaba el
  // monitor las estaba causando el monitor.
  //
  // El mecanismo: cuando un Worker le pide una página a OTRO Worker de la misma
  // cuenta de Cloudflare, el pedido se enruta internamente y los dos comparten
  // el presupuesto de recursos. Si el sitio del otro lado hace un render caro,
  // la suma se pasa y muere con `exceededResources`. Cabañas, que no es un
  // Worker, nunca falló.
  //
  // Un segundo intento con pausa da un isolate distinto y suele pasar. Si los
  // dos fallan, ahí sí hay algo real.
  await new Promise((r) => setTimeout(r, 1500));
  const segundo = await intentar(url);
  return segundo.estado === "offline"
    ? { ...segundo, detalle: `${segundo.detalle ?? "sin respuesta"} (2 intentos)` }
    : segundo;
}

async function intentar(url: string): Promise<Chequeo> {
  const arranque = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Sin User-Agent propio, algunos hostings responden distinto a un cliente
      // que no parece un navegador — y mediríamos algo que ningún visitante ve.
      headers: { "User-Agent": "ZecamoMonitor/1.0 (+https://zecamostudios.com)" },
    });
    const latenciaMs = Date.now() - arranque;

    if (res.status >= 400) {
      return { estado: "offline", latenciaMs, detalle: `HTTP ${res.status}` };
    }
    if (latenciaMs > LENTO_MS) {
      return { estado: "degraded", latenciaMs, detalle: `Lento: ${(latenciaMs / 1000).toFixed(1)}s` };
    }
    return { estado: "online", latenciaMs };
  } catch (err) {
    const latenciaMs = Date.now() - arranque;
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return {
      estado: "offline",
      latenciaMs,
      // Un timeout no es lo mismo que un DNS que no resuelve: el primero suele
      // ser el servidor ahogado, el segundo suele ser el dominio vencido.
      detalle: msg.includes("timeout") || msg.includes("aborted") ? "Sin respuesta (timeout)" : msg,
    };
  }
}
