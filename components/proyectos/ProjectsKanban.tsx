"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pill } from "@/components/ui-zecamo/Pill";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER } from "@/lib/proyectos/estados";
import type { Project } from "@/lib/types";

/**
 * Cuatro columnas, las mismas cuatro que la ficha. Las tarjetas se mueven con
 * las flechas: antes el tablero no tenia forma de mover nada (habia un TODO de
 * drag-drop) y encima leia el estado de una columna que nadie escribia.
 *
 * Salieron de la tarjeta el avatar del owner, la barra de progreso y la llamita
 * de prioridad.
 */

interface ProjectsKanbanProps {
  projects: Project[];
  onSelect: (p: Project) => void;
  onMove?: (p: Project, dir: "prev" | "next") => void;
}

export function ProjectsKanban({ projects, onSelect, onMove }: ProjectsKanbanProps) {
  return (
    <div className="grid grid-cols-4 gap-3.5 overflow-x-auto pb-2 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
      {PROJECT_STATUS_ORDER.map((estado, columna) => {
        const items = projects.filter((p) => p.status === estado);
        return (
          <div
            key={estado}
            className="bg-white/[0.015] border border-[var(--color-border)] rounded-2xl p-3 min-w-0"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Pill variant={estado} dot>
                {PROJECT_STATUS_LABELS[estado]}
              </Pill>
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                {items.length}
              </span>
            </div>

            {items.length === 0 && <p className="text-[12px] text-[var(--color-text-dim)] py-2">—</p>}

            {items.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelect(p)}
                className="bg-white/[0.02] border border-[var(--color-border)] rounded-xl p-3 mb-2 cursor-pointer transition-[background-color,border-color] duration-[140ms] ease-out [@media(hover:hover)]:hover:bg-white/[0.04] [@media(hover:hover)]:hover:border-[rgba(43,91,255,0.25)]"
              >
                <div className="text-[13px] font-medium leading-tight mb-0.5 truncate">{p.name}</div>
                {p.client && (
                  <div className="text-[11px] text-[var(--color-text-muted)] truncate">{p.client}</div>
                )}
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--color-border)]">
                  <span className="font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--color-text-dim)]">
                    {p.due && p.due !== "—" ? p.due : "sin fecha"}
                  </span>
                  {onMove && (
                    <span className="flex gap-1">
                      {columna > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMove(p, "prev");
                          }}
                          aria-label="Estado anterior"
                          title="Estado anterior"
                          className="p-0.5 bg-transparent border-0 text-[var(--color-text-dim)] cursor-pointer transition-[color,transform] duration-[140ms] ease-out active:scale-[0.92] [@media(hover:hover)]:hover:text-[var(--color-text)]"
                        >
                          <ChevronLeft size={12} />
                        </button>
                      )}
                      {columna < PROJECT_STATUS_ORDER.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMove(p, "next");
                          }}
                          aria-label="Siguiente estado"
                          title="Siguiente estado"
                          className="p-0.5 bg-transparent border-0 text-[var(--color-primary-hover)] cursor-pointer transition-transform duration-[140ms] ease-out active:scale-[0.92]"
                        >
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
