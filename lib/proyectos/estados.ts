import type { ProjectStatus } from "@/lib/types";

/**
 * Los estados de un proyecto, en el orden en que pasan. Son los valores de la
 * columna `estado` de la base: una sola lista, no dos.
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  propuesta: "Propuesta",
  en_desarrollo: "En curso",
  entregado: "Entregado",
  en_soporte: "Soporte",
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "propuesta",
  "en_desarrollo",
  "entregado",
  "en_soporte",
];

/**
 * `ui_estado` es la columna vieja que leian el kanban y algunos widgets. Se
 * sigue escribiendo en sincronia para no dejar datos inconsistentes atras.
 */
export const STATUS_A_UI_ESTADO: Record<ProjectStatus, string> = {
  propuesta: "backlog",
  en_desarrollo: "curso",
  entregado: "entregado",
  en_soporte: "review",
};
