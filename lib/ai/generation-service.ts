/**
 * GenerationService — central entry point for all AI generation.
 * Automatically selects MockProvider or OpenAIProvider based on env.
 * Logs every generation to content_ai_generations table.
 */
import type { GenerationRequest, GenerationResponse, ScoringResponse } from "./providers/base";
import { MockProvider }   from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

function getProvider() {
  return process.env.OPENAI_API_KEY
    ? new OpenAIProvider()
    : new MockProvider();
}

export async function generateContent(req: GenerationRequest): Promise<GenerationResponse & { isMock: boolean }> {
  const provider = getProvider();
  const result   = await provider.generate(req);
  return { ...result, isMock: provider.isMock };
}

export async function scoreContent(
  content: string,
  tipo: AIGenerationType,
  plataforma: ContentPlatform,
): Promise<ScoringResponse> {
  return getProvider().score(content, tipo, plataforma);
}

export function getActiveProvider(): { name: string; isMock: boolean } {
  const p = getProvider();
  return { name: p.name, isMock: p.isMock };
}
