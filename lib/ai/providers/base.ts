import type { AIGenerationType, ContentPlatform } from "@/lib/types";

export interface GenerationRequest {
  tipo: AIGenerationType;
  plataforma: ContentPlatform;
  prompt: string;
  context: {
    tono?: string;
    contexto?: string;
    charLimit?: number;
    brandMemory?: string;
  };
}

export interface GenerationResponse {
  content: string;
  hook?: string;
  cta?: string;
  hashtags?: string[];
  alternatives?: string[];
  tokens: number;
  model: string;
  raw?: Record<string, unknown>;
}

export interface ScoringResponse {
  score: number;        // 0–10
  feedback: string;
  breakdown: {
    hook: number;
    clarity: number;
    cta: number;
    engagement: number;
  };
}

export interface AIProvider {
  readonly name: string;
  readonly isMock: boolean;
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  score(content: string, tipo: AIGenerationType, plataforma: ContentPlatform): Promise<ScoringResponse>;
}
