"use client";

import { useState } from "react";
import { Plus, Search, User, DollarSign, TrendingUp, Check } from "lucide-react";
import { CLIENTS, LINES } from "@/lib/mock-data";
import { fmtN } from "@/lib/utils";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";
import { ClientesTable } from "./ClientesTable";
import { ClienteDetail } from "./ClienteDetail";
import type { Client, ClientStatus, ServiceLine } from "@/lib/types";

export function ClientesView() {
  const [selected, setSelected] = useState<Client | null>(null);
  const [lineFilter, setLineFilter] = useState<ServiceLine | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [search, setSearch] = useState("");

  if (selected) {
    return <ClienteDetail client={selected} onBack={() => setSelected(null)} />;
  }

  // TODO: reemplazar por query a Supabase tabla `clients`
  const filtered = CLIENTS.filter(
    (c) =>
      (lineFilter === "all" || c.line === lineFilter) &&
      (statusFilter === "all" || c.status === statusFilter) &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase())),
  );

  const active = CLIENTS.filter((c) => c.status === "active").length;
  const totalMrr = CLIENTS.filter((c) => c.status === "active").reduce((s, c) => s + c.mrr, 0);
  const STATUSES: { id: ClientStatus | "all"; l: string }[] = [
    { id: "all", l: "Todos" },
    { id: "active", l: "Activos" },
    { id: "onboarding", l: "Onboarding" },
    { id: "paused", l: "Pausados" },
  ];

  return (
    <>
      <PageHead
        title="Clientes"
        subtitle={`${active} activos · MRR $${fmtN(totalMrr)} · ${CLIENTS.length} totales`}
        actions={
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-xl text-[13px] w-56">
              <Search size={14} />
              <input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 outline-none bg-transparent flex-1 text-[var(--color-text)]"
              />
            </div>
            <Button variant="primary"><Plus size={14} />Nuevo cliente</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Activos" icon={User} value={active} sub={`de ${CLIENTS.length} totales`} />
        <StatCard label="MRR total" icon={DollarSign} currency="$" value={fmtN(totalMrr)} delta={{ value: "+12%", direction: "up" }} />
        <StatCard label="Health promedio" icon={TrendingUp} value="79" unit="/100" sub="2 en riesgo" />
        <StatCard label="Retención 90d" icon={Check} value="94" unit="%" delta={{ value: "+4%", direction: "up" }} />
      </StatGrid>

      <div className="flex items-center gap-2 mb-[18px] flex-wrap">
        <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Línea:</span>
        <Chip active={lineFilter === "all"} onClick={() => setLineFilter("all")}>Todas</Chip>
        {LINES.map((l) => (
          <Chip key={l.id} active={lineFilter === l.id} onClick={() => setLineFilter(l.id)}>{l.id}</Chip>
        ))}
        <span className="w-px h-[18px] bg-[var(--color-border-2)] mx-2" />
        <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Estado:</span>
        {STATUSES.map((s) => (
          <Chip key={s.id} active={statusFilter === s.id} onClick={() => setStatusFilter(s.id)}>{s.l}</Chip>
        ))}
      </div>

      <ClientesTable clients={filtered} onSelect={setSelected} />
    </>
  );
}
