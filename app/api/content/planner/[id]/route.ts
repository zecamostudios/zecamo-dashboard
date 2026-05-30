import { NextRequest, NextResponse } from "next/server";
import { updatePlannerSlot, deletePlannerSlot } from "@/lib/db/content/planner";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const updates = await req.json();
    await updatePlannerSlot(params.id, updates);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await deletePlannerSlot(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
