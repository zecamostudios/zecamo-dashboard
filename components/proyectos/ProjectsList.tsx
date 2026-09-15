import { Pill } from "@/components/ui-zecamo/Pill";
import { PROJECT_STATUS_LABELS } from "@/lib/proyectos/estados";
import type { Project } from "@/lib/types";

/**
 * Cuatro columnas. Salieron "Línea", "Progreso" (un porcentaje que se cargaba a
 * mano y nunca se actualizaba), "Inicio" y la fila de avatares del equipo.
 */

interface ProjectsListProps {
  projects: Project[];
  onSelect: (p: Project) => void;
}

export function ProjectsList({ projects, onSelect }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 text-center text-[13px] text-[var(--color-text-muted)]">
        Todavía no hay proyectos.
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left border-b border-[var(--color-border)]">
            {["Proyecto", "Estado", "Entrega"].map((h) => (
              <th
                key={h}
                className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium px-[18px] py-3"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              onClick={() => onSelect(p)}
              className="border-b border-[var(--color-border)] last:border-b-0 cursor-pointer transition-colors duration-[140ms] ease-out [@media(hover:hover)]:hover:bg-white/[0.02]"
            >
              <td className="px-[18px] py-3">
                <div className="font-medium">{p.name}</div>
                {p.client && (
                  <div className="text-[11.5px] text-[var(--color-text-muted)]">{p.client}</div>
                )}
              </td>
              <td className="px-[18px] py-3">
                <Pill variant={p.status} dot>
                  {PROJECT_STATUS_LABELS[p.status] ?? p.status}
                </Pill>
              </td>
              <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[var(--color-text-muted)]">
                {p.due && p.due !== "—" ? p.due : "sin fecha"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
