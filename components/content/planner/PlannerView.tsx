"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Globe,
  Send,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import type { ContentPlatform, PlannerSlot, ContentPost } from "@/lib/types";

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const PLATFORM_ICON: Record<ContentPlatform, typeof Globe> = {
  linkedin:  Globe,
  twitter:   Send,
  instagram: Globe,
  facebook:  Globe,
};
const PLATFORM_COLOR: Record<ContentPlatform, string> = {
  linkedin:  "#0A66C2",
  twitter:   "#1DA1F2",
  instagram: "#E1306C",
  facebook:  "#1877F2",
};

function getWeekDates(offset = 0): Date[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

interface PlannerViewProps {
  initialSlots?: PlannerSlot[];
}

export function PlannerView({ initialSlots = [] }: PlannerViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [platformFilter, setPlatformFilter] = useState<ContentPlatform | "all">("all");
  const [slots, setSlots] = useState<PlannerSlot[]>(initialSlots);
  const [showModal, setShowModal] = useState(false);
  const [addForDate, setAddForDate] = useState("");
  const [slotForm, setSlotForm] = useState({ plataforma: "linkedin" as ContentPlatform, hora: "", hook: "" });
  const [saving, setSaving] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Reload slots when week changes (skip offset 0 — SSR handled initial load)
  useEffect(() => {
    if (weekOffset === 0) return;
    const start = weekDates[0].toISOString().slice(0, 10);
    const end   = weekDates[6].toISOString().slice(0, 10);
    setLoadingSlots(true);
    fetch(`/api/content/planner?start=${start}&end=${end}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: PlannerSlot[]) => setSlots(data))
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [weekOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  const slotsByDate = useMemo(() => {
    const map: Record<string, PlannerSlot[]> = {};
    const filtered = platformFilter === "all"
      ? slots
      : slots.filter((s) => s.plataforma === platformFilter);
    filtered.forEach((s) => {
      if (!map[s.fecha]) map[s.fecha] = [];
      map[s.fecha].push(s);
    });
    return map;
  }, [slots, platformFilter]);

  const weekLabel = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    const fmt = (d: Date) =>
      d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
    return `${fmt(first)} — ${fmt(last)}`;
  }, [weekDates]);

  function openModal(date?: string) {
    setAddForDate(date ?? new Date().toISOString().slice(0, 10));
    setSlotForm({ plataforma: "linkedin", hora: "", hook: "" });
    setShowModal(true);
  }

  async function addSlot() {
    if (!slotForm.hook.trim() || saving) return;
    setSaving(true);

    // Optimistic insert with temp id
    const tempId = `temp_${Date.now()}`;
    const now = new Date().toISOString();
    const optimisticPost: ContentPost = {
      id: tempId,
      titulo: slotForm.hook,
      plataforma: slotForm.plataforma,
      tipo: "post",
      estado: "borrador",
      hook: slotForm.hook,
      version: 1,
      created_at: now,
      updated_at: now,
    };
    const optimisticSlot: PlannerSlot = {
      id: tempId,
      post_id: tempId,
      plataforma: slotForm.plataforma,
      fecha: addForDate,
      hora: slotForm.hora || undefined,
      estado: "programado",
      orden: slots.length,
      post: optimisticPost,
    };
    setSlots((prev) => [...prev, optimisticSlot]);
    setShowModal(false);

    try {
      const res = await fetch("/api/content/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha:      addForDate,
          hora:       slotForm.hora || null,
          plataforma: slotForm.plataforma,
          hook:       slotForm.hook,
          titulo:     slotForm.hook,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const saved = await res.json() as PlannerSlot;
      // Replace optimistic slot with real one
      setSlots((prev) =>
        prev.map((s) => s.id === tempId ? { ...saved, post: optimisticPost } : s),
      );
      toast.success("Slot guardado");
    } catch {
      setSlots((prev) => prev.filter((s) => s.id !== tempId));
      toast.error("Error al guardar el slot");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot(slotId: string) {
    const prev = slots;
    setSlots((s) => s.filter((x) => x.id !== slotId));
    try {
      await fetch(`/api/content/planner/${slotId}`, { method: "DELETE" });
    } catch {
      setSlots(prev);
      toast.error("Error al eliminar el slot");
    }
  }

  const isToday = (d: Date) => {
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };

  return (
    <>
      <PageHead
        title="Planner"
        subtitle="Organizá y programá tu contenido semana por semana"
        actions={
          <Button variant="primary" onClick={() => openModal()}>
            <Plus size={14} /> Agregar slot
          </Button>
        }
      />

      {/* Week nav + filters */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset((v) => v - 1)}
            className="w-8 h-8 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] grid place-items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="font-[family-name:var(--font-display)] text-[15px] font-medium min-w-[180px] text-center">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((v) => v + 1)}
            className="w-8 h-8 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] grid place-items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition"
          >
            <ChevronRight size={15} />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[12px] text-[var(--color-primary-hover)] hover:underline cursor-pointer bg-transparent border-0"
            >
              Hoy
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Chip active={platformFilter === "all"} onClick={() => setPlatformFilter("all")}>Todas</Chip>
          {(["linkedin", "twitter", "instagram"] as ContentPlatform[]).map((p) => (
            <Chip key={p} active={platformFilter === p} onClick={() => setPlatformFilter(p)}>
              {p === "linkedin" ? "LinkedIn" : p === "twitter" ? "X" : "IG"}
            </Chip>
          ))}
        </div>
      </div>

      {/* Add slot modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">Agregar slot · {addForDate}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Plataforma</label>
                <select
                  value={slotForm.plataforma}
                  onChange={(e) => setSlotForm((f) => ({ ...f, plataforma: e.target.value as ContentPlatform }))}
                  className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition appearance-none"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">X / Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Hora (opcional)</label>
                <input
                  type="time"
                  value={slotForm.hora}
                  onChange={(e) => setSlotForm((f) => ({ ...f, hora: e.target.value }))}
                  className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Hook / título *</label>
                <textarea
                  autoFocus
                  rows={3}
                  value={slotForm.hook}
                  onChange={(e) => setSlotForm((f) => ({ ...f, hook: e.target.value }))}
                  placeholder="¿De qué trata este post?"
                  className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer hover:text-[var(--color-text)] transition">Cancelar</button>
              <button onClick={addSlot} disabled={!slotForm.hook.trim() || saving} className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition disabled:opacity-50">{saving ? "Guardando..." : "Agregar slot"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 gap-2 transition-opacity duration-200 ${loadingSlots ? "opacity-40 pointer-events-none" : ""}`}>
        {weekDates.map((date, i) => {
          const dateKey = date.toISOString().slice(0, 10);
          const daySlots = slotsByDate[dateKey] ?? [];
          const today = isToday(date);

          return (
            <div
              key={dateKey}
              className={
                "rounded-2xl border flex flex-col min-h-[240px] " +
                (today
                  ? "border-[rgba(43,91,255,0.4)] bg-gradient-to-b from-[rgba(43,91,255,0.08)] to-[rgba(43,91,255,0.02)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]")
              }
            >
              {/* Day header */}
              <div className="p-3 pb-2 border-b border-[var(--color-border)]">
                <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] font-medium">
                  {DAYS_ES[i]}
                </div>
                <div
                  className={
                    "font-[family-name:var(--font-display)] text-[22px] font-medium leading-none mt-0.5 " +
                    (today ? "text-[var(--color-primary-hover)]" : "text-[var(--color-text)]")
                  }
                >
                  {date.getDate()}
                </div>
                {daySlots.length > 0 && (
                  <div className="font-mono text-[10px] text-[var(--color-text-dim)] mt-0.5">
                    {daySlots.length} post{daySlots.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Slots */}
              <div className="flex-1 p-2 flex flex-col gap-1.5">
                {daySlots.map((slot) => {
                  const PlatIcon = PLATFORM_ICON[slot.plataforma];
                  const color = PLATFORM_COLOR[slot.plataforma];
                  return (
                    <div
                      key={slot.id}
                      className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-2)] transition cursor-pointer group relative"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <PlatIcon size={11} style={{ color }} />
                        {slot.hora && (
                          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">
                            {slot.hora.slice(0, 5)}
                          </span>
                        )}
                        <span
                          className={
                            "ml-auto w-1.5 h-1.5 rounded-full " +
                            (slot.estado === "publicado"
                              ? "bg-[var(--color-success)]"
                              : slot.estado === "programado"
                              ? "bg-[var(--color-primary-hover)]"
                              : "bg-[var(--color-warning)]")
                          }
                        />
                      </div>
                      {slot.post?.hook && (
                        <p className="text-[11px] text-[var(--color-text)] leading-snug line-clamp-2">
                          {slot.post.hook}
                        </p>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSlot(slot.id); }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded grid place-items-center text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition bg-transparent border-0 cursor-pointer hover:bg-[rgba(255,84,102,0.1)]"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  );
                })}

                {/* Add slot button */}
                <button onClick={() => openModal(dateKey)} className="mt-auto w-full py-2 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-dim)] text-[11px] hover:border-[var(--color-border-2)] hover:text-[var(--color-text-muted)] transition cursor-pointer bg-transparent flex items-center justify-center gap-1">
                  <Plus size={11} /> Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
