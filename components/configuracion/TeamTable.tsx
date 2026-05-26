"use client";

import { UserPlus, MoreHorizontal } from "lucide-react";
import { OWNERS } from "@/lib/mock-data";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Button } from "@/components/ui-zecamo/Button";
import { ConfigSection } from "./_shared";

const META: Record<string, string> = {
  JS: "joaco@zecamostudios.com · Founder",
  LM: "lisandro@zecamostudios.com · Co-founder",
  BR: "benja@zecamostudios.com · Co-founder",
};

export function TeamTable() {
  // TODO: Conectar Supabase tabla `team_members`
  return (
    <ConfigSection title="Equipo" sub="Los socios y sus permisos.">
      {OWNERS.map((o) => (
        <div
          key={o.id}
          className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-b-0"
        >
          <OwnerAvatar id={o.id} size="lg" />
          <div className="flex-1">
            <div className="text-[13.5px] font-medium">{o.name}</div>
            <div className="text-[11.5px] text-[var(--color-text-muted)]">{META[o.id]}</div>
          </div>
          <Pill variant="active" dot>Owner</Pill>
          <button
            className="w-[30px] h-[30px] grid place-items-center rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            aria-label="Más opciones"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      ))}
      <Button className="mt-3.5"><UserPlus size={13} />Invitar persona</Button>
    </ConfigSection>
  );
}
