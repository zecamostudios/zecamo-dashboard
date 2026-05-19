"use server";

import { redirect } from "next/navigation";
import { createClient as _createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isFounderAdmin } from "@/lib/manual/auth";

export async function updateBlock(formData: FormData) {
  const admin = await isFounderAdmin();
  if (!admin) return;

  const blockId = formData.get("blockId") as string;
  const slug = formData.get("slug") as string;
  const title = (formData.get("title") as string) || null;
  const content_md = (formData.get("content_md") as string) || null;
  const variant = (formData.get("variant") as string) || null;

  const supabase = (await _createClient()) as unknown as SupabaseClient;
  await supabase
    .from("manual_blocks")
    .update({ title, content_md, variant })
    .eq("id", blockId);

  redirect(`/manual/${slug}`);
}
