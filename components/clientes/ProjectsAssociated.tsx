"use client";

import { useRouter } from "next/navigation";
import { Folder, Plus } from "lucide-react";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Progress } from "@/components/ui-zecamo/Progress";
import { Button } from "@/components/ui-zecamo/Button";
import type { Project } from "@/lib/types";

export function ProjectsAssociated({ projects }: { projects: Project[] }) {
  const router = useRouter();
  if (projects.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-white/[0.04] border border-[var(--color-border)] grid place-items-center mb-3 text-[var(--color-text-muted)]">
          <Folder size={22} />
        </div>
        <p className="font-[family-name:var(--font-display)] text-[16px] font-medium m-0">Sin proyectos aún</p>
        <p className="text-[12.5px] text-[var(--color-text-muted)] mt-1 mb-4">Arrancá el primer proyecto para este cliente.</p>
        <Button variant="primary" onClick={() => router.push("/proyectos")}>
          <Plus size={13} />Crear proyecto
        </Button>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="text-left">
          {["Nombre", "Estado", "Progreso", "Deadline"].map((h) => (
            <th key={h} className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium pb-3">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => (
          <tr key={p.id} className="border-t border-[var(--color-border)]">
            <td className="py-3">
              <div className="font-medium">{p.name}</div>
              <div className="text-[11.5px] mt-0.5"><Pill variant={p.line}>{p.line}</Pill></div>
            </td>
            <td className="py-3"><Pill variant={p.status}>{p.status}</Pill></td>
            <td className="py-3 w-36"><Progress value={p.progress} /></td>
            <td className="py-3 font-mono text-[var(--color-text-muted)]">{p.due}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
