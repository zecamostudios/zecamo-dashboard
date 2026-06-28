/**
 * Mappers puros fila-de-DB → tipo de UI, y los strings de columnas.
 * Sin imports de servidor: se usan tanto en los getters (server) como en la
 * carga desde el navegador (useLiveRows), para tener UNA sola fuente de verdad.
 */
import type {
  Client, ClientStatus, ServiceLine, Project, OwnerId, ProjectStatus, Priority,
  Task, TaskStatus, Transaction, Prospect, StageId,
} from "@/lib/types";

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

const fmtDate = (v: unknown, opts: Intl.DateTimeFormatOptions) =>
  v ? new Date(String(v)).toLocaleDateString("es-AR", opts) : "—";

// ── Prospectos ────────────────────────────────────────────────
export const PROSPECT_COLS =
  "id, negocio, nombre_dueno, fuente, etapa, linea_servicio, valor_estimado, fecha_contacto, created_at, volver_a_llamar";

export function rowToProspect(row: Record<string, unknown>, idx: number): Prospect {
  return {
    id: idx + 1,
    dbId: String(row.id ?? ""),
    name: String(row.nombre_dueno ?? row.negocio ?? ""),
    company: String(row.negocio ?? ""),
    owner: (String(row.asignado_initials ?? "JS")) as OwnerId,
    line: (String(row.linea_servicio ?? "Webs")) as ServiceLine,
    stage: (String(row.etapa ?? "lead")) as StageId,
    value: Number(row.valor_estimado ?? 0),
    date: row.fecha_contacto
      ? fmtDate(row.fecha_contacto, { day: "numeric", month: "short", year: "numeric" })
      : String(row.created_at ?? "").slice(0, 10),
    last: String(row.last_activity ?? "—"),
    source: String(row.fuente ?? "Web"),
    recall: Boolean(String(row.volver_a_llamar ?? "").trim()),
  };
}

// ── Clientes ──────────────────────────────────────────────────
export const CLIENT_COLS =
  "id, nombre, contacto_nombre, mrr_usd, ui_status, linea_servicio, health_score, next_action, fecha_inicio";

export function rowToClient(row: Record<string, unknown>, idx: number): Client {
  return {
    id: idx + 1,
    dbId: String(row.id ?? ""),
    name: String(row.nombre ?? ""),
    contact: String(row.contacto_nombre ?? ""),
    line: (String(row.linea_servicio ?? "Webs")) as ServiceLine,
    mrr: Number(row.mrr_usd ?? 0),
    since: fmtDate(row.fecha_inicio, { month: "short", year: "numeric" }),
    status: (String(row.ui_status ?? "active")) as ClientStatus,
    projects: typeof row.projects_count === "number" ? row.projects_count : 1,
    health: Number(row.health_score ?? 80),
    next: String(row.next_action ?? "—"),
  };
}

// ── Proyectos ─────────────────────────────────────────────────
export const PROJECT_COLS =
  "id, nombre, cliente_id, linea_servicio, asignado_initials, equipo, progreso, prioridad, ui_estado, fecha_inicio, fecha_entrega, clientes(nombre)";

export function rowToProject(row: Record<string, unknown>, idx: number): Project {
  const cli = row.clientes as { nombre?: string } | null;
  return {
    id: idx + 1,
    dbId: String(row.id ?? ""),
    name: String(row.nombre ?? ""),
    client: String(cli?.nombre ?? row.cliente_nombre ?? ""),
    line: (String(row.linea_servicio ?? "Webs")) as ServiceLine,
    owner: (String(row.asignado_initials ?? "JS")) as OwnerId,
    start: fmtDate(row.fecha_inicio, { day: "numeric", month: "short", year: "numeric" }),
    due: fmtDate(row.fecha_entrega, { day: "numeric", month: "short", year: "numeric" }),
    progress: Number(row.progreso ?? 0),
    status: (String(row.ui_estado ?? "backlog")) as ProjectStatus,
    priority: (String(row.prioridad ?? "media")) as Priority,
    team: ((row.equipo as string[]) ?? []) as OwnerId[],
  };
}

// ── Tareas ────────────────────────────────────────────────────
export const TASK_COLS =
  "id, titulo, estado, prioridad, fecha_limite, asignado_initials, proyecto_nombre, etiquetas";

const ESTADO_TO_STATUS: Record<string, TaskStatus> = { todo: "hacer", doing: "curso", review: "review", done: "hecho" };

export function rowToTask(row: Record<string, unknown>, idx: number): Task {
  return {
    id: idx + 100,
    dbId: String(row.id ?? ""),
    text: String(row.titulo ?? ""),
    status: ESTADO_TO_STATUS[String(row.estado ?? "todo")] ?? "hacer",
    prio: (String(row.prioridad ?? "media")) as Priority,
    due: row.fecha_limite ? fmtDate(row.fecha_limite, { day: "numeric", month: "short" }) : "Sin fecha",
    owner: (String(row.asignado_initials ?? "JS")) as OwnerId,
    proj: String(row.proyecto_nombre ?? "General"),
    tags: (row.etiquetas as string[]) ?? [],
    done: String(row.estado) === "done",
  };
}

// ── Transacciones ─────────────────────────────────────────────
export const TX_COLS =
  "id, fecha, tipo, concepto, descripcion, monto_usd, monto_original, moneda, cotizacion, clase_egreso, linea_servicio, owner_initials";

export function rowToTransaction(row: Record<string, unknown>): Transaction {
  const fecha = String(row.fecha ?? "").slice(0, 10);
  const dd = fecha.split("-")[2] ?? "";
  const monthKey = fecha.slice(5, 7);
  const claseRaw = String(row.clase_egreso ?? "");
  return {
    dbId: String(row.id ?? ""),
    d: `${dd} ${MONTH_LABELS[monthKey] ?? monthKey}`,
    fecha,
    c: String(row.concepto ?? row.descripcion ?? ""),
    line: (String(row.linea_servicio ?? "Ops")) as ServiceLine | "Ops",
    a: Number(row.monto_usd ?? 0),
    type: row.tipo === "egreso" ? "out" : "in",
    owner: (String(row.owner_initials ?? "JS")) as OwnerId,
    moneda: row.moneda === "ARS" ? "ARS" : "USD",
    montoOriginal: row.monto_original != null ? Number(row.monto_original) : Number(row.monto_usd ?? 0),
    cotizacion: row.cotizacion != null ? Number(row.cotizacion) : undefined,
    claseEgreso: claseRaw === "fijo" || claseRaw === "variable" ? claseRaw : undefined,
  };
}
