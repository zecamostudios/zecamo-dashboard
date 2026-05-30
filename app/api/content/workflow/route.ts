import { NextRequest, NextResponse } from "next/server";
import { transitionPost, WorkflowError } from "@/lib/services/workflow-service";
import { getWorkflowEvents } from "@/lib/db/content/workflow";
import type { ContentStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("post_id");
    if (!postId) return NextResponse.json({ error: "post_id requerido" }, { status: 400 });

    const events = await getWorkflowEvents(postId, "content_post");
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { post_id, from, to, actor, metadata } = (await req.json()) as {
      post_id: string;
      from: ContentStatus;
      to: ContentStatus;
      actor?: string;
      metadata?: Record<string, unknown>;
    };

    if (!post_id || !from || !to) {
      return NextResponse.json({ error: "post_id, from y to son requeridos" }, { status: 400 });
    }

    await transitionPost(post_id, from, to, actor, metadata);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof WorkflowError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
