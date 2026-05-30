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
  Calendar,
  Copy,
  History,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card } from "@/components/ui-zecamo/Card";
import { Chip } from "@/components/ui-zecamo/Chip";
import { Pill } from "@/components/ui-zecamo/Pill";
import type { ContentPost, ContentStatus, ContentPlatform, WorkflowEvent } from "@/lib/types";

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
  borrador:   { label: "Borrador",    variant: "archivado" },
  revision:   { label: "En revisión", variant: "review" },
  aprobado:   { label: "Aprobado",    variant: "venta" },
  programado: { label: "Programado",  variant: "discovery" },
  publicado:  { label: "Publicado",   variant: "active" },
  rechazado:  { label: "Rechazado",   variant: "noventa" },
};

interface QueueViewProps {
  initialPosts?: ContentPost[];
}

export function QueueView({ initialPosts = [] }: QueueViewProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<ContentPost[]>(initialPosts);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<ContentPlatform | "all">("all");
  const [schedulePostId, setSchedulePostId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [expandedEvents, setExpandedEvents] = useState<string | null>(null);
  const [eventsCache, setEventsCache] = useState<Record<string, WorkflowEvent[]>>({});

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

  async function transition(id: string, from: ContentStatus, to: ContentStatus) {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, estado: to } : p));
    const res = await fetch("/api/content/workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: id, from, to }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, estado: from } : p));
      toast.error(error ?? "Error al cambiar estado");
    }
  }

  async function approvePost(post: ContentPost) {
    await transition(post.id, post.estado, "aprobado");
    toast.success("Post aprobado");
  }

  async function rejectPost(post: ContentPost) {
    await transition(post.id, post.estado, "rechazado");
    toast.error("Post rechazado");
  }

  async function confirmSchedule() {
    if (!schedulePostId || !scheduleDate) return;
    const post = posts.find((p) => p.id === schedulePostId);
    if (!post) return;

    const dt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    setPosts((prev) =>
      prev.map((p) => p.id === schedulePostId ? { ...p, estado: "programado", programado_para: dt } : p),
    );
    setSchedulePostId(null);

    const res = await fetch("/api/content/workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: schedulePostId,
        from: "aprobado",
        to: "programado",
        metadata: { programado_para: dt },
      }),
    });

    if (!res.ok) {
      setPosts((prev) =>
        prev.map((p) => p.id === schedulePostId ? { ...p, estado: "aprobado", programado_para: undefined } : p),
      );
      toast.error("Error al programar");
      return;
    }

    await fetch(`/api/content/posts/${schedulePostId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programado_para: dt }),
    });

    toast.success("Post programado");
  }

  async function duplicatePost(post: ContentPost) {
    const res = await fetch("/api/content/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo:     `${post.titulo} (copia)`,
        contenido:  post.contenido,
        plataforma: post.plataforma,
        tipo:       post.tipo,
        estado:     "borrador",
        hook:       post.hook,
        cta:        post.cta,
        hashtags:   post.hashtags,
        version:    1,
      }),
    });
    if (res.ok) {
      const dup = await res.json() as ContentPost;
      setPosts((prev) => [dup, ...prev]);
      toast.success("Post duplicado como borrador");
    } else {
      toast.error("Error al duplicar");
    }
  }

  async function loadEvents(postId: string) {
    if (expandedEvents === postId) {
      setExpandedEvents(null);
      return;
    }
    setExpandedEvents(postId);
    if (eventsCache[postId]) return;

    const res = await fetch(`/api/content/workflow?post_id=${postId}`);
    if (res.ok) {
      const events = await res.json() as WorkflowEvent[];
      setEventsCache((c) => ({ ...c, [postId]: events }));
    }
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
        <QueueKpi label="En revisión"  value={counts.revision}   color="var(--color-warning)"        Icon={Eye} />
        <QueueKpi label="Aprobados"    value={counts.aprobado}   color="var(--color-success)"        Icon={CheckCircle2} />
        <QueueKpi label="Programados"  value={counts.programado} color="var(--color-primary-hover)"  Icon={Clock} />
        <QueueKpi label="Publicados"   value={counts.publicado}  color="var(--color-info)"           Icon={Send} />
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
        {(["linkedin", "twitter", "instagram", "facebook"] as ContentPlatform[]).map((p) => (
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
            const sp      = STATUS_PILL[post.estado];
            const showEvt = expandedEvents === post.id;
            const events  = eventsCache[post.id] ?? [];

            return (
              <div
                key={post.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden hover:border-[var(--color-border-2)] transition-all"
              >
                <div className="p-5 group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-[var(--color-border)] grid place-items-center shrink-0">
                      <Send size={16} className={PLATFORM_COLORS[post.plataforma]} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => loadEvents(post.id)}
                        className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white/[0.03] grid place-items-center text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text)] transition"
                        title="Historial"
                      >
                        {showEvt ? <ChevronUp size={13} /> : <History size={13} />}
                      </button>
                      <button
                        onClick={() => duplicatePost(post)}
                        className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white/[0.03] grid place-items-center text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text)] transition"
                        title="Duplicar"
                      >
                        <Copy size={13} />
                      </button>

                      {post.estado === "revision" && (
                        <>
                          <button
                            onClick={() => rejectPost(post)}
                            className="w-8 h-8 rounded-lg border border-[rgba(255,84,102,0.3)] bg-[rgba(255,84,102,0.08)] grid place-items-center text-[var(--color-danger)] cursor-pointer hover:bg-[rgba(255,84,102,0.14)] transition"
                            title="Rechazar"
                          >
                            <XCircle size={14} />
                          </button>
                          <button
                            onClick={() => approvePost(post)}
                            className="w-8 h-8 rounded-lg border border-[rgba(34,197,139,0.3)] bg-[rgba(34,197,139,0.08)] grid place-items-center text-[var(--color-success)] cursor-pointer hover:bg-[rgba(34,197,139,0.14)] transition"
                            title="Aprobar"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        </>
                      )}

                      {post.estado === "aprobado" && (
                        <button
                          onClick={() => setSchedulePostId(post.id)}
                          className="h-8 px-3 rounded-lg border border-[rgba(43,91,255,0.3)] bg-[rgba(43,91,255,0.08)] text-[11.5px] font-medium text-[var(--color-primary-hover)] cursor-pointer hover:bg-[rgba(43,91,255,0.14)] transition flex items-center gap-1.5"
                        >
                          <Calendar size={12} /> Programar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Workflow events */}
                {showEvt && (
                  <div className="border-t border-[var(--color-border)] bg-white/[0.02] px-5 py-3">
                    <p className="text-[10.5px] uppercase tracking-widest text-[var(--color-text-dim)] mb-2 font-medium">
                      Historial de estados
                    </p>
                    {events.length === 0 ? (
                      <p className="text-[12px] text-[var(--color-text-muted)]">Sin eventos registrados</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {events.map((e) => (
                          <div key={e.id} className="flex items-center gap-2 text-[12px]">
                            <span className="text-[var(--color-text-dim)] font-mono text-[10.5px]">
                              {new Date(e.created_at).toLocaleString("es-AR", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                            <span className="text-[var(--color-text-muted)]">{e.evento}</span>
                            {e.actor && (
                              <span className="text-[var(--color-text-dim)]">por {e.actor}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule modal */}
      {schedulePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-[15px] font-semibold mb-1">Programar publicación</h3>
            <p className="text-[12.5px] text-[var(--color-text-muted)] mb-5">
              Elegí fecha y hora para la publicación automática
            </p>

            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 font-medium">
                  Fecha
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 font-medium">
                  Hora
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setSchedulePostId(null)}>Cancelar</Button>
              <Button variant="primary" onClick={confirmSchedule} disabled={!scheduleDate}>
                <Calendar size={13} /> Programar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QueueKpi({
  label, value, color, Icon,
}: {
  label: string; value: number; color: string; Icon: typeof Eye;
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
