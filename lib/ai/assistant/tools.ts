import type OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALLOWED_TABLE_NAMES, tablesPromptBlock } from "./tables";

/** Herramientas de ESCRITURA: pausan y requieren confirmación del usuario. */
export const WRITE_TOOLS = new Set(["crear", "actualizar", "eliminar"]);

export function isWriteTool(name: string): boolean {
  return WRITE_TOOLS.has(name);
}

export const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "consultar",
      description:
        "Lee registros de una tabla del dashboard. Úsalo para buscar info antes de responder o antes de modificar algo (para conocer el id y los valores actuales). Es de solo lectura: se ejecuta sin pedir confirmación.",
      parameters: {
        type: "object",
        properties: {
          tabla: { type: "string", description: "Nombre exacto de la tabla." },
          columnas: { type: "string", description: "Columnas separadas por coma. Default '*'." },
          filtros: {
            type: "array",
            description: "Condiciones AND a aplicar.",
            items: {
              type: "object",
              properties: {
                columna: { type: "string" },
                op: { type: "string", enum: ["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is"], description: "Operador. 'ilike' para texto sin distinguir mayúsculas (usá % como comodín)." },
                valor: { description: "Valor a comparar." },
              },
              required: ["columna", "op", "valor"],
            },
          },
          orden: {
            type: "object",
            properties: { columna: { type: "string" }, asc: { type: "boolean" } },
            required: ["columna"],
          },
          limite: { type: "number", description: "Máximo de filas (1-100). Default 20." },
        },
        required: ["tabla"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear",
      description: "Crea un registro nuevo en una tabla. REQUIERE confirmación del usuario antes de ejecutarse.",
      parameters: {
        type: "object",
        properties: {
          tabla: { type: "string", description: "Nombre exacto de la tabla." },
          datos: { type: "object", description: "Objeto con los campos del registro nuevo." },
        },
        required: ["tabla", "datos"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "actualizar",
      description: "Actualiza un registro existente por su id. REQUIERE confirmación del usuario antes de ejecutarse.",
      parameters: {
        type: "object",
        properties: {
          tabla: { type: "string", description: "Nombre exacto de la tabla." },
          id: { type: "string", description: "id del registro a actualizar." },
          datos: { type: "object", description: "Objeto solo con los campos a cambiar." },
        },
        required: ["tabla", "id", "datos"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "eliminar",
      description: "Elimina un registro por su id. REQUIERE confirmación del usuario. Usalo con cuidado: es irreversible.",
      parameters: {
        type: "object",
        properties: {
          tabla: { type: "string", description: "Nombre exacto de la tabla." },
          id: { type: "string", description: "id del registro a eliminar." },
        },
        required: ["tabla", "id"],
      },
    },
  },
];

type ToolInput = Record<string, unknown>;

function guardTable(tabla: unknown): string {
  const t = String(tabla ?? "");
  if (!ALLOWED_TABLE_NAMES.has(t)) {
    throw new Error(
      `Tabla "${t}" no permitida. Tablas disponibles:\n${tablesPromptBlock()}`,
    );
  }
  return t;
}

/** Ejecuta una herramienta. Devuelve un string legible para el modelo. */
export async function executeTool(name: string, input: ToolInput): Promise<string> {
  const supabase = createAdminClient();

  if (name === "consultar") {
    const tabla = guardTable(input.tabla);
    const columnas = String(input.columnas ?? "*") || "*";
    let q = supabase.from(tabla).select(columnas);
    const filtros = Array.isArray(input.filtros) ? input.filtros : [];
    for (const f of filtros as Array<{ columna: string; op: string; valor: unknown }>) {
      q = q.filter(f.columna, f.op as never, f.valor as never);
    }
    const orden = input.orden as { columna: string; asc?: boolean } | undefined;
    if (orden?.columna) q = q.order(orden.columna, { ascending: orden.asc ?? false });
    const limite = Math.min(Math.max(Number(input.limite ?? 20) || 20, 1), 100);
    q = q.limit(limite);
    const { data, error } = await q;
    if (error) return `Error al consultar: ${error.message}`;
    return JSON.stringify({ filas: data?.length ?? 0, datos: data }, null, 2);
  }

  if (name === "crear") {
    const tabla = guardTable(input.tabla);
    const { data, error } = await supabase.from(tabla).insert(input.datos as object).select().single();
    if (error) return `Error al crear: ${error.message}`;
    return `Creado en ${tabla}. Registro: ${JSON.stringify(data)}`;
  }

  if (name === "actualizar") {
    const tabla = guardTable(input.tabla);
    const id = String(input.id ?? "");
    if (!id) return "Error: falta el id.";
    const { data, error } = await supabase.from(tabla).update(input.datos as object).eq("id", id).select().single();
    if (error) return `Error al actualizar: ${error.message}`;
    return `Actualizado ${tabla} id=${id}. Registro: ${JSON.stringify(data)}`;
  }

  if (name === "eliminar") {
    const tabla = guardTable(input.tabla);
    const id = String(input.id ?? "");
    if (!id) return "Error: falta el id.";
    const { error } = await supabase.from(tabla).delete().eq("id", id);
    if (error) return `Error al eliminar: ${error.message}`;
    return `Eliminado ${tabla} id=${id}.`;
  }

  return `Herramienta desconocida: ${name}`;
}
