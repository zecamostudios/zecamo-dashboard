import { notFound, redirect } from "next/navigation";
import { isFounderAdmin } from "@/lib/manual/auth";
import { createClient as _createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EditBlockForm } from "@/components/manual/edit-block-form";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ block?: string }>;
};

export default async function EditBlockPage({ params, searchParams }: Props) {
  const [{ slug }, { block: blockId }] = await Promise.all([params, searchParams]);

  const admin = await isFounderAdmin();
  if (!admin) redirect(`/manual/${slug}`);
  if (!blockId) redirect(`/manual/${slug}`);

  const supabase = (await _createClient()) as unknown as SupabaseClient;
  const { data: block } = await supabase
    .from("manual_blocks")
    .select("id, type, title, subtitle, content_md, variant")
    .eq("id", blockId)
    .single();

  if (!block) notFound();

  return (
    <div className="zec-edit-page">
      <div className="zec-edit-header">
        <a href={`/manual/${slug}`} className="zec-edit-back">← Volver</a>
        <h1 className="zec-edit-title">Editar bloque · <span>{block.type}</span></h1>
      </div>
      <EditBlockForm block={block} slug={slug} />
    </div>
  );
}
