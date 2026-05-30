/**
 * OpenAIProvider — production provider.
 * Becomes active automatically when OPENAI_API_KEY is set.
 * No changes needed when adding the key later.
 */
import OpenAI from "openai";
import type { AIProvider, GenerationRequest, GenerationResponse, ScoringResponse } from "./base";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

const PRIMARY_MODEL  = "gpt-4o";
const FALLBACK_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `Sos un experto en marketing de contenidos para LinkedIn, X/Twitter e Instagram para agencias y consultoras de automatización e IA.
Tu objetivo: generar contenido que interrumpa el scroll, construya autoridad y genere acción.
Respondé siempre en formato JSON válido con los campos que se indican.
Idioma: español rioplatense (Argentina/Uruguay). Directo, sin formalismos innecesarios.`;

const TYPE_INSTRUCTIONS: Record<AIGenerationType, string> = {
  hook: `Generá 3 hooks alternativos. Cada uno: interrumpe el scroll, crea curiosidad o tensión, 1-2 líneas máximo.
JSON: { "hooks": ["hook1","hook2","hook3"], "best": 0, "explanation": "por qué" }`,

  post: `Generá un post completo para la plataforma indicada.
JSON: { "hook": "primera línea", "content": "cuerpo completo incluyendo el hook", "cta": "call to action final", "hashtags": ["#tag1"], "char_count": número }`,

  thread: `Generá un thread para X/Twitter.
JSON: { "tweets": [{"n":1,"text":"..."}], "hook": "primer tweet", "cta": "último tweet CTA" }`,

  carousel: `Generá la estructura de un carrusel.
JSON: { "slides": [{"n":1,"titulo":"...","cuerpo":"...","nota_visual":"..."}], "hook": "promesa slide 1", "cta": "slide final" }`,

  rewrite: `Reescribí y mejorá el texto dado.
JSON: { "original_issues": ["problema1"], "rewritten": "texto mejorado", "improvements": ["mejora1"], "hook": "nueva primera línea" }`,
};

const SCORE_SYSTEM = `Sos un experto evaluador de contenido para redes sociales. Evaluá el contenido dado en una escala del 1 al 10.
Respondé con JSON: { "score": número, "feedback": "análisis en 2 oraciones", "breakdown": { "hook": número, "clarity": número, "cta": número, "engagement": número } }`;

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly isMock = false;

  private client(): OpenAI {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  private async call(model: string, system: string, user: string): Promise<OpenAI.Chat.ChatCompletion> {
    return this.client().chat.completions.create({
      model,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user",   content: user },
      ],
    });
  }

  async generate(req: GenerationRequest): Promise<GenerationResponse> {
    const { tipo, plataforma, prompt, context } = req;
    const charLimit = context.charLimit ?? 3000;
    const userMsg = [
      `Plataforma: ${plataforma} (límite: ${charLimit} chars)`,
      `Tono: ${context.tono ?? "profesional-directo"}`,
      context.contexto ? `Contexto: ${context.contexto}` : null,
      context.brandMemory ? `Memoria de marca:\n${context.brandMemory}` : null,
      ``,
      `Tema/Prompt: ${prompt}`,
    ].filter(Boolean).join("\n");

    const system = SYSTEM_PROMPT + "\n\n" + TYPE_INSTRUCTIONS[tipo];
    let completion: OpenAI.Chat.ChatCompletion;
    let model = PRIMARY_MODEL;
    try {
      completion = await this.call(PRIMARY_MODEL, system, userMsg);
    } catch {
      completion = await this.call(FALLBACK_MODEL, system, userMsg);
      model = FALLBACK_MODEL;
    }

    const raw = completion.choices[0]?.message?.content ?? "";
    const tokens = (completion.usage?.prompt_tokens ?? 0) + (completion.usage?.completion_tokens ?? 0);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw);
    } catch {
      parsed = { content: raw };
    }

    return this._normalize(tipo, parsed, tokens, model);
  }

  private _normalize(tipo: AIGenerationType, p: Record<string, unknown>, tokens: number, model: string): GenerationResponse {
    if (tipo === "hook") {
      const hooks = (p.hooks as string[]) ?? [];
      const best  = Number(p.best ?? 0);
      return { content: hooks[best] ?? hooks[0] ?? "", hook: hooks[best], alternatives: hooks, cta: undefined, tokens, model, raw: p };
    }
    if (tipo === "thread") {
      const tweets = (p.tweets as { n: number; text: string }[]) ?? [];
      return { content: tweets.map((t) => `${t.n}/ ${t.text}`).join("\n\n"), hook: p.hook as string, cta: p.cta as string, tokens, model, raw: p };
    }
    if (tipo === "carousel") {
      const slides = (p.slides as { n: number; titulo: string; cuerpo: string }[]) ?? [];
      return { content: slides.map((s) => `Slide ${s.n}: ${s.titulo}\n${s.cuerpo}`).join("\n\n---\n\n"), hook: p.hook as string, cta: p.cta as string, tokens, model, raw: p };
    }
    return {
      content: (p.content ?? p.rewritten ?? "") as string,
      hook:    p.hook as string,
      cta:     p.cta  as string,
      hashtags: (p.hashtags as string[]) ?? [],
      tokens, model, raw: p,
    };
  }

  async score(content: string, tipo: AIGenerationType, plataforma: ContentPlatform): Promise<ScoringResponse> {
    const userMsg = `Plataforma: ${plataforma}\nTipo: ${tipo}\n\nContenido:\n${content}`;
    const completion = await this.call(PRIMARY_MODEL, SCORE_SYSTEM, userMsg);
    const raw = completion.choices[0]?.message?.content ?? "{}";
    try {
      const p = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw) as ScoringResponse;
      return p;
    } catch {
      return { score: 7, feedback: "Contenido evaluado.", breakdown: { hook: 7, clarity: 7, cta: 7, engagement: 7 } };
    }
  }
}
