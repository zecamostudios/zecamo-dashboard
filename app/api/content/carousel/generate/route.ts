import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { generateCarousel } from "@/lib/services/carousel/carousel-service";
import { publishPost } from "@/lib/services/publishing/publishing-service";
import type { ContentPost } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { post_id, publish_after = false } = (await req.json()) as {
      post_id: string;
      publish_after?: boolean;
    };

    if (!post_id) {
      return NextResponse.json({ error: "post_id requerido" }, { status: 400 });
    }

    const supabase = await createClient();

    // Load post
    const { data: post, error } = await supabase
      .from("content_posts")
      .select("*")
      .eq("id", post_id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    const typedPost = post as unknown as ContentPost;

    if (!["instagram", "facebook"].includes(typedPost.plataforma)) {
      return NextResponse.json(
        { error: "El carrusel solo aplica a Instagram o Facebook" },
        { status: 400 },
      );
    }

    // Generate carousel (GPT + render + upload)
    const result = await generateCarousel(typedPost);

    // Optionally publish to Instagram immediately after
    let publishResult = null;
    if (publish_after && typedPost.plataforma === "instagram") {
      publishResult = await publishPost(post_id, "instagram", { actor: auth.userId });
    }

    return NextResponse.json({
      ok: true,
      slides: result.slides.length,
      mediaUrls: result.mediaUrls,
      caption: result.caption,
      published: publishResult?.success ?? false,
    });
  } catch (err) {
    console.error("[carousel/generate]", err);
    const msg = err instanceof Error ? err.message : "Error al generar carrusel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
