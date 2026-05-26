import { MessageSquare, Plus, User, Mail, Phone } from "lucide-react";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import type { Client } from "@/lib/types";

const NOTES = [
  { d: "22 May", t: "Pidió mantener la línea visual del logo. Le encantaron las pruebas de tipografía editorial." },
  { d: "15 May", t: "Confirmó renovación por 12 meses más. Pensar upsell a línea AIMA." },
  { d: "10 May", t: "Reunión semanal pasada a los jueves a las 11hs." },
];

export function ClientNotes({ client }: { client: Client }) {
  return (
    <Card>
      <CardHead>
        <CardTitle big icon={<MessageSquare size={14} />}>Notas</CardTitle>
        <button className="w-7 h-7 grid place-items-center bg-transparent border-0 text-[var(--color-text-muted)] cursor-pointer rounded-md hover:bg-white/[0.04]">
          <Plus size={13} />
        </button>
      </CardHead>
      {NOTES.map((n, i) => (
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
