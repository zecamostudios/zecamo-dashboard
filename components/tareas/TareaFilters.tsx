"use client";

import { Chip } from "@/components/ui-zecamo/Chip";
import type { Owner, OwnerId, Priority, TaskStatus } from "@/lib/types";

interface TareaFiltersProps {
  owners: Owner[];
  ownerFilter: OwnerId | "all";
  setOwnerFilter: (v: OwnerId | "all") => void;
  prioFilter: Priority | "all";
  setPrioFilter: (v: Priority | "all") => void;
  statusFilter: TaskStatus | "all";
  setStatusFilter: (v: TaskStatus | "all") => void;
}

const PRIO_OPTS: { id: Priority; l: string }[] = [
  { id: "alta", l: "Alta" },
  { id: "media", l: "Media" },
  { id: "baja", l: "Baja" },
];

const STATUS_OPTS: { id: TaskStatus; l: string }[] = [
  { id: "hacer", l: "Por hacer" },
  { id: "curso", l: "En curso" },
  { id: "review", l: "En review" },
  { id: "hecho", l: "Completada" },
];

export function TareaFilters({
  owners,
  ownerFilter,
  setOwnerFilter,
  prioFilter,
  setPrioFilter,
  statusFilter,
  setStatusFilter,
}: TareaFiltersProps) {
  return (
    <div className="flex items-center gap-2 mb-[14px] flex-wrap">
      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Owner:</span>
      <Chip active={ownerFilter === "all"} onClick={() => setOwnerFilter("all")}>Todos</Chip>
      {owners.map((o) => (
        <Chip key={o.id} active={ownerFilter === o.id} onClick={() => setOwnerFilter(o.id)}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: o.color }} />
          {o.short}
        </Chip>
      ))}
      <span className="w-px h-[18px] bg-[var(--color-border-2)] mx-2" />
      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Prioridad:</span>
      <Chip active={prioFilter === "all"} onClick={() => setPrioFilter("all")}>Todas</Chip>
      {PRIO_OPTS.map((p) => (
        <Chip key={p.id} active={prioFilter === p.id} onClick={() => setPrioFilter(p.id)}>{p.l}</Chip>
      ))}
      <span className="w-px h-[18px] bg-[var(--color-border-2)] mx-2" />
      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Estado:</span>
      <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Todos</Chip>
      {STATUS_OPTS.map((s) => (
        <Chip key={s.id} active={statusFilter === s.id} onClick={() => setStatusFilter(s.id)}>{s.l}</Chip>
      ))}
    </div>
  );
}
