"use client";

import { useState } from "react";
import { User, Briefcase, Globe, Code, Bell, type LucideIcon } from "lucide-react";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { cn } from "@/lib/utils";
import { PerfilSection } from "./PerfilSection";
import { BrandSettings } from "./BrandSettings";
import { IntegracionesSection } from "./IntegracionesSection";
import { ApiKeysSection } from "./ApiKeysSection";
import { NotifSection } from "./NotifSection";

type TabId = "perfil" | "workspace" | "integraciones" | "apikeys" | "notificaciones";

const TABS: { id: TabId; l: string; ico: LucideIcon }[] = [
  { id: "perfil", l: "Perfil", ico: User },
  { id: "workspace", l: "Workspace", ico: Briefcase },
  { id: "integraciones", l: "Integraciones", ico: Globe },
  { id: "apikeys", l: "API keys", ico: Code },
  { id: "notificaciones", l: "Notificaciones", ico: Bell },
];

export function ConfigView() {
  const [active, setActive] = useState<TabId>("perfil");

  return (
    <>
      <PageHead title="Configuración" subtitle="Perfil, workspace e integraciones de Zecamo Studios." />

      <div className="grid grid-cols-[220px_1fr] gap-6 items-start max-[900px]:grid-cols-1">
        <aside className="sticky top-[90px] flex flex-col gap-px max-[900px]:static max-[900px]:flex-row max-[900px]:overflow-x-auto">
          {TABS.map((t) => {
            const Ic = t.ico;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13.5px] transition cursor-pointer text-left",
                  isActive
                    ? "bg-gradient-to-r from-[rgba(43,91,255,0.18)] to-[rgba(43,91,255,0.04)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_rgba(43,91,255,0.25)]"
                    : "text-[var(--color-text-muted)] hover:bg-white/[0.035] hover:text-[var(--color-text)]",
                )}
              >
                <span className={isActive ? "text-[var(--color-primary-hover)]" : ""}>
                  <Ic size={16} />
                </span>
                <span>{t.l}</span>
              </button>
            );
          })}
        </aside>

        <div>
          {active === "perfil" && <PerfilSection />}
          {active === "workspace" && <BrandSettings />}
          {active === "integraciones" && <IntegracionesSection />}
          {active === "apikeys" && <ApiKeysSection />}
          {active === "notificaciones" && <NotifSection />}
        </div>
      </div>
    </>
  );
}
