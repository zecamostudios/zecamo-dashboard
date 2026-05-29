"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ListVideo,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Plus,
  Eye,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card } from "@/components/ui-zecamo/Card";
import { Chip } from "@/components/ui-zecamo/Chip";
import { Pill } from "@/components/ui-zecamo/Pill";
import type { ContentPost, ContentStatus, ContentPlatform } from "@/lib/types";

const PLATFORM_COLORS: Record<ContentPlatform, string> = {
  linkedin:  "text-[#0A66C2]",
  twitter:   "text-[#1DA1F2]",
  instagram: "text-[#E1306C]",
  facebook:  "text-[#1877F2]",
};

const PLATFORM_LABEL: Record<ContentPlatform, string> = {
  linkedin:  "LinkedIn",
  twitter:   "X / Twitter",
  instagram: "Instagram",
  facebook:  "Facebook",
};

const STATUS_PILL: Record<ContentStatus, { label: string; variant: string }> = {
  borrador:   { label: "Borrador",  variant: "archivado" },
  revision:   { label: "En revisión", variant: "review" },
  aprobado:   { label: "Aprobado",  variant: "venta" },
  programado: { label: "Programado", variant: "discovery" },
  publicado:  { label: "Publicado", variant: "active" },
  rechazado:  { label: "Rechazado", variant: "noventa" },
};

interface QueueViewProps {
  initialPosts?: ContentPost[];
}

export function QueueView({ initialPosts = [] }: QueueViewProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<ContentPost[]>(initialPosts);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<ContentPlatform | "all">("all");
  const filtered = useMemo(
    () =>
      posts.filter(
        (p) =>
          (statusFilter === "all" || p.estado === statusFilter) &&
          (platformFilter === "all" || p.plataforma === platformFilter),
      ),
    [posts, statusFilter, platformFilter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { revision: 0, aprobado: 0, programado: 0, publicado: 0 };
    posts.forEach((p) => { if (p.estado in c) c[p.estado]++; });
    return c;
  }, [posts]);

  async function approvePost(id: string) {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, estado: "aprobado" as ContentStatus } : p));
    await fetch(`/api/content/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "aprobado" }),
    });
    toast.success("Post aprobado");
  }

  async function rejectPost(id: string) {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, estado: "rechazado" as ContentStatus } : p));
    await fetch(`/api/content/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "rechazado" }),
    });
    toast.error("Post rechazado");
  }

  return (
    <>
      <PageHead
        title="Queue"
        subtitle="Revisá, aprobá y programá tu contenido para publicación"
        actions={
          <Button variant="primary" onClick={() => router.push("/content/ai-studio")}>
            <Plus size={14} /> Nuevo post
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-[14px] mb-[18px] max-[900px]:grid-cols-2">
        <QueueKpi label="En revisión"  value={counts.revision}   color="var(--color-warning)"   Icon={Eye} />
        <QueueKpi label="Aprobados"    value={counts.aprobado}   color="var(--color-success)"   Icon={CheckCircle2} />
        <QueueKpi label="Programados"  value={counts.programado} color="var(--color-primary-hover)" Icon={Clock} />
        <QueueKpi label="Publicados"   value={counts.publicado}  color="var(--color-info)"      Icon={Send} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Estado:</span>
        <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Todos</Chip>
        {(["revision", "aprobado", "programado", "publicado", "rechazado"] as ContentStatus[]).map((s) => (
          <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {STATUS_PILL[s].label}
          </Chip>
        ))}
        <span className="w-px h-[18px] bg-[var(--color-border-2)] mx-2" />
        <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Plataforma:</span>
        <Chip active={platformFilter === "all"} onClick={() => setPlatformFilter("all")}>Todas</Chip>
        {(["linkedin", "twitter", "instagram"] as ContentPlatform[]).map((p) => (
          <Chip key={p} active={platformFilter === p} onClick={() => setPlatformFilter(p)}>
            {PLATFORM_LABEL[p]}
          </Chip>
        ))}
      </div>

      {/* Queue list */}
      {filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <ListVideo size={28} className="mx-auto mb-3 text-[var(--color-text-dim)]" />
          <p className="text-[14px] text-[var(--color-text-muted)] mb-1">La queue está vacía</p>
          <p className="text-[12.5px] text-[var(--color-text-dim)]">
            Generá contenido en AI Studio y guardalo como borrador
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((post) => {
            const sp = STATUS_PILL[post.estado];
            return (
              <div
                key={post.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-border-2)] transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Platform dot */}
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-[var(--color-border)] grid place-items-center shrink-0">
                    <Send size={16} className={PLATFORM_COLORS[post.plataforma]} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11.5px] font-medium text-[var(--color-text-muted)]">
                        {PLATFORM_LABEL[post.plataforma]}
                      </span>
                      <span className="text-[var(--color-border-2)]">·</span>
                      <span className="text-[11px] font-mono text-[var(--color-text-dim)]">
                        {post.tipo}
                      </span>
                      <Pill variant={sp.variant as "active"}>{sp.label}</Pill>
                      {post.ai_score != null && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--color-success)]">
                          <Sparkles size={10} />
                          {post.ai_score}/10
                        </span>
                      )}
                    </div>

                    {/* Hook preview */}
                    {post.hook && (
                      <p className="text-[13.5px] font-medium mb-1.5 leading-snug line-clamp-2">
                        {post.hook}
                      </p>
                    )}

                    <p className="text-[12.5px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                      {post.contenido}
                    </p>

                    {post.programado_para && (
                      <div className="flex items-center gap-1.5 mt-2 text-[11.5px] text-[var(--color-text-muted)]">
                        <Clock size={11} />
                        {new Date(post.programado_para).toLocaleString("es-AR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {post.estado === "revision" && (
                    <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => rejectPost(post.id)}
                        className="w-8 h-8 rounded-lg border border-[rgba(255,84,102,0.3)] bg-[rgba(255,84,102,0.08)] grid place-items-center text-[var(--color-danger)] cursor-pointer hover:bg-[rgba(255,84,102,0.14)] transition"
                        title="Rechazar"
                      >
                        <XCircle size={15} />
                      </button>
                      <button
                        onClick={() => approvePost(post.id)}
                        className="w-8 h-8 rounded-lg border border-[rgba(34,197,139,0.3)] bg-[rgba(34,197,139,0.08)] grid place-items-center text-[var(--color-success)] cursor-pointer hover:bg-[rgba(34,197,139,0.14)] transition"
                        title="Aprobar"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function QueueKpi({
  label,
  value,
  color,
  Icon,
}: {
  label: string;
  value: number;
  color: string;
  Icon: typeof Eye;
}) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">
          {label}
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/[0.04] grid place-items-center" style={{ color }}>
          <Icon size={15} />
        </div>
      </div>
      <div className="font-[family-name:var(--font-display)] text-[34px] font-medium leading-none tracking-tight">
        {value}
      </div>
    </div>
  );
}
