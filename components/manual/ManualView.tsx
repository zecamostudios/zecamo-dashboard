"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { PlaybookNav, SECTIONS, type SectionId } from "./PlaybookNav";
import { SectionContent } from "./SectionContent";
import { SearchBar } from "./SearchBar";

export function ManualView() {
  const [active, setActive] = useState<SectionId>("identidad");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search ? SECTIONS.filter((s) => s.l.toLowerCase().includes(search.toLowerCase())) : SECTIONS,
    [search],
  );

  const idx = SECTIONS.findIndex((s) => s.id === active);
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];

  return (
    <>
      <PageHead
        title={
          <>
            Manual <em className="text-[var(--color-text-muted)] not-italic font-normal">· interno</em>
          </>
        }
        subtitle="Documentación viva de cómo trabajamos en Zecamo."
        actions={
          <>
            <Button><ExternalLink size={12} />Versión pública</Button>
            <Button variant="primary"><Plus size={14} />Nueva sección</Button>
          </>
        }
      />

      <div className="grid grid-cols-[240px_1fr] gap-6 items-start max-[900px]:grid-cols-1">
        <aside className="sticky top-[90px] max-[900px]:static">
          <SearchBar value={search} onChange={setSearch} />
          <PlaybookNav sections={filtered} active={active} onChange={setActive} />
          <div className="mt-4 px-3.5 py-3 bg-white/[0.02] border border-[var(--color-border)] rounded-xl text-[11.5px] text-[var(--color-text-muted)]">
            <div className="text-[10.5px] uppercase tracking-[0.06em] text-[var(--color-text-dim)] mb-1.5">
              Última edición
            </div>
            <div className="font-mono">23 May 2026 · 14:22</div>
            <div className="flex items-center gap-1.5 mt-2">
              <OwnerAvatar id="JS" size="xs" />
              <span>Joaco Sánchez</span>
            </div>
          </div>
        </aside>

        <div>
          <SectionContent id={active} />
          <div className="flex justify-between mt-6 pt-[18px] border-t border-[var(--color-border)]">
            {prev ? (
              <Button variant="ghost" className="px-3 py-2" onClick={() => setActive(prev.id)}>
                <ChevronLeft size={13} />
                <span className="flex flex-col items-start">
                  <span className="text-[10.5px] text-[var(--color-text-dim)] uppercase tracking-[0.05em]">
                    Anterior
                  </span>
                  <span>{prev.l}</span>
                </span>
              </Button>
            ) : (
              <div />
            )}
            {next ? (
              <Button variant="ghost" className="px-3 py-2" onClick={() => setActive(next.id)}>
                <span className="flex flex-col items-end">
                  <span className="text-[10.5px] text-[var(--color-text-dim)] uppercase tracking-[0.05em]">
                    Siguiente
                  </span>
                  <span>{next.l}</span>
                </span>
                <ChevronRight size={13} />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
