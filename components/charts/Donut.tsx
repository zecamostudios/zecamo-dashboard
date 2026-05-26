"use client";

interface DonutProps {
  pct: number;
  label: string;
  sub?: string;
  color?: string;
  size?: number;
}

// TODO: migrar a Framer Motion (animar strokeDashoffset)
export function Donut({ pct, label, sub, color = "var(--color-primary-hover)", size = 100 }: DonutProps) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 600ms" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: size * 0.22,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            {label}
          </div>
          {sub && <div style={{ fontSize: 10, color: "var(--color-text-dim)", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}
