"use client";

import { useState } from "react";
import { Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui-zecamo/Button";
import { ConfigSection } from "./_shared";

interface ApiKey {
  id: string;
  label: string;
  key: string;
  created: string;
  lastUsed: string;
}

const KEYS: ApiKey[] = [
  { id: "prod", label: "Producción", key: "sk_live_zec_4f8a92b1c3d6e7f0a8b2c4d5e6f7a8b9", created: "15 Ene 2026", lastUsed: "Hace 2 min" },
  { id: "staging", label: "Staging", key: "sk_test_zec_9d2c1b3a5e6f7081d4c2b1a0e9f8d7c6", created: "15 Ene 2026", lastUsed: "Hace 4h" },
  { id: "dev", label: "Development", key: "sk_dev_zec_aaaa1111bbbb2222cccc3333dddd4444", created: "22 Mar 2026", lastUsed: "Hoy" },
];

const mask = (k: string) => "•".repeat(28) + k.slice(-6);

export function ApiKeysSection() {
  // TODO: Conectar Supabase tabla `api_keys` (encriptadas server-side)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setRevealed((p) => ({ ...p, [k]: !p[k] }));

  return (
    <ConfigSection title="API Keys" sub="Las llaves para acceder a la API de Zecamo. No las compartas.">
      <div className="px-3.5 py-3 bg-[rgba(240,168,42,0.06)] border border-[rgba(240,168,42,0.2)] rounded-[10px] mb-[18px] text-[12.5px] text-[var(--color-text-muted)] flex gap-2.5 items-start">
        <Flame size={14} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
        <span>
          <b className="text-[var(--color-warning)]">Cuidado:</b> las API keys se muestran solo cuando elegís
          revelarlas. Una vez rotadas, las viejas se invalidan en 15 minutos.
        </span>
      </div>

      {KEYS.map((k) => (
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
              <Button variant="ghost" className="px-2 py-1">Rotar</Button>
            </div>
          </div>
          <div
            className="px-3 py-2.5 bg-black/25 border border-[var(--color-border)] rounded-lg font-mono text-[12.5px] tracking-wider"
            style={{ color: revealed[k.id] ? "var(--color-primary-hover)" : "var(--color-text-muted)" }}
          >
            {revealed[k.id] ? k.key : mask(k.key)}
          </div>
        </div>
      ))}

      <Button variant="primary" className="mt-[18px]"><Plus size={13} />Crear API key</Button>
    </ConfigSection>
  );
}
