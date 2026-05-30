"use client";

import { useState } from "react";
import { Plus, Search, User, DollarSign, TrendingUp, Check, X } from "lucide-react";
import { toast } from "sonner";
import { CLIENTS, LINES } from "@/lib/mock-data";
import { fmtN } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";
import { ClientesTable } from "./ClientesTable";
import { ClienteDetail } from "./ClienteDetail";
import type { Client, ClientStatus, ServiceLine } from "@/lib/types";

const MODAL_INPUT =
  "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition";

interface ClientesViewProps {
  initialClients?: Client[];
}

export function ClientesView({ initialClients }: ClientesViewProps) {
  const [clients, setClients] = useState<Client[]>(initialClients ?? CLIENTS);
  const [selected, setSelected] = useState<Client | null>(null);
  const [lineFilter, setLineFilter] = useState<ServiceLine | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", line: "Webs", mrr: "", status: "onboarding" });

  if (selected) {
    return (
      <ClienteDetail
        client={selected}
        onBack={() => setSelected(null)}
        onDelete={(dbId) => {
          setClients((prev) => prev.filter((c) => c.dbId !== dbId));
          setSelected(null);
        }}
      />
    );
  }

  const filtered = clients.filter(
    (c) =>
      (lineFilter === "all" || c.line === lineFilter) &&
      (statusFilter === "all" || c.status === statusFilter) &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase())),
  );

  const active = clients.filter((c) => c.status === "active").length;
  const totalMrr = clients
    .filter((c) => c.status === "active")
    .reduce((s, c) => s + c.mrr, 0);

  const STATUSES: { id: ClientStatus | "all"; l: string }[] = [
    { id: "all", l: "Todos" },
    { id: "active", l: "Activos" },
    { id: "onboarding", l: "Onboarding" },
    { id: "paused", l: "Pausados" },
  ];

  async function createCliente() {
    if (!form.name.trim()) return;
    const supabase = createClient();
    const savedForm = { ...form };
    const optimistic: Client = {
      id: clients.length + 1,
      name: savedForm.name.trim(),
      contact: savedForm.contact.trim(),
      line: savedForm.line as ServiceLine,
      mrr: Number(savedForm.mrr) || 0,
      since: "—",
      status: savedForm.status as ClientStatus,
      projects: 0,
      health: 80,
      next: "—",
    };
    setClients((prev) => [optimistic, ...prev]);
    setShowModal(false);
    setForm({ name: "", contact: "", line: "Webs", mrr: "", status: "onboarding" });
    toast.success(`Cliente "${savedForm.name}" creado`);

    const { data, error } = await supabase
      .from("clientes")
      .insert({
        nombre: savedForm.name.trim(),
        contacto_nombre: savedForm.contact.trim() || null,
        linea_servicio: savedForm.line,
        mrr_usd: Number(savedForm.mrr) || 0,
        ui_status: savedForm.status,
        health_score: 80,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Error al guardar en Supabase");
    } else if (data) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === optimistic.id ? { ...c, dbId: String(data.id) } : c,
        ),
      );
    }
  }

  return (
    <>
      <PageHead
        title="Clientes"
        subtitle={`${active} activos · MRR $${fmtN(totalMrr)} · ${clients.length} totales`}
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
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus size={14} />Nuevo cliente
            </Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Activos" icon={User} value={active} sub={`de ${clients.length} totales`} />
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">Nuevo cliente</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Nombre *</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Acme Corp"
                  className={MODAL_INPUT}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Contacto</label>
                <input
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  placeholder="Nombre del contacto"
                  className={MODAL_INPUT}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Línea</label>
                <select
                  value={form.line}
                  onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))}
                  className={MODAL_INPUT}
                >
                  {LINES.map((l) => <option key={l.id} value={l.id}>{l.id}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">MRR (USD)</label>
                <input
                  type="number"
                  value={form.mrr}
                  onChange={(e) => setForm((f) => ({ ...f, mrr: e.target.value }))}
                  placeholder="0"
                  className={MODAL_INPUT}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                onClick={createCliente}
                className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition"
              >
                Crear cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
