"use client";

// TODO: migrar a Framer Motion (slide-in del drawer)
import { useState, useEffect } from "react";
import { Sliders } from "lucide-react";
import { Toggle } from "@/components/ui-zecamo/Toggle";

type Density = "compact" | "comfortable" | "spacious";

export function TweaksDrawer() {
  const [open, setOpen] = useState(false);
  const [density, setDensity] = useState<Density>("comfortable");
  const [glow, setGlow] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
    document.documentElement.style.setProperty(
      "--color-glow",
      glow ? "rgba(43, 91, 255, 0.45)" : "rgba(43, 91, 255, 0)",
    );
  }, [density, glow]);

  return (
    <>
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-2)] text-[var(--color-text)] grid place-items-center cursor-pointer z-50 shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:border-[rgba(43,91,255,0.25)] transition-all"
        aria-label="Tweaks"
      >
        <Sliders size={18} />
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 w-[300px] bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-2xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.5)] z-50">
          <div className="font-[family-name:var(--font-display)] font-medium text-[15px] mb-4">Tweaks</div>

          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2 font-medium">Densidad</div>
            <div className="flex gap-1 p-[3px] bg-white/[0.025] border border-[var(--color-border)] rounded-xl">
              {(["compact", "comfortable", "spacious"] as Density[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-[9px] cursor-pointer transition-all border-0 ${
                    density === d
                      ? "bg-[var(--color-surface-2)] text-[var(--color-text)] shadow-[0_0_0_1px_var(--color-border-2)]"
                      : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {d === "compact" ? "Compacto" : d === "spacious" ? "Amplio" : "Cómodo"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium">Glow azul</div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Sombras y halos del brand</div>
            </div>
            <Toggle value={glow} onChange={setGlow} />
          </div>
        </div>
      )}
    </>
  );
}
