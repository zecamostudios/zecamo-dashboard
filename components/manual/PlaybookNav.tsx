"use client";

import {
  Sparkles,
  Users,
  Briefcase,
  Code,
  Target,
  DollarSign,
  Book,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionId =
  | "identidad"
  | "equipo"
  | "lineas"
  | "stack"
  | "comercial"
  | "pricing"
  | "playbooks"
  | "operacion"
  | "roadmap";

export interface ManualSection {
  id: SectionId;
  l: string;
  ico: LucideIcon;
}

export const SECTIONS: ManualSection[] = [
  { id: "identidad", l: "Identidad", ico: Sparkles },
  { id: "equipo", l: "Equipo", ico: Users },
  { id: "lineas", l: "Líneas de servicio", ico: Briefcase },
  { id: "stack", l: "Stack técnico", ico: Code },
  { id: "comercial", l: "Proceso comercial", ico: Target },
  { id: "pricing", l: "Pricing", ico: DollarSign },
  { id: "playbooks", l: "Playbooks", ico: Book },
  { id: "operacion", l: "Operación interna", ico: Settings },
  { id: "roadmap", l: "Roadmap 90 días", ico: TrendingUp },
];

interface PlaybookNavProps {
  sections: ManualSection[];
  active: SectionId;
  onChange: (id: SectionId) => void;
}

export function PlaybookNav({ sections, active, onChange }: PlaybookNavProps) {
  return (
    <div className="flex flex-col gap-px">
      {sections.map((s) => {
        const Ic = s.ico;
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13.5px] transition cursor-pointer text-left",
              isActive
                ? "bg-gradient-to-r from-[rgba(43,91,255,0.18)] to-[rgba(43,91,255,0.04)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_rgba(43,91,255,0.25)]"
                : "text-[var(--color-text-muted)] hover:bg-white/[0.035] hover:text-[var(--color-text)]",
            )}
          >
            <span className={isActive ? "text-[var(--color-primary-hover)]" : ""}>
              <Ic size={15} />
            </span>
            <span>{s.l}</span>
            <span className="ml-auto font-mono text-[10.5px] text-[var(--color-text-dim)]">
              {String(SECTIONS.findIndex((x) => x.id === s.id) + 1).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
