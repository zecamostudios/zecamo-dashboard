"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, Flame } from "lucide-react";
import { TASKS } from "@/lib/mock-data";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button } from "@/components/ui-zecamo/Button";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface TasksWidgetProps {
  initialTasks?: Task[];
}

export function TasksWidget({ initialTasks }: TasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks ?? TASKS);
  const toggle = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <Card>
      <CardHead>
        <CardTitle big>Tareas de hoy</CardTitle>
        <Link href="/tareas">
          <Button variant="ghost" className="text-xs">Ver todas</Button>
        </Link>
      </CardHead>
      {tasks.slice(0, 6).map((t) => (
        <div key={t.id} className="flex items-start gap-2.5 py-2.5 border-b border-[var(--color-border)]">
          <button
            onClick={() => toggle(t.id)}
            className={cn(
              "w-[18px] h-[18px] mt-0.5 rounded-md border grid place-items-center cursor-pointer shrink-0 transition-all",
              t.done
                ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                : "border-[rgba(255,255,255,0.16)] bg-transparent text-transparent hover:border-[rgba(43,91,255,0.45)]",
            )}
          >
            {t.done && <Check size={12} />}
          </button>
          <div className="flex-1 min-w-0">
            <div className={cn("text-[13px] leading-snug", t.done ? "line-through text-[var(--color-text-dim)]" : "text-[var(--color-text)]")}>
              {t.text}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5 font-mono">
              <span>{t.proj}</span>
              <span className="opacity-40">·</span>
              <span>{t.due}</span>
              {t.prio === "alta" && !t.done && <Flame size={11} className="text-[var(--color-warning)] ml-0.5" />}
            </div>
          </div>
          <OwnerAvatar id={t.owner} size="xs" />
        </div>
      ))}
      <Link href="/tareas" className="block mt-3">
        <Button className="w-full justify-center">
          <Plus size={13} />Agregar tarea
        </Button>
      </Link>
    </Card>
  );
}
