import OpenAI from "openai";
import { TOOLS, executeTool, isWriteTool } from "./tools";
import { tablesPromptBlock } from "./tables";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function client() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Falta OPENAI_API_KEY en el entorno.");
  return new OpenAI({ apiKey });
}

const SYSTEM = `Sos el asistente operativo del dashboard interno de Zecamo Studios (una agencia de IA/automatización/webs). Hablás en español rioplatense, directo y sin vueltas.

Tu trabajo es que Joaco NO tenga que cargar datos a mano: él te cuenta qué pasó (una llamada, un cliente nuevo, un gasto, una tarea) y vos lo registrás o lo modificás en la base usando las herramientas.

Tablas disponibles (con sus campos principales):
${tablesPromptBlock()}

Reglas:
- Antes de crear o modificar algo, usá "consultar" si necesitás conocer el id o los valores actuales (ej: para mover un prospecto de etapa primero buscalo por nombre).
- Si no sabés en qué tabla o campo va algo, o si falta un dato importante (ej: a qué cliente corresponde un gasto), PREGUNTÁ en vez de inventar. Es mejor una repregunta que un dato mal cargado.
- Las herramientas de escritura (crear, actualizar, eliminar) las confirma Joaco antes de ejecutarse. No hace falta que pidas permiso por texto: invocá la herramienta directamente y el dashboard le mostrará la confirmación. Sí explicá brevemente qué vas a hacer.
- Las fechas en formato ISO (YYYY-MM-DD). Para montos de finanzas, si Joaco da pesos aclarale que cargás el monto y la moneda.
- Sé conciso. Cuando termines una acción, confirmá en una línea qué quedó hecho.`;

type Msg = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export interface PendingWrite {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export type AgentResult =
  | { type: "message"; text: string; messages: Msg[] }
  | { type: "confirm"; text: string; writes: PendingWrite[]; messages: Msg[] };

function parseArgs(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Corre el agente. `messages` es el historial completo en formato OpenAI.
 * Si `confirmations` viene, el último mensaje del asistente tiene tool_calls
 * pendientes de escritura: ejecutamos los aprobados y seguimos.
 */
export async function runAgent(
  messages: Msg[],
  confirmations?: Record<string, boolean>,
): Promise<AgentResult> {
  const openai = client();
  const msgs: Msg[] = [...messages];

  // Continuación tras una confirmación: resolvemos los tool_calls del último turno.
  if (confirmations) {
    const last = msgs[msgs.length - 1];
    if (last?.role === "assistant" && last.tool_calls?.length) {
      for (const call of last.tool_calls) {
        if (call.type !== "function") continue;
        const name = call.function.name;
        const input = parseArgs(call.function.arguments);
        let content: string;
        if (isWriteTool(name)) {
          content = confirmations[call.id]
            ? await executeTool(name, input)
            : "El usuario canceló esta acción. No se modificó nada.";
        } else {
          content = await executeTool(name, input);
        }
        msgs.push({ role: "tool", tool_call_id: call.id, content });
      }
    }
  }

  // Loop principal de razonamiento + herramientas.
  for (let i = 0; i < 12; i++) {
    const resp = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM }, ...msgs],
      tools: TOOLS,
      max_tokens: 1500,
    });

    const choice = resp.choices[0].message;
    const toolCalls = (choice.tool_calls ?? []).filter(
      (c): c is OpenAI.Chat.Completions.ChatCompletionMessageToolCall & { type: "function" } =>
        c.type === "function",
    );

    if (toolCalls.length) {
      msgs.push(choice);

      const writes = toolCalls.filter((c) => isWriteTool(c.function.name));
      if (writes.length) {
        // Pausamos: el cliente muestra las tarjetas de confirmación.
        return {
          type: "confirm",
          text: choice.content ?? "",
          writes: writes.map((c) => ({ id: c.id, name: c.function.name, input: parseArgs(c.function.arguments) })),
          messages: msgs,
        };
      }

      // Solo lecturas: ejecutamos y seguimos.
      for (const c of toolCalls) {
        const out = await executeTool(c.function.name, parseArgs(c.function.arguments));
        msgs.push({ role: "tool", tool_call_id: c.id, content: out });
      }
      continue;
    }

    msgs.push(choice);
    return { type: "message", text: choice.content ?? "", messages: msgs };
  }

  return { type: "message", text: "Corté el procesamiento tras demasiados pasos. Probá de nuevo o reformulá.", messages: msgs };
}
