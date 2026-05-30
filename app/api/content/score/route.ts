import { NextRequest, NextResponse } from "next/server";
import { scorePost } from "@/lib/ai/scoring-service";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

export async function POST(req: NextRequest) {
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
