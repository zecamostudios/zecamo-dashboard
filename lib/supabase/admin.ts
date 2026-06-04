import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE — SOLO para usar en el servidor
 * (route handlers, server actions). Bypassa RLS, así que nunca lo importes
 * en componentes cliente ni expongas la key.
 *
 * Se usa para persistir tokens de Instagram, que no deben quedar atados a la
 * sesión del navegador del usuario que dispara la conexión.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY para el cliente admin."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
