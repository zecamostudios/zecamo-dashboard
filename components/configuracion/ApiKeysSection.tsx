"use client";

import { useState } from "react";
import { Flame, Plus, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui-zecamo/Button";
import { ConfigSection } from "./_shared";

const MODAL_INPUT = "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition";

interface ApiKey {
  id: string;
  label: string;
  key: string;
  created: string;
  lastUsed: string;
}

const INITIAL_KEYS: ApiKey[] = [
  { id: "prod", label: "Producción", key: "sk_live_zec_4f8a92b1c3d6e7f0a8b2c4d5e6f7a8b9", created: "15 Ene 2026", lastUsed: "Hace 2 min" },
  { id: "staging", label: "Staging", key: "sk_test_zec_9d2c1b3a5e6f7081d4c2b1a0e9f8d7c6", created: "15 Ene 2026", lastUsed: "Hace 4h" },
  { id: "dev", label: "Development", key: "sk_dev_zec_aaaa1111bbbb2222cccc3333dddd4444", created: "22 Mar 2026", lastUsed: "Hoy" },
];

const mask = (k: string) => "•".repeat(28) + k.slice(-6);
const genKey = (prefix: string) => `${prefix}_zec_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [showNew, setShowNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const toggle = (k: string) => setRevealed((p) => ({ ...p, [k]: !p[k] }));

  function rotateKey(id: string) {
    const key = keys.find((k) => k.id === id);
    if (!confirm(`¿Rotar la key "${key?.label}"? La anterior se invalidará en 15 minutos.`)) return;
    const prefix = id === "prod" ? "sk_live" : id === "staging" ? "sk_test" : "sk_dev";
    const newKey = genKey(prefix);
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, key: newKey } : k));
    setRevealed((p) => ({ ...p, [id]: true }));
    toast.success(`Key "${key?.label}" rotada — copiala antes de salir`);
  }

  function createKey() {
    if (!newLabel.trim()) return;
    const id = `key_${Date.now()}`;
    const newKey = genKey("sk_custom");
    const today = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
    setKeys((prev) => [...prev, { id, label: newLabel.trim(), key: newKey, created: today, lastUsed: "Nunca" }]);
    setRevealed((p) => ({ ...p, [id]: true }));
    toast.success(`API key "${newLabel}" creada`);
    setShowNew(false);
    setNewLabel("");
  }

  return (
    <ConfigSection title="API Keys" sub="Las llaves para acceder a la API de Zecamo. No las compartas.">
      <div className="px-3.5 py-3 bg-[rgba(240,168,42,0.06)] border border-[rgba(240,168,42,0.2)] rounded-[10px] mb-[18px] text-[12.5px] text-[var(--color-text-muted)] flex gap-2.5 items-start">
        <Flame size={14} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
        <span>
          <b className="text-[var(--color-warning)]">Cuidado:</b> las API keys se muestran solo cuando elegís
          revelarlas. Una vez rotadas, las viejas se invalidan en 15 minutos.
        </span>
      </div>

      {keys.map((k) => (
        <div key={k.id} className="py-3.5 border-b border-[var(--color-border)] last:border-b-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[13.5px] font-medium">{k.label}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
                Creada: {k.created} · Último uso: {k.lastUsed}
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button variant="ghost" className="px-2 py-1" onClick={() => toggle(k.id)}>
                {revealed[k.id] ? "Ocultar" : "Revelar"}
              </Button>
              <Button variant="ghost" className="px-2 py-1" onClick={() => rotateKey(k.id)}>
                <RefreshCw size={11} />Rotar
              </Button>
            </div>
          </div>
          <div
            className="px-3 py-2.5 bg-black/25 border border-[var(--color-border)] rounded-lg font-mono text-[12.5px] tracking-wider cursor-pointer"
            style={{ color: revealed[k.id] ? "var(--color-primary-hover)" : "var(--color-text-muted)" }}
            onClick={async () => {
              if (!revealed[k.id]) return;
              await navigator.clipboard.writeText(k.key);
              toast.success("Key copiada al portapapeles");
            }}
            title={revealed[k.id] ? "Click para copiar" : undefined}
          >
            {revealed[k.id] ? k.key : mask(k.key)}
          </div>
        </div>
      ))}

      {showNew ? (
        <div className="mt-[18px] flex gap-2 items-center">
          <input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createKey(); if (e.key === "Escape") { setShowNew(false); setNewLabel(""); } }}
            placeholder="Nombre de la key (ej: Integración n8n)…"
            className={MODAL_INPUT}
          />
          <button onClick={() => { setShowNew(false); setNewLabel(""); }} className="w-8 h-8 shrink-0 grid place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] bg-transparent cursor-pointer hover:bg-white/[0.04]"><X size={14} /></button>
          <button onClick={createKey} className="w-8 h-8 shrink-0 grid place-items-center rounded-lg bg-[rgba(34,197,139,0.12)] border border-[rgba(34,197,139,0.2)] text-[var(--color-success)] cursor-pointer hover:bg-[rgba(34,197,139,0.18)]"><Check size={14} /></button>
        </div>
      ) : (
        <Button variant="primary" className="mt-[18px]" onClick={() => setShowNew(true)}><Plus size={13} />Crear API key</Button>
      )}
    </ConfigSection>
  );
}
