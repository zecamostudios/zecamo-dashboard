import { NextRequest, NextResponse } from "next/server";
import { INSTAGRAM_OAUTH } from "@/lib/instagram/config";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron de renovación de tokens de Instagram.
 *
 * GET /api/cron/refresh-instagram
 *
 * Los tokens de larga duración de Instagram viven 60 días pero se pueden
 * renovar (otros 60) llamando a refresh_access_token, siempre que tengan
 * más de 24 h y no estén vencidos. Este endpoint renueva las cuentas que
 * vencen dentro de los próximos 10 días.
 *
 * Lo dispara Vercel Cron (ver vercel.json). Protegido con CRON_SECRET:
 * Vercel manda `Authorization: Bearer ${CRON_SECRET}` en cada ejecución.
 * Nota: CRON_SECRET debe cargarse desde el dashboard de Vercel (las env vars
 * creadas por la API REST no se inyectan al runtime en este proyecto).
 */
export const dynamic = "force-dynamic";

const DIAS_ANTES = 10;

export async function GET(request: NextRequest) {
  // Auth: solo Vercel Cron. Si CRON_SECRET está definido, Vercel manda
  // `Authorization: Bearer ${CRON_SECRET}` en cada ejecución y acá lo validamos.
  // (Cargá CRON_SECRET desde el dashboard de Vercel para activar la protección.)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const limite = new Date(Date.now() + DIAS_ANTES * 86_400_000).toISOString();

  const { data: cuentas, error } = await supabase
    .from("instagram_connections")
    .select("id, ig_user_id, access_token, token_expires_at")
    .lte("token_expires_at", limite);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resultados: Array<{ ig_user_id: string; ok: boolean; detail?: string }> = [];

  for (const c of cuentas ?? []) {
    try {
      const url = new URL(INSTAGRAM_OAUTH.refreshToken);
      url.searchParams.set("grant_type", "ig_refresh_token");
      url.searchParams.set("access_token", c.access_token);
      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok || !data.access_token) {
        resultados.push({
          ig_user_id: c.ig_user_id,
          ok: false,
          detail: data.error?.message || `HTTP ${res.status}`,
        });
        continue;
      }

      const expiresIn: number = data.expires_in ?? 60 * 60 * 24 * 60;
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      await supabase
        .from("instagram_connections")
        .update({
          access_token: data.access_token,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", c.id);

      resultados.push({ ig_user_id: c.ig_user_id, ok: true });
    } catch (e) {
      resultados.push({
        ig_user_id: c.ig_user_id,
        ok: false,
        detail: (e as Error).message,
      });
    }
  }

  return NextResponse.json({
    revisadas: cuentas?.length ?? 0,
    renovadas: resultados.filter((r) => r.ok).length,
    resultados,
  });
}
