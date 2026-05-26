import { Plus, Flame } from "lucide-react";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Progress } from "@/components/ui-zecamo/Progress";
import type { Project, ProjectStatus } from "@/lib/types";

const STATUSES: { id: ProjectStatus; l: string }[] = [
  { id: "backlog", l: "Backlog" },
  { id: "curso", l: "En curso" },
  { id: "review", l: "En review" },
  { id: "entregado", l: "Entregado" },
  { id: "archivado", l: "Archivado" },
];

interface ProjectsKanbanProps {
  projects: Project[];
  onSelect: (p: Project) => void;
}

// TODO: usar @dnd-kit/core para drag-drop entre columnas en producción
export function ProjectsKanban({ projects, onSelect }: ProjectsKanbanProps) {
  return (
    <div className="grid grid-cols-5 gap-3.5 overflow-x-auto pb-2 max-[1280px]:grid-cols-3 max-[640px]:grid-cols-1">
      {STATUSES.map((st) => {
        const items = projects.filter((p) => p.status === st.id);
        return (
          <div key={st.id} className="bg-white/[0.015] border border-[var(--color-border)] rounded-2xl p-3 min-w-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Pill variant={st.id} dot>{st.l}</Pill>
                <span className="font-mono text-[11px] text-[var(--color-text-muted)]">{items.length}</span>
              </div>
              <button className="w-6 h-6 grid place-items-center bg-transparent border-0 text-[var(--color-text-muted)] cursor-pointer rounded">
                <Plus size={12} />
              </button>
            </div>
            <div>
              {items.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="bg-white/[0.02] border border-[var(--color-border)] rounded-xl p-3 mb-2 cursor-pointer transition-all hover:bg-white/[0.04] hover:border-[rgba(43,91,255,0.25)]"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium leading-tight mb-0.5">{p.name}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] truncate">{p.client}</div>
                    </div>
                    {p.priority === "alta" && <Flame size={12} className="text-[var(--color-warning)] shrink-0 mt-0.5" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Pill variant={p.line}>{p.line}</Pill>
                  </div>
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10.5px] text-[var(--color-text-dim)] mb-1 font-mono">
                      <span>{p.progress}%</span>
                      <span>{p.due}</span>
                    </div>
                    <Progress value={p.progress} height={4} />
                  </div>
                  <div className="flex mt-2.5">
                    {p.team.map((m, i) => (
                      <div key={i} style={{ marginLeft: i > 0 ? -7 : 0 }} className="ring-2 ring-[var(--color-surface)] rounded-full">
                        <OwnerAvatar id={m} size="xs" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-6 text-center text-[12px] text-[var(--color-text-dim)] border border-dashed border-[var(--color-border-2)] rounded-lg">
                  Sin proyectos
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
