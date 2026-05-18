import { createClient as _createClient } from "@/lib/supabase/server";

export async function isFounderAdmin(): Promise<boolean> {
  const supabase = await _createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  return data?.rol === "owner" || data?.rol === "admin";
}
