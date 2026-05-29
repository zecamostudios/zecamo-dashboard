import { createClient } from "@/lib/supabase/server";
import type { ContentAsset, AssetType } from "@/lib/types";

export async function getAssets(tipo?: AssetType): Promise<ContentAsset[]> {
  const supabase = await createClient();
  let query = supabase
    .from("content_assets")
    .select("*")
    .order("favorito", { ascending: false })
    .order("uses", { ascending: false });

  if (tipo) query = query.eq("tipo", tipo);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as ContentAsset[];
}

export async function createAsset(
  asset: Omit<ContentAsset, "id" | "uses" | "created_at">,
): Promise<ContentAsset | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_assets")
    .insert({ ...asset, uses: 0 })
    .select()
    .single();
  if (error) return null;
  return data as ContentAsset;
}

export async function updateAsset(id: string, updates: Partial<ContentAsset>): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, creado_por: _cp, ...safeUpdates } = updates as Record<string, unknown>;
  await supabase
    .from("content_assets")
    .update({ ...safeUpdates, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function toggleFavorite(id: string, favorito: boolean): Promise<void> {
  return updateAsset(id, { favorito });
}

export async function incrementUses(id: string, currentUses: number): Promise<void> {
  return updateAsset(id, { uses: currentUses + 1 });
}

export async function deleteAsset(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("content_assets").delete().eq("id", id);
}
