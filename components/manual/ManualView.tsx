"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

const MODAL_INPUT = "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { PlaybookNav, SECTIONS, type SectionId } from "./PlaybookNav";
import { SectionContent } from "./SectionContent";
import { SearchBar } from "./SearchBar";

export function ManualView() {
  const [active, setActive] = useState<SectionId>("identidad");
  const [search, setSearch] = useState("");
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

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
            <Button onClick={() => window.open("https://zecamostudios.com/manual", "_blank")}>
              <ExternalLink size={12} />Versión pública
            </Button>
            <Button variant="primary" onClick={() => setShowNewSection(true)}>
              <Plus size={14} />Nueva sección
            </Button>
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

      {showNewSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNewSection(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">Nueva sección</h2>
              <button onClick={() => setShowNewSection(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer"><X size={16} /></button>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Nombre *</label>
              <input autoFocus value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newSectionName.trim()) { toast.success(`Sección "${newSectionName}" creada`); setShowNewSection(false); setNewSectionName(""); } }} placeholder="Ej: Procesos de onboarding" className={MODAL_INPUT} />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNewSection(false)} className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer transition">Cancelar</button>
              <button onClick={() => { if (!newSectionName.trim()) return; toast.success(`Sección "${newSectionName}" creada`); setShowNewSection(false); setNewSectionName(""); }} className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition">Crear</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
