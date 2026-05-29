"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PROJECTS, LINES, OWNERS } from "@/lib/mock-data";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import { ViewToggle } from "./ViewToggle";
import { ProjectsKanban } from "./ProjectsKanban";
import { ProjectsList } from "./ProjectsList";
import { ProjectDetail } from "./ProjectDetail";
import type { OwnerId, Project, ServiceLine } from "@/lib/types";

interface ProyectosViewProps {
  initialProjects?: Project[];
}

const MODAL_INPUT = "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition";

export function ProyectosView({ initialProjects }: ProyectosViewProps) {
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [lineFilter, setLineFilter] = useState<ServiceLine | "all">("all");
  const [ownerFilter, setOwnerFilter] = useState<OwnerId | "all">("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", line: "Webs", owner: "JS" });

  if (selected) return <ProjectDetail project={selected} onBack={() => setSelected(null)} />;

  const allProjects = initialProjects ?? PROJECTS;

  const filtered = allProjects.filter(
    (p) =>
      (lineFilter === "all" || p.line === lineFilter) &&
      (ownerFilter === "all" || p.owner === ownerFilter),
  );

  return (
    <>
      <PageHead
        title="Proyectos"
        subtitle={`${allProjects.filter((p) => p.status === "curso").length} en curso · ${allProjects.filter((p) => p.status === "review").length} en review · ${allProjects.filter((p) => p.status === "entregado").length} entregados`}
        actions={
          <>
            <ViewToggle value={view} onChange={setView} />
            <Button variant="primary" onClick={() => setShowModal(true)}><Plus size={14} />Nuevo proyecto</Button>
          </>
        }
      />

      <div className="flex items-center gap-2 mb-[18px] flex-wrap">
        <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Línea:</span>
        <Chip active={lineFilter === "all"} onClick={() => setLineFilter("all")}>Todas</Chip>
        {LINES.map((l) => (
          <Chip key={l.id} active={lineFilter === l.id} onClick={() => setLineFilter(l.id)}>{l.id}</Chip>
        ))}
        <span className="w-px h-[18px] bg-[var(--color-border-2)] mx-2" />
        <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Owner:</span>
        <Chip active={ownerFilter === "all"} onClick={() => setOwnerFilter("all")}>Todos</Chip>
        {OWNERS.map((o) => (
          <Chip key={o.id} active={ownerFilter === o.id} onClick={() => setOwnerFilter(o.id)}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: o.color }} />
            {o.short}
          </Chip>
        ))}
      </div>

      {view === "kanban" ? (
        <ProjectsKanban projects={filtered} onSelect={setSelected} />
      ) : (
        <ProjectsList projects={filtered} onSelect={setSelected} />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">Nuevo proyecto</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Nombre *</label>
                <input autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Web corporativa" className={MODAL_INPUT} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Cliente</label>
                <input value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} placeholder="Nombre del cliente" className={MODAL_INPUT} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Línea</label>
                <select value={form.line} onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))} className={MODAL_INPUT}>
                  {LINES.map((l) => <option key={l.id} value={l.id}>{l.id}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Owner</label>
                <select value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} className={MODAL_INPUT}>
                  {OWNERS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer transition">Cancelar</button>
              <button
                onClick={() => {
                  if (!form.name.trim()) return;
                  toast.success(`Proyecto "${form.name}" creado`);
                  setShowModal(false);
                  setForm({ name: "", client: "", line: "Webs", owner: "JS" });
                }}
                className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition"
              >
                Crear proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
