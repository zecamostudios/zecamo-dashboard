import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdminSecret } from "@/lib/supabase/auth-guard";
import { ingestPlatformMetrics, ingestAllPublishedPosts } from "@/lib/services/analytics/metrics-ingestion";
import type { ContentPlatform } from "@/lib/types";

export async function POST(req: NextRequest) {
  // Allow both admin secret (for cron jobs) and user auth
  const isAdmin = requireAdminSecret(req);
  if (!isAdmin) {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
  }

  try {
    const { post_id, platform, all } = await req.json() as {
      post_id?:  string;
      platform?: ContentPlatform;
      all?:      boolean;
    };

    if (all) {
      const result = await ingestAllPublishedPosts(platform);
      return NextResponse.json(result);
    }

    if (!post_id || !platform) {
      return NextResponse.json({ error: "post_id y platform requeridos (o all: true)" }, { status: 400 });
    }

    const snapshot = await ingestPlatformMetrics(post_id, platform);
    return NextResponse.json({ snapshot }, { status: 201 });
  } catch (err) {
    console.error("[analytics/ingest]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 },
    );
  }
}
