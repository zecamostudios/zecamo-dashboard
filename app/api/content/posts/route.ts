import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado");
  const plataforma = searchParams.get("plataforma");
  const tipo = searchParams.get("tipo");
  const limit = Number(searchParams.get("limit") ?? 0);

  let query = supabase.from("content_posts").select("*").order("created_at", { ascending: false });
  if (estado) query = query.eq("estado", estado);
  if (plataforma) query = query.eq("plataforma", plataforma);
  if (tipo) query = query.eq("tipo", tipo);
  if (limit > 0) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("content_posts")
    .insert({ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}
