import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai/generation-service";
import { buildRequest } from "@/lib/ai/prompt-service";
import { getBrandMemoryForPrompt } from "@/lib/ai/memory-service";
import { requireAuth } from "@/lib/supabase/auth-guard";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { tipo, plataforma, prompt, context } = (await req.json()) as {
      tipo: AIGenerationType;
      plataforma: ContentPlatform;
      prompt: string;
      context?: { tono?: string; contexto?: string };
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt requerido" }, { status: 400 });
    }

    const brandMemory = await getBrandMemoryForPrompt();

    const request = buildRequest({
      tipo,
      plataforma,
      prompt,
      tono:     context?.tono,
      contexto: context?.contexto,
      brandMemory,
    });

    const result = await generateContent(request);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[content/generate]", err);
    return NextResponse.json({ error: "Error al generar" }, { status: 500 });
  }
}
