import { type ReactNode } from "react";
import { Target, ChevronRight } from "lucide-react";
import { OWNERS, STAGES } from "@/lib/mock-data";
import { Pill } from "@/components/ui-zecamo/Pill";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Card } from "@/components/ui-zecamo/Card";
import { SECTIONS, type SectionId } from "./PlaybookNav";

interface SectionContentProps {
  id: SectionId;
}

interface SectionDef {
  title: string;
  lead: string;
  body: ReactNode;
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] text-[var(--color-text-muted)] leading-[1.65] mb-4">{children}</p>;
}
function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-[18px] font-medium tracking-tight mt-7 mb-3 text-[var(--color-text)]">
      {children}
    </h3>
  );
}
function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 mb-5 pl-5 list-none">
      {items.map((it, i) => (
        <li
          key={i}
          className="relative py-1.5 pl-4 text-[14.5px] text-[var(--color-text-muted)] leading-[1.55]"
        >
          <span className="absolute left-0 top-[14px] w-[5px] h-[5px] bg-[var(--color-primary-hover)] rounded-full shadow-[0_0_6px_var(--color-glow)]" />
          {it}
        </li>
      ))}
    </ul>
  );
}
function Quote({ children, author }: { children: ReactNode; author?: string }) {
  return (
    <blockquote className="my-5 px-[22px] py-4 border-l-[3px] border-[var(--color-primary-hover)] bg-[rgba(43,91,255,0.05)] rounded-r-xl shadow-[0_0_16px_rgba(43,91,255,0.1)]">
      <div className="font-[family-name:var(--font-display)] italic text-[17px] text-[var(--color-text)] leading-[1.5]">
        {children}
      </div>
      {author && (
        <div className="text-[11px] text-[var(--color-text-muted)] mt-2 uppercase tracking-[0.06em] font-mono">
          — {author}
        </div>
      )}
    </blockquote>
  );
}

const STAGE_DESC: Record<string, string> = {
  lead: "Apareció. Buscamos contacto.",
  discovery: "Acordamos call de 30min para entender el problema.",
  call1: "Discovery hecha. Owner toma notas y arma propuesta.",
  propuesta: "Propuesta enviada con video o doc. Agendamos cierre.",
  call2: "Llamada de cierre. Manejar objeciones, firmar.",
  venta: "Cerrado. Pasa a onboarding del cliente.",
  noresp: "No respondió. Retomar en 30-60 días.",
  noventa: "No quiso. Documentar la razón.",
  seguim: "Mantener relación. Newsletter, eventos.",
};

const SECTIONS_CONTENT: Record<SectionId, SectionDef> = {
  identidad: {
    title: "Identidad",
    lead: "Quiénes somos, qué hacemos y por qué.",
    body: (
      <>
        <P>
          <b className="text-[var(--color-text)]">Zecamo Studios</b> es un estudio de software & estrategia digital.
          Hacemos automatizaciones con IA, outbound B2B, sitios web y diagnósticos para que negocios chicos y
          medianos compitan con los grandes.
        </P>
        <P>
          No somos una agencia clásica. Somos un equipo pequeño con vocación de operación interna prolija — preferimos
          cobrar menos por hacer mejor un trabajo que aceptar uno que sabemos que no vamos a poder sostener.
        </P>
        <Quote author="manifiesto">
          &ldquo;Los buenos productos viven en la operación, no en la propuesta. Nuestro trabajo no termina en el deploy.&rdquo;
        </Quote>
        <H3>Valores</H3>
        <List
          items={[
            <><b>Claridad sobre velocidad.</b> No vendemos lo que no podemos explicar simple.</>,
            <><b>Cobrar bien.</b> El floor es no negociable.</>,
            <><b>Documentación viva.</b> Lo que hacemos dos veces, lo escribimos.</>,
            <><b>Cliente-céntrico.</b> Trato directo con el founder o el dueño. Sin intermediarios.</>,
          ]}
        />
      </>
    ),
  },
  equipo: {
    title: "Equipo",
    lead: "Quiénes somos y qué hace cada uno.",
    body: (
      <>
        <P>
          Somos tres socios. Sin empleados ni jerarquías rígidas — cada socio es líder de su área pero todos hacemos
          de todo cuando hace falta.
        </P>
        <div className="grid grid-cols-3 gap-3.5 my-6 max-[900px]:grid-cols-1">
          {OWNERS.map((o) => (
            <Card key={o.id} className="p-[18px]">
              <div className="flex items-center gap-3 mb-3">
                <OwnerAvatar id={o.id} size="lg" />
                <div>
                  <div className="font-[family-name:var(--font-display)] text-[15px] font-medium">{o.name}</div>
                  <div className="text-[11.5px] text-[var(--color-text-muted)]">
                    {o.id === "JS" && "Founder · Producto + Webs"}
                    {o.id === "LM" && "Co-founder · AIMA + IA"}
                    {o.id === "BR" && "Co-founder · B2B + Outbound"}
                  </div>
                </div>
              </div>
              <div className="text-[12.5px] text-[var(--color-text-muted)] leading-[1.5]">
                {o.id === "JS" && "Lidera diseño y desarrollo. Owner de la línea Webs y de operación interna."}
                {o.id === "LM" && "Lidera automatizaciones IA. Owner de AIMA y de la mayoría de los flows técnicos."}
                {o.id === "BR" && "Lidera ventas y outbound. Owner de la línea B2B y de los diagnósticos."}
              </div>
            </Card>
          ))}
        </div>
        <H3>Reglas de equipo</H3>
        <List
          items={[
            "Weekly los lunes 10:00. Sync de pipeline, proyectos y bloqueos.",
            "Decisiones de negocio: consenso entre los 3 o mayoría 2 de 3.",
            "Cada socio tiene autonomía total en su área de propiedad.",
          ]}
        />
      </>
    ),
  },
  lineas: {
    title: "Líneas de servicio",
    lead: "Las 4 líneas que ofrecemos y cómo se diferencian.",
    body: (
      <>
        <P>Tenemos 4 líneas. Idealmente un cliente arranca con una y crece a 2-3.</P>
        {(
          [
            { id: "AIMA", sub: "Automatizaciones IA", d: "Bots, flujos automatizados, integraciones con IA. Modelo: setup + mantenimiento mensual. Owner: Lisandro." },
            { id: "B2B", sub: "Outbound y ventas", d: "Campañas de outbound, gestión de pipeline, cierre. Modelo: fijo + comisión por venta. Owner: Benja." },
            { id: "Webs", sub: "Diseño + desarrollo web", d: "Sitios web custom y e-commerce. Modelo: precio fijo con 40% anticipo. Owner: Joaco." },
            { id: "Diagnóstico", sub: "Express o Premium", d: "Auditoría de operación digital. Express (3-5 días) o Premium (7-10 días). Modelo: fijo 100% al inicio. Owner: rotativo." },
          ] as const
        ).map((l) => (
          <Card key={l.id} className="mb-3 p-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <Pill variant={l.id}>{l.id}</Pill>
              <span className="text-[13px] text-[var(--color-text-muted)]">· {l.sub}</span>
            </div>
            <div className="text-[13px] text-[var(--color-text-muted)] leading-[1.55]">{l.d}</div>
          </Card>
        ))}
      </>
    ),
  },
  stack: {
    title: "Stack técnico",
    lead: "Las herramientas con las que trabajamos.",
    body: (
      <>
        <H3>Producción</H3>
        <List
          items={[
            "Frontend: Next.js 15, React, Tailwind CSS",
            "Backend: Supabase (Postgres + Auth + Storage)",
            "Hosting: Vercel (frontend), Supabase (backend)",
            "IA: OpenAI, Anthropic (Claude), Vapi (voz)",
            "Email: Resend (transaccional), Lemlist (outbound)",
          ]}
        />
        <H3>Diseño + producto</H3>
        <List
          items={[
            "Diseño: Figma + plugin de tokens",
            "Wireframes: Excalidraw",
            "Prototipos: en código (Next + componentes propios)",
          ]}
        />
        <H3>Operación</H3>
        <List
          items={[
            "CRM: este dashboard (propio)",
            "Comms: WhatsApp Business + Notion",
            "Calendario: Google Calendar + Calendly",
            "Pagos: MercadoPago (ARS), Stripe (USD)",
          ]}
        />
      </>
    ),
  },
  comercial: {
    title: "Proceso comercial",
    lead: "De lead a cliente, paso a paso.",
    body: (
      <>
        <P>
          El pipeline tiene <b className="text-[var(--color-primary-hover)]">9 etapas</b>. No hay atajos.
        </P>
        <div className="my-4 flex flex-col gap-2">
          {STAGES.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-3.5 py-2.5 bg-white/[0.02] border border-[var(--color-border)] rounded-[10px]"
            >
              <span className="font-mono text-[10.5px] text-[var(--color-text-dim)] w-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-[160px]"><Pill variant={s.id}>{s.label}</Pill></span>
              <span className="text-[12.5px] text-[var(--color-text-muted)]">{STAGE_DESC[s.id]}</span>
            </div>
          ))}
        </div>
        <H3>Reglas clave</H3>
        <List
          items={[
            "Nunca saltarse la discovery. Si no hay call, no hay propuesta.",
            "Propuesta siempre en video (Loom) o doc visual, nunca texto plano.",
            "Si pasan más de 7 días sin respuesta, follow-up.",
            "Si pasan 14, otro follow-up.",
            "Si pasan 30, pasa a 'No responde' y se retoma en 60.",
          ]}
        />
      </>
    ),
  },
  pricing: {
    title: "Pricing",
    lead: "Cómo cobramos. El floor no se negocia.",
    body: (
      <>
        <P>
          Usamos la <b className="text-[var(--color-primary-hover)]">Calculadora de pricing</b> para cotizar. Da un
          rango low → recomendado → high.
        </P>
        <H3>Floor por línea (USD)</H3>
        <table className="w-full text-[13px] my-3.5">
          <thead className="text-left text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="py-2 font-medium">Línea</th>
              <th className="py-2 font-medium">Chico</th>
              <th className="py-2 font-medium">Medio</th>
              <th className="py-2 font-medium">Grande</th>
              <th className="py-2 font-medium">Enterprise</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-[var(--color-border)]"><td className="py-2"><Pill variant="AIMA">AIMA</Pill></td><td>$840</td><td>$1,750</td><td>$3,500</td><td>$6,300</td></tr>
            <tr className="border-b border-[var(--color-border)]"><td className="py-2"><Pill variant="B2B">B2B</Pill></td><td>$630</td><td>$1,260</td><td>$2,450</td><td>$4,550</td></tr>
            <tr className="border-b border-[var(--color-border)]"><td className="py-2"><Pill variant="Webs">Webs</Pill></td><td>$490</td><td>$1,050</td><td>$2,240</td><td>$4,550</td></tr>
            <tr><td className="py-2"><Pill variant="Diagnóstico">Diag.</Pill></td><td>$280</td><td>$490</td><td>$840</td><td>$1,540</td></tr>
          </tbody>
        </table>
        <H3>Modelos de cobro</H3>
        <List
          items={[
            <><b>AIMA:</b> Setup inicial + retainer mensual (~18% del setup).</>,
            <><b>B2B:</b> Fijo + comisión 5-10% sobre cada venta cerrada.</>,
            <><b>Webs:</b> 40% anticipo · 40% al deploy · 20% al cierre.</>,
            <><b>Diagnóstico:</b> 100% al inicio (es la forma de filtrar serios).</>,
          ]}
        />
      </>
    ),
  },
  playbooks: {
    title: "Playbooks",
    lead: "Guías paso a paso para situaciones recurrentes.",
    body: (
      <>
        {[
          { t: "Onboarding de cliente nuevo", d: "De 'firmado' al kickoff. Form, doc, kickoff call y primera tarea en 5 días." },
          { t: "Cómo armar una propuesta ganadora", d: "Estructura: contexto · diagnóstico · propuesta · pricing · timeline · siguiente paso." },
          { t: "Outbound LinkedIn — primer mensaje", d: "3 oraciones máximo. Personalizado. CTA blando (pregunta, no agenda)." },
          { t: "Cómo manejar objeción de precio", d: "Nunca bajar del floor. Reducir alcance o entregar en fases. Ofrecer Diagnóstico como entry." },
          { t: "Cuando un cliente quiere cancelar", d: "Call de retención de 20min. Entender el por qué real. Ofrecer pausa antes que baja." },
          { t: "Cómo escribir un brief técnico", d: "Para AIMA y Webs. Inputs / outputs / restricciones / criterio de éxito." },
        ].map((p, i) => (
          <Card key={i} className="mb-2.5 p-3.5 cursor-pointer flex justify-between items-center">
            <div>
              <div className="text-[13.5px] font-medium">{p.t}</div>
              <div className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{p.d}</div>
            </div>
            <ChevronRight size={14} />
          </Card>
        ))}
      </>
    ),
  },
  operacion: {
    title: "Operación interna",
    lead: "Cómo nos organizamos día a día.",
    body: (
      <>
        <H3>Rituales</H3>
        <List
          items={[
            <><b>Daily async:</b> cada uno escribe en el canal #daily a primera hora qué hace hoy y qué bloqueos tiene.</>,
            <><b>Weekly lunes 10:00:</b> sync de pipeline, proyectos y prioridades de la semana.</>,
            <><b>Demo viernes 17:00:</b> mostramos lo entregado de la semana entre nosotros.</>,
            <><b>Mensual último jueves:</b> review financiero, MRR, ajustes de pricing.</>,
            <><b>Trimestral:</b> retro + planning. Definir 3 objetivos del trimestre.</>,
          ]}
        />
        <H3>Documentación</H3>
        <List
          items={[
            "Cada proyecto tiene una carpeta en Drive: /Clientes/{Nombre}/{Proyecto}",
            "Cada cliente tiene una página en este Manual con su brief, accesos y notas.",
            "Cualquier decisión importante se documenta en una nota fechada.",
          ]}
        />
      </>
    ),
  },
  roadmap: {
    title: "Roadmap 90 días",
    lead: "Lo que vamos a hacer entre Junio y Agosto 2026.",
    body: (
      <>
        {[
          { mes: "Junio 2026", meta: "Llegar a $6.5k MRR", goals: ["Cerrar 2 nuevos clientes AIMA", "Lanzar campaña outbound clínicas dentales (target: 50 mensajes/sem)", "Subir Calculadora pública al sitio"] },
          { mes: "Julio 2026", meta: "Llegar a $7.5k MRR", goals: ["Onboardear cliente enterprise (target: $3k MRR)", "Sumar línea de productización Diagnóstico Express ($500 fijo)", "Automatizar facturación mensual"] },
          { mes: "Agosto 2026", meta: "Llegar a $8.5k MRR · objetivo Q3", goals: ["Decidir si contratamos un 4° rol (probable: dev mid)", "Refresh de identidad visual del sitio", "Trip de planning anual (3 días offsite)"] },
        ].map((m, i) => (
          <Card key={i} className="mb-3.5 p-[18px]">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="font-[family-name:var(--font-display)] text-[18px] font-medium">{m.mes}</div>
                <div className="text-[12px] text-[var(--color-primary-hover)] font-mono mt-0.5">
                  Meta: {m.meta}
                </div>
              </div>
              <Target size={20} className="text-[var(--color-primary-hover)]" />
            </div>
            <List items={m.goals} />
          </Card>
        ))}
      </>
    ),
  },
};

export function SectionContent({ id }: SectionContentProps) {
  const c = SECTIONS_CONTENT[id];
  const num = String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, "0");

  return (
    <article className="max-w-[780px] font-[family-name:var(--font-sans)]">
      <div className="text-[11px] text-[var(--color-primary-hover)] uppercase tracking-[0.08em] mb-2 font-mono">
        Manual Zecamo · {num}
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-[40px] font-medium tracking-tight leading-[1.05] m-0 mb-2.5 text-[var(--color-text)]">
        {c.title}
      </h2>
      <p className="text-[17px] text-[var(--color-text-muted)] m-0 mb-7 font-[family-name:var(--font-display)] font-normal leading-[1.4]">
        {c.lead}
      </p>
      <div className="border-t border-[var(--color-border)] pt-6">{c.body}</div>
    </article>
  );
}
