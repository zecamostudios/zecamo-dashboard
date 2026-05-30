import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
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

  // Trigger n8n webhook if configured
  const n8nWebhook = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhook) {
    await fetch(`${n8nWebhook}/${automation_id}`, { method: "POST" }).catch(() => {});
  }

  return NextResponse.json({ run: data });
}
