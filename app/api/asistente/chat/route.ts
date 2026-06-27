import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { runAgent } from "@/lib/ai/assistant/agent";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { messages, confirmations } = (await req.json()) as {
      messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
      confirmations?: Record<string, boolean>;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages requerido" }, { status: 400 });
    }

    const result = await runAgent(messages, confirmations);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[asistente/chat]", err);
    const msg = err instanceof Error ? err.message : "Error en el asistente";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
