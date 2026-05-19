import { notFound } from "next/navigation";
import { getSection, getSectionBlocks } from "@/lib/manual/queries";
import { SectionHeader } from "@/components/manual/section-header";
import { BlockRenderer } from "@/components/manual/block-renderer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const section = await getSection(slug);
  return { title: section ? `${section.title} · Manual Zecamo` : "Manual Zecamo" };
}

export default async function ManualSectionPage({ params }: Props) {
  const { slug } = await params;
  const section = await getSection(slug);

  if (!section) notFound();

  const blocks = await getSectionBlocks(section.id);

  return (
    <article className="zec-section">
      <SectionHeader section={section} />
      <div className="zec-blocks">
        {blocks.map((block) => (
          <div key={block.id} className="zec-block-wrap">
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>
    </article>
  );
}
