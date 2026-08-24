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
}

/**
 * ⚠️ LOS PANELES SE MIDEN POR /sign-in, NO POR /dashboard.
 *
 * Clerk protege /dashboard devolviendo **404 a propósito** cuando no hay
 * sesión. Un monitor apuntando ahí diría "caído" las veinticuatro horas
 * estando todo perfecto — y un monitor que grita siempre deja de mirarse en
 * una semana.
 */
export const SITIOS: Sitio[] = [
  { name: "Maximo B",          key: "maximob",       url: "https://maximob.com.ar",              grupo: "web",   cliente: "Maximo B" },
  { name: "Cabañas Las Flores", key: "cabanas",      url: "https://cabañaslasflores.com",        grupo: "web",   cliente: "Cabañas Las Flores" },
  { name: "Finca Cajal",       key: "fincacajal",    url: "https://www.fincacajal.com.ar",       grupo: "web",   cliente: "Finca Cajal" },
  { name: "Zecamo Studios",    key: "zecamo",        url: "https://www.zecamostudios.com",       grupo: "web",   cliente: "Zecamo" },
  { name: "LEVEL",             key: "level",         url: "https://www.levelstudios.site",       grupo: "web",   cliente: "LEVEL" },
  { name: "Descubrir Tucumán", key: "descubrirtuc",  url: "https://descubrirtucuman.vercel.app", grupo: "web",   cliente: "Descubrir Tucumán" },

  { name: "Panel Maximo B",    key: "maximob-panel", url: "https://maximob.com.ar/sign-in",      grupo: "panel", cliente: "Maximo B" },
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
