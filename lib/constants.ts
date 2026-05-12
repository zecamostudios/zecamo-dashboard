export const ESTADOS_PROSPECTO = ["initiated", "engaged", "calendly", "booked", "no_interesado", "agendado"] as const;
export type EstadoProspecto = (typeof ESTADOS_PROSPECTO)[number];

export const ESTADOS_PROSPECTO_LABELS: Record<EstadoProspecto, string> = {
  initiated: "Iniciado",
  engaged: "Contactado",
  calendly: "Calendly enviado",
  booked: "Reunión agendada",
  no_interesado: "No interesado",
  agendado: "Agendado",
};

export const ESTADOS_PROSPECTO_COLORS: Record<EstadoProspecto, string> = {
  initiated: "bg-slate-100 text-slate-700",
  engaged: "bg-blue-100 text-blue-700",
  calendly: "bg-violet-100 text-violet-700",
  booked: "bg-amber-100 text-amber-700",
  no_interesado: "bg-red-100 text-red-700",
  agendado: "bg-green-100 text-green-700",
};

export const FUENTES_PROSPECTO = ["linkedin", "referido", "cold_email", "ads", "otro"] as const;
export type FuenteProspecto = (typeof FUENTES_PROSPECTO)[number];

export const FUENTES_LABELS: Record<FuenteProspecto, string> = {
  linkedin: "LinkedIn",
  referido: "Referido",
  cold_email: "Cold Email",
  ads: "Ads",
  otro: "Otro",
};

export const ESTADOS_CLIENTE = ["activo", "pausado", "churn"] as const;
export type EstadoCliente = (typeof ESTADOS_CLIENTE)[number];

export const ESTADOS_CLIENTE_LABELS: Record<EstadoCliente, string> = {
  activo: "Activo",
  pausado: "Pausado",
  churn: "Churn",
};

export const ESTADOS_CLIENTE_COLORS: Record<EstadoCliente, string> = {
  activo: "bg-green-100 text-green-700",
  pausado: "bg-amber-100 text-amber-700",
  churn: "bg-red-100 text-red-700",
};

export const ESTADOS_PROYECTO = ["propuesta", "en_desarrollo", "entregado", "en_soporte", "cancelado"] as const;
export type EstadoProyecto = (typeof ESTADOS_PROYECTO)[number];

export const ESTADOS_PROYECTO_LABELS: Record<EstadoProyecto, string> = {
  propuesta: "Propuesta",
  en_desarrollo: "En desarrollo",
  entregado: "Entregado",
  en_soporte: "En soporte",
  cancelado: "Cancelado",
};

export const ESTADOS_PROYECTO_COLORS: Record<EstadoProyecto, string> = {
  propuesta: "bg-slate-100 text-slate-700",
  en_desarrollo: "bg-blue-100 text-blue-700",
  entregado: "bg-green-100 text-green-700",
  en_soporte: "bg-violet-100 text-violet-700",
  cancelado: "bg-red-100 text-red-700",
};

export const ESTADOS_TAREA = ["todo", "doing", "review", "done"] as const;
export type EstadoTarea = (typeof ESTADOS_TAREA)[number];

export const ESTADOS_TAREA_LABELS: Record<EstadoTarea, string> = {
  todo: "Por hacer",
  doing: "En progreso",
  review: "En revisión",
  done: "Listo",
};

export const PRIORIDADES_TAREA = ["baja", "media", "alta", "urgente"] as const;
export type PrioridadTarea = (typeof PRIORIDADES_TAREA)[number];

export const PRIORIDADES_LABELS: Record<PrioridadTarea, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORIDADES_COLORS: Record<PrioridadTarea, string> = {
  baja: "bg-slate-100 text-slate-600",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-amber-100 text-amber-700",
  urgente: "bg-red-100 text-red-700",
};

export const TIPOS_TRANSACCION = ["ingreso", "egreso"] as const;
export type TipoTransaccion = (typeof TIPOS_TRANSACCION)[number];

export const CATEGORIAS_TRANSACCION = ["venta", "herramienta", "sueldo", "impuesto", "marketing", "otro"] as const;
export type CategoriaTransaccion = (typeof CATEGORIAS_TRANSACCION)[number];

export const CANALES_OUTBOUND = ["email", "linkedin", "whatsapp", "llamada"] as const;
export type CanalOutbound = (typeof CANALES_OUTBOUND)[number];

export const TIPOS_INTERACCION = ["llamada", "mensaje", "email", "reunion", "nota"] as const;
export type TipoInteraccion = (typeof TIPOS_INTERACCION)[number];

export const AREAS_PRICING = ["Adquisición", "Entrega", "Soporte"] as const;
export type AreaPricing = (typeof AREAS_PRICING)[number];
