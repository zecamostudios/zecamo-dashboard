import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Progress } from "@/components/ui-zecamo/Progress";
import type { Project } from "@/lib/types";

interface ProjectsListProps {
  projects: Project[];
  onSelect: (p: Project) => void;
}

export function ProjectsList({ projects, onSelect }: ProjectsListProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left border-b border-[var(--color-border)]">
            {["Proyecto", "Línea", "Estado", "Progreso", "Inicio", "Deadline", "Equipo"].map((h) => (
              <th key={h} className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium px-[18px] py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} onClick={() => onSelect(p)} className="border-b border-[var(--color-border)] hover:bg-white/[0.02] cursor-pointer">
              <td className="px-[18px] py-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-[11.5px] text-[var(--color-text-muted)]">{p.client}</div>
              </td>
              <td className="px-[18px] py-3"><Pill variant={p.line}>{p.line}</Pill></td>
              <td className="px-[18px] py-3"><Pill variant={p.status} dot>{p.status}</Pill></td>
              <td className="px-[18px] py-3 w-40">
                <div className="flex items-center gap-2">
                  <Progress value={p.progress} className="flex-1" />
                  <span className="font-mono text-[11.5px] text-[var(--color-text-muted)] w-8 text-right">{p.progress}%</span>
                </div>
              </td>
              <td className="px-[18px] py-3 font-mono text-[var(--color-text-muted)]">{p.start}</td>
              <td className="px-[18px] py-3 font-mono text-[var(--color-text-muted)]">{p.due}</td>
              <td className="px-[18px] py-3">
                <div className="flex">
                  {p.team.map((m, i) => (
                    <div key={i} style={{ marginLeft: i > 0 ? -7 : 0 }} className="ring-2 ring-[var(--color-surface)] rounded-full">
                      <OwnerAvatar id={m} size="xs" />
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
