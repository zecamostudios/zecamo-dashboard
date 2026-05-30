import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { triggerAutomation } from "@/lib/services/automation/automation-service";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { automation_id, payload } = await req.json();
    if (!automation_id) {
      return NextResponse.json({ error: "automation_id requerido" }, { status: 400 });
    }

    const result = await triggerAutomation(
      automation_id,
      { ...payload, triggered_by: auth.userId },
    );

    return NextResponse.json({
      run:         result.run,
      webhookSent: result.webhookSent,
      webhookError:result.webhookError,
    });
  } catch (err) {
    console.error("[automations/trigger]", err);
    return NextResponse.json({ error: "Error al disparar automatización" }, { status: 500 });
  }
}
