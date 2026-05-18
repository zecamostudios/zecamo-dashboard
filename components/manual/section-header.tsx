import type { ManualSection } from "@/lib/manual/queries";

export function SectionHeader({ section }: { section: ManualSection }) {
  return (
    <div className="zec-section-header">
      <div className="zec-section-eyebrow">
        <span className="zec-dot" />
        {section.number} · {section.category === "operacion" ? "Operación" : "Negocio"}
      </div>
      <h1 className="zec-section-title">{section.title}</h1>
      {section.subtitle && <p className="zec-section-lede">{section.subtitle}</p>}
    </div>
  );
}
