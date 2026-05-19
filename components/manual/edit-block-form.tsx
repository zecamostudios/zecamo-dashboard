"use client";

import { updateBlock } from "@/app/manual/[slug]/edit/actions";

type Block = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content_md: string | null;
  variant: string | null;
};

const REF_TYPES = ["principle", "team_member", "service_line", "script", "objection", "playbook", "pipeline_stage", "pricing_floor", "roadmap_month"];

export function EditBlockForm({ block, slug }: { block: Block; slug: string }) {
  const isRef = REF_TYPES.includes(block.type);

  if (isRef) {
    return (
      <div className="zec-edit-card">
        <div className="zec-edit-ref-note">
          <p>Este bloque es de tipo <strong>{block.type}</strong> y su contenido viene de una tabla referenciada en la base de datos.</p>
          <p>Para editar su contenido, modificá directamente el registro en Supabase:</p>
          <ul>
            {block.type === "principle" && <li>Tabla: <code>principles</code></li>}
            {block.type === "team_member" && <li>Tabla: <code>team_members</code></li>}
            {block.type === "service_line" && <li>Tabla: <code>service_lines_config</code></li>}
            {block.type === "script" && <li>Tabla: <code>scripts</code></li>}
            {block.type === "objection" && <li>Tabla: <code>scripts</code> (type = objection)</li>}
            {block.type === "playbook" && <li>Tablas: <code>playbooks</code> + <code>playbook_steps</code></li>}
            {block.type === "pipeline_stage" && <li>Tabla: <code>pipeline_stages</code></li>}
            {block.type === "pricing_floor" && <li>Tabla: <code>pricing_floors</code></li>}
            {block.type === "roadmap_month" && <li>Tabla: <code>roadmap_months</code></li>}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <form action={updateBlock} className="zec-edit-card">
      <input type="hidden" name="blockId" value={block.id} />
      <input type="hidden" name="slug" value={slug} />

      <div className="zec-edit-field">
        <label className="zec-edit-label">Título (opcional)</label>
        <input
          name="title"
          className="zec-edit-input"
          defaultValue={block.title ?? ""}
          placeholder="Título del bloque"
        />
      </div>

      {block.type === "callout" && (
        <div className="zec-edit-field">
          <label className="zec-edit-label">Variante</label>
          <select name="variant" className="zec-edit-input" defaultValue={block.variant ?? "info"}>
            <option value="info">Info</option>
            <option value="warn">Advertencia</option>
            <option value="tip">Tip</option>
            <option value="danger">Danger</option>
            <option value="success">Success</option>
          </select>
        </div>
      )}

      <div className="zec-edit-field">
        <label className="zec-edit-label">Contenido (Markdown)</label>
        <textarea
          name="content_md"
          className="zec-edit-textarea"
          defaultValue={block.content_md ?? ""}
          rows={20}
          placeholder="Escribí el contenido en Markdown..."
        />
      </div>

      <div className="zec-edit-actions">
        <button type="submit" className="zec-edit-btn-save">Guardar</button>
        <a href={`/manual/${slug}`} className="zec-edit-btn-cancel">Cancelar</a>
      </div>
    </form>
  );
}
