"use client";

import { useState, useMemo } from "react";
import { Plus, Filter } from "lucide-react";
import { OWNERS, TASKS } from "@/lib/mock-data";
import type { Task } from "@/lib/types";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Tabs } from "@/components/ui-zecamo/Tabs";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { TaskBoard } from "./TaskBoard";

type View = "equipo" | "mias";

export function TareasView() {
  // TODO: Conectar Supabase tabla `tasks`
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [view, setView] = useState<View>("equipo");
  // TODO: Conectar Supabase Auth — meId vendría de la sesión
  const meId = "JS" as const;

  const filtered = useMemo(
    () => (view === "mias" ? tasks.filter((t) => t.owner === meId) : tasks),
    [tasks, view, meId],
  );

  const pending = filtered.filter((t) => t.status !== "hecho").length;
  const done = filtered.filter((t) => t.status === "hecho").length;

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
                { value: "mias", label: "Mis tareas" },
              ]}
            />
            <Button><Filter size={13} />Filtros</Button>
            <Button variant="primary"><Plus size={14} />Nueva tarea</Button>
          </>
        }
      />

      {view === "equipo" && (
        <div className="grid grid-cols-12 gap-[14px] mb-[14px]">
          {OWNERS.map((o) => {
            const owned = tasks.filter((t) => t.owner === o.id);
            const doneCount = owned.filter((t) => t.status === "hecho").length;
            const pct = owned.length ? (doneCount / owned.length) * 100 : 0;
            const color =
              pct > 60 ? "var(--color-success)" : pct > 30 ? "var(--color-warning)" : "var(--color-text)";
            return (
              <div
                key={o.id}
                className="col-span-4 max-[900px]:col-span-12 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[22px]"
              >
                <div className="flex items-center gap-3">
                  <OwnerAvatar id={o.id} size="lg" />
                  <div className="flex-1">
                    <div className="text-[14.5px] font-medium font-[family-name:var(--font-display)]">
                      {o.name}
                    </div>
                    <div className="text-[11.5px] text-[var(--color-text-muted)]">
                      {owned.filter((t) => t.status !== "hecho").length} pendientes · {doneCount} hechas
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-mono text-[22px] font-semibold font-[family-name:var(--font-display)] tracking-tight"
                      style={{ color }}
                    >
                      {Math.round(pct)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.05em] text-[var(--color-text-muted)]">
                      Progreso
                    </div>
                  </div>
                </div>
                <div className="bg-white/[0.05] rounded-full overflow-hidden mt-3" style={{ height: 4 }}>
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskBoard tasks={filtered} setTasks={setTasks} />
    </>
  );
}
