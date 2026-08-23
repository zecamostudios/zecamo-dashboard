import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Adaptador de Next para Cloudflare Workers.
 *
 * POR QUÉ SE MUDA EL DASHBOARD (2026-08-23)
 * En Vercel plan Hobby los crons son diarios, y el límite no avisa: una
 * expresión más frecuente hace que Vercel RECHACE EL DEPLOY ENTERO. Ya nos costó
 * dos commits sin publicar. En Workers los Cron Triggers cada 5 minutos son
 * gratis, así que el Worker externo que hoy despierta al monitor deja de hacer
 * falta — una pieza móvil menos.
 *
 * Además Maximo B y Cabañas ya viven en Cloudflare: un solo lugar donde mirar
 * cuando algo pasa.
 */
export default defineCloudflareConfig();
