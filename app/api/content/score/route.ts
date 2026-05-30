import { NextRequest, NextResponse } from "next/server";
import { scorePost } from "@/lib/ai/scoring-service";
import { requireAuth } from "@/lib/supabase/auth-guard";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { content, tipo, plataforma } = (await req.json()) as {
      content: string;
      tipo: AIGenerationType;
      plataforma: ContentPlatform;
    };

    if (!content?.trim()) {
      return NextResponse.json({ error: "content requerido" }, { status: 400 });
    }

    const result = await scorePost(content, tipo ?? "post", plataforma ?? "linkedin");
    return NextResponse.json(result);
  } catch (err) {
    console.error("[content/score]", err);
    return NextResponse.json({ error: "Error al puntuar" }, { status: 500 });
  }
}
