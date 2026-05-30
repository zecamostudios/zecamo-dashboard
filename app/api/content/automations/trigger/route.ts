import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const supabase = await createClient();
  const { automation_id } = await req.json();

  const { data, error } = await supabase
    .from("content_automation_runs")
    .insert({
      nombre: automation_id,
      tipo: "manual",
      estado: "pending",
      iniciado_en: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const n8nWebhook = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhook) {
    await fetch(`${n8nWebhook}/${automation_id}`, { method: "POST" }).catch(() => {});
  }

  return NextResponse.json({ run: data });
}
