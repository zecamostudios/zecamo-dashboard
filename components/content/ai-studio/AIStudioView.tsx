"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  RefreshCw,
  ChevronRight,
  Zap,
  BookOpen,
  AlignLeft,
  Layers,
  RotateCcw,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Pill } from "@/components/ui-zecamo/Pill";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";
import { GeneratorForm } from "./GeneratorForm";
import { GenerationOutput } from "./GenerationOutput";
import { HookLibraryPanel } from "./HookLibraryPanel";

type StudioTab = AIGenerationType;

const TABS: { value: StudioTab; label: string; icon: typeof Sparkles }[] = [
  { value: "hook",     label: "Hooks",     icon: Zap },
  { value: "post",     label: "Post",      icon: AlignLeft },
  { value: "thread",   label: "Thread",    icon: Layers },
  { value: "carousel", label: "Carrusel",  icon: BookOpen },
  { value: "rewrite",  label: "Reescribir", icon: RotateCcw },
];

const PLATFORM_TABS: { value: ContentPlatform; label: string }[] = [
  { value: "linkedin",  label: "LinkedIn" },
  { value: "twitter",   label: "X / Twitter" },
  { value: "instagram", label: "Instagram" },
];

export interface GenerationResult {
  content:      string;
  hook?:        string;
  cta?:         string;
  tokens?:      number;
  isMock?:      boolean;
  aiScore?:     number;
  aiFeedback?:  string;
}

interface RecentPost {
  id: string;
  titulo: string;
  estado: string;
  plataforma: string;
  created_at: string;
  ai_score?: number;
}

export function AIStudioView() {
  const router = useRouter();
  const [studioTab, setStudioTab] = useState<StudioTab>("hook");
  const [platform, setPlatform]   = useState<ContentPlatform>("linkedin");
  const [prompt, setPrompt]       = useState("");
  const [result, setResult]       = useState<GenerationResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [showHooks, setShowHooks] = useState(false);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);

  // Load recent posts on mount
  useEffect(() => {
    fetch("/api/content/posts?limit=5")
      .then((r) => r.json())
      .then((d) => setRecentPosts((d.posts ?? []).slice(0, 5) as RecentPost[]))
      .catch(() => {});
  }, []);

  async function handleGenerate(prompt: string, context: Record<string, string>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: studioTab, plataforma: platform, prompt, context }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const generationResult: GenerationResult = {
        content:  data.content,
        hook:     data.hook,
        cta:      data.cta,
        tokens:   data.tokens,
        isMock:   data.isMock,
      };

      // Score content in background (non-blocking)
      setResult(generationResult);
      fetch("/api/content/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content, tipo: studioTab, plataforma: platform }),
      })
        .then((r) => r.ok ? r.json() : null)
        .then((score) => {
          if (score) {
            setResult((prev) => prev
              ? { ...prev, aiScore: score.score, aiFeedback: score.feedback }
              : prev,
            );
          }
        })
        .catch(() => {});
    } catch {
      toast.error("Error al generar contenido. Revisá tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  }

  async function handleSave() {
    if (!result) return;
    try {
      const tipo = studioTab === "thread" ? "thread"
        : studioTab === "carousel" ? "carousel"
        : "post";

      const res = await fetch("/api/content/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo:     result.hook?.slice(0, 80) ?? result.content.slice(0, 80),
          contenido:  result.content,
          plataforma: platform,
          tipo,
          estado:     "borrador",
          hook:       result.hook,
          cta:        result.cta,
          version:    1,
          ai_score:   result.aiScore ?? null,
          ai_feedback: result.aiFeedback ?? null,
        }),
      });

      if (!res.ok) throw new Error();
      const saved = await res.json();
      toast.success("Guardado en Borradores");

      // Refresh recent posts
      setRecentPosts((prev) => [saved.post ?? { ...result, id: Date.now().toString(), titulo: result.hook ?? result.content.slice(0, 60), estado: "borrador", plataforma: platform, created_at: new Date().toISOString() }, ...prev].slice(0, 5));
    } catch {
      toast.error("Error al guardar");
    }
  }

  return (
    <>
      <PageHead
        title={
          <>
            AI Studio
            <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(43,91,255,0.10)] border border-[rgba(43,91,255,0.25)] rounded-full text-[11px] font-medium text-[var(--color-primary-hover)] align-middle">
              <Sparkles size={11} />
              AI-powered
            </span>
          </>
        }
        subtitle="Generá posts, threads, hooks y carruseles optimizados por plataforma"
        actions={
          <Button
            variant={showHooks ? "primary" : "default"}
            onClick={() => setShowHooks((v) => !v)}
          >
            <BookOpen size={13} />
            Biblioteca de hooks
          </Button>
        }
      />

      <div className="grid grid-cols-12 gap-[14px]">
        {/* Left: controls */}
        <div className="col-span-5 max-[1100px]:col-span-12 flex flex-col gap-[14px]">
          {/* Studio type tabs */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Sparkles size={16} />}>
                Tipo de contenido
              </CardTitle>
            </CardHead>
            <div className="grid grid-cols-5 gap-1.5">
              {TABS.map(({ value, label, icon: Icon }) => {
                const active = studioTab === value;
                return (
                  <button
                    key={value}
                    onClick={() => setStudioTab(value)}
                    className={
                      "p-2.5 rounded-xl flex flex-col items-center gap-1.5 border cursor-pointer transition-all duration-[140ms] " +
                      (active
                        ? "bg-gradient-to-b from-[rgba(43,91,255,0.14)] to-[rgba(43,91,255,0.04)] border-[rgba(43,91,255,0.4)] shadow-[0_0_0_1px_rgba(43,91,255,0.4)]"
                        : "bg-[var(--color-surface)] border-[var(--color-border-2)] hover:border-[var(--color-border-3)]")
                    }
                  >
                    <Icon size={16} className={active ? "text-[var(--color-primary-hover)]" : "text-[var(--color-text-muted)]"} />
                    <span className={"text-[11px] font-medium " + (active ? "text-[var(--color-primary-hover)]" : "text-[var(--color-text-muted)]")}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Platform */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Globe size={16} />}>Plataforma</CardTitle>
            </CardHead>
            <div className="flex gap-2">
              {PLATFORM_TABS.map((p) => {
                const active = platform === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={
                      "flex-1 py-2.5 rounded-xl text-[13px] font-medium border cursor-pointer transition-all duration-[140ms] " +
                      (active
                        ? "bg-[rgba(43,91,255,0.10)] border-[rgba(43,91,255,0.4)] text-[var(--color-primary-hover)]"
                        : "bg-[var(--color-surface)] border-[var(--color-border-2)] text-[var(--color-text-muted)] hover:border-[var(--color-border-3)]")
                    }
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </Card>

          <GeneratorForm
            tipo={studioTab}
            plataforma={platform}
            loading={loading}
            externalPrompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={handleGenerate}
          />
        </div>

        {/* Right: output */}
        <div className="col-span-7 max-[1100px]:col-span-12 flex flex-col gap-[14px]">
          <GenerationOutput
            result={result}
            loading={loading}
            tipo={studioTab}
            plataforma={platform}
            onCopy={handleCopy}
            onSave={handleSave}
            onRegenerate={() => {}}
          />

          {/* Recent generations */}
          <Card>
            <CardHead>
              <CardTitle big icon={<RefreshCw size={15} />}>
                Generaciones recientes
              </CardTitle>
              <Button variant="ghost" className="text-[11.5px] px-2 py-1" onClick={() => router.push("/content/queue")}>
                Ver queue <ChevronRight size={11} />
              </Button>
            </CardHead>
            {recentPosts.length === 0 ? (
              <p className="text-[12.5px] text-[var(--color-text-dim)] text-center py-6">
                Los borradores guardados aparecerán aquí
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {recentPosts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border)] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-[var(--color-text)] truncate">{p.titulo}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10.5px] text-[var(--color-text-dim)] font-mono">{p.plataforma}</span>
                        {p.ai_score != null && (
                          <span className="text-[10.5px] text-[var(--color-success)] font-mono flex items-center gap-0.5">
                            <Sparkles size={9} /> {p.ai_score}/10
                          </span>
                        )}
                      </div>
                    </div>
                    <Pill variant={p.estado === "borrador" ? "archivado" : "active"}>
                      {p.estado}
                    </Pill>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Hook library slide-in */}
      {showHooks && (
        <HookLibraryPanel
          onClose={() => setShowHooks(false)}
          onInsert={(hook) => {
            setPrompt(hook);
            setShowHooks(false);
            toast.success("Hook insertado como prompt");
          }}
        />
      )}
    </>
  );
}
