import { scoreContent } from "./generation-service";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

export interface ContentScore {
  score: number;
  feedback: string;
  breakdown: Record<string, number>;
}

export async function scorePost(
  content: string,
  tipo: AIGenerationType,
  plataforma: ContentPlatform,
): Promise<ContentScore> {
  const result = await scoreContent(content, tipo, plataforma);
  return {
    score:     result.score,
    feedback:  result.feedback,
    breakdown: result.breakdown as Record<string, number>,
  };
}
