"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PROJECTS, LINES, OWNERS } from "@/lib/mock-data";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import { ViewToggle } from "./ViewToggle";
import { ProjectsKanban } from "./ProjectsKanban";
import { ProjectsList } from "./ProjectsList";
import { ProjectDetail } from "./ProjectDetail";
import type { OwnerId, Project, ServiceLine } from "@/lib/types";

export function ProyectosView() {
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [lineFilter, setLineFilter] = useState<ServiceLine | "all">("all");
  const [ownerFilter, setOwnerFilter] = useState<OwnerId | "all">("all");
  const [selected, setSelected] = useState<Project | null>(null);

  if (selected) return <ProjectDetail project={selected} onBack={() => setSelected(null)} />;

  // TODO: reemplazar por query a Supabase tabla `projects`
  const filtered = PROJECTS.filter(
    (p) =>
      (lineFilter === "all" || p.line === lineFilter) &&
      (ownerFilter === "all" || p.owner === ownerFilter),
  );

  return (
    <>
      <PageHead
        title="Proyectos"
        subtitle={`${PROJECTS.filter((p) => p.status === "curso").length} en curso · ${PROJECTS.filter((p) => p.status === "review").length} en review · ${PROJECTS.filter((p) => p.status === "entregado").length} entregados`}
        actions={
          <>
            <ViewToggle value={view} onChange={setView} />
            <Button variant="primary"><Plus size={14} />Nuevo proyecto</Button>
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
    </>
  );
}
