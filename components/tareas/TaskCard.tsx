"use client";

import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  canPrev: boolean;
  canNext: boolean;
  onMove: (dir: "next" | "prev") => void;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, canPrev, canNext, onMove, onEdit }: TaskCardProps) {
  return (
    <div
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 cursor-pointer transition-[border-color,background-color] duration-[140ms] ease-out [@media(hover:hover)]:hover:border-[var(--color-border-2)]"
      onClick={() => onEdit?.(task)}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="text-[13px] leading-snug">{task.text}</div>
        {task.prio === "alta" && (
          <span className="text-[var(--color-warning)] shrink-0" title="Prioridad alta">
            <Flame size={12} />
          </span>
        )}
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10.5px] text-[var(--color-text-muted)] font-[family-name:var(--font-mono)] truncate">
            {task.proj !== "General" ? `${task.proj} · ` : ""}{task.due}
          </span>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {canPrev && (
            <button
              onClick={() => onMove("prev")}
              className="p-0.5 bg-transparent border-0 text-[var(--color-text-dim)] cursor-pointer transition-[color,transform] duration-[140ms] ease-out active:scale-[0.92] [@media(hover:hover)]:hover:text-[var(--color-text)]"
              title="Mover atrás"
            >
              <ChevronLeft size={11} />
            </button>
          )}
          {canNext && (
            <button
              onClick={() => onMove("next")}
              className="p-0.5 bg-transparent border-0 text-[var(--color-primary-hover)] cursor-pointer"
              title="Avanzar"
            >
              <ChevronRight size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
