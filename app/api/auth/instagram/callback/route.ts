import { NextRequest, NextResponse } from "next/server";
import {
  INSTAGRAM_OAUTH,
  getInstagramAppCredentials,
  getInstagramRedirectUri,
} from "@/lib/instagram/config";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Callback de Instagram Business Login.
 *
 * GET /api/auth/instagram/callback?code=...&state=...
 *
 * ⚠️ Esta es la URL que se registra en Meta Developers → Instagram →
 *    "Configurar inicio de sesión de empresa de Instagram" → URI de redireccionamiento.
 *    Debe coincidir EXACTO (esquema + host + path).
 *
 * Pasos:
 *  1. Valida `state` contra el nonce de la cookie (anti-CSRF).
 *  2. Cambia el `code` por un token corto (1h).
 *  3. Cambia el token corto por uno largo (60 días).
 *  4. Persiste el token en Supabase (tabla instagram_connections).
 *  5. Redirige al dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  const fail = (reason: string) =>
    NextResponse.redirect(
      `${origin}/configuracion?ig=error&reason=${encodeURIComponent(reason)}`
    );

  // Meta devolvió un error (usuario canceló, app sin permisos, etc.)
  if (errorParam) {
    return fail(errorDesc || errorParam);
  }
  if (!code || !stateRaw) {
    return fail("Faltan code o state en el callback.");
  }

  // 1. Validar state (anti-CSRF) contra la cookie.
  let clienteId: string | null = null;
  try {
    const decoded = JSON.parse(
      Buffer.from(stateRaw, "base64url").toString("utf8")
    ) as { nonce: string; clienteId: string | null };
    const cookieNonce = request.cookies.get("ig_oauth_nonce")?.value;
    if (!cookieNonce || cookieNonce !== decoded.nonce) {
      return fail("State inválido (posible CSRF).");
    }
    clienteId = decoded.clienteId;
  } catch {
    return fail("State malformado.");
  }

  let appId: string, appSecret: string;
  try {
    ({ appId, appSecret } = getInstagramAppCredentials());
  } catch (e) {
    return fail((e as Error).message);
  }

  const redirectUri = getInstagramRedirectUri(origin);

  try {
    // 2. code → token corto (1 hora).
    const shortRes = await fetch(INSTAGRAM_OAUTH.shortLivedToken, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    });
    const shortData = await shortRes.json();
    if (!shortRes.ok || !shortData.access_token) {
      return fail(
        `Intercambio de code falló: ${shortData.error_message || shortRes.status}`
      );
    }

    const igUserId: string = String(shortData.user_id);
    const permissions: string[] = shortData.permissions || [];

    // 3. token corto → token largo (60 días).
    const longUrl = new URL(INSTAGRAM_OAUTH.longLivedToken);
    longUrl.searchParams.set("grant_type", "ig_exchange_token");
    longUrl.searchParams.set("client_secret", appSecret);
    longUrl.searchParams.set("access_token", shortData.access_token);
    const longRes = await fetch(longUrl.toString());
    const longData = await longRes.json();
    if (!longRes.ok || !longData.access_token) {
      return fail(
        `No se pudo obtener token de larga duración: ${longData.error?.message || longRes.status}`
      );
    }

    const accessToken: string = longData.access_token;
    const expiresIn: number = longData.expires_in ?? 60 * 60 * 24 * 60;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 3b. Traer el username (y confirmar el user_id) del perfil de negocio.
    let username: string | null = null;
    try {
      const meUrl = new URL("https://graph.instagram.com/me");
      meUrl.searchParams.set("fields", "user_id,username");
      meUrl.searchParams.set("access_token", accessToken);
      const meRes = await fetch(meUrl.toString());
      const meData = await meRes.json();
      if (meRes.ok) username = meData.username ?? null;
    } catch {
      // username es informativo; si falla seguimos con el token igual.
    }

    // 4. Persistir en Supabase (service role, bypassa RLS).
    const supabase = createAdminClient();
    const { error: dbError } = await supabase
      .from("instagram_connections")
      .upsert(
        {
          ig_user_id: igUserId,
          cliente_id: clienteId,
          username,
          access_token: accessToken,
          token_expires_at: expiresAt,
          permissions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "ig_user_id" }
      );
    if (dbError) {
      return fail(`Token obtenido pero falló al guardar: ${dbError.message}`);
    }

    // 5. Listo. Limpiamos la cookie y redirigimos.
    const ok = NextResponse.redirect(
      `${origin}/configuracion?ig=connected&user=${encodeURIComponent(igUserId)}`
    );
    ok.cookies.delete("ig_oauth_nonce");
    return ok;
  } catch (e) {
    return fail((e as Error).message);
  }
}
