"use client";

import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  canPrev: boolean;
  canNext: boolean;
  onMove: (dir: "next" | "prev") => void;
}

export function TaskCard({ task, canPrev, canNext, onMove }: TaskCardProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:border-[var(--color-border-2)] transition">
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="text-[13px] leading-snug">{task.text}</div>
        {task.prio === "alta" && (
          <span className="text-[var(--color-warning)] shrink-0" title="Prioridad alta">
            <Flame size={12} />
          </span>
        )}
      </div>
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-[7px] py-[2px] bg-white/[0.04] border border-[var(--color-border)] rounded-full text-[var(--color-text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <OwnerAvatar id={task.owner} size="xs" />
          <span className="text-[10.5px] text-[var(--color-text-muted)] font-mono">{task.due}</span>
        </div>
        <div className="flex gap-1">
          {canPrev && (
            <button
              onClick={() => onMove("prev")}
              className="p-0.5 bg-transparent border-0 text-[var(--color-text-dim)] cursor-pointer hover:text-[var(--color-text)]"
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
