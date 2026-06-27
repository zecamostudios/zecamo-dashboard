/**
 * Whitelist de tablas que el asistente puede leer y modificar.
 *
 * Solo tablas de negocio. Quedan AFUERA a propósito las que guardan tokens o
 * datos sensibles (instagram_connections, platform_accounts), las de auth
 * (profiles) y los logs internos (activity_log) — el agente no tiene por qué
 * tocarlas.
 */

export interface TableInfo {
  name: string;
  desc: string;
}

export const ALLOWED_TABLES: TableInfo[] = [
  { name: "prospectos",            desc: "CRM: prospectos del pipeline de ventas. Campos clave: negocio, nombre_dueno, telefono, email, fuente, etapa (lead/discovery/call1/propuesta/call2/venta/noresp/noventa/seguim), estado, linea_servicio, valor_estimado, fecha_contacto, volver_a_llamar, ultimo_resultado, notas, notas_llamadas, asignado_a." },
  { name: "interacciones_prospecto", desc: "Interacciones registradas de un prospecto (timeline). Campos: prospecto_id, tipo (llamada/email/mensaje/reunion/nota), contenido, creado_por, fecha." },
  { name: "clientes",              desc: "Clientes activos de la agencia. Campos típicos: nombre, contacto, email, telefono, linea_servicio, estado (activo/pausado/churn), mrr, fecha_alta." },
  { name: "proyectos",            desc: "Proyectos en ejecución para clientes. Campos: nombre, cliente_id, estado, fecha_inicio, fecha_entrega, descripcion, progreso." },
  { name: "tareas",               desc: "Tareas internas / del equipo. Campos: titulo, descripcion, estado (pendiente/en_progreso/hecho), prioridad, asignado_a, proyecto_id, vence." },
  { name: "transacciones",        desc: "Finanzas: ingresos y egresos. Campos: fecha, tipo (ingreso/egreso), concepto, monto_usd, monto_original, moneda, cotizacion, clase_egreso (fijo/variable), linea_servicio, owner_initials, cliente_id." },
  { name: "leads",                desc: "Leads de prospección outbound (SDR). Campos: nombre, telefono, whatsapp, email, instagram, tiene_web, rating, num_reviews, score, gancho, opener, estado, canal_sugerido, research." },
  { name: "reuniones",            desc: "Reuniones agendadas. Campos típicos: titulo, fecha, prospecto_id/cliente_id, notas." },
  { name: "pricing_calculos",     desc: "Cálculos guardados de la calculadora de pricing." },
  { name: "content_posts",        desc: "Content OS: posts de redes. Campos: titulo, contenido, plataforma, tipo, estado (borrador/revision/aprobado/programado/publicado/rechazado), hook, cta, hashtags." },
  { name: "content_planner",      desc: "Calendario de contenido. Campos: post_id, fecha, hora, plataforma, estado." },
  { name: "brand_memory",         desc: "Memoria de marca para generación de contenido (tono, do/don't, datos de marca)." },
  { name: "roadmap_months",       desc: "Roadmap por meses de la agencia." },
];

export const ALLOWED_TABLE_NAMES = new Set(ALLOWED_TABLES.map((t) => t.name));

export function tablesPromptBlock(): string {
  return ALLOWED_TABLES.map((t) => `- ${t.name}: ${t.desc}`).join("\n");
}
