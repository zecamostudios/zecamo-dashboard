import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { publishPost, validateForPublish, PublishingError } from "@/lib/services/publishing/publishing-service";
import type { ContentPlatform } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { post_id, platform, validate_only } = (await req.json()) as {
      post_id:       string;
      platform:      ContentPlatform;
      validate_only?: boolean;
    };

    if (!post_id || !platform) {
      return NextResponse.json({ error: "post_id y platform son requeridos" }, { status: 400 });
    }

    if (validate_only) {
      const result = await validateForPublish(post_id, platform);
      return NextResponse.json(result);
    }

    const result = await publishPost(post_id, platform, {
      actor: auth.userId,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err) {
    if (err instanceof PublishingError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("[content/publish]", err);
    return NextResponse.json({ error: "Error al publicar" }, { status: 500 });
  }
}
