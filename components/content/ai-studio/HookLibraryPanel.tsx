"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, BookOpen, Star, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import type { ContentAsset, AssetType } from "@/lib/types";

interface HookLibraryPanelProps {
  onClose: () => void;
  onInsert: (hook: string) => void;
}

const HOOK_TYPES: { id: AssetType; label: string }[] = [
  { id: "hook",     label: "Hooks" },
  { id: "cta",      label: "CTAs" },
  { id: "framework", label: "Frameworks" },
];

export function HookLibraryPanel({ onClose, onInsert }: HookLibraryPanelProps) {
  const router = useRouter();
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [filter, setFilter] = useState<AssetType>("hook");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setAssets([]);
    fetch(`/api/content/assets?tipo=${filter}`)
      .then((r) => r.json())
      .then((d) => setAssets(d.assets ?? []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-[420px] h-full bg-[var(--color-surface)] border-l border-[var(--color-border-2)] flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.4)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <BookOpen size={17} className="text-[var(--color-primary-hover)]" />
            <span className="font-[family-name:var(--font-display)] font-semibold text-[15px]">
              Biblioteca
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition cursor-pointer border-0 bg-transparent text-[var(--color-text-muted)]">
            <X size={16} />
          </button>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 px-6 py-3 border-b border-[var(--color-border)]">
          {HOOK_TYPES.map((t) => (
            <Chip key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}>
              {t.label}
            </Chip>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {loading ? (
            <div className="text-center py-12 text-[var(--color-text-dim)] text-[13px]">
              Cargando...
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[var(--color-text-dim)] text-[13px] mb-4">
                No hay {filter}s en la biblioteca aún
              </div>
              <Button
                variant="primary"
                className="mx-auto"
                onClick={() => { onClose(); router.push("/content/assets"); }}
              >
                <Plus size={13} /> Agregar primero
              </Button>
            </div>
          ) : (
            assets.map((asset) => (
              <div
                key={asset.id}
                className="group p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-2)] transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[13px] leading-snug flex-1">{asset.contenido}</p>
                  {asset.favorito && (
                    <Star size={13} className="text-[var(--color-warning)] shrink-0 mt-0.5 fill-current" />
                  )}
                </div>
                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 bg-white/[0.04] border border-[var(--color-border)] rounded-full text-[var(--color-text-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigator.clipboard.writeText(asset.contenido ?? "")}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--color-border-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 cursor-pointer bg-transparent transition"
                  >
                    <Copy size={10} /> Copiar
                  </button>
                  <button
                    onClick={() => onInsert(asset.contenido ?? "")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(43,91,255,0.10)] border border-[rgba(43,91,255,0.25)] text-[var(--color-primary-hover)] flex items-center gap-1 cursor-pointer transition"
                  >
                    Insertar como prompt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
