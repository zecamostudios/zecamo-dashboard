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
 * ⏸ MAXIMO B EN PAUSA HASTA EL 2026-08-29 12:00 UTC — es un experimento.
 *
 * Lo medido el 2026-08-28, con los números limpios de Cloudflare:
 *
 *   pedidos que FALLAN  → CPU p25/p50/p75 clavada en 10,0ms (un techo duro)
 *   pedidos que ANDAN   → CPU p50 38ms, p99 502ms, sin problema
 *
 * Dos topes distintos sobre el MISMO Worker el MISMO día. No es que el plan sea
 * chico: si lo fuera, los de 38ms tampoco pasarían. Descartados también el
 * arranque del Worker (29ms contra un límite de 400) y los visitantes reales
 * (16 de 16 pedidos desde Buenos Aires dieron 200).
 *
 * Queda en pie que el monitor se las cause a sí mismo: Worker llamando a otro
 * Worker de la misma cuenta comparten presupuesto. Y ojo, el reintento de
 * `chequearSitio` DUPLICA los pedidos justo cuando el sitio ya está sufriendo.
 *
 * La prueba: 24h sin tocarlo. Si las fallas de `maximo-b` se van a cero, era
 * esto y no hay que pagar nada. Si siguen, es la cuenta y ahí sí se paga.
 *
 * Se puede hacer AHORA sin costo porque el catálogo todavía está vacío: no hay
 * clientes entrando ni ventas que perder.
 */
export const SITIOS: Sitio[] = [
  { name: "Maximo B",          key: "maximob",       url: "https://maximob.com.ar",              grupo: "web",   cliente: "Maximo B", pausadoHasta: "2026-08-29T12:00:00Z" },
  { name: "Cabañas Las Flores", key: "cabanas",      url: "https://cabañaslasflores.com",        grupo: "web",   cliente: "Cabañas Las Flores" },
  { name: "Finca Cajal",       key: "fincacajal",    url: "https://www.fincacajal.com.ar",       grupo: "web",   cliente: "Finca Cajal" },
  { name: "Zecamo Studios",    key: "zecamo",        url: "https://www.zecamostudios.com",       grupo: "web",   cliente: "Zecamo" },
  { name: "LEVEL",             key: "level",         url: "https://www.levelstudios.site",       grupo: "web",   cliente: "LEVEL" },
  { name: "Descubrir Tucumán", key: "descubrirtuc",  url: "https://descubrirtucuman.vercel.app", grupo: "web",   cliente: "Descubrir Tucumán" },

  { name: "Panel Maximo B",    key: "maximob-panel", url: "https://maximob.com.ar/sign-in",      grupo: "panel", cliente: "Maximo B", pausadoHasta: "2026-08-29T12:00:00Z" },
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
