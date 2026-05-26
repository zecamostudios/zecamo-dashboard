"use client";

import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface TaskBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

interface Col {
  id: TaskStatus;
  l: string;
  color: string;
}

const COLS: Col[] = [
  { id: "hacer", l: "Por hacer", color: "var(--color-text-muted)" },
  { id: "curso", l: "En curso", color: "var(--color-primary-hover)" },
  { id: "review", l: "En review", color: "var(--color-warning)" },
  { id: "hecho", l: "Completada", color: "var(--color-success)" },
];

export function TaskBoard({ tasks, setTasks }: TaskBoardProps) {
  // TODO: reemplazar mover-con-flechas por drag-and-drop con @dnd-kit
  const moveTask = (id: number, dir: "next" | "prev") => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = COLS.findIndex((c) => c.id === t.status);
        const next = dir === "next" ? Math.min(COLS.length - 1, idx + 1) : Math.max(0, idx - 1);
        return { ...t, status: COLS[next].id };
      }),
    );
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
                    onMove={(dir) => moveTask(t.id, dir)}
                  />
                );
              })}
              {items.length === 0 && (
                <div className="py-6 text-center text-[var(--color-text-dim)] text-[12px] border border-dashed border-[var(--color-border-2)] rounded-lg">
                  Sin tareas
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
