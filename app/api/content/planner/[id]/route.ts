import { NextRequest, NextResponse } from "next/server";
import { updatePlannerSlot, deletePlannerSlot } from "@/lib/db/content/planner";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const updates = await req.json();
    await updatePlannerSlot(params.id, updates);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await deletePlannerSlot(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
