"use client";

// TODO: migrar a Recharts si se necesita interactividad (tooltips, zoom)
import type { FinancePoint } from "@/lib/types";

interface AreaChartProps {
  data: FinancePoint[];
  height?: number;
}

export function AreaChart({ data, height = 240 }: AreaChartProps) {
  const w = 720;
  const h = height;
  const pad = { l: 48, r: 12, t: 16, b: 28 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const maxV = Math.max(...data.map((d) => Math.max(d.in, d.out)));
  const niceMax = Math.ceil(maxV / 2000) * 2000;
  const stepX = cw / (data.length - 1);
  const yAt = (v: number) => pad.t + ch - (v / niceMax) * ch;
  const xAt = (i: number) => pad.l + i * stepX;
  const buildPath = (key: "in" | "out") =>
    data.map((d, i) => (i === 0 ? "M" : "L") + xAt(i).toFixed(1) + " " + yAt(d[key]).toFixed(1)).join(" ");
  const buildArea = (key: "in" | "out") =>
    buildPath(key) + ` L ${xAt(data.length - 1)} ${pad.t + ch} L ${xAt(0)} ${pad.t + ch} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));

  return (
    <div style={{ width: "100%", height }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="ac-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-hover)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-primary-hover)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ac-out" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-purple)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-purple)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={yAt(t)}
              y2={yAt(t)}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="2 4"
            />
            <text x={pad.l - 8} y={yAt(t) + 4} textAnchor="end" fontSize="10" fill="var(--color-text-dim)" fontFamily="var(--font-mono)">
              ${(t / 1000).toFixed(0)}k
            </text>
          </g>
        ))}

        <path d={buildArea("in")} fill="url(#ac-in)" />
        <path d={buildArea("out")} fill="url(#ac-out)" />
        <path
          d={buildPath("in")}
          fill="none"
          stroke="var(--color-primary-hover)"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px var(--color-glow))" }}
        />
        <path d={buildPath("out")} fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinejoin="round" />

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xAt(i)} cy={yAt(d.in)} r="3" fill="var(--color-primary-hover)" />
            <circle cx={xAt(i)} cy={yAt(d.out)} r="3" fill="var(--color-purple)" />
            <text x={xAt(i)} y={h - 8} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">
              {d.m}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
