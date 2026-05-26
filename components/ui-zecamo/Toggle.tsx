"use client";

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-[42px] h-6 rounded-xl border-0 cursor-pointer p-0 transition-colors"
      style={{
        background: value
          ? "linear-gradient(180deg, var(--color-primary-hover), var(--color-primary))"
          : "rgba(255,255,255,0.08)",
        boxShadow: value ? "0 0 12px var(--color-glow)" : "none",
      }}
      aria-pressed={value}
    >
      <span
        className="absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-[left] duration-150"
        style={{ left: value ? 20 : 2 }}
      />
    </button>
  );
}
