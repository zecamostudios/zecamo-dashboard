"use client";

import { Copy, Save, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";
import type { GenerationResult } from "./AIStudioView";

interface GenerationOutputProps {
  result: GenerationResult | null;
  loading: boolean;
  tipo: AIGenerationType;
  plataforma: ContentPlatform;
  onCopy: (text: string) => void;
  onSave: () => void;
  onRegenerate: () => void;
}

export function GenerationOutput({
  result,
  loading,
  onCopy,
  onSave,
  onRegenerate,
}: GenerationOutputProps) {
  if (loading) {
    return (
      <Card glow className="min-h-[320px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-primary-hover)]/30 border-t-[var(--color-primary-hover)] animate-spin" />
        <div className="text-[13px] text-[var(--color-text-muted)]">
          Generando tu contenido con IA...
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="min-h-[320px] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(43,91,255,0.08)] border border-[rgba(43,91,255,0.15)] grid place-items-center">
          <Sparkles size={22} className="text-[var(--color-primary-hover)] opacity-60" />
        </div>
        <div className="text-[14px] font-medium text-[var(--color-text-muted)]">
          Tu contenido aparecerá aquí
        </div>
        <div className="text-[12.5px] text-[var(--color-text-dim)] text-center max-w-[280px]">
          Completá el formulario y hacé clic en &ldquo;Generar contenido&rdquo;
        </div>
      </Card>
    );
  }

  return (
    <Card glow className="flex flex-col gap-4">
      <CardHead>
        <CardTitle big icon={<Sparkles size={16} />}>
          <span className="text-[var(--color-primary-hover)]">Resultado</span>
        </CardTitle>
        <div className="flex items-center gap-1.5">
          {result.tokens && (
            <span className="font-mono text-[11px] text-[var(--color-text-dim)]">
              {result.tokens} tokens
            </span>
          )}
          <Button variant="ghost" className="px-2 py-1 text-[11.5px]" onClick={onRegenerate}>
            <RefreshCw size={11} /> Regenerar
          </Button>
        </div>
      </CardHead>

      {/* Hook highlight */}
      {result.hook && (
        <div className="px-4 py-3 bg-[rgba(43,91,255,0.08)] border border-[rgba(43,91,255,0.2)] rounded-xl">
          <div className="text-[10px] uppercase tracking-[0.07em] text-[var(--color-primary-hover)] mb-1.5 font-medium">
            Hook
          </div>
          <p className="text-[13.5px] text-[var(--color-text)] font-medium leading-snug">
            {result.hook}
          </p>
          <button
            onClick={() => onCopy(result.hook!)}
            className="mt-2 text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 transition-colors"
          >
            <Copy size={10} /> Copiar hook
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-muted)] mb-2">
          Contenido
        </div>
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 text-[13.5px] text-[var(--color-text)] leading-relaxed whitespace-pre-wrap min-h-[160px]">
          {result.content}
        </div>
      </div>

      {/* CTA */}
      {result.cta && (
        <div className="px-4 py-3 bg-[rgba(34,197,139,0.06)] border border-[rgba(34,197,139,0.18)] rounded-xl">
          <div className="text-[10px] uppercase tracking-[0.07em] text-[var(--color-success)] mb-1 font-medium">
            CTA
          </div>
          <p className="text-[13px] text-[var(--color-text)]">{result.cta}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-[var(--color-border)]">
        <Button className="flex-1 justify-center" onClick={() => onCopy(result.content)}>
          <Copy size={13} /> Copiar
        </Button>
        <Button variant="primary" className="flex-1 justify-center" onClick={onSave}>
          <Save size={13} /> Guardar borrador
        </Button>
      </div>
    </Card>
  );
}
