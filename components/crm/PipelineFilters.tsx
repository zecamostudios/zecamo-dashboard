"use client";

import { Filter } from "lucide-react";
import { OWNERS, LINES } from "@/lib/mock-data";
import { Chip } from "@/components/ui-zecamo/Chip";
import { Button } from "@/components/ui-zecamo/Button";
import type { OwnerId, ServiceLine } from "@/lib/types";

interface PipelineFiltersProps {
  ownerFilter: OwnerId | "all";
  onOwnerChange: (v: OwnerId | "all") => void;
  lineFilter: ServiceLine | "all";
  onLineChange: (v: ServiceLine | "all") => void;
}

export function PipelineFilters({ ownerFilter, onOwnerChange, lineFilter, onLineChange }: PipelineFiltersProps) {
  return (
    <div className="flex items-center gap-2 mb-[18px] flex-wrap">
      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mr-1">Owner:</span>
      <Chip active={ownerFilter === "all"} onClick={() => onOwnerChange("all")}>Todos</Chip>
      {OWNERS.map((o) => (
        <Chip key={o.id} active={ownerFilter === o.id} onClick={() => onOwnerChange(o.id)}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: o.color }} />
          {o.short}
        </Chip>
      ))}
      <span className="w-px h-[18px] bg-[var(--color-border-2)] mx-2" />
      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mr-1">Línea:</span>
      <Chip active={lineFilter === "all"} onClick={() => onLineChange("all")}>Todas</Chip>
      {LINES.map((l) => (
        <Chip key={l.id} active={lineFilter === l.id} onClick={() => onLineChange(l.id)}>{l.id}</Chip>
      ))}
      <span className="flex-1" />
      <Button variant="ghost" className="text-xs">
        <Filter size={12} />Más filtros
      </Button>
    </div>
  );
}
