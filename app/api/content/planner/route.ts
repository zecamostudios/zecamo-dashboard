import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlannerSlots, createPlannerSlot } from "@/lib/db/content/planner";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start") ?? new Date().toISOString().slice(0, 10);
    const end   = searchParams.get("end") ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const slots = await getPlannerSlots(start, end);
    return NextResponse.json(slots);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { post_id, fecha, hora, plataforma, estado = "programado", orden = 0 } = body;

    if (!fecha || !plataforma) {
      return NextResponse.json({ error: "fecha y plataforma son requeridos" }, { status: 400 });
    }

    let resolvedPostId = post_id;
    if (!resolvedPostId) {
      const supabase = await createClient();
      const { data: post, error } = await supabase
        .from("content_posts")
        .insert({
          titulo:     body.titulo ?? body.hook ?? "Sin título",
          contenido:  body.hook ?? "",
          plataforma,
          tipo:       "post",
          estado:     "borrador",
          hook:       body.hook ?? null,
          version:    1,
        })
        .select("id")
        .single();
      if (error || !post) return NextResponse.json({ error: "No se pudo crear el post" }, { status: 500 });
      resolvedPostId = post.id;
    }

    const slot = await createPlannerSlot({
      post_id:   resolvedPostId,
      fecha,
      hora:      hora || null,
      plataforma,
      estado,
      orden,
    });

    if (!slot) return NextResponse.json({ error: "Error al crear slot" }, { status: 500 });
    return NextResponse.json(slot, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
