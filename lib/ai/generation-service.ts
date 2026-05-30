/**
 * GenerationService — central entry point for all AI generation.
 * Automatically selects MockProvider or OpenAIProvider based on env.
 * Accepts optional per-request config overrides (model, temperature, maxTokens).
 */
import type { GenerationRequest, GenerationResponse, ScoringResponse } from "./providers/base";
import { MockProvider }   from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import { getDefaultAIConfig, type AIConfig } from "./ai-config";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

function getProvider(): MockProvider | OpenAIProvider {
  return process.env.OPENAI_API_KEY
    ? new OpenAIProvider()
    : new MockProvider();
}

export async function generateContent(
  req: GenerationRequest,
  configOverride?: Partial<AIConfig>,
): Promise<GenerationResponse & { isMock: boolean }> {
  const provider = getProvider();
  let result: GenerationResponse;

  if (!provider.isMock && configOverride) {
    result = await (provider as OpenAIProvider).generate(req, configOverride);
  } else {
    result = await provider.generate(req);
  }

  return { ...result, isMock: provider.isMock };
}

export async function scoreContent(
  content: string,
  tipo: AIGenerationType,
  plataforma: ContentPlatform,
): Promise<ScoringResponse> {
  return getProvider().score(content, tipo, plataforma);
}

export function getActiveProvider(): { name: string; isMock: boolean; config: AIConfig } {
  const p = getProvider();
  return { name: p.name, isMock: p.isMock, config: getDefaultAIConfig() };
}
