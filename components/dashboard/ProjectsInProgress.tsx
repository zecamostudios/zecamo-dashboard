import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROJECTS } from "@/lib/mock-data";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Progress } from "@/components/ui-zecamo/Progress";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button } from "@/components/ui-zecamo/Button";
import type { Project } from "@/lib/types";

interface ProjectsInProgressProps {
  projects?: Project[];
}

export function ProjectsInProgress({ projects: initialProjects }: ProjectsInProgressProps) {
  const projects = (initialProjects ?? PROJECTS).filter((p) => p.status === "curso" || p.status === "review").slice(0, 5);

  return (
    <Card>
      <CardHead>
        <CardTitle big>Proyectos en curso</CardTitle>
        <Link href="/proyectos">
          <Button variant="ghost" className="text-xs">
            Ver todos <ArrowRight size={12} />
          </Button>
        </Link>
      </CardHead>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left">
            <th className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium pb-2.5">Proyecto</th>
            <th className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium pb-2.5">Línea</th>
            <th className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium pb-2.5">Progreso</th>
            <th className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium pb-2.5">Deadline</th>
            <th className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium pb-2.5">Equipo</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-t border-[var(--color-border)]">
              <td className="py-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-[11.5px] text-[var(--color-text-muted)]">{p.client}</div>
              </td>
              <td className="py-3"><Pill variant={p.line}>{p.line}</Pill></td>
              <td className="py-3 w-40">
                <div className="flex items-center gap-2">
                  <Progress value={p.progress} className="flex-1" />
                  <span className="font-mono text-[11.5px] text-[var(--color-text-muted)] w-8 text-right">{p.progress}%</span>
                </div>
              </td>
              <td className="py-3 font-mono text-[12px] text-[var(--color-text-muted)]">{p.due}</td>
              <td className="py-3">
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
    </Card>
  );
}
