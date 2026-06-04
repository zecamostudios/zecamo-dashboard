/**
 * Configuración central de Instagram Business Login (Instagram API con Instagram Login).
 *
 * Flujo Meta: Meta Developers → Instagram → "API setup with Instagram login"
 * (Configurar inicio de sesión de empresa de Instagram).
 *
 * NO confundir con el login de usuarios del dashboard (eso es Supabase Auth,
 * en app/auth/callback). Esto conecta cuentas de Instagram Business para
 * publicar/gestionar contenido — la de Zecamo y, a futuro, las de clientes.
 */

/** Path del callback OAuth. Debe coincidir EXACTO con lo registrado en Meta. */
export const INSTAGRAM_CALLBACK_PATH = "/api/auth/instagram/callback";

/**
 * Scopes de Instagram Business Login.
 * Pedí solo los que vayas a usar — Meta revisa cada permiso en App Review.
 */
export const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
];

/** Endpoints oficiales del flujo Instagram Login. */
export const INSTAGRAM_OAUTH = {
  authorize: "https://www.instagram.com/oauth/authorize",
  shortLivedToken: "https://api.instagram.com/oauth/access_token",
  longLivedToken: "https://graph.instagram.com/access_token",
  refreshToken: "https://graph.instagram.com/refresh_access_token",
} as const;

/**
 * Devuelve la URL absoluta del callback (redirect_uri).
 *
 * Prioridad:
 *  1. NEXT_PUBLIC_SITE_URL (recomendado en producción: dominio fijo).
 *  2. origin del request (sirve para previews y local).
 *
 * Meta exige coincidencia EXACTA con lo registrado, así que en prod conviene
 * fijar NEXT_PUBLIC_SITE_URL para no depender del origin del preview de Vercel.
 */
export function getInstagramRedirectUri(requestOrigin: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin).replace(/\/$/, "");
  return `${base}${INSTAGRAM_CALLBACK_PATH}`;
}

export function getInstagramAppCredentials() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error(
      "Faltan INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET en las variables de entorno."
    );
  }
  return { appId, appSecret };
}
