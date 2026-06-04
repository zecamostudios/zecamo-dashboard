import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  INSTAGRAM_OAUTH,
  INSTAGRAM_SCOPES,
  getInstagramAppCredentials,
  getInstagramRedirectUri,
} from "@/lib/instagram/config";

/**
 * Inicia el flujo de Instagram Business Login.
 *
 * GET /api/auth/instagram
 * GET /api/auth/instagram?clienteId=<uuid>   ← para conectar la IG de un cliente
 *
 * Construye la URL de autorización de Instagram y redirige al usuario.
 * El parámetro `state` lleva un nonce anti-CSRF (guardado en cookie httpOnly)
 * y, opcionalmente, el clienteId para soportar conexiones multi-cliente con
 * UNA sola redirect URI.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const clienteId = searchParams.get("clienteId") ?? null;

  let appId: string;
  try {
    ({ appId } = getInstagramAppCredentials());
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }

  const redirectUri = getInstagramRedirectUri(origin);

  // Nonce anti-CSRF + contexto del cliente, codificados en `state`.
  const nonce = randomBytes(16).toString("hex");
  const state = Buffer.from(JSON.stringify({ nonce, clienteId })).toString("base64url");

  const authorizeUrl = new URL(INSTAGRAM_OAUTH.authorize);
  authorizeUrl.searchParams.set("client_id", appId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", INSTAGRAM_SCOPES.join(","));
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl.toString());

  // El nonce viaja en cookie httpOnly para verificarlo en el callback.
  response.cookies.set("ig_oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutos
  });

  return response;
}
