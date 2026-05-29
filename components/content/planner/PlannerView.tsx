"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Globe,
  Send,
} from "lucide-react";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import type { ContentPlatform, PlannerSlot } from "@/lib/types";

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
  const [slots] = useState<PlannerSlot[]>(initialSlots);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

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
          <Button variant="primary">
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
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
                      className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-2)] transition cursor-pointer group"
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
                    </div>
                  );
                })}

                {/* Add slot button */}
                <button className="mt-auto w-full py-2 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-dim)] text-[11px] hover:border-[var(--color-border-2)] hover:text-[var(--color-text-muted)] transition cursor-pointer bg-transparent flex items-center justify-center gap-1">
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
