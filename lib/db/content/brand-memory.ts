import { createClient } from "@/lib/supabase/server";
import type { BrandMemory } from "@/lib/types";

export async function getBrandMemory(): Promise<BrandMemory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_memory")
    .select("*")
    .order("categoria")
    .order("orden");
  return (data ?? []) as BrandMemory[];
}

export async function createBrandMemory(
  item: Omit<BrandMemory, "id" | "created_at" | "updated_at">,
): Promise<BrandMemory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_memory")
    .insert(item)
    .select()
    .single();
  if (error) return null;
  return data as BrandMemory;
}

export async function updateBrandMemory(
  id: string,
  updates: Partial<Pick<BrandMemory, "clave" | "valor" | "activo" | "orden">>,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("brand_memory").update(updates).eq("id", id);
}

export async function deleteBrandMemory(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("brand_memory").delete().eq("id", id);
}

export async function toggleBrandMemory(id: string, activo: boolean): Promise<void> {
  return updateBrandMemory(id, { activo });
}
