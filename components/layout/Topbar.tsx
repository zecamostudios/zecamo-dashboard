"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { IconButton } from "@/components/ui-zecamo/Button";

const SECTION_NAMES: Record<string, string> = {
  "/": "Dashboard",
  "/crm": "CRM",
  "/clientes": "Clientes",
  "/proyectos": "Proyectos",
  "/calculadora": "Calculadora",
  "/finanzas": "Finanzas",
  "/outbound": "Outbound",
  "/tareas": "Tareas",
  "/analiticas": "Analíticas",
  "/manual": "Manual",
  "/configuracion": "Configuración",
};

export function Topbar() {
  const pathname = usePathname() ?? "/";
  const current = SECTION_NAMES[pathname] ?? "Dashboard";

  return (
    <div className="flex items-center justify-between px-8 py-[14px] border-b border-[var(--color-border)] bg-[var(--color-bg)]/70 backdrop-blur-[20px] sticky top-0 z-20">
      <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-[12.5px] font-mono tracking-wide">
        <span>Zecamo Studios</span>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-text)]">{current}</span>
      </div>

      <div className="flex items-center gap-[10px]">
        <div className="flex items-center gap-2 px-3 py-[7px] bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-xl w-[280px] text-[13px] text-[var(--color-text-muted)] focus-within:border-[rgba(43,91,255,0.25)] focus-within:shadow-[0_0_0_3px_rgba(43,91,255,0.10)] transition-all">
          <Search size={14} />
          <input
            placeholder="Buscar clientes, proyectos, prospectos..."
            className="border-0 outline-none bg-transparent flex-1 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)]"
          />
          <span className="font-mono text-[10.5px] bg-white/[0.04] border border-[var(--color-border-2)] px-[6px] py-[1px] rounded text-[var(--color-text-muted)]">
            ⌘K
          </span>
        </div>
        <IconButton ping aria-label="Notificaciones">
          <Bell size={15} />
        </IconButton>
        <Link href="/configuracion">
          <IconButton aria-label="Ajustes">
            <Settings size={15} />
          </IconButton>
        </Link>
      </div>
    </div>
  );
}
