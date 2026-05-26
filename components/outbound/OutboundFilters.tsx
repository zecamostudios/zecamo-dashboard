"use client";

import { Chip } from "@/components/ui-zecamo/Chip";
import type { Owner, OutboundStatus, OwnerId } from "@/lib/types";

interface OutboundFiltersProps {
  owners: Owner[];
  ownerFilter: OwnerId | "all";
  setOwnerFilter: (v: OwnerId | "all") => void;
  statusFilter: OutboundStatus | "all";
  setStatusFilter: (v: OutboundStatus | "all") => void;
}

const STATUS_OPTS: { id: OutboundStatus; l: string }[] = [
  { id: "enviado", l: "Enviado" },
  { id: "respondio", l: "Respondió" },
  { id: "agendado", l: "Agendó call" },
  { id: "no_resp", l: "No respondió" },
];

export function OutboundFilters({
  owners,
  ownerFilter,
  setOwnerFilter,
  statusFilter,
  setStatusFilter,
}: OutboundFiltersProps) {
  return (
    <div className="flex items-center gap-2 mb-[14px] flex-wrap">
      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Owner:</span>
      <Chip active={ownerFilter === "all"} onClick={() => setOwnerFilter("all")}>
        Todos
      </Chip>
      {owners.map((o) => (
        <Chip key={o.id} active={ownerFilter === o.id} onClick={() => setOwnerFilter(o.id)}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: o.color }} />
          {o.short}
        </Chip>
      ))}
      <span className="w-px h-[18px] bg-[var(--color-border-2)] mx-2" />
      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Estado:</span>
      <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
        Todos
      </Chip>
      {STATUS_OPTS.map((s) => (
        <Chip key={s.id} active={statusFilter === s.id} onClick={() => setStatusFilter(s.id)}>
          {s.l}
        </Chip>
      ))}
    </div>
  );
}
