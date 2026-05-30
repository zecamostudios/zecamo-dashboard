import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const SIZE = 1080;

type SlideType = "hook" | "body" | "cta";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const type    = (searchParams.get("type")    ?? "body") as SlideType;
  const text    = searchParams.get("text")    ?? "";
  const title   = searchParams.get("title")   ?? "";
  const slide   = parseInt(searchParams.get("slide")   ?? "1", 10);
  const total   = parseInt(searchParams.get("total")   ?? "1", 10);
  const brand   = searchParams.get("brand")   ?? "Zecamo";
  const accent  = searchParams.get("accent")  ?? "#4F7CFF";

  return new ImageResponse(
    <SlideLayout type={type} text={text} title={title} slide={slide} total={total} brand={brand} accent={accent} />,
    { width: SIZE, height: SIZE },
  );
}

function SlideLayout({
  type, text, title, slide, total, brand, accent,
}: {
  type: SlideType;
  text: string;
  title: string;
  slide: number;
  total: number;
  brand: string;
  accent: string;
}) {
  const isHook = type === "hook";
  const isCta  = type === "cta";

  return (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        background: "#09090f",
        display: "flex",
        flexDirection: "column",
        padding: "72px",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: accent,
        }}
      />

      {/* Top row: brand + slide counter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: isHook ? 80 : 48,
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: accent, letterSpacing: "0.04em" }}>
          {brand.toUpperCase()}
        </span>
        <span style={{ fontSize: 20, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
          {slide}/{total}
        </span>
      </div>

      {/* Content area */}
      {isHook ? (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          {title && (
            <p style={{ fontSize: 22, color: accent, fontWeight: 600, margin: "0 0 24px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {title}
            </p>
          )}
          <p style={{ fontSize: 64, fontWeight: 800, color: "#ffffff", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
            {text}
          </p>
        </div>
      ) : isCta ? (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <p style={{ fontSize: 22, color: accent, fontWeight: 600, margin: "0 0 28px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ¿Qué sigue?
          </p>
          <p style={{ fontSize: 48, fontWeight: 700, color: "#ffffff", lineHeight: 1.2, margin: "0 0 48px" }}>
            {text}
          </p>
          {/* Bottom CTA decoration */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 4, background: accent, borderRadius: 2 }} />
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.5)" }}>Seguí para más contenido</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {title && (
            <p style={{ fontSize: 26, color: accent, fontWeight: 700, margin: "0 0 28px", lineHeight: 1.3 }}>
              {title}
            </p>
          )}
          <p style={{ fontSize: 38, color: "rgba(255,255,255,0.88)", lineHeight: 1.55, margin: 0, fontWeight: 400 }}>
            {text}
          </p>
        </div>
      )}

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.06)",
        }}
      />
    </div>
  );
}
