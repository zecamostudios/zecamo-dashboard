"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, MapPin, MessageCircle, AtSign, X, Globe, Inbox, Search, Loader2, Sparkles, Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/types/database";
import { PageHead } from "@/components/ui-zecamo/PageHead";

interface LeadsQueueProps {
  initialLeads: Lead[];
  counts: { pendientes: number; contactados: number; respondio: number };
}

function scoreColor(score: number | null) {
  if (score == null) return "var(--color-text-muted)";
  if (score >= 8) return "var(--color-success)";
  if (score >= 5) return "var(--color-primary-hover)";
  return "var(--color-text-muted)";
}

function igHandle(raw: string | null) {
  if (!raw) return null;
  return raw.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "");
}

export function LeadsQueue({ initialLeads, counts }: LeadsQueueProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  // openers editados localmente, keyed por id
  const [openers, setOpeners] = useState<Record<string, string>>(
    () => Object.fromEntries(initialLeads.map((l) => [l.id, l.opener ?? ""])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [investigando, setInvestigando] = useState(false);
  const [rubro, setRubro] = useState("");
  const [ciudad, setCiudad] = useState("San Miguel de Tucumán");

  // Resincronizar con el server cuando llegan leads nuevos (router.refresh).
  // Para el opener editable se prefiere el mensaje_corto del agente si existe.
  useEffect(() => {
    setLeads(initialLeads);
    setOpeners(Object.fromEntries(initialLeads.map((l) => [l.id, l.mensaje_corto ?? l.opener ?? ""])));
  }, [initialLeads]);

  // Dispara el agente WF-SDR-Agent para los pendientes sin investigar (top N por score).
  async function investigarTopN(n = 20) {
    const pendientes = leads.filter((l) => l.estado === "prospecto_pendiente").slice(0, n);
    if (pendientes.length === 0) {
      toast.error("No hay leads sin investigar en la cola");
      return;
    }
    setInvestigando(true);
    const payload = pendientes.map((l) => ({
      id: l.id, nombre: l.nombre, categoria: l.categoria, zona: l.zona, web: l.web,
      google_place_id: l.google_place_id, whatsapp: l.whatsapp, instagram: l.instagram,
      rating: l.rating, num_reviews: l.num_reviews, tiene_web: l.tiene_web,
      opener: l.opener, canal_sugerido: l.canal_sugerido,
    }));
    try {
      const res = await fetch("/api/outbound/investigar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: payload }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "" }));
        toast.error(error || "No se pudo iniciar la investigación");
        setInvestigando(false);
        return;
      }
      toast.success(`Investigando ${pendientes.length} leads… las propuestas aparecen en ~1 min`);
      await new Promise((r) => setTimeout(r, 30000));
      router.refresh();
    } catch {
      toast.error("No se pudo contactar el servidor");
    } finally {
      setInvestigando(false);
    }
  }

  // Dispara el workflow WF-Outbound-SDR y refresca la cola cuando termina de scrapear.
  // Sin rubro → usa las queries por defecto del workflow (gyms Tucumán).
  async function buscarProspectos() {
    setBuscando(true);
    const r = rubro.trim();
    const c = ciudad.trim();
    const body = r ? { nicho: r, ciudad: c || "San Miguel de Tucumán", categoria: r } : {};
    try {
      const res = await fetch("/api/outbound/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "" }));
        toast.error(error || "No se pudo iniciar la búsqueda");
        setBuscando(false);
        return;
      }
      toast.success(
        `Buscando ${r || "gimnasios"}… los nuevos van a aparecer en unos segundos`,
      );
      // El workflow corre async; le damos tiempo a scrapear + puntuar y refrescamos.
      await new Promise((res) => setTimeout(res, 14000));
      router.refresh();
    } catch {
      toast.error("No se pudo contactar el servidor");
    } finally {
      setBuscando(false);
    }
  }

  async function saveOpener(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ opener: openers[id] }).eq("id", id);
    if (error) toast.error("No se pudo guardar el opener");
  }

  async function aprobarYAbrir(lead: Lead) {
    const opener = openers[lead.id] ?? "";
    if (!opener.trim()) {
      toast.error("El opener está vacío");
      return;
    }
    setBusy(lead.id);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const aprobadoPor = userData.user?.email ?? "desconocido";

    const { error } = await supabase
      .from("leads")
      .update({
        estado: "contactado",
        fecha_contacto: new Date().toISOString(),
        aprobado_por: aprobadoPor,
        opener,
      })
      .eq("id", lead.id);

    if (error) {
      toast.error("No se pudo actualizar el lead");
      setBusy(null);
      return;
    }

    // Promover al CRM: crea el prospecto (etapa "lead") con el opener y los
    // datos del lead en notas, así aparece en el Kanban. Falla suave: si el
    // insert al CRM rompe, el lead igual quedó contactado y se abrió el canal.
    const meta: string[] = [];
    if (lead.rating != null) meta.push(`Rating ${lead.rating} (${lead.num_reviews ?? 0} reseñas)`);
    if (lead.score != null) meta.push(`score ${lead.score}`);
    meta.push(lead.tiene_web ? "con web" : "sin web (creció a pulmón)");
    if (lead.whatsapp) meta.push(`WA ${lead.whatsapp}`);
    if (lead.instagram) meta.push(`IG ${lead.instagram}`);
    const notas = [
      `Mensaje enviado:\n${opener}`,
      lead.gancho ? `Gancho: ${lead.gancho}` : null,
      meta.length ? meta.join(" · ") : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const { error: crmError } = await supabase.from("prospectos").insert({
      negocio: lead.nombre,
      telefono: lead.whatsapp ?? lead.telefono ?? null,
      email: lead.email ?? null,
      fuente: "Prospección IA",
      fecha_contacto: new Date().toISOString().slice(0, 10),
      etapa: "lead",
      linea_servicio: "Webs",
      notas,
    });
    if (crmError) {
      toast.error("Contactado, pero no entró al CRM: " + crmError.message);
    }

    // Abrir el canal con el texto pre-cargado — NUNCA se manda solo.
    const esWhatsapp = lead.canal_sugerido === "whatsapp" && lead.whatsapp;
    if (esWhatsapp) {
      window.open(
        `https://wa.me/${lead.whatsapp}?text=${encodeURIComponent(opener)}`,
        "_blank",
        "noopener,noreferrer",
      );
      toast.success(`${lead.nombre} → CRM · WhatsApp abierto`);
    } else {
      const handle = igHandle(lead.instagram);
      try {
        await navigator.clipboard.writeText(opener);
      } catch {
        /* clipboard puede fallar sin gesto del user; seguimos igual */
      }
      if (handle) {
        window.open(`https://instagram.com/${handle}`, "_blank", "noopener,noreferrer");
        toast.success(`${lead.nombre} → CRM · IG abierto (opener copiado, pegalo en el DM)`);
      } else {
        toast.success(`${lead.nombre} → CRM · opener copiado al portapapeles`);
      }
    }

    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setBusy(null);
  }

  async function descartar(lead: Lead) {
    setBusy(lead.id);
    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ estado: "descartado" }).eq("id", lead.id);
    if (error) {
      toast.error("No se pudo descartar");
      setBusy(null);
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setBusy(null);
    toast(`Descartado · ${lead.nombre}`);
  }

  return (
    <>
      <PageHead
        title="Cola de prospectos"
        subtitle="Negocios scrapeados de Google Maps + investigados por IA · aprobá y mandá a mano (cero blast automático)"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!buscando) buscarProspectos();
            }}
            className="flex items-center gap-2 flex-wrap"
          >
            <input
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              placeholder="Rubro (ej: peluquerías)"
              disabled={buscando}
              className="rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition w-[170px] disabled:opacity-60"
            />
            <input
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ciudad"
              disabled={buscando}
              className="rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition w-[160px] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={buscando}
              title="Sin rubro busca gimnasios de Tucumán por defecto"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition disabled:opacity-60 disabled:cursor-default whitespace-nowrap"
            >
              {buscando ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {buscando ? "Buscando…" : "Buscar prospectos"}
            </button>
          </form>
          <button
            onClick={() => investigarTopN(20)}
            disabled={investigando}
            title="Investiga los pendientes (top 20 por score) y arma email + propuesta"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium bg-white/[0.06] text-[var(--color-text)] border border-[var(--color-border)] cursor-pointer hover:bg-white/[0.1] transition disabled:opacity-60 disabled:cursor-default whitespace-nowrap"
          >
            {investigando ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {investigando ? "Investigando…" : "Investigar top 20"}
          </button>
          </div>
        }
      />

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-[14px] mb-[18px] max-[640px]:grid-cols-1">
        <Stat label="Pendientes" value={leads.length || counts.pendientes} highlight />
        <Stat label="Contactados" value={counts.contactados} />
        <Stat label="Respondió" value={counts.respondio} />
      </div>

      {leads.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <Inbox size={28} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="text-[14px] text-[var(--color-text)] m-0">No hay prospectos pendientes</p>
          <p className="text-[12.5px] text-[var(--color-text-muted)] mt-1.5 m-0">
            Tocá «Buscar prospectos» para traer gimnasios nuevos de Google Maps.
          </p>
          <button
            onClick={buscarProspectos}
            disabled={buscando}
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition disabled:opacity-60 disabled:cursor-default"
          >
            {buscando ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {buscando ? "Buscando…" : "Buscar prospectos"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[14px] max-[900px]:grid-cols-1">
          {leads.map((lead) => {
            const canal = lead.canal_sugerido === "whatsapp" ? "whatsapp" : "instagram";
            const disabled = busy === lead.id;
            return (
              <div
                key={lead.id}
                className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[22px] flex flex-col gap-3.5"
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium font-[family-name:var(--font-display)] truncate">
                      {lead.nombre}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11.5px] text-[var(--color-text-muted)]">
                      {lead.zona && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          {lead.zona}
                        </span>
                      )}
                      {lead.rating != null && (
                        <span className="inline-flex items-center gap-1">
                          <Star size={12} />
                          {lead.rating}
                          {lead.num_reviews != null && ` · ${lead.num_reviews} reseñas`}
                        </span>
                      )}
                      {!lead.tiene_web && (
                        <span className="inline-flex items-center gap-1 text-[var(--color-danger)]">
                          <Globe size={12} />
                          sin web
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div
                      className="font-mono text-[20px] font-semibold leading-none"
                      style={{ color: scoreColor(lead.score) }}
                      title="Score 1-10 (más alto = mejor prospecto)"
                    >
                      {lead.score ?? "—"}
                    </div>
                    <Badge canal={canal} />
                  </div>
                </div>

                {/* Gancho */}
                {lead.gancho && !lead.research_at && (
                  <div className="rounded-xl bg-white/[0.03] border border-[var(--color-border)] px-3 py-2.5">
                    <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1">
                      Gancho detectado
                    </div>
                    <div className="text-[13px] text-[var(--color-text)] leading-snug">{lead.gancho}</div>
                  </div>
                )}

                {/* Ficha de research del agente */}
                {lead.research_at && (() => {
                  const r = (lead.research ?? {}) as {
                    resumen?: string;
                    servicios_sugeridos?: string[];
                  };
                  return (
                    <div className="rounded-xl bg-white/[0.03] border border-[var(--color-border)] px-3 py-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                          Research IA
                        </span>
                        {lead.email_enviado_at ? (
                          <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[rgba(34,197,139,0.1)] text-[var(--color-success)]">
                            email enviado
                          </span>
                        ) : (
                          <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[rgba(43,91,255,0.1)] text-[var(--color-primary-hover)]">
                            investigado
                          </span>
                        )}
                      </div>
                      {r.resumen && (
                        <p className="text-[12.5px] text-[var(--color-text)] leading-snug m-0">{r.resumen}</p>
                      )}
                      {Array.isArray(r.servicios_sugeridos) && r.servicios_sugeridos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {r.servicios_sugeridos.map((s, i) => (
                            <span
                              key={i}
                              className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {lead.email_asunto && (
                        <details className="mt-1">
                          <summary className="text-[11.5px] text-[var(--color-primary-hover)] cursor-pointer inline-flex items-center gap-1">
                            <Mail size={12} /> Ver email{lead.email ? ` → ${lead.email}` : " (sin email — mandalo por WSP/IG)"}
                          </summary>
                          <div className="mt-1.5 text-[12px] leading-snug">
                            <div className="font-medium text-[var(--color-text)]">{lead.email_asunto}</div>
                            <div className="mt-1 text-[var(--color-text-muted)] whitespace-pre-wrap">{lead.email_cuerpo}</div>
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })()}

                {/* Opener editable */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 block">
                    Opener (editá antes de mandar)
                  </label>
                  <textarea
                    rows={4}
                    value={openers[lead.id] ?? ""}
                    onChange={(e) => setOpeners((p) => ({ ...p, [lead.id]: e.target.value }))}
                    onBlur={() => saveOpener(lead.id)}
                    className="w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition resize-none leading-snug"
                  />
                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-auto">
                  <button
                    disabled={disabled}
                    onClick={() => descartar(lead)}
                    className="py-2 px-3 rounded-xl text-[13px] text-[var(--color-text-muted)] border border-[var(--color-border)] bg-transparent cursor-pointer transition hover:text-[var(--color-text)] disabled:opacity-50"
                  >
                    <X size={14} className="inline -mt-0.5 mr-1" />
                    Descartar
                  </button>
                  <button
                    disabled={disabled}
                    onClick={() => aprobarYAbrir(lead)}
                    className="flex-1 py-2 px-3 rounded-xl text-[13px] font-medium bg-[var(--color-primary-hover)] text-white border-0 cursor-pointer hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                  >
                    {canal === "whatsapp" ? <MessageCircle size={14} /> : <AtSign size={14} />}
                    {canal === "whatsapp" ? "Aprobar y abrir WhatsApp" : "Aprobar y abrir Instagram"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Badge({ canal }: { canal: "whatsapp" | "instagram" }) {
  const isWa = canal === "whatsapp";
  return (
    <span
      className={
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border " +
        (isWa
          ? "bg-[rgba(34,197,139,0.08)] border-[rgba(34,197,139,0.25)] text-[var(--color-success)]"
          : "bg-[rgba(43,91,255,0.08)] border-[var(--color-primary)]/30 text-[var(--color-primary-hover)]")
      }
    >
      {isWa ? <MessageCircle size={11} /> : <AtSign size={11} />}
      {isWa ? "WhatsApp" : "Instagram"}
    </span>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={
        "rounded-[20px] border p-5 " +
        (highlight
          ? "bg-gradient-to-b from-[rgba(43,91,255,0.10)] to-[rgba(43,91,255,0.02)] border-[var(--color-primary)]/25"
          : "bg-[var(--color-surface)] border-[var(--color-border)]")
      }
    >
      <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium mb-2">
        {label}
      </div>
      <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
        {value}
      </div>
    </div>
  );
}
