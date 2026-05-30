/**
 * PromptService — builds enriched generation requests by injecting
 * brand memory context. When brand memory is available, the AI
 * (real or mock) can generate more on-brand content.
 */
import type { GenerationRequest } from "./providers/base";
import type { AIGenerationType, ContentPlatform, BrandMemory } from "@/lib/types";

export interface PromptInput {
  tipo: AIGenerationType;
  plataforma: ContentPlatform;
  prompt: string;
  tono?: string;
  contexto?: string;
  brandMemory?: BrandMemory[];
}

export function buildRequest(input: PromptInput): GenerationRequest {
  const { tipo, plataforma, prompt, tono, contexto, brandMemory } = input;

  const charLimits: Record<ContentPlatform, number> = {
    linkedin: 3000,
    twitter:  280,
    instagram: 2200,
    facebook:  5000,
  };

  let brandContext: string | undefined;
  if (brandMemory && brandMemory.length > 0) {
    const active = brandMemory.filter((m) => m.activo);
    const sections = [
      fmtSection("Tono y personalidad", active, "tono"),
      fmtSection("Posicionamiento",      active, "posicionamiento"),
      fmtSection("Audiencia",            active, "audiencia"),
      fmtSection("Pilares de contenido", active, "pilares"),
      fmtSection("Patrones de CTA",      active, "cta_patterns"),
      fmtSection("Restricciones",        active, "restricciones"),
    ].filter(Boolean);
    if (sections.length > 0) brandContext = sections.join("\n\n");
  }

  return {
    tipo,
    plataforma,
    prompt,
    context: {
      tono:        tono ?? "profesional-directo",
      contexto,
      charLimit:   charLimits[plataforma],
      brandMemory: brandContext,
    },
  };
}

function fmtSection(title: string, memories: BrandMemory[], categoria: string): string {
  const items = memories.filter((m) => m.categoria === categoria);
  if (items.length === 0) return "";
  return `${title}:\n${items.map((m) => `- ${m.valor}`).join("\n")}`;
}
