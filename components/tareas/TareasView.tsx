"use client";

import { useState, useMemo } from "react";
import { Plus, Filter, X, Trash2 } from "lucide-react";
import { OWNERS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLiveRows } from "@/lib/hooks/useLiveRows";
import { TASK_COLS, rowToTask } from "@/lib/db/mappers";
import type { Task, TaskStatus, OwnerId, Priority } from "@/lib/types";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Tabs } from "@/components/ui-zecamo/Tabs";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { TaskBoard } from "./TaskBoard";

type View = "equipo" | "mias";

const PRIO_OPTS: { value: Priority; label: string }[] = [
  { value: "alta",  label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja",  label: "Baja" },
];

const STATUS_TO_ESTADO: Record<TaskStatus, string> = {
  hacer: "todo", curso: "doing", review: "review", hecho: "done",
};

interface TareasViewProps {
  initialTasks?: Task[];
}

interface TaskForm {
  titulo: string;
  prioridad: Priority;
  owner: OwnerId;
  fechaLimite: string;
  status: TaskStatus;
}

let _counter = 9000;

export function TareasView({ initialTasks }: TareasViewProps) {
  const [tasks, setTasks] = useLiveRows(initialTasks ?? [], {
    table: "tareas", columns: TASK_COLS, order: { column: "created_at" }, map: rowToTask,
  });
  const [view, setView] = useState<View>("equipo");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPrio, setFilterPrio] = useState<Priority | "">("");
  const [filterOwner, setFilterOwner] = useState<OwnerId | "">("");
  const [form, setForm] = useState<TaskForm>({ titulo: "", prioridad: "media", owner: "JS", fechaLimite: "", status: "hacer" });
  const meId = "JS" as const;
  const supabase = createClient();

  const filtered = useMemo(() => {
    let base = view === "mias" ? tasks.filter((t) => t.owner === meId) : tasks;
    if (filterPrio) base = base.filter((t) => t.prio === filterPrio);
    if (filterOwner) base = base.filter((t) => t.owner === filterOwner);
    return base;
  }, [tasks, view, meId, filterPrio, filterOwner]);

  const pending = filtered.filter((t) => t.status !== "hecho").length;
  const done    = filtered.filter((t) => t.status === "hecho").length;

  function openNew(defaultStatus: TaskStatus = "hacer") {
    setEditing(null);
    setForm({ titulo: "", prioridad: "media", owner: "JS", fechaLimite: "", status: defaultStatus });
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setForm({
      titulo: task.text,
      prioridad: task.prio,
      owner: task.owner,
      fechaLimite: task.due === "Sin fecha" ? "" : task.due,
      status: task.status,
    });
    setModalOpen(true);
  }

  async function saveTask() {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      if (editing?.dbId) {
        // UPDATE
        const { error } = await supabase.from("tareas").update({
          titulo: form.titulo,
          prioridad: form.prioridad,
          asignado_initials: form.owner,
          fecha_limite: form.fechaLimite || null,
          estado: STATUS_TO_ESTADO[form.status],
          updated_at: new Date().toISOString(),
        }).eq("id", editing.dbId);
        if (error) throw error;
        setTasks((prev) => prev.map((t) => t.id === editing.id
          ? { ...t, text: form.titulo, prio: form.prioridad, owner: form.owner, status: form.status,
              due: form.fechaLimite ? new Date(form.fechaLimite).toLocaleDateString("es-AR", { day: "numeric", month: "short" }) : "Sin fecha" }
          : t,
        ));
        toast.success("Tarea actualizada");
      } else {
        // CREATE
        const { data, error } = await supabase.from("tareas").insert({
          titulo: form.titulo,
          prioridad: form.prioridad,
          asignado_initials: form.owner,
          fecha_limite: form.fechaLimite || null,
          estado: STATUS_TO_ESTADO[form.status],
        }).select("id").single();
        if (error) throw error;
        const newTask: Task = {
          id: ++_counter,
          dbId: data?.id ?? "",
          text: form.titulo,
          status: form.status,
          prio: form.prioridad,
          owner: form.owner,
          due: form.fechaLimite ? new Date(form.fechaLimite).toLocaleDateString("es-AR", { day: "numeric", month: "short" }) : "Sin fecha",
          proj: "General",
          tags: [],
        };
        setTasks((prev) => [newTask, ...prev]);
        toast.success("Tarea creada");
      }
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message ?? "Error al guardar");
    }
    setSaving(false);
  }

  async function deleteTask() {
    if (!editing?.dbId) return;
    const { error } = await supabase.from("tareas").delete().eq("id", editing.dbId);
    if (error) { toast.error(error.message); return; }
    setTasks((prev) => prev.filter((t) => t.id !== editing.id));
    setModalOpen(false);
    toast.success("Tarea eliminada");
  }

  return (
    <>
      <PageHead
        title="Tareas"
        subtitle={`${pending} pendientes · ${done} completadas`}
        actions={
          <>
            <Tabs
              value={view}
              onChange={(v) => setView(v as View)}
              tabs={[
                { value: "equipo", label: "Equipo" },
                { value: "mias",   label: "Mis tareas" },
              ]}
            />
            <Button onClick={() => setShowFilters((v) => !v)}><Filter size={13} />Filtros{(filterPrio || filterOwner) ? " ●" : ""}</Button>
            <Button variant="primary" onClick={() => openNew()}>
              <Plus size={14} />Nueva tarea
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="mb-4 px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-4 flex-wrap">
          <span className="text-[11.5px] font-medium text-[var(--color-text-muted)] uppercase tracking-[0.06em]">Filtros</span>
          <select
            value={filterPrio}
            onChange={(e) => setFilterPrio(e.target.value as Priority | "")}
            className="rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition appearance-none"
          >
            <option value="">Todas las prioridades</option>
            {PRIO_OPTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value as OwnerId | "")}
            className="rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition appearance-none"
          >
            <option value="">Todos los owners</option>
            {OWNERS.map((o) => <option key={o.id} value={o.id}>{o.short}</option>)}
          </select>
          {(filterPrio || filterOwner) && (
            <button
              onClick={() => { setFilterPrio(""); setFilterOwner(""); }}
              className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] bg-transparent border-0 cursor-pointer transition"
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {view === "equipo" && (
        <div className="grid grid-cols-12 gap-[14px] mb-[14px]">
          {OWNERS.map((o) => {
            const owned = tasks.filter((t) => t.owner === o.id);
            const doneCount = owned.filter((t) => t.status === "hecho").length;
            const pct = owned.length ? (doneCount / owned.length) * 100 : 0;
            const color = pct > 60 ? "var(--color-success)" : pct > 30 ? "var(--color-warning)" : "var(--color-text)";
            return (
              <div key={o.id} className="col-span-4 max-[900px]:col-span-12 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[22px]">
                <div className="flex items-center gap-3">
                  <OwnerAvatar id={o.id} size="lg" />
                  <div className="flex-1">
                    <div className="text-[14.5px] font-medium font-[family-name:var(--font-display)]">{o.name}</div>
                    <div className="text-[11.5px] text-[var(--color-text-muted)]">
                      {owned.filter((t) => t.status !== "hecho").length} pendientes · {doneCount} hechas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[22px] font-semibold font-[family-name:var(--font-display)] tracking-tight" style={{ color }}>
                      {Math.round(pct)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.05em] text-[var(--color-text-muted)]">Progreso</div>
                  </div>
                </div>
                <div className="bg-white/[0.05] rounded-full overflow-hidden mt-3" style={{ height: 4 }}>
                  <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskBoard tasks={filtered} setTasks={setTasks} onNewTask={openNew} onEditTask={openEdit} />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">{editing ? "Editar tarea" : "Nueva tarea"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Título *</label>
                <input
                  autoFocus
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && saveTask()}
                  placeholder="Descripción de la tarea..."
                  className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13.5px] px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-[var(--color-primary-hover)] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                    className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition appearance-none"
                  >
                    <option value="hacer">Por hacer</option>
                    <option value="curso">En curso</option>
                    <option value="review">En review</option>
                    <option value="hecho">Completada</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value as Priority }))}
                    className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition appearance-none"
                  >
                    {PRIO_OPTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Asignado</label>
                  <select
                    value={form.owner}
                    onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value as OwnerId }))}
                    className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition appearance-none"
                  >
                    {OWNERS.map((o) => <option key={o.id} value={o.id}>{o.short}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Fecha límite</label>
                  <input
                    type="date"
                    value={form.fechaLimite}
                    onChange={(e) => setForm((f) => ({ ...f, fechaLimite: e.target.value }))}
                    className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              {editing && (
                <button
                  onClick={deleteTask}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 border-0 bg-transparent cursor-pointer transition mr-auto"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] bg-transparent cursor-pointer transition">
                Cancelar
              </button>
              <button
                onClick={saveTask}
                disabled={saving || !form.titulo.trim()}
                className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Guardando…" : editing ? "Guardar" : "Crear tarea"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
