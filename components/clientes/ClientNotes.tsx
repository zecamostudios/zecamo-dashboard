"use client";

import { useState } from "react";
import { MessageSquare, Plus, User, Mail, Phone, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import type { Client } from "@/lib/types";

const INITIAL_NOTES = [
  { d: "22 May", t: "Pidió mantener la línea visual del logo. Le encantaron las pruebas de tipografía editorial." },
  { d: "15 May", t: "Confirmó renovación por 12 meses más. Pensar upsell a línea AIMA." },
  { d: "10 May", t: "Reunión semanal pasada a los jueves a las 11hs." },
];

export function ClientNotes({ client }: { client: Client }) {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function saveNote() {
    if (!draft.trim()) return;
    const today = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short" });
    setNotes((prev) => [{ d: today, t: draft.trim() }, ...prev]);
    setDraft("");
    setAdding(false);
    toast.success("Nota guardada");
  }

  return (
    <Card>
      <CardHead>
        <CardTitle big icon={<MessageSquare size={14} />}>Notas</CardTitle>
        <button
          onClick={() => setAdding(true)}
          className="w-7 h-7 grid place-items-center bg-transparent border-0 text-[var(--color-text-muted)] cursor-pointer rounded-md hover:bg-white/[0.04]"
        >
          <Plus size={13} />
        </button>
      </CardHead>

      {adding && (
        <div className="mb-3 pb-3 border-b border-[var(--color-border)]">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) saveNote(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }}
            placeholder="Escribí tu nota… (Ctrl+Enter para guardar)"
            rows={3}
            className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition resize-none"
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => { setAdding(false); setDraft(""); }} className="w-7 h-7 grid place-items-center rounded-md bg-transparent border-0 text-[var(--color-text-muted)] cursor-pointer hover:bg-white/[0.04]"><X size={13} /></button>
            <button onClick={saveNote} className="w-7 h-7 grid place-items-center rounded-md bg-[rgba(34,197,139,0.12)] border border-[rgba(34,197,139,0.2)] text-[var(--color-success)] cursor-pointer hover:bg-[rgba(34,197,139,0.18)]"><Check size={13} /></button>
          </div>
        </div>
      )}

      {notes.map((n, i) => (
        <div key={i} className="py-3 border-b border-[var(--color-border)] last:border-0">
          <div className="text-[11px] text-[var(--color-text-muted)] mb-1 font-mono">{n.d}</div>
          <div className="text-[13px] text-[var(--color-text)] leading-relaxed">{n.t}</div>
        </div>
      ))}

      <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
        <CardTitle big icon={<User size={14} />}>Contacto</CardTitle>
        <div className="flex flex-col gap-2 text-[13px] mt-3">
          <div className="flex items-center gap-2"><User size={13} /><span>{client.contact}</span></div>
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Mail size={13} />
            <span>{client.contact.split(" ")[0].toLowerCase()}@{client.name.toLowerCase().replace(/\s/g, "")}.com</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Phone size={13} />
            <span>+54 9 11 5xxx-xxxx</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
