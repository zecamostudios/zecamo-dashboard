"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useLiveRows } from "@/lib/hooks/useLiveRows";
import { PROJECT_COLS, rowToProject } from "@/lib/db/mappers";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER, STATUS_A_UI_ESTADO } from "@/lib/proyectos/estados";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { ViewToggle } from "./ViewToggle";
import { ProjectsKanban } from "./ProjectsKanban";
import { ProjectsList } from "./ProjectsList";
import type { Project, ProjectStatus } from "@/lib/types";

/**
 * Se fueron el modal de "nuevo proyecto" (ahora se crea en la ficha, un solo
 * lugar), los filtros por linea y por owner, y el detalle embebido: el proyecto
 * se abre en su propia URL, asi se puede compartir y volver con el navegador.
 */

interface ProyectosViewProps {
  initialProjects?: Project[];
}

export function ProyectosView({ initialProjects }: ProyectosViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useLiveRows(initialProjects ?? [], {
    table: "proyectos", columns: PROJECT_COLS, order: { column: "created_at" }, map: rowToProject,
  });
  const [view, setView] = useState<"kanban" | "lista">("kanban");

  function abrir(p: Project) {
    if (p.dbId) router.push(`/proyectos/${p.dbId}`);
  }

  async function mover(proyecto: Project, dir: "prev" | "next") {
    const i = PROJECT_STATUS_ORDER.indexOf(proyecto.status);
    if (i === -1) return;
    const siguiente = dir === "next" ? Math.min(PROJECT_STATUS_ORDER.length - 1, i + 1) : Math.max(0, i - 1);
    if (siguiente === i) return;
    const nuevo: ProjectStatus = PROJECT_STATUS_ORDER[siguiente];

    setProjects((prev) => prev.map((p) => (p.id === proyecto.id ? { ...p, status: nuevo } : p)));

    if (!proyecto.dbId) return;
    // Las dos columnas de estado, siempre juntas: ver lib/proyectos/estados.ts.
    const { error } = await supabase
      .from("proyectos")
      .update({
        estado: nuevo,
        ui_estado: STATUS_A_UI_ESTADO[nuevo],
        updated_at: new Date().toISOString(),
      })
      .eq("id", proyecto.dbId);

    if (error) {
      setProjects((prev) => prev.map((p) => (p.id === proyecto.id ? { ...p, status: proyecto.status } : p)));
      toast.error("No se pudo mover el proyecto");
    }
  }

  const porEstado = (estado: ProjectStatus) => projects.filter((p) => p.status === estado).length;

  return (
    <>
      <PageHead
        title="Proyectos"
        subtitle={`${porEstado("en_desarrollo")} en curso · ${porEstado("entregado")} entregados · ${projects.length} en total`}
        actions={
          <>
            <ViewToggle value={view} onChange={setView} />
            <Link href="/proyectos/nuevo">
              <Button variant="primary">
                <Plus size={14} />Nuevo proyecto
              </Button>
            </Link>
          </>
        }
      />

      {projects.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)] mb-4">
            Todavía no hay proyectos. El primero arranca en {PROJECT_STATUS_LABELS.propuesta.toLowerCase()}.
          </p>
          <Link href="/proyectos/nuevo">
            <Button variant="primary">
              <Plus size={14} />Nuevo proyecto
            </Button>
          </Link>
        </div>
      ) : view === "kanban" ? (
        <ProjectsKanban projects={projects} onSelect={abrir} onMove={mover} />
      ) : (
        <ProjectsList projects={projects} onSelect={abrir} />
      )}
    </>
  );
}
