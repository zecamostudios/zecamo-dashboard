import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

const PRIMARY_MODEL = "gpt-5.4";
const FALLBACK_MODEL = "gpt-5.4-mini";

const SYSTEM_PROMPT = `Sos un experto en marketing de contenidos para LinkedIn, X/Twitter e Instagram para agencias y consultoras de automatización e IA.
Tu objetivo: generar contenido que interrumpa el scroll, construya autoridad y genere acción.
Respondé siempre en formato JSON válido con los campos que se indican.
Idioma: español rioplatense (Argentina/Uruguay). Directo, sin formalismos innecesarios.`;

const TYPE_INSTRUCTIONS: Record<AIGenerationType, string> = {
  hook: `Generá 3 hooks alternativos para el tema dado. Cada hook debe: interrumpir el scroll en las primeras palabras, crear curiosidad o tensión, ser 1-2 líneas máximo.
Respondé con JSON: { "hooks": ["hook1", "hook2", "hook3"], "best": 0, "explanation": "por qué este es el mejor" }`,

  post: `Generá un post completo para la plataforma indicada.
Respondé con JSON: {
  "hook": "primera línea del post (el hook)",
  "content": "cuerpo completo del post, incluyendo el hook",
  "cta": "call to action final",
  "hashtags": ["hashtag1", "hashtag2"],
  "char_count": número
}`,

  thread: `Generá un thread para X/Twitter.
Respondé con JSON: {
  "tweets": [
    { "n": 1, "text": "tweet hook" },
    { "n": 2, "text": "tweet desarrollo..." }
  ],
  "hook": "el primer tweet",
  "cta": "último tweet con CTA"
}`,

  carousel: `Generá la estructura de un carrusel para Instagram o LinkedIn.
Respondé con JSON: {
  "slides": [
    { "n": 1, "titulo": "...", "cuerpo": "...", "nota_visual": "..." }
  ],
  "hook": "promesa del slide 1",
  "cta": "slide final"
}`,

  rewrite: `Reescribí y mejorá el texto dado manteniendo el mensaje central pero con más impacto.
Respondé con JSON: {
  "original_issues": ["problema1", "problema2"],
  "rewritten": "texto reescrito completo",
  "improvements": ["mejora1", "mejora2"],
  "hook": "nueva primera línea si aplica"
}`,
};

const CHAR_LIMITS: Record<ContentPlatform, number> = {
  linkedin: 3000,
  twitter: 280,
  instagram: 2200,
  facebook: 5000,
};

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function callOpenAI(
  model: string,
  system: string,
  userMessage: string,
): Promise<OpenAI.Chat.ChatCompletion> {
  return getClient().chat.completions.create({
    model,
    max_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMessage },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const { tipo, plataforma, prompt, context } = (await req.json()) as {
      tipo: AIGenerationType;
      plataforma: ContentPlatform;
      prompt: string;
      context: { tono?: string; contexto?: string };
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt requerido" }, { status: 400 });
    }

    const charLimit = CHAR_LIMITS[plataforma];
    const userMessage = [
      `Plataforma: ${plataforma} (límite: ${charLimit} caracteres)`,
      `Tono: ${context.tono ?? "profesional-directo"}`,
      context.contexto ? `Contexto del negocio: ${context.contexto}` : null,
      ``,
      `Tema/Prompt: ${prompt}`,
    ]
      .filter(Boolean)
      .join("\n");

    const fullSystem = SYSTEM_PROMPT + "\n\n" + TYPE_INSTRUCTIONS[tipo];

    let completion: OpenAI.Chat.ChatCompletion;
    let modelUsed = PRIMARY_MODEL;
    try {
      completion = await callOpenAI(PRIMARY_MODEL, fullSystem, userMessage);
    } catch {
      completion = await callOpenAI(FALLBACK_MODEL, fullSystem, userMessage);
      modelUsed = FALLBACK_MODEL;
    }

    const rawText = completion.choices[0]?.message?.content ?? "";
    const usage = completion.usage;

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? rawText);
    } catch {
      parsed = { content: rawText };
    }

    const tokens = (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0);

    let result: Record<string, unknown>;

    if (tipo === "hook") {
      const hooks = (parsed.hooks as string[]) ?? [rawText];
      const best = Number(parsed.best ?? 0);
      result = {
        content: hooks[best] ?? hooks[0],
        hook: hooks[best] ?? hooks[0],
        alternatives: hooks,
        cta: null,
        tokens,
        model: modelUsed,
      };
    } else if (tipo === "thread") {
      const tweets = (parsed.tweets as { n: number; text: string }[]) ?? [];
      result = {
        content: tweets.map((t) => `${t.n}/ ${t.text}`).join("\n\n"),
        hook: parsed.hook as string,
        cta: parsed.cta as string,
        tokens,
        model: modelUsed,
      };
    } else if (tipo === "carousel") {
      const slides = (parsed.slides as { n: number; titulo: string; cuerpo: string }[]) ?? [];
      result = {
        content: slides.map((s) => `Slide ${s.n}: ${s.titulo}\n${s.cuerpo}`).join("\n\n---\n\n"),
        hook: parsed.hook as string,
        cta: parsed.cta as string,
        tokens,
        model: modelUsed,
      };
    } else {
      result = {
        content: (parsed.content ?? parsed.rewritten ?? rawText) as string,
        hook: parsed.hook as string,
        cta: parsed.cta as string,
        tokens,
        model: modelUsed,
      };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[content/generate]", err);
    return NextResponse.json({ error: "Error al generar" }, { status: 500 });
  }
}
