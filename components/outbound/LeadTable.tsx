import { Mail, Globe, MessageSquare } from "lucide-react";
import { Pill } from "@/components/ui-zecamo/Pill";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import type { OutboundMessage, OutboundStatus, StageId } from "@/lib/types";

interface LeadTableProps {
  messages: OutboundMessage[];
}

const STATUS_MAP: Record<OutboundStatus, { l: string; variant: StageId }> = {
  enviado: { l: "Enviado", variant: "lead" },
  respondio: { l: "Respondió", variant: "call1" },
  agendado: { l: "Agendó call", variant: "venta" },
  no_resp: { l: "No respondió", variant: "noresp" },
};

export function LeadTable({ messages }: LeadTableProps) {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="text-left text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
          <tr>
            <th className="px-[22px] py-3 font-medium">Contacto</th>
            <th className="px-3 py-3 font-medium">Empresa</th>
            <th className="px-3 py-3 font-medium">Canal</th>
            <th className="px-3 py-3 font-medium">Template</th>
            <th className="px-3 py-3 font-medium">Owner</th>
            <th className="px-3 py-3 font-medium">Estado</th>
            <th className="px-[22px] py-3 font-medium">Enviado</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((m) => {
            const s = STATUS_MAP[m.status];
            return (
              <tr key={m.id} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="px-[22px] py-3 font-medium">{m.to}</td>
                <td className="px-3 py-3 text-[var(--color-text-muted)]">{m.company}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[12px]">
                    {m.channel === "Email" && <Mail size={12} />}
                    {m.channel === "LinkedIn" && <Globe size={12} />}
                    {m.channel === "Instagram" && <MessageSquare size={12} />}
                    {m.channel}
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--color-text-muted)] text-[12px]">{m.template}</td>
                <td className="px-3 py-3"><OwnerAvatar id={m.owner} size="xs" /></td>
                <td className="px-3 py-3"><Pill variant={s.variant} dot>{s.l}</Pill></td>
                <td className="px-[22px] py-3 font-mono text-[var(--color-text-muted)] text-[11.5px]">{m.sent}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
