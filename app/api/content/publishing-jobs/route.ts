import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { getPublishingJobs, createPublishingJob } from "@/lib/db/content/publishing";
import type { ContentPlatform } from "@/lib/types";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("post_id") ?? undefined;

  const jobs = await getPublishingJobs(postId);
  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { post_id, plataforma, account_id, programado_para } = await req.json();
    if (!post_id || !plataforma) {
      return NextResponse.json({ error: "post_id y plataforma requeridos" }, { status: 400 });
    }

    const job = await createPublishingJob({
      post_id,
      plataforma: plataforma as ContentPlatform,
      account_id,
      programado_para,
    });

    if (!job) return NextResponse.json({ error: "Error al crear job" }, { status: 500 });
    return NextResponse.json({ job }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
