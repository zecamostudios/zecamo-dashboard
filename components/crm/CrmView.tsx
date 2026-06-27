"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Target, Clock, DollarSign, Bell } from "lucide-react";
import { fmtN, fmtUsd } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";
import { KanbanBoard } from "./KanbanBoard";
import { PipelineFilters } from "./PipelineFilters";
import type { OwnerId, Prospect, ServiceLine, StageId } from "@/lib/types";

const ACTIVE_STAGES: StageId[] = ["lead", "discovery", "call1", "propuesta", "call2", "venta"];

interface CrmViewProps {
  initialProspects?: Prospect[];
}

export function CrmView({ initialProspects }: CrmViewProps) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects ?? []);
  const [ownerFilter, setOwnerFilter] = useState<OwnerId | "all">("all");
  const [lineFilter,  setLineFilter]  = useState<ServiceLine | "all">("all");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const filtered = useMemo(
    () => prospects.filter(
      (p) =>
        (ownerFilter === "all" || p.owner === ownerFilter) &&
        (lineFilter  === "all" || p.line  === lineFilter)  &&
        (!search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.company.toLowerCase().includes(search.toLowerCase())),
    ),
    [prospects, ownerFilter, lineFilter, search],
  );

  const totalValue  = filtered.reduce((s, p) => s + p.value, 0);
  const won         = filtered.filter((p) => p.stage === "venta").length;
  const convRate    = filtered.length ? Math.round((won / filtered.length) * 100) : 0;
  const avgDeal     = filtered.length ? Math.round(totalValue / filtered.length) : 0;
  const activos     = filtered.filter((p) => ["lead", "discovery", "call1", "propuesta", "call2"].includes(p.stage)).length;
  const porRellamar = filtered.filter((p) => p.recall).length;

  async function moveProspect(prospect: Prospect, dir: "prev" | "next") {
    const idx = ACTIVE_STAGES.indexOf(prospect.stage as StageId);
    if (idx === -1) return;
    const nextIdx = dir === "next" ? Math.min(ACTIVE_STAGES.length - 1, idx + 1) : Math.max(0, idx - 1);
    if (nextIdx === idx) return;
    const newStage = ACTIVE_STAGES[nextIdx];

    // Optimistic update
    setProspects((prev) => prev.map((p) => p.id === prospect.id ? { ...p, stage: newStage } : p));

    if (prospect.dbId) {
      const { error } = await supabase
        .from("prospectos")
        .update({ etapa: newStage, updated_at: new Date().toISOString() })
        .eq("id", prospect.dbId);

      if (error) {
        setProspects((prev) => prev.map((p) => p.id === prospect.id ? { ...p, stage: prospect.stage } : p));
        toast.error("Error al mover el prospecto");
      }
    }
  }

  return (
    <>
      <PageHead
        title={<>CRM <em className="not-italic font-light text-[var(--color-text-muted)]">· pipeline</em></>}
        subtitle={`${filtered.length} prospectos · ${fmtUsd(totalValue)} en el funnel · ${convRate}% conversión`}
        actions={
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-xl text-[13px] text-[var(--color-text-muted)] w-60">
              <Search size={14} />
              <input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 outline-none bg-transparent flex-1 text-[var(--color-text)]"
              />
            </div>
            <Link href="/crm/nuevo">
              <Button variant="primary">
                <Plus size={14} />Nuevo prospecto
              </Button>
            </Link>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Conversión"    icon={Target}     value={convRate}        unit="%" sub={`${won} ${won === 1 ? "venta" : "ventas"} de ${filtered.length}`} />
        <StatCard label="Activos"       icon={Clock}      value={activos}                  sub="en pipeline abierto" />
        <StatCard label="Deal promedio" icon={DollarSign} currency="$" value={fmtN(avgDeal)} sub="valor medio en el funnel" />
        <StatCard label="Por rellamar"  icon={Bell}       value={porRellamar}              sub={porRellamar === 1 ? "prospecto pendiente" : "prospectos pendientes"} />
      </StatGrid>

      <PipelineFilters
        ownerFilter={ownerFilter}
        onOwnerChange={setOwnerFilter}
        lineFilter={lineFilter}
        onLineChange={setLineFilter}
      />

      <KanbanBoard prospects={filtered} onMove={moveProspect} />
    </>
  );
}
