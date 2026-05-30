import { NextRequest, NextResponse } from "next/server";
import { getActiveProvider }   from "@/lib/ai/generation-service";
import { getProviderStatus, SUPPORTED_MODELS, TOKEN_COSTS } from "@/lib/ai/ai-config";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const status = getProviderStatus();
  const active = getActiveProvider();

  return NextResponse.json({
    provider:   status.provider,
    hasApiKey:  status.hasApiKey,
    keyPreview: status.keyPreview,
    model:      active.config.model,
    temperature:active.config.temperature,
    maxTokens:  active.config.maxTokens,
    isMock:     active.isMock,
    supportedModels: SUPPORTED_MODELS,
    costs: TOKEN_COSTS,
    envHints: {
      OPENAI_API_KEY:   status.hasApiKey ? "set" : "missing",
      OPENAI_MODEL:     process.env.OPENAI_MODEL     ?? "(default: gpt-4o)",
      OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE ?? "(default: 0.7)",
      OPENAI_MAX_TOKENS:  process.env.OPENAI_MAX_TOKENS  ?? "(default: 2048)",
    },
  });
}
