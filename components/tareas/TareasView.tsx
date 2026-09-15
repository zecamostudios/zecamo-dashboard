"use client";

import { useState } from "react";
import { Plus, X, Trash2, Flame } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useLiveRows } from "@/lib/hooks/useLiveRows";
import { TASK_COLS, rowToTask } from "@/lib/db/mappers";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { TaskBoard } from "./TaskBoard";
import type { Task, TaskStatus } from "@/lib/types";

/**
 * Se fueron las pestañas Equipo / Mis tareas, las tres tarjetas de progreso por
 * owner y el panel de filtros por prioridad y owner: en un estudio de una sola
 * persona eran decoracion. Del formulario salieron el asignado y la prioridad
 * de tres niveles, que ahora es un solo toggle "urgente".
 */

const STATUS_TO_ESTADO: Record<TaskStatus, string> = {
  hacer: "todo",
  curso: "doing",
  review: "review",
  hecho: "done",
};

const STATUS_LABELS: { value: TaskStatus; label: string }[] = [
  { value: "hacer", label: "Por hacer" },
  { value: "curso", label: "En curso" },
  { value: "review", label: "En review" },
  { value: "hecho", label: "Hecha" },
];

const INPUT =
  "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13.5px] px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] outline-none transition-[background-color,border-color] duration-[140ms] ease-out focus:border-[var(--color-primary-hover)]";

interface TareasViewProps {
  initialTasks?: Task[];
  proyectos?: { id: string; nombre: string }[];
}

interface TaskForm {
  titulo: string;
  proyectoId: string;
  fechaLimite: string;
  status: TaskStatus;
  urgente: boolean;
}

const FORM_VACIO: TaskForm = {
  titulo: "",
  proyectoId: "",
  fechaLimite: "",
  status: "hacer",
  urgente: false,
};

let _counter = 9000;

export function TareasView({ initialTasks, proyectos = [] }: TareasViewProps) {
  const supabase = createClient();
  const [tasks, setTasks] = useLiveRows(initialTasks ?? [], {
    table: "tareas", columns: TASK_COLS, order: { column: "created_at" }, map: rowToTask,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TaskForm>(FORM_VACIO);

  const pendientes = tasks.filter((t) => t.status !== "hecho").length;
  const hechas = tasks.length - pendientes;

  function openNew(status: TaskStatus = "hacer") {
    setEditing(null);
    setForm({ ...FORM_VACIO, status });
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setForm({
      titulo: task.text,
      proyectoId: task.projectId ?? "",
      fechaLimite: task.dueAt ?? "",
      status: task.status,
      urgente: task.prio === "alta",
    });
    setModalOpen(true);
  }

  async function saveTask() {
    if (!form.titulo.trim()) return;
    setSaving(true);

    const proyecto = proyectos.find((p) => p.id === form.proyectoId);
    const payload = {
      titulo: form.titulo.trim(),
      prioridad: form.urgente ? "alta" : "media",
      fecha_limite: form.fechaLimite || null,
      estado: STATUS_TO_ESTADO[form.status],
      proyecto_id: form.proyectoId || null,
      proyecto_nombre: proyecto?.nombre ?? null,
    };

    if (editing?.dbId) {
      const { error } = await supabase
        .from("tareas")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editing.dbId);
      if (error) {
        toast.error("No se guardó: " + error.message);
        setSaving(false);
        return;
      }
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editing.id
            ? {
                ...t,
                text: payload.titulo,
                prio: form.urgente ? "alta" : "media",
                status: form.status,
                projectId: form.proyectoId || undefined,
                proj: proyecto?.nombre ?? "General",
                dueAt: form.fechaLimite || undefined,
                due: form.fechaLimite
                  ? new Date(`${form.fechaLimite}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
                  : "Sin fecha",
                done: form.status === "hecho",
              }
            : t,
        ),
      );
      toast.success("Guardado");
    } else {
      const { data, error } = await supabase.from("tareas").insert(payload).select("id").single();
      if (error) {
        toast.error("No se guardó: " + error.message);
        setSaving(false);
        return;
      }
      setTasks((prev) => [
        {
          id: ++_counter,
          dbId: data ? String(data.id) : undefined,
          text: payload.titulo,
          status: form.status,
          prio: form.urgente ? "alta" : "media",
          due: form.fechaLimite
            ? new Date(`${form.fechaLimite}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
            : "Sin fecha",
          dueAt: form.fechaLimite || undefined,
          owner: "JS",
          proj: proyecto?.nombre ?? "General",
          projectId: form.proyectoId || undefined,
          tags: [],
          done: form.status === "hecho",
        },
        ...prev,
      ]);
      toast.success("Tarea creada");
    }

    setModalOpen(false);
    setSaving(false);
  }

  async function deleteTask() {
    if (!editing?.dbId) return;
    if (!confirm(`¿Borrar "${editing.text}"?`)) return;
    const { error } = await supabase.from("tareas").delete().eq("id", editing.dbId);
    if (error) {
      toast.error("No se pudo borrar: " + error.message);
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== editing.id));
    setModalOpen(false);
    toast.success("Tarea borrada");
  }

  return (
    <>
      <PageHead
        title="Tareas"
        subtitle={`${pendientes} pendientes · ${hechas} hechas`}
        actions={
          <Button variant="primary" onClick={() => openNew()}>
            <Plus size={14} />Nueva tarea
          </Button>
        }
      />

      <TaskBoard tasks={tasks} setTasks={setTasks} onNewTask={openNew} onEditTask={openEdit} />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">{editing ? "Editar tarea" : "Nueva tarea"}</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
                className="text-[var(--color-text-muted)] [@media(hover:hover)]:hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="tarea-titulo" className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">
                  Tarea
                </label>
                <input
                  id="tarea-titulo"
                  autoFocus
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTask();
                  }}
                  placeholder="Ej: mandarle la propuesta a Pri"
                  className={INPUT}
                />
              </div>

              <div>
                <label htmlFor="tarea-proyecto" className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">
                  Proyecto
                </label>
                <select
                  id="tarea-proyecto"
                  value={form.proyectoId}
                  onChange={(e) => setForm((f) => ({ ...f, proyectoId: e.target.value }))}
                  className={INPUT}
                >
                  <option value="">Sin proyecto</option>
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tarea-fecha" className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">
                    Para cuándo
                  </label>
                  <input
                    id="tarea-fecha"
                    type="date"
                    value={form.fechaLimite}
                    onChange={(e) => setForm((f) => ({ ...f, fechaLimite: e.target.value }))}
                    className={`${INPUT} [color-scheme:dark]`}
                  />
                </div>
                <div>
                  <label htmlFor="tarea-estado" className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">
                    Estado
                  </label>
                  <select
                    id="tarea-estado"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                    className={INPUT}
                  >
                    {STATUS_LABELS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, urgente: !f.urgente }))}
                aria-pressed={form.urgente}
                className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] cursor-pointer transition-[background-color,border-color,color,transform] duration-[140ms] ease-out active:scale-[0.99] ${
                  form.urgente
                    ? "bg-[rgba(240,168,42,0.12)] border-[rgba(240,168,42,0.35)] text-[var(--color-warning)]"
                    : "bg-white/[0.04] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Flame size={14} />
                {form.urgente ? "Urgente" : "Marcar como urgente"}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-6">
              {editing && (
                <button
                  type="button"
                  onClick={deleteTask}
                  aria-label="Borrar tarea"
                  className="p-2 rounded-lg text-[var(--color-text-muted)] [@media(hover:hover)]:hover:text-[var(--color-danger)] border-0 bg-transparent cursor-pointer transition-colors duration-[140ms] ease-out mr-auto"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer transition-colors duration-[140ms] ease-out [@media(hover:hover)]:hover:text-[var(--color-text)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveTask}
                disabled={saving || !form.titulo.trim()}
                className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer transition-[opacity,transform] duration-[140ms] ease-out active:scale-[0.98] disabled:opacity-50"
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
