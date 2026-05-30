import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSnapshots, upsertSnapshot, getTopPerformingPosts } from "@/lib/db/content/analytics";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("post_id");
    const top    = searchParams.get("top");

    if (top) {
      const data = await getTopPerformingPosts(Number(top) || 10);
      return NextResponse.json(data);
    }

    if (!postId) return NextResponse.json({ error: "post_id requerido" }, { status: 400 });
    const data = await getAnalyticsSnapshots(postId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const result = await upsertSnapshot(body);
    if (!result) return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
