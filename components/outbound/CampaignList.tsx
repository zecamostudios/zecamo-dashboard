"use client";

import { useState } from "react";
import { Inbox, Plus, Send, X, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button } from "@/components/ui-zecamo/Button";
import { Pill } from "@/components/ui-zecamo/Pill";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import type { Template } from "@/lib/types";

const MODAL_INPUT = "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition";

interface CampaignListProps {
  templates: Template[];
}

export function CampaignList({ templates }: CampaignListProps) {
  const [localTemplates, setLocalTemplates] = useState<Template[]>(templates);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  async function addTemplate(name: string) {
    if (!name.trim()) return;
    const supabase = createClient();
    const saved = name.trim();
    const optimistic: Template = {
      id: localTemplates.length + 1,
      name: saved,
      uses: 0,
      reply: 0,
      line: "AIMA",
      owner: "JS",
    };
    setLocalTemplates((prev) => [optimistic, ...prev]);
    setShowNew(false);
    setNewName("");
    toast.success(`Template "${saved}" creado`);
    const { error } = await supabase.from("outbound_templates").insert({
      nombre: saved,
      uses: 0,
      reply_rate: 0,
      linea_servicio: "AIMA",
      owner_initials: "JS",
    });
    if (error) toast.error("Error al guardar en Supabase");
  }

  async function copyTemplate(t: Template) {
    try {
      await navigator.clipboard.writeText(t.name);
      toast.success(`Template "${t.name}" copiado al portapapeles`);
    } catch {
      toast.info(`Template seleccionado: ${t.name}`);
    }
  }

  return (
    <Card>
      <CardHead>
        <CardTitle big icon={<Inbox size={16} />}>Templates · biblioteca</CardTitle>
        <Button variant="primary" className="px-3 py-1.5" onClick={() => setShowNew(true)}><Plus size={13} />Nuevo template</Button>
      </CardHead>

      {showNew && (
        <div className="mb-4 pb-4 border-b border-[var(--color-border)] flex gap-2 items-center">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTemplate(newName);
              if (e.key === "Escape") { setShowNew(false); setNewName(""); }
            }}
            placeholder="Nombre del template…"
            className={MODAL_INPUT}
          />
          <button onClick={() => { setShowNew(false); setNewName(""); }} className="w-8 h-8 shrink-0 grid place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] bg-transparent cursor-pointer hover:bg-white/[0.04]"><X size={14} /></button>
          <button
            onClick={() => addTemplate(newName)}
            className="w-8 h-8 shrink-0 grid place-items-center rounded-lg bg-[rgba(34,197,139,0.12)] border border-[rgba(34,197,139,0.2)] text-[var(--color-success)] cursor-pointer hover:bg-[rgba(34,197,139,0.18)]"
          >
            <Check size={14} />
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-left text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="py-2.5 font-medium">Template</th>
              <th className="py-2.5 font-medium">Línea</th>
              <th className="py-2.5 font-medium">Owner</th>
              <th className="py-2.5 font-medium">Usos</th>
              <th className="py-2.5 font-medium">Reply rate</th>
              <th className="py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {localTemplates.map((t) => {
              const good = t.reply > 0.2;
              return (
                <tr key={t.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="py-3 font-medium">{t.name}</td>
                  <td className="py-3"><Pill variant={t.line}>{t.line}</Pill></td>
                  <td className="py-3"><OwnerAvatar id={t.owner} size="xs" /></td>
                  <td className="py-3 font-mono">{t.uses}</td>
                  <td className="py-3 w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/[0.05] rounded-full overflow-hidden" style={{ height: 4 }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, t.reply * 200)}%`,
                            background: good
                              ? "linear-gradient(90deg, var(--color-success), #4FE0AA)"
                              : "linear-gradient(90deg, var(--color-warning), #FFC459)",
                          }}
                        />
                      </div>
                      <span
                        className="font-mono text-[11.5px] w-9 text-right font-semibold"
                        style={{ color: good ? "var(--color-success)" : "var(--color-warning)" }}
                      >
                        {Math.round(t.reply * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3"><Button variant="ghost" className="px-2 py-1" onClick={() => copyTemplate(t)}><Send size={11} />Usar</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
