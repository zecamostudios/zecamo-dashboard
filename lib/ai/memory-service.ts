/**
 * MemoryService — fetches brand memory and formats it for prompt injection.
 * Server-side only (uses server Supabase client).
 */
import { createClient } from "@/lib/supabase/server";
import type { BrandMemory } from "@/lib/types";

export async function getBrandMemoryForPrompt(): Promise<BrandMemory[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("brand_memory")
      .select("*")
      .eq("activo", true)
      .order("categoria")
      .order("orden");
    return (data ?? []) as BrandMemory[];
  } catch {
    return [];
  }
}

export async function getBrandMemoryByCategory(categoria: string): Promise<BrandMemory[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("brand_memory")
      .select("*")
      .eq("categoria", categoria)
      .eq("activo", true)
      .order("orden");
    return (data ?? []) as BrandMemory[];
  } catch {
    return [];
  }
}
