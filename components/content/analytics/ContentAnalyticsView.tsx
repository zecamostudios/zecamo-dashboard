"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Star,
  Users,
  ThumbsUp,
  Share2,
  Sparkles,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Chip } from "@/components/ui-zecamo/Chip";
import { Pill } from "@/components/ui-zecamo/Pill";

// ── Mock data (used when DB tables don't exist yet) ──────────────────────────

const MOCK_KPI = {
  totalPosts:      47,
  publishedPosts:  32,
  avgAiScore:      7.4,
  totalReach:      18_420,
  totalEngagement: 2_310,
  avgEngagementRate: 12.5,
  topPlatform:     "LinkedIn",
  followersGained: 143,
};

const MOCK_TOP_POSTS = [
  { id: "1", titulo: "¿Por qué tu equipo sigue haciendo esto manualmente?", plataforma: "linkedin", ai_score: 9.1, alcance: 4_200, engagement: 680, estado: "publicado" },
  { id: "2", titulo: "ANTES: 6 horas de seguimiento. AHORA: 0.",              plataforma: "linkedin", ai_score: 8.8, alcance: 3_800, engagement: 510, estado: "publicado" },
  { id: "3", titulo: "3 automatizaciones que cambiaron una clínica en 2 semanas", plataforma: "instagram", ai_score: 8.3, alcance: 2_900, engagement: 390, estado: "publicado" },
  { id: "4", titulo: "El error que cometen el 80% de las agencias con la IA",  plataforma: "twitter",   ai_score: 8.0, alcance: 2_100, engagement: 280, estado: "publicado" },
  { id: "5", titulo: "Implementamos en semanas, no meses. Acá el proceso.",    plataforma: "linkedin", ai_score: 7.9, alcance: 1_950, engagement: 250, estado: "publicado" },
];

const MOCK_PLATFORM_BREAKDOWN = [
  { plataforma: "LinkedIn",  posts: 22, alcance: 11_200, engagement: 1_480, color: "#2B5BFF" },
  { plataforma: "Instagram", posts: 14, alcance: 4_800,  engagement: 580,   color: "#EC4899" },
  { plataforma: "Twitter",   posts: 11, alcance: 2_420,  engagement: 250,   color: "#06B6D4" },
];

const MOCK_WEEKLY = [
  { day: "L", date: "Lun", posts: 2, alcance: 1_400 },
  { day: "M", date: "Mar", posts: 1, alcance: 800 },
  { day: "X", date: "Mié", posts: 3, alcance: 2_100 },
  { day: "J", date: "Jue", posts: 0, alcance: 0 },
  { day: "V", date: "Vie", posts: 2, alcance: 1_600 },
  { day: "S", date: "Sáb", posts: 1, alcance: 600 },
  { day: "D", date: "Dom", posts: 0, alcance: 0 },
];

const MOCK_ENGAGEMENT_TREND = [
  { week: "S-4", rate: 9.8 },
  { week: "S-3", rate: 11.2 },
  { week: "S-2", rate: 10.5 },
  { week: "S-1", rate: 13.1 },
  { week: "Esta", rate: 12.5 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const PLATFORM_COLORS: Record<string, string> = {
  linkedin:  "#2B5BFF",
  twitter:   "#06B6D4",
  instagram: "#EC4899",
  facebook:  "#3B82F6",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  delta,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof BarChart3;
  color: string;
  delta?: number;
}) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl grid place-items-center"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div
        className="font-[family-name:var(--font-display)] text-[34px] font-medium leading-none tracking-tight"
        style={{ color }}
      >
        {value}
      </div>
      {(sub || delta !== undefined) && (
        <div className="flex items-center gap-1.5">
          {delta !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-[11px] font-medium ${delta >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
            >
              {delta >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {Math.abs(delta)}%
            </span>
          )}
          {sub && <span className="text-[11px] text-[var(--color-text-dim)]">{sub}</span>}
        </div>
      )}
    </div>
  );
}

function BarChart({
  data,
  max,
  color,
}: {
  data: { label: string; value: number }[];
  max: number;
  color?: string;
}) {
  return (
    <div className="flex items-end gap-1.5 h-[80px]">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${Math.max(4, (d.value / max) * 72)}px`,
              background: color ?? "var(--color-primary-hover)",
              opacity: d.value === 0 ? 0.15 : 0.85,
            }}
          />
          <span className="text-[9.5px] text-[var(--color-text-dim)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const H = 60;
  const W = 100;
  const step = W / (data.length - 1);

  const points = data.map((d, i) => ({
    x: i * step,
    y: H - ((d.value - min) / range) * (H - 8) - 4,
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${H} L 0 ${H} Z`;

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 64 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2B5BFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2B5BFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineGrad)" />
        <path d={path} fill="none" stroke="#2B5BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="#2B5BFF" />
        ))}
      </svg>
      <div className="flex justify-between">
        {data.map((d) => (
          <span key={d.label} className="text-[9.5px] text-[var(--color-text-dim)]">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Timeframe = "7d" | "30d" | "90d";

interface ContentAnalyticsViewProps {
  isMock?: boolean;
}

export function ContentAnalyticsView({ isMock = true }: ContentAnalyticsViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [topPosts, setTopPosts] = useState(MOCK_TOP_POSTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isMock) return;
    setLoading(true);
    fetch("/api/content/analytics?top=5")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setTopPosts(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isMock]);

  const maxReach = Math.max(...MOCK_PLATFORM_BREAKDOWN.map((p) => p.alcance));

  return (
    <>
      <PageHead
        title={
          <>
            Analytics
            {isMock && (
              <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(245,158,11,0.10)] border border-[rgba(245,158,11,0.25)] rounded-full text-[11px] font-medium text-[var(--color-warning)] align-middle">
                Demo data
              </span>
            )}
          </>
        }
        subtitle="Rendimiento del contenido publicado por plataforma"
        actions={
          <div className="flex gap-1.5">
            {(["7d", "30d", "90d"] as Timeframe[]).map((t) => (
              <Chip key={t} active={timeframe === t} onClick={() => setTimeframe(t)}>
                {t === "7d" ? "7 días" : t === "30d" ? "30 días" : "90 días"}
              </Chip>
            ))}
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-[14px] mb-[14px] max-[1100px]:grid-cols-2 max-[600px]:grid-cols-1">
        <KpiCard
          label="Posts publicados"
          value={MOCK_KPI.publishedPosts}
          sub="de 47 totales"
          icon={Calendar}
          color="var(--color-primary-hover)"
          delta={12}
        />
        <KpiCard
          label="Alcance total"
          value={fmtNum(MOCK_KPI.totalReach)}
          sub="impresiones únicas"
          icon={Eye}
          color="var(--color-success)"
          delta={8}
        />
        <KpiCard
          label="Engagement rate"
          value={`${MOCK_KPI.avgEngagementRate}%`}
          sub="promedio en todos los posts"
          icon={ThumbsUp}
          color="#F59E0B"
          delta={3}
        />
        <KpiCard
          label="Score IA promedio"
          value={MOCK_KPI.avgAiScore}
          sub="sobre 10"
          icon={Sparkles}
          color="#A47BFF"
          delta={5}
        />
      </div>

      <div className="grid grid-cols-12 gap-[14px]">
        {/* Left col */}
        <div className="col-span-8 max-[1100px]:col-span-12 flex flex-col gap-[14px]">
          {/* Top posts */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Star size={16} />}>Top 5 Posts</CardTitle>
            </CardHead>
            <div className="flex flex-col">
              {(loading ? MOCK_TOP_POSTS : topPosts).map((post, i) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0"
                >
                  <span className="text-[13px] font-mono text-[var(--color-text-dim)] w-5 shrink-0">
                    {i + 1}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: PLATFORM_COLORS[post.plataforma] ?? "#888" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-[var(--color-text)] truncate">{post.titulo}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10.5px] text-[var(--color-text-dim)] capitalize">{post.plataforma}</span>
                      <span className="text-[10.5px] text-[var(--color-text-dim)]">·</span>
                      <span className="text-[10.5px] text-[var(--color-text-dim)]">
                        {fmtNum(post.alcance)} alcance
                      </span>
                      <span className="text-[10.5px] text-[var(--color-text-dim)]">·</span>
                      <span className="text-[10.5px] text-[var(--color-text-dim)]">
                        {fmtNum(post.engagement)} eng.
                      </span>
                    </div>
                  </div>
                  {post.ai_score != null && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Sparkles size={10} className="text-[var(--color-warning)]" />
                      <span className="text-[11px] font-mono text-[var(--color-warning)]">
                        {post.ai_score}
                      </span>
                    </div>
                  )}
                  <Pill variant="active" className="shrink-0">
                    {post.estado}
                  </Pill>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly activity */}
          <Card>
            <CardHead>
              <CardTitle big icon={<BarChart3 size={16} />}>
                Actividad semanal
              </CardTitle>
              <span className="text-[11px] text-[var(--color-text-dim)]">Posts publicados por día</span>
            </CardHead>
            <BarChart
              data={MOCK_WEEKLY.map((d) => ({ label: d.day, value: d.posts }))}
              max={Math.max(...MOCK_WEEKLY.map((d) => d.posts), 1)}
              color="var(--color-primary-hover)"
            />
          </Card>
        </div>

        {/* Right col */}
        <div className="col-span-4 max-[1100px]:col-span-12 flex flex-col gap-[14px]">
          {/* Platform breakdown */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Share2 size={16} />}>
                Por plataforma
              </CardTitle>
            </CardHead>
            <div className="flex flex-col gap-3">
              {MOCK_PLATFORM_BREAKDOWN.map((p) => (
                <div key={p.plataforma}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[var(--color-text)]">{p.plataforma}</span>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                      {fmtNum(p.alcance)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(p.alcance / maxReach) * 100}%`,
                        background: p.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-[var(--color-text-dim)]">{p.posts} posts</span>
                    <span className="text-[10px] text-[var(--color-text-dim)]">{fmtNum(p.engagement)} eng.</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Engagement trend */}
          <Card>
            <CardHead>
              <CardTitle big icon={<TrendingUp size={16} />}>
                Engagement trend
              </CardTitle>
            </CardHead>
            <LineChart
              data={MOCK_ENGAGEMENT_TREND.map((d) => ({ label: d.week, value: d.rate }))}
            />
            <div className="mt-2 flex items-center gap-1.5 pt-3 border-t border-[var(--color-border)]">
              <ArrowUp size={12} className="text-[var(--color-success)]" />
              <span className="text-[11.5px] text-[var(--color-success)] font-medium">+2.7%</span>
              <span className="text-[11px] text-[var(--color-text-dim)]">vs semana anterior</span>
            </div>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Users size={16} />}>
                Seguidores
              </CardTitle>
            </CardHead>
            <div className="flex flex-col gap-3">
              {[
                { label: "Ganados este mes",    value: `+${MOCK_KPI.followersGained}`, color: "var(--color-success)" },
                { label: "Mejor plataforma",    value: MOCK_KPI.topPlatform,           color: "var(--color-primary-hover)" },
                { label: "Total engagement",    value: fmtNum(MOCK_KPI.totalEngagement), color: "#F59E0B" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-[12px] text-[var(--color-text-muted)]">{s.label}</span>
                  <span className="text-[13px] font-semibold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
