"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-xl text-[13px] w-full mb-3">
      <Search size={14} className="text-[var(--color-text-muted)]" />
      <input
        placeholder="Buscar en el manual..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 outline-0 bg-transparent flex-1 text-[var(--color-text)]"
      />
    </div>
  );
}
