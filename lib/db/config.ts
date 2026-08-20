import { createClient } from "@/lib/supabase/server";

/**
 * Lee un valor de la tabla app_config (clave/valor jsonb).
 * Devuelve el fallback si no existe o hay error.
 */
export async function getConfig<T>(clave: string, fallback: T): Promise<T> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_config")
    .select("valor")
    .eq("clave", clave)
    .maybeSingle();

  if (error || !data) return fallback;
  return (data.valor as T) ?? fallback;
}

export async function getMrrObjetivo(): Promise<number> {
  return getConfig<number>("mrr_objetivo", 8500);
}
