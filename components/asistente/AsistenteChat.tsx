"use client";

import { useRef, useState, useEffect } from "react";
import { Send, Sparkles, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";

interface PendingWrite {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

type ViewItem =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "system"; text: string }
  | { kind: "pending"; writes: PendingWrite[]; resolved?: "confirmed" | "cancelled" | "error"; errorDetail?: string };

// Mensajes en formato OpenAI — el server los devuelve actualizados y los
// reusamos tal cual (los guardamos opacos y los reenviamos).
type ApiMessage = Record<string, unknown> & { role: string };

const WRITE_META: Record<string, { label: string; icon: typeof Plus; tone: string }> = {
  crear: { label: "Crear", icon: Plus, tone: "text-emerald-400" },
  actualizar: { label: "Actualizar", icon: Pencil, tone: "text-blue-400" },
  eliminar: { label: "Eliminar", icon: Trash2, tone: "text-red-400" },
};

const SUGERENCIAS = [
  "Registrá una llamada con el gimnasio Andino: interesado, llamar el martes",
  "Cargá un egreso de 50 USD por la suscripción de n8n",
  "Mové el prospecto PRI GYM a la etapa propuesta",
  "¿Qué prospectos tengo pendientes de rellamar?",
];

export function AsistenteChat() {
  const [view, setView] = useState<ViewItem[]>([]);
  const [convo, setConvo] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [view, loading]);

  function applyResult(
    result: { type: string; text?: string; writes?: PendingWrite[]; messages: ApiMessage[]; error?: string; applied?: { id: string; ok: boolean; detail: string }[] },
  ) {
    if (result.error) {
      setView((v) => [...v, { kind: "system", text: `⚠ ${result.error}` }]);
      return;
    }
    setConvo(result.messages);
    const extras: ViewItem[] = [];
    if (result.text) extras.push({ kind: "assistant", text: result.text });
    if (result.type === "confirm" && result.writes?.length) {
      extras.push({ kind: "pending", writes: result.writes });
    }
    setView((v) => [...v, ...extras]);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const nextConvo: ApiMessage[] = [...convo, { role: "user", content: text }];
    setConvo(nextConvo);
    setView((v) => [...v, { kind: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/asistente/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextConvo }),
      });
      const data = await res.json();
      applyResult(data);
    } catch {
      setView((v) => [...v, { kind: "system", text: "⚠ Error de red. Probá de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  async function resolvePending(idx: number, approve: boolean) {
    const item = view[idx];
    if (item?.kind !== "pending" || item.resolved || loading) return;
    const confirmations: Record<string, boolean> = {};
    for (const w of item.writes) confirmations[w.id] = approve;
    if (!approve) {
      setView((v) => v.map((it, i) => (i === idx ? { ...it, resolved: "cancelled" } as ViewItem : it)));
    }
    setLoading(true);
    try {
      const res = await fetch("/api/asistente/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: convo, confirmations }),
      });
      const data = await res.json();
      if (approve && !data.error) {
        const map: Record<string, { ok: boolean; detail: string }> = {};
        for (const a of data.applied ?? []) map[a.id] = a;
        const ok = item.writes.every((w) => map[w.id]?.ok);
        const firstErr = item.writes.map((w) => map[w.id]).find((a) => a && !a.ok);
        setView((v) => v.map((it, i) => (i === idx ? { ...it, resolved: ok ? "confirmed" : "error", errorDetail: firstErr?.detail } as ViewItem : it)));
      }
      applyResult(data);
    } catch {
      setView((v) => [...v, { kind: "system", text: "⚠ Error de red al confirmar." }]);
    } finally {
      setLoading(false);
    }
  }

  const empty = view.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-var(--shell-pad,90px))] min-h-0">
      <PageHead
        title={<>Asistente <em className="not-italic font-light text-[var(--color-text-muted)]">· operá hablando</em></>}
        subtitle="Contame qué pasó y lo registro en el dashboard. Confirmás vos antes de tocar la base."
      />

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 pb-4">
        {empty && (
          <div className="mt-6 max-w-2xl">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-3">
              <Sparkles size={15} className="text-[var(--color-primary-hover)]" />
              Probá con algo así:
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left text-[13px] leading-snug p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-2)] transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {view.map((item, i) => {
          if (item.kind === "user") {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 bg-[var(--color-primary)] text-white text-[14px] leading-relaxed whitespace-pre-wrap">
                  {item.text}
                </div>
              </div>
            );
          }
          if (item.kind === "assistant") {
            return (
              <div key={i} className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-[14px] leading-relaxed whitespace-pre-wrap">
                  {item.text}
                </div>
              </div>
            );
          }
          if (item.kind === "system") {
            return (
              <div key={i} className="text-center text-[12.5px] text-amber-400/90 py-1">{item.text}</div>
            );
          }
          // pending
          return (
            <div key={i} className="rounded-2xl border border-[var(--color-border-2)] bg-[var(--color-surface)] p-4 max-w-[90%]">
              <div className="text-[12px] uppercase tracking-wide text-[var(--color-text-dim)] mb-2.5">
                Confirmá antes de guardar
              </div>
              <div className="space-y-2.5">
                {item.writes.map((w) => {
                  const meta = WRITE_META[w.name] ?? { label: w.name, icon: Pencil, tone: "text-[var(--color-text)]" };
                  const Icon = meta.icon;
                  const { tabla, id, datos } = w.input as { tabla?: string; id?: string; datos?: unknown };
                  return (
                    <div key={w.id} className="rounded-xl bg-black/20 border border-[var(--color-border)] p-3">
                      <div className="flex items-center gap-2 text-[13.5px] font-medium">
                        <Icon size={15} className={meta.tone} />
                        <span className={meta.tone}>{meta.label}</span>
                        <span className="text-[var(--color-text)]">en {String(tabla ?? "?")}</span>
                        {id ? <span className="text-[var(--color-text-dim)] text-[12px]">· id {String(id)}</span> : null}
                      </div>
                      {(datos !== undefined || w.name === "eliminar") && (
                        <pre className="mt-2 text-[12px] text-[var(--color-text-muted)] whitespace-pre-wrap break-words font-mono">
                          {w.name === "eliminar" ? "(se elimina el registro)" : JSON.stringify(datos, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>

              {item.resolved ? (
                item.resolved === "error" ? (
                  <div className="mt-3 text-[13px] text-red-400">
                    <div className="flex items-center gap-1.5"><X size={14} /> No se pudo guardar</div>
                    {item.errorDetail && <p className="mt-1 text-[12px] text-red-400/80 font-mono break-words">{item.errorDetail}</p>}
                  </div>
                ) : (
                  <div className={`mt-3 text-[13px] flex items-center gap-1.5 ${item.resolved === "confirmed" ? "text-emerald-400" : "text-[var(--color-text-dim)]"}`}>
                    {item.resolved === "confirmed" ? <><Check size={14} /> Aplicado</> : <><X size={14} /> Cancelado</>}
                  </div>
                )
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="primary" onClick={() => resolvePending(i, true)} disabled={loading}>
                    <Check size={14} /> Confirmar
                  </Button>
                  <Button variant="ghost" onClick={() => resolvePending(i, false)} disabled={loading}>
                    <X size={14} /> Cancelar
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[14px] flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" /> Pensando…
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-end gap-2 bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-2xl p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Escribí lo que querés registrar o preguntar…"
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] px-2 py-1.5 max-h-32"
          />
          <Button variant="primary" onClick={send} disabled={loading || !input.trim()}>
            <Send size={15} />
          </Button>
        </div>
        <p className="text-[11px] text-[var(--color-text-dim)] mt-1.5 px-1">Enter para enviar · Shift+Enter para salto de línea</p>
      </div>
    </div>
  );
}
