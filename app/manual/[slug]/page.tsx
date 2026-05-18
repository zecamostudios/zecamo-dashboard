import { notFound } from "next/navigation";
import { getSection, getSectionBlocks } from "@/lib/manual/queries";
import { isFounderAdmin } from "@/lib/manual/auth";
import { SectionHeader } from "@/components/manual/section-header";
import { BlockRenderer } from "@/components/manual/block-renderer";
import { EditButton } from "@/components/manual/edit-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const section = await getSection(slug);
  return { title: section ? `${section.title} · Manual Zecamo` : "Manual Zecamo" };
}

export default async function ManualSectionPage({ params }: Props) {
  const { slug } = await params;
  const [section, isAdmin] = await Promise.all([getSection(slug), isFounderAdmin()]);

  if (!section) notFound();

  const blocks = await getSectionBlocks(section.id);

  return (
    <article className="zec-section">
      <SectionHeader section={section} />
      <div className="zec-blocks">
        {blocks.map((block) => (
          <div key={block.id} className="zec-block-wrap">
            {isAdmin && (
              <div className="zec-block-edit-row">
                <EditButton slug={slug} blockId={block.id} />
              </div>
            )}
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>
    </article>
  );
}
