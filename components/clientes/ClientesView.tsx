"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, User, DollarSign } from "lucide-react";
import { fmtN } from "@/lib/utils";
import { useLiveRows } from "@/lib/hooks/useLiveRows";
import { CLIENT_COLS, rowToClient } from "@/lib/db/mappers";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";
import { ClientesTable } from "./ClientesTable";
import type { Client, ClientStatus } from "@/lib/types";

/**
 * Se fueron: el modal de "nuevo cliente" (ahora se crea en la ficha, un solo
 * lugar para editar un cliente), el filtro por linea de servicio y las dos
 * tarjetas de health/riesgo, que puntuaban con un numero que nadie cargaba.
 */

interface ClientesViewProps {
  initialClients?: Client[];
}

const ESTADOS: { id: ClientStatus | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Activos" },
  { id: "paused", label: "Pausados" },
];

export function ClientesView({ initialClients }: ClientesViewProps) {
  const router = useRouter();
  const [clients] = useLiveRows(initialClients ?? [], {
    table: "clientes", columns: CLIENT_COLS, order: { column: "mrr_usd" }, map: rowToClient,
  });
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      (statusFilter === "all" || c.status === statusFilter) &&
      (!search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contact.toLowerCase().includes(search.toLowerCase())),
  );

  const activos = clients.filter((c) => c.status === "active").length;
  const mrrTotal = clients.filter((c) => c.status === "active").reduce((s, c) => s + c.mrr, 0);

  return (
    <>
      <PageHead
        title="Clientes"
        subtitle={`${activos} activos · $${fmtN(mrrTotal)} por mes · ${clients.length} en total`}
        actions={
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-xl text-[13px] w-56">
              <Search size={14} className="text-[var(--color-text-muted)]" />
              <input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 outline-none bg-transparent flex-1 text-[var(--color-text)]"
              />
            </div>
            <Link href="/clientes/nuevo">
              <Button variant="primary">
                <Plus size={14} />Nuevo cliente
              </Button>
            </Link>
          </>
        }
      />

      <StatGrid cols={3}>
        <StatCard label="Activos" icon={User} value={activos} sub={`de ${clients.length} en total`} />
        <StatCard
          featured
          label="Por mes"
          icon={DollarSign}
          currency="$"
          value={fmtN(mrrTotal)}
          unit="/mo"
          sub="suma de los activos"
        />
        <StatCard
          label="Promedio"
          icon={DollarSign}
          currency="$"
          value={fmtN(activos ? Math.round(mrrTotal / activos) : 0)}
          sub="por cliente activo"
        />
      </StatGrid>

      <div className="flex items-center gap-2 mb-[18px] flex-wrap">
        {ESTADOS.map((e) => (
          <Chip key={e.id} active={statusFilter === e.id} onClick={() => setStatusFilter(e.id)}>
            {e.label}
          </Chip>
        ))}
      </div>

      <ClientesTable
        clients={filtered}
        onSelect={(c) => {
          if (c.dbId) router.push(`/clientes/${c.dbId}`);
        }}
      />
    </>
  );
}
