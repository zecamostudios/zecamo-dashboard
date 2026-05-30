export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  provider: "openai" | "mock";
}

export const SUPPORTED_MODELS = [
  { id: "gpt-4o",       label: "GPT-4o",       tier: "best",    contextK: 128 },
  { id: "gpt-4o-mini",  label: "GPT-4o Mini",  tier: "fast",    contextK: 128 },
  { id: "gpt-4-turbo",  label: "GPT-4 Turbo",  tier: "legacy",  contextK: 128 },
  { id: "gpt-3.5-turbo",label: "GPT-3.5 Turbo",tier: "economy", contextK: 16  },
] as const;

// Cost per 1M tokens (USD), as of mid-2025
export const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  "gpt-4o":       { input: 2.50,  output: 10.00 },
  "gpt-4o-mini":  { input: 0.15,  output: 0.60  },
  "gpt-4-turbo":  { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo":{ input: 0.50,  output: 1.50  },
  "mock-v1":      { input: 0,     output: 0     },
};

export function getDefaultAIConfig(): AIConfig {
  return {
    model:       process.env.OPENAI_MODEL       ?? "gpt-4o",
    temperature: Number(process.env.OPENAI_TEMPERATURE ?? "0.7"),
    maxTokens:   Number(process.env.OPENAI_MAX_TOKENS  ?? "2048"),
    provider:    process.env.OPENAI_API_KEY ? "openai" : "mock",
  };
}

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const costs = TOKEN_COSTS[model] ?? TOKEN_COSTS["gpt-4o"];
  return (inputTokens  / 1_000_000) * costs.input
       + (outputTokens / 1_000_000) * costs.output;
}

export function getProviderStatus(): {
  provider: "openai" | "mock";
  hasApiKey: boolean;
  model: string;
  keyPreview: string | null;
} {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const key    = process.env.OPENAI_API_KEY ?? "";
  return {
    provider:   hasKey ? "openai" : "mock",
    hasApiKey:  hasKey,
    model:      process.env.OPENAI_MODEL ?? "gpt-4o",
    keyPreview: hasKey ? `sk-...${key.slice(-4)}` : null,
  };
}
