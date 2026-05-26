"use client";

interface FunnelStage {
  id: string;
  label: string;
  count: number;
}

interface FunnelProps {
  stages: FunnelStage[];
}

export function Funnel({ stages }: FunnelProps) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {stages.map((s, i) => {
        const pct = (s.count / max) * 100;
        const next = stages[i + 1];
        const dropoff = next && s.count > 0 ? Math.round(((s.count - next.count) / s.count) * 100) : 0;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 140, fontSize: 12.5, color: "var(--color-text-muted)", flexShrink: 0 }}>
              {s.label}
            </div>
            <div style={{ flex: 1, position: "relative", height: 32 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${pct}%`,
                  borderRadius: 6,
                  background: "linear-gradient(90deg, rgba(43,91,255,0.35), rgba(43,91,255,0.18))",
                  border: "1px solid rgba(43,91,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12,
                  boxShadow: "0 0 12px rgba(43,91,255,0.18)",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>
                  {s.count}
                </span>
              </div>
            </div>
            <div style={{ width: 60, fontSize: 11, fontFamily: "var(--font-mono)", color: dropoff > 50 ? "var(--color-warning)" : "var(--color-text-dim)", textAlign: "right" }}>
              {next ? `-${dropoff}%` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
