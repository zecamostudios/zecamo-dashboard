"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

const PLATFORM_CHAR_LIMITS: Record<ContentPlatform, number> = {
  linkedin: 3000,
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
};

const TYPE_PROMPTS: Record<AIGenerationType, { placeholder: string; tip: string }> = {
  hook: {
    placeholder: "Ej: Cómo conseguimos 3 clientes nuevos en una semana sin gastar en publicidad...",
    tip: "Un buen hook interrumpe el scroll en las primeras 3 palabras.",
  },
  post: {
    placeholder: "Describí el tema o insight que querés comunicar...",
    tip: "Un post efectivo tiene: hook → desarrollo → CTA.",
  },
  thread: {
    placeholder: "El tema del thread y el punto principal que querés desarrollar...",
    tip: "El tweet 1 es el hook. El último tweet cierra con CTA.",
  },
  carousel: {
    placeholder: "El tema y la estructura que querés para el carrusel...",
    tip: "Slide 1: promesa. Slides 2-8: desarrollo. Último: CTA.",
  },
  rewrite: {
    placeholder: "Pegá el texto que querés reescribir o mejorar...",
    tip: "Especificá el tono o formato deseado para el resultado.",
  },
};

interface GeneratorFormProps {
  tipo: AIGenerationType;
  plataforma: ContentPlatform;
  loading: boolean;
  externalPrompt?: string;
  onPromptChange?: (prompt: string) => void;
  onGenerate: (prompt: string, context: Record<string, string>) => void;
}

export function GeneratorForm({ tipo, plataforma, loading, externalPrompt, onPromptChange, onGenerate }: GeneratorFormProps) {
  const [prompt, setPrompt] = useState(externalPrompt ?? "");

  useEffect(() => {
    if (externalPrompt !== undefined) setPrompt(externalPrompt);
  }, [externalPrompt]);
  const [tono, setTono] = useState("profesional-directo");
  const [contexto, setContexto] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const charLimit = PLATFORM_CHAR_LIMITS[plataforma];
  const typeConfig = TYPE_PROMPTS[tipo];

  function handleSubmit() {
    if (!prompt.trim()) return;
    onGenerate(prompt, { tono, contexto, charLimit: String(charLimit) });
  }

  return (
    <Card>
      <CardHead>
        <CardTitle big icon={<Sparkles size={16} />}>
          Prompt
        </CardTitle>
        <span className="text-[11px] text-[var(--color-text-dim)] font-mono">
          {charLimit.toLocaleString()} chars max
        </span>
      </CardHead>

      <div className="flex flex-col gap-3">
        <textarea
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); onPromptChange?.(e.target.value); }}
          placeholder={typeConfig.placeholder}
          rows={5}
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-xl px-4 py-3 text-[13.5px] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] resize-none outline-none focus:border-[rgba(43,91,255,0.4)] focus:shadow-[0_0_0_3px_rgba(43,91,255,0.10)] transition-all"
        />

        <div className="px-3 py-2.5 bg-[rgba(43,91,255,0.06)] border border-[rgba(43,91,255,0.15)] rounded-xl text-[11.5px] text-[var(--color-text-muted)]">
          <span className="text-[var(--color-primary-hover)] font-medium">Tip: </span>
          {typeConfig.tip}
        </div>

        {/* Tone selector */}
        <div>
          <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-2 block">
            Tono
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "profesional-directo", label: "Directo" },
              { id: "storytelling",        label: "Story" },
              { id: "educativo",           label: "Educativo" },
              { id: "provocador",          label: "Provocador" },
              { id: "casual",              label: "Casual" },
              { id: "autoridad",           label: "Autoridad" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTono(t.id)}
                className={
                  "py-2 px-3 rounded-[9px] text-[12px] font-medium border cursor-pointer transition-all duration-[140ms] " +
                  (tono === t.id
                    ? "bg-[rgba(43,91,255,0.10)] border-[rgba(43,91,255,0.35)] text-[var(--color-primary-hover)]"
                    : "bg-transparent border-[var(--color-border-2)] text-[var(--color-text-muted)] hover:border-[var(--color-border-3)]")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced context */}
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-0 p-0"
        >
          <ChevronDown
            size={14}
            className={
              "transition-transform duration-150 " + (showAdvanced ? "rotate-180" : "")
            }
          />
          Contexto adicional
        </button>

        {showAdvanced && (
          <textarea
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
            placeholder="Contexto de tu negocio, audiencia objetivo, objeción a destruir, case study reciente..."
            rows={3}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-xl px-4 py-3 text-[13.5px] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] resize-none outline-none focus:border-[rgba(43,91,255,0.4)] focus:shadow-[0_0_0_3px_rgba(43,91,255,0.10)] transition-all"
          />
        )}

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!prompt.trim() || loading}
          className="w-full justify-center py-[10px]"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generar contenido
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
