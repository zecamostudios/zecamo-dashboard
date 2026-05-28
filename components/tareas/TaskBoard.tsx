"use client";

import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface TaskBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onNewTask?: (col: TaskStatus) => void;
  onEditTask?: (task: Task) => void;
}

interface Col {
  id: TaskStatus;
  l: string;
  color: string;
  estado: string;
}

const COLS: Col[] = [
  { id: "hacer",  l: "Por hacer",   color: "var(--color-text-muted)",    estado: "todo"   },
  { id: "curso",  l: "En curso",    color: "var(--color-primary-hover)", estado: "doing"  },
  { id: "review", l: "En review",   color: "var(--color-warning)",       estado: "review" },
  { id: "hecho",  l: "Completada",  color: "var(--color-success)",       estado: "done"   },
];

export function TaskBoard({ tasks, setTasks, onNewTask, onEditTask }: TaskBoardProps) {
  const supabase = createClient();

  const moveTask = async (task: Task, dir: "next" | "prev") => {
    const idx = COLS.findIndex((c) => c.id === task.status);
    const nextIdx = dir === "next" ? Math.min(COLS.length - 1, idx + 1) : Math.max(0, idx - 1);
    if (nextIdx === idx) return;
    const newStatus = COLS[nextIdx].id;
    const newEstado = COLS[nextIdx].estado;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));

    if (task.dbId) {
      const { error } = await supabase
        .from("tareas")
        .update({ estado: newEstado, updated_at: new Date().toISOString() })
        .eq("id", task.dbId);

      if (error) {
        // Revert on failure
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      }
    }
  };

  return (
    <div className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
      {COLS.map((col) => {
        const items = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            className="bg-white/[0.015] border border-[var(--color-border)] rounded-2xl p-3"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: col.color, boxShadow: `0 0 6px ${col.color}` }}
                />
                <span className="text-[13px] font-medium">{col.l}</span>
                <span className="font-mono text-[11px] text-[var(--color-text-muted)]">{items.length}</span>
              </div>
              <button
                onClick={() => onNewTask?.(col.id)}
                className="w-6 h-6 grid place-items-center bg-transparent border-0 text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text)]"
                aria-label="Agregar tarea"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((t) => {
                const idx = COLS.findIndex((c) => c.id === t.status);
                return (
                  <TaskCard
                    key={t.id}
                    task={t}
                    canPrev={idx > 0}
                    canNext={idx < COLS.length - 1}
                    onMove={(dir) => moveTask(t, dir)}
                    onEdit={onEditTask}
                  />
                );
              })}
              {items.length === 0 && (
                <button
                  onClick={() => onNewTask?.(col.id)}
                  className="py-6 text-center text-[var(--color-text-dim)] text-[12px] border border-dashed border-[var(--color-border-2)] rounded-lg w-full bg-transparent cursor-pointer hover:border-[var(--color-border)] transition"
                >
                  + Agregar tarea
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
