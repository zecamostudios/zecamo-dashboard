/**
 * Los sitios que monitoreamos, y cómo se decide si están bien.
 *
 * Vive acá y no adentro de una ruta para que lo compartan `/api/health` (que
 * responde cuando alguien mira la pantalla) y `/api/cron/monitor` (que corre
 * solo y avisa). Dos listas separadas se desincronizan: el día que se suma un
 * cliente, se agrega en una y no en la otra, y el monitor queda mintiendo.
 */

export type EstadoSitio = "online" | "degraded" | "offline";

export interface Sitio {
  name: string;
  key: string;
  url: string;
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
  { name: "Maximo B",          key: "maximob",       url: "https://maximob.com.ar" },
  { name: "Maximo B · panel",  key: "maximob-panel", url: "https://maximob.com.ar/sign-in" },
  { name: "Cabañas",           key: "cabanas",       url: "https://cabañaslasflores.com" },
  { name: "Cabañas · panel",   key: "cabanas-panel", url: "https://panel.cabañaslasflores.com" },
  { name: "Finca Cajal",       key: "fincacajal",    url: "https://www.fincacajal.com.ar" },
  { name: "Zecamo",            key: "zecamo",        url: "https://www.zecamostudios.com" },
  { name: "LEVEL",             key: "level",         url: "https://www.levelstudios.site" },
  { name: "Descubrir Tucumán", key: "descubrirtuc",  url: "https://descubrirtucuman.vercel.app" },
];

/** Arriba de esto el visitante ya se fue, aunque el sitio conteste. */
const LENTO_MS = 3000;
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
