"use client";

import { useState, useMemo } from "react";
import { Plus, Inbox, Send, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { OWNERS, OUTBOUND_MESSAGES, TEMPLATES } from "@/lib/mock-data";
import type { OutboundMessage, OutboundStatus, OwnerId, Template } from "@/lib/types";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { OutboundFilters } from "./OutboundFilters";
import { CampaignList } from "./CampaignList";
import { LeadTable } from "./LeadTable";

const FUNNEL_ICONS = { Send, Inbox, Calendar, X } as const;

interface OutboundViewProps {
  initialMessages?: OutboundMessage[];
  initialTemplates?: Template[];
}

const MODAL_INPUT = "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition";

export function OutboundView({ initialMessages, initialTemplates }: OutboundViewProps) {
  const [ownerFilter, setOwnerFilter] = useState<OwnerId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<OutboundStatus | "all">("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgForm, setMsgForm] = useState({ prospect: "", platform: "linkedin", message: "" });

  const allMessages = initialMessages ?? OUTBOUND_MESSAGES;
  const allTemplates = initialTemplates ?? TEMPLATES;

  const filtered = allMessages.filter(
    (m) =>
      (ownerFilter === "all" || m.owner === ownerFilter) &&
      (statusFilter === "all" || m.status === statusFilter),
  );

  const byOwner = useMemo(
    () =>
      OWNERS.map((o) => {
        const msgs = allMessages.filter((m) => m.owner === o.id);
        const replied = msgs.filter((m) => m.status === "respondio" || m.status === "agendado").length;
        const booked = msgs.filter((m) => m.status === "agendado").length;
        return {
          ...o,
          total: msgs.length,
          replied,
          booked,
          replyRate: msgs.length ? replied / msgs.length : 0,
          bookRate: msgs.length ? booked / msgs.length : 0,
        };
      }),
    [allMessages],
  );

  const total = allMessages.length;
  const responded = allMessages.filter((m) => m.status === "respondio" || m.status === "agendado").length;
  const booked = allMessages.filter((m) => m.status === "agendado").length;
  const noResp = allMessages.filter((m) => m.status === "no_resp").length;

  return (
    <>
      <PageHead
        title="Outbound"
        subtitle="Mensajes enviados, respuestas y reuniones agendadas · este mes"
        actions={
          <>
            <Button
              variant={showTemplates ? "primary" : "default"}
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Inbox size={13} />Templates
            </Button>
            <Button variant="primary" onClick={() => setShowMsgModal(true)}><Plus size={14} />Nuevo mensaje</Button>
          </>
        }
      />

      {/* KPIs funnel */}
      <div className="grid grid-cols-4 gap-[14px] mb-[18px] max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
        <FunnelKpi label="Enviados" value={total} Icon={FUNNEL_ICONS.Send} pct={1} sub="total" />
        <FunnelKpi
          label="Respondió"
          value={responded}
          Icon={FUNNEL_ICONS.Inbox}
          pct={responded / total}
          sub={`${Math.round((responded / total) * 100)}% reply rate`}
          highlight
        />
        <FunnelKpi
          label="Agendó call"
          value={booked}
          Icon={FUNNEL_ICONS.Calendar}
          pct={booked / total}
          sub={`${Math.round((booked / total) * 100)}% book rate`}
          highlight
        />
        <FunnelKpi
          label="No respondió"
          value={noResp}
          Icon={FUNNEL_ICONS.X}
          pct={noResp / total}
          sub={`${Math.round((noResp / total) * 100)}% del total`}
          negative
        />
      </div>

      {/* Por socio */}
      <div className="grid grid-cols-12 gap-[14px] mb-[14px]">
        {byOwner.map((o) => (
          <div
            key={o.id}
            className="col-span-4 max-[900px]:col-span-12 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[22px]"
          >
            <div className="flex items-center gap-3 mb-3.5">
              <OwnerAvatar id={o.id} size="lg" />
              <div>
                <div className="text-[14.5px] font-medium font-[family-name:var(--font-display)]">{o.name}</div>
                <div className="text-[11.5px] text-[var(--color-text-muted)]">{o.total} mensajes enviados</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <Mini label="Respond." value={o.replied} />
              <Mini label="Agendó" value={o.booked} accent="primary" />
              <Mini label="Reply" value={`${Math.round(o.replyRate * 100)}%`} accent="success" />
            </div>
            <div className="bg-white/[0.05] rounded-full overflow-hidden" style={{ height: 4 }}>
              <div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]"
                style={{ width: `${o.replyRate * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {showTemplates ? (
        <CampaignList templates={allTemplates} />
      ) : (
        <>
          <OutboundFilters
            owners={OWNERS}
            ownerFilter={ownerFilter}
            setOwnerFilter={setOwnerFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          <LeadTable messages={filtered} />
        </>
      )}

      {showMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowMsgModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold">Nuevo mensaje</h2>
              <button onClick={() => setShowMsgModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Prospecto *</label>
                <input autoFocus value={msgForm.prospect} onChange={(e) => setMsgForm((f) => ({ ...f, prospect: e.target.value }))} placeholder="Nombre del prospecto" className={MODAL_INPUT} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Plataforma</label>
                <select value={msgForm.platform} onChange={(e) => setMsgForm((f) => ({ ...f, platform: e.target.value }))} className={MODAL_INPUT}>
                  <option value="linkedin">LinkedIn</option>
                  <option value="email">Email</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">Mensaje</label>
                <textarea rows={3} value={msgForm.message} onChange={(e) => setMsgForm((f) => ({ ...f, message: e.target.value }))} placeholder="Escribí el mensaje…" className={`${MODAL_INPUT} resize-none`} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowMsgModal(false)} className="flex-1 py-2 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer transition">Cancelar</button>
              <button
                onClick={() => {
                  if (!msgForm.prospect.trim()) return;
                  toast.success(`Mensaje enviado a ${msgForm.prospect}`);
                  setShowMsgModal(false);
                  setMsgForm({ prospect: "", platform: "linkedin", message: "" });
                }}
                className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Mini({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "primary" | "success";
}) {
  const styles =
    accent === "primary"
      ? "bg-[rgba(43,91,255,0.06)] border-[var(--color-primary)]/25 text-[var(--color-primary-hover)]"
      : accent === "success"
      ? "bg-[rgba(34,197,139,0.06)] border-[rgba(34,197,139,0.18)] text-[var(--color-success)]"
      : "bg-white/[0.02] border-[var(--color-border)] text-[var(--color-text)]";
  return (
    <div className={`text-center px-1.5 py-2 border rounded-lg ${styles}`}>
      <div className="font-mono text-[18px] font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.05em] text-[var(--color-text-muted)]">{label}</div>
    </div>
  );
}

function FunnelKpi({
  label,
  value,
  Icon,
  pct,
  sub,
  highlight,
  negative,
}: {
  label: string;
  value: number;
  Icon: (typeof FUNNEL_ICONS)[keyof typeof FUNNEL_ICONS];
  pct: number;
  sub: string;
  highlight?: boolean;
  negative?: boolean;
}) {
  const trackBg = negative
    ? "linear-gradient(90deg, var(--color-danger), #FF7585)"
    : highlight
    ? "linear-gradient(90deg, var(--color-success), #4FE0AA)"
    : "linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))";
  return (
    <div
      className={
        "relative rounded-[20px] border p-5 overflow-hidden " +
        (highlight
          ? "bg-gradient-to-b from-[rgba(43,91,255,0.10)] to-[rgba(43,91,255,0.02)] border-[var(--color-primary)]/25 shadow-[0_0_0_1px_rgba(43,91,255,0.25),0_8px_28px_rgba(43,91,255,0.18)]"
          : "bg-[var(--color-surface)] border-[var(--color-border)]")
      }
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium">{label}</div>
        <div className="w-7 h-7 rounded-lg bg-white/[0.04] grid place-items-center text-[var(--color-text-muted)]">
          <Icon size={15} />
        </div>
      </div>
      <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
        {value}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[11.5px]">
        <span
          className="font-mono font-medium"
          style={{
            color: negative
              ? "var(--color-danger)"
              : highlight
              ? "var(--color-success)"
              : "var(--color-text-muted)",
          }}
        >
          {sub}
        </span>
      </div>
      <div className="bg-white/[0.05] rounded-full overflow-hidden mt-1.5" style={{ height: 4 }}>
        <div className="h-full" style={{ width: `${pct * 100}%`, background: trackBg }} />
      </div>
    </div>
  );
}
