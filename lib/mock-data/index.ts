import type {
  Owner, Stage, ServiceLineDef, Prospect, Client, Project,
  Task, Meeting, FinancePoint, ActivityItem, Transaction,
  OutboundMessage, Template, ByLine,
} from "@/lib/types";

export const OWNERS: Owner[] = [
  { id: "JS", name: "Joaco Sánchez",    short: "Joaco",    color: "#2B5BFF" },
  { id: "LM", name: "Lisandro Méndez", short: "Lisandro", color: "#A47BFF" },
  { id: "BR", name: "Benjamín Rivero", short: "Benja",    color: "#22C58B" },
];

export const STAGES: Stage[] = [
  { id: "lead",      label: "Lead nuevo" },
  { id: "discovery", label: "Discovery agendada" },
  { id: "call1",     label: "Llamada 1 hecha" },
  { id: "propuesta", label: "Propuesta agendada" },
  { id: "call2",     label: "Llamada 2 (cierre)" },
  { id: "venta",     label: "Venta" },
  { id: "noresp",    label: "No responde" },
  { id: "noventa",   label: "No venta" },
  { id: "seguim",    label: "Seguimiento futuro" },
];

export const LINES: ServiceLineDef[] = [
  { id: "AIMA",       full: "AIMA · Automatizaciones IA",      color: "var(--color-aima)" },
  { id: "B2B",        full: "B2B · Outbound y ventas",          color: "var(--color-b2b)" },
  { id: "Webs",       full: "Webs · Diseño y desarrollo",       color: "var(--color-webs)" },
  { id: "Diagnóstico",full: "Diagnóstico · Express/Premium",    color: "var(--color-diag)" },
];

export const PROSPECTS: Prospect[] = [
  { id: 1,  name: "Joaco Pereyra",    company: "Marca de ropa Argenta",    owner: "JS", line: "Webs",        stage: "discovery", value: 1200, date: "14 Jun 2026", last: "Hace 2h",   source: "Referido" },
  { id: 2,  name: "Camila Restrepo",  company: "Estudio Norte Arq.",        owner: "LM", line: "AIMA",        stage: "propuesta", value: 3500, date: "12 Jun 2026", last: "Ayer",      source: "LinkedIn" },
  { id: 3,  name: "Tomás Funes",      company: "Pizzería La Vera",           owner: "BR", line: "AIMA",        stage: "discovery", value: 900,  date: "10 Jun 2026", last: "Ayer",      source: "Instagram" },
  { id: 4,  name: "Mariana Pérez",    company: "Luna Café Roastery",         owner: "JS", line: "Webs",        stage: "call2",     value: 1800, date: "09 Jun 2026", last: "Hace 3d",   source: "Referido" },
  { id: 5,  name: "Dr. Esteban Roca", company: "Forma Dental",               owner: "BR", line: "B2B",         stage: "call1",     value: 2400, date: "08 Jun 2026", last: "Hace 3d",   source: "Cold email" },
  { id: 6,  name: "Julia Rossi",      company: "Mate & Co.",                 owner: "LM", line: "Webs",        stage: "call1",     value: 1100, date: "07 Jun 2026", last: "Hace 4d",   source: "Web" },
  { id: 7,  name: "Felipe Aguirre",   company: "Lince Studio Music",         owner: "JS", line: "Diagnóstico", stage: "lead",      value: 600,  date: "06 Jun 2026", last: "Hace 5d",   source: "Referido" },
  { id: 8,  name: "Sofía Lema",       company: "Tienda Brote Verde",         owner: "BR", line: "AIMA",        stage: "lead",      value: 1500, date: "05 Jun 2026", last: "Hace 6d",   source: "Web" },
  { id: 9,  name: "Dra. Paola Vega",  company: "Clínica Veterinaria Sol",    owner: "LM", line: "B2B",         stage: "venta",     value: 2800, date: "04 Jun 2026", last: "Cerrado",   source: "Referido" },
  { id: 10, name: "Hernán Casas",     company: "Inmobiliaria Casas Norte",   owner: "JS", line: "B2B",         stage: "venta",     value: 3200, date: "03 Jun 2026", last: "Cerrado",   source: "LinkedIn" },
  { id: 11, name: "Valeria Núñez",    company: "Bistró 21",                  owner: "BR", line: "AIMA",        stage: "noresp",    value: 1200, date: "02 Jun 2026", last: "Hace 10d",  source: "Cold email" },
  { id: 12, name: "Diego Sosa",       company: "GymForce",                   owner: "JS", line: "Diagnóstico", stage: "propuesta", value: 800,  date: "01 Jun 2026", last: "Hoy",       source: "Referido" },
  { id: 13, name: "Florencia Ríos",   company: "Boutique Lila",              owner: "LM", line: "Webs",        stage: "venta",     value: 2400, date: "28 May 2026", last: "Cerrado",   source: "Instagram" },
  { id: 14, name: "Ana Sandoval",     company: "Centro Médico Lago",         owner: "LM", line: "AIMA",        stage: "call2",     value: 4200, date: "27 May 2026", last: "Hace 1d",   source: "Referido" },
  { id: 15, name: "Marcelo Vega",     company: "Vega Construcciones",        owner: "JS", line: "Webs",        stage: "noventa",   value: 1800, date: "25 May 2026", last: "Descartado",source: "Web" },
  { id: 16, name: "Lucía Bertoni",    company: "Escuela de Yoga Vrindavan",  owner: "BR", line: "Webs",        stage: "seguim",    value: 1000, date: "20 May 2026", last: "Hace 1m",   source: "Referido" },
  { id: 17, name: "Pablo Iglesias",   company: "Salud Norte",                owner: "LM", line: "AIMA",        stage: "call1",     value: 3800, date: "22 Jun 2026", last: "Hace 2d",   source: "Referido" },
  { id: 18, name: "Natalia Bustos",   company: "Sastrería Italiana",         owner: "JS", line: "Diagnóstico", stage: "discovery", value: 500,  date: "23 Jun 2026", last: "Hoy",       source: "Instagram" },
  { id: 19, name: "Renzo Maldini",    company: "Maldini Eventos",            owner: "BR", line: "B2B",         stage: "call1",     value: 2000, date: "24 Jun 2026", last: "Ayer",      source: "Cold email" },
  { id: 20, name: "Camila Ferreyra",  company: "Estudio Contable Ferreyra",  owner: "LM", line: "Webs",        stage: "propuesta", value: 1600, date: "25 Jun 2026", last: "Hace 1d",   source: "Referido" },
  { id: 21, name: "Andrés Pinto",     company: "Café Quito",                 owner: "JS", line: "Webs",        stage: "lead",      value: 900,  date: "26 Jun 2026", last: "Hoy",       source: "LinkedIn" },
  { id: 22, name: "Ramiro Gutiérrez", company: "Vidrios del Sur",            owner: "BR", line: "Diagnóstico", stage: "noresp",    value: 400,  date: "15 May 2026", last: "Hace 12d",  source: "Web" },
];

export const CLIENTS: Client[] = [
  { id: 1, name: "Café Atlas",          contact: "Lucas Morán",    line: "Webs",        mrr: 1200, since: "Ene 2026", status: "active",     projects: 2, health: 92, next: "Review homepage · 28 May" },
  { id: 2, name: "Estudio Mendoza",     contact: "Ana Vidal",      line: "AIMA",        mrr: 850,  since: "Feb 2026", status: "active",     projects: 1, health: 88, next: "Demo automatización · 30 May" },
  { id: 3, name: "Salud Norte",         contact: "Dr. Pablo I.",   line: "AIMA",        mrr: 1500, since: "Nov 2025", status: "active",     projects: 1, health: 95, next: "Weekly · 27 May" },
  { id: 4, name: "Boutique Lila",       contact: "Florencia Ríos", line: "Webs",        mrr: 500,  since: "Mar 2026", status: "active",     projects: 1, health: 78, next: "Deploy v2 · 26 May" },
  { id: 5, name: "GymForce",            contact: "Diego Sosa",     line: "Diagnóstico", mrr: 700,  since: "Abr 2026", status: "onboarding", projects: 1, health: 70, next: "Kickoff · 28 May" },
  { id: 6, name: "Mar Azul Hotel",      contact: "Valentina Cruz",  line: "B2B",        mrr: 0,    since: "Dic 2025", status: "paused",     projects: 0, health: 45, next: "Reactivar Q3" },
  { id: 7, name: "Vidrios del Sur",     contact: "Hernán M.",      line: "Webs",        mrr: 300,  since: "May 2026", status: "active",     projects: 1, health: 85, next: "Soporte mensual" },
  { id: 8, name: "Inmobiliaria Casas",  contact: "Hernán Casas",   line: "B2B",         mrr: 1800, since: "May 2026", status: "onboarding", projects: 1, health: 80, next: "Setup outbound · 31 May" },
  { id: 9, name: "Clínica Vet. Sol",    contact: "Dra. Paola V.",  line: "B2B",         mrr: 1100, since: "May 2026", status: "active",     projects: 1, health: 90, next: "Primera campaña · 02 Jun" },
];

export const PROJECTS: Project[] = [
  { id: 1,  name: "Café Atlas · Web v2",              client: "Café Atlas",         line: "Webs",        owner: "JS", start: "15 Abr 2026", due: "30 May 2026", progress: 72,  status: "curso",     priority: "alta",  team: ["JS","LM"] },
  { id: 2,  name: "Salud Norte · Bot pacientes",      client: "Salud Norte",        line: "AIMA",        owner: "LM", start: "10 Abr 2026", due: "14 Jun 2026", progress: 45,  status: "curso",     priority: "alta",  team: ["LM","JS"] },
  { id: 3,  name: "Boutique Lila · E-commerce",       client: "Boutique Lila",      line: "Webs",        owner: "JS", start: "20 Mar 2026", due: "28 May 2026", progress: 88,  status: "review",    priority: "media", team: ["JS"] },
  { id: 4,  name: "GymForce · Diagnóstico Express",   client: "GymForce",           line: "Diagnóstico", owner: "BR", start: "08 May 2026", due: "10 Jun 2026", progress: 20,  status: "curso",     priority: "media", team: ["BR","JS"] },
  { id: 5,  name: "Vidrios del Sur · Landing",        client: "Vidrios del Sur",    line: "Webs",        owner: "JS", start: "05 May 2026", due: "26 May 2026", progress: 95,  status: "review",    priority: "baja",  team: ["JS"] },
  { id: 6,  name: "Estudio Mendoza · Bot WhatsApp",   client: "Estudio Mendoza",    line: "AIMA",        owner: "LM", start: "01 May 2026", due: "05 Jun 2026", progress: 60,  status: "curso",     priority: "alta",  team: ["LM"] },
  { id: 7,  name: "Inmobiliaria · Outbound LinkedIn", client: "Inmobiliaria Casas", line: "B2B",         owner: "BR", start: "20 May 2026", due: "20 Jun 2026", progress: 15,  status: "backlog",   priority: "alta",  team: ["BR","LM"] },
  { id: 8,  name: "Clínica Vet. · Campaña Q3",        client: "Clínica Vet. Sol",   line: "B2B",         owner: "LM", start: "22 May 2026", due: "15 Jul 2026", progress: 8,   status: "backlog",   priority: "media", team: ["LM"] },
  { id: 9,  name: "Café Atlas · Landing v1",          client: "Café Atlas",         line: "Webs",        owner: "JS", start: "10 Ene 2026", due: "28 Feb 2026", progress: 100, status: "entregado", priority: "alta",  team: ["JS"] },
  { id: 10, name: "Salud Norte · Setup CRM",          client: "Salud Norte",        line: "AIMA",        owner: "LM", start: "05 Nov 2025", due: "15 Dic 2025", progress: 100, status: "entregado", priority: "alta",  team: ["LM","JS"] },
  { id: 11, name: "Mar Azul · Web (pausado)",         client: "Mar Azul Hotel",     line: "Webs",        owner: "BR", start: "15 Dic 2025", due: "—",           progress: 35,  status: "archivado", priority: "baja",  team: ["BR"] },
];

export const TASKS: Task[] = [
  { id: 101, text: "Importar leads de LinkedIn (Sales Nav)",       status: "hacer",  prio: "alta",  due: "Hoy",     owner: "BR", proj: "Outbound",      tags: ["B2B"] },
  { id: 102, text: "Setup Stripe para clientes US",                 status: "hacer",  prio: "media", due: "Mañana",  owner: "JS", proj: "Ops",           tags: ["Finanzas"] },
  { id: 103, text: "Refactor componentes Café Atlas v2",            status: "curso",  prio: "alta",  due: "Hoy",     owner: "JS", proj: "Café Atlas",    tags: ["Webs"] },
  { id: 104, text: "Diseñar flujos bot · Salud Norte",              status: "curso",  prio: "alta",  due: "29 May",  owner: "LM", proj: "Salud Norte",   tags: ["AIMA"] },
  { id: 105, text: "Mandar propuesta · Estudio Norte Arq.",         status: "hacer",  prio: "alta",  due: "Hoy 18:00",owner:"LM", proj: "CRM",           tags: ["Propuesta"] },
  { id: 106, text: "Llamada 1 · Pizzería La Vera",                  status: "curso",  prio: "media", due: "Hoy 16:30",owner:"BR", proj: "CRM",           tags: ["Reunión"] },
  { id: 107, text: "Review final homepage Café Atlas",              status: "review", prio: "alta",  due: "Hoy",     owner: "JS", proj: "Café Atlas",    tags: ["QA"] },
  { id: 108, text: "Pulir copy landing Vidrios del Sur",            status: "review", prio: "baja",  due: "26 May",  owner: "JS", proj: "Vidrios",       tags: ["Copy"] },
  { id: 109, text: "Validar flow checkout · Boutique Lila",         status: "review", prio: "media", due: "27 May",  owner: "JS", proj: "Boutique Lila", tags: ["QA"] },
  { id: 110, text: "Cobrar mensualidad mayo · Café Atlas",          status: "hecho",  prio: "alta",  due: "Ayer",    owner: "JS", proj: "Finanzas",      tags: ["Cobro"] },
  { id: 111, text: "Pagar Vercel + Supabase",                       status: "hecho",  prio: "baja",  due: "Ayer",    owner: "JS", proj: "Ops",           tags: ["Ops"] },
  { id: 112, text: "Onboarding GymForce · kickoff",                 status: "hecho",  prio: "media", due: "21 May",  owner: "BR", proj: "GymForce",      tags: ["Diagnóstico"] },
  { id: 113, text: "Configurar dominio · Boutique Lila",            status: "hacer",  prio: "media", due: "Mañana",  owner: "JS", proj: "Boutique Lila", tags: ["DNS"] },
  { id: 114, text: "Demo automatización · Estudio Mendoza",         status: "hacer",  prio: "alta",  due: "30 May",  owner: "LM", proj: "E. Mendoza",    tags: ["AIMA"] },
  { id: 115, text: "Facturar mayo a clientes activos",              status: "hacer",  prio: "alta",  due: "31 May",  owner: "JS", proj: "Finanzas",      tags: ["Cobro"] },
  { id: 116, text: "Mejorar template Estudios de arquitectura",     status: "curso",  prio: "baja",  due: "02 Jun",  owner: "LM", proj: "Outbound",      tags: ["Template"] },
];

export const MEETINGS: Meeting[] = [
  { id: 1, day: "Hoy", time: "16:30", title: "Llamada 1 · Pizzería La Vera",     who: "Tomás Funes",    owner: "BR", channel: "video" },
  { id: 2, day: "Hoy", time: "18:00", title: "Propuesta · Estudio Norte Arq.",   who: "Camila Restrepo",owner: "LM", channel: "video" },
  { id: 3, day: "Mar", time: "10:00", title: "Weekly Salud Norte",                who: "Dr. Pablo I.",   owner: "LM", channel: "video" },
  { id: 4, day: "Mar", time: "15:00", title: "Discovery · Café Quito",            who: "Andrés Pinto",   owner: "JS", channel: "video" },
  { id: 5, day: "Mié", time: "11:00", title: "Cierre · Centro Médico Lago",      who: "Ana Sandoval",   owner: "LM", channel: "video" },
];

export const FINANCE: FinancePoint[] = [
  { m: "Dic", in: 6200,  out: 2100 },
  { m: "Ene", in: 7400,  out: 2400 },
  { m: "Feb", in: 8900,  out: 2800 },
  { m: "Mar", in: 9600,  out: 3100 },
  { m: "Abr", in: 10800, out: 3400 },
  { m: "May", in: 12340, out: 3650 },
];

export const ACTIVITY: ActivityItem[] = [
  { id: 1, ico: "DollarSign",  who: "JS", text: "Cobro recibido · Café Atlas · $1,200",              when: "Hace 1h" },
  { id: 2, ico: "CheckSquare", who: "BR", text: "Tarea completada · Setup outbound LinkedIn",          when: "Hace 3h" },
  { id: 3, ico: "Users",       who: "LM", text: "Prospecto nuevo · Estudio Norte Arq.",               when: "Hace 5h" },
  { id: 4, ico: "Target",      who: "LM", text: "Cierre · Dra. Paola Vega · Clínica Vet. Sol",        when: "Ayer" },
  { id: 5, ico: "Send",        who: "BR", text: "Propuesta enviada · GymForce Diagnóstico",           when: "Hace 2d" },
];

export const TRANSACTIONS: Transaction[] = [
  { d: "22 May", c: "Mensualidad mayo · Salud Norte",       line: "AIMA",        a: 1500, type: "in",  owner: "LM" },
  { d: "22 May", c: "Mensualidad mayo · Café Atlas",        line: "Webs",        a: 1200, type: "in",  owner: "JS" },
  { d: "21 May", c: "Vercel Pro · plan team",               line: "Ops",         a: 20,   type: "out", owner: "JS" },
  { d: "20 May", c: "Inmobiliaria Casas · setup outbound",  line: "B2B",         a: 1800, type: "in",  owner: "BR" },
  { d: "19 May", c: "Supabase · Pro tier",                  line: "Ops",         a: 25,   type: "out", owner: "JS" },
  { d: "18 May", c: "Diseño extra · Estudio Mendoza",       line: "AIMA",        a: 850,  type: "in",  owner: "LM" },
  { d: "17 May", c: "Subcontratado dev · Café Atlas v2",    line: "Webs",        a: 2400, type: "out", owner: "JS" },
  { d: "15 May", c: "Diagnóstico Express · GymForce",       line: "Diagnóstico", a: 700,  type: "in",  owner: "BR" },
  { d: "14 May", c: "Notion + Linear · workspace",          line: "Ops",         a: 48,   type: "out", owner: "JS" },
  { d: "12 May", c: "Onboarding · Inmobiliaria Casas",      line: "B2B",         a: 1500, type: "in",  owner: "BR" },
  { d: "10 May", c: "Clínica Vet. Sol · setup B2B",         line: "B2B",         a: 1100, type: "in",  owner: "LM" },
  { d: "08 May", c: "OpenAI · API",                         line: "Ops",         a: 180,  type: "out", owner: "LM" },
];

export const OUTBOUND_MESSAGES: OutboundMessage[] = [
  { id: 1,  to: "Mariana Pérez",    company: "Luna Café Roastery",         owner: "JS", channel: "LinkedIn",  status: "agendado",  sent: "Hace 2d",  template: "Café & restaurantes" },
  { id: 2,  to: "Tomás Iglesias",   company: "Estudio Norte Arq.",         owner: "LM", channel: "Email",     status: "respondio", sent: "Hace 3d",  template: "Estudios de arquitectura" },
  { id: 3,  to: "Camila Restrepo",  company: "Estudio Norte Arq.",         owner: "LM", channel: "Email",     status: "agendado",  sent: "Hace 1d",  template: "Estudios de arquitectura" },
  { id: 4,  to: "Dr. Esteban Roca", company: "Forma Dental",               owner: "BR", channel: "LinkedIn",  status: "respondio", sent: "Hace 4d",  template: "Clínicas dentales" },
  { id: 5,  to: "Julia Rossi",      company: "Mate & Co.",                 owner: "LM", channel: "Email",     status: "enviado",   sent: "Hace 1d",  template: "E-commerce LATAM" },
  { id: 6,  to: "Felipe Aguirre",   company: "Lince Studio Music",         owner: "JS", channel: "Instagram", status: "enviado",   sent: "Hace 5h",  template: "Estudios creativos" },
  { id: 7,  to: "Sofía Lema",       company: "Tienda Brote Verde",         owner: "BR", channel: "Email",     status: "no_resp",   sent: "Hace 8d",  template: "E-commerce LATAM" },
  { id: 8,  to: "Valeria Núñez",    company: "Bistró 21",                  owner: "BR", channel: "Email",     status: "no_resp",   sent: "Hace 10d", template: "Café & restaurantes" },
  { id: 9,  to: "Hernán Casas",     company: "Inmobiliaria Casas",         owner: "JS", channel: "LinkedIn",  status: "agendado",  sent: "Hace 6d",  template: "Inmobiliarias" },
  { id: 10, to: "Andrés Pinto",     company: "Café Quito",                 owner: "JS", channel: "LinkedIn",  status: "enviado",   sent: "Hoy",      template: "Café & restaurantes" },
  { id: 11, to: "Renzo Maldini",    company: "Maldini Eventos",            owner: "BR", channel: "Email",     status: "respondio", sent: "Hace 2d",  template: "Eventos & catering" },
  { id: 12, to: "Natalia Bustos",   company: "Sastrería Italiana",         owner: "JS", channel: "Instagram", status: "enviado",   sent: "Hoy",      template: "Retail premium" },
  { id: 13, to: "Marcelo Vega",     company: "Vega Construcciones",        owner: "JS", channel: "Email",     status: "no_resp",   sent: "Hace 14d", template: "Construcción & inmobiliaria" },
  { id: 14, to: "Ana Sandoval",     company: "Centro Médico Lago",         owner: "LM", channel: "LinkedIn",  status: "agendado",  sent: "Hace 3d",  template: "Salud privada" },
];

export const TEMPLATES: Template[] = [
  { id: 1,  name: "Café & restaurantes",           uses: 38, reply: 0.22, line: "AIMA",        owner: "BR" },
  { id: 2,  name: "Estudios de arquitectura",      uses: 18, reply: 0.28, line: "Webs",        owner: "LM" },
  { id: 3,  name: "Clínicas dentales",             uses: 24, reply: 0.18, line: "B2B",         owner: "BR" },
  { id: 4,  name: "E-commerce LATAM",              uses: 32, reply: 0.16, line: "AIMA",        owner: "LM" },
  { id: 5,  name: "Inmobiliarias",                 uses: 14, reply: 0.30, line: "B2B",         owner: "JS" },
  { id: 6,  name: "Salud privada",                 uses: 11, reply: 0.25, line: "AIMA",        owner: "LM" },
  { id: 7,  name: "Estudios creativos",            uses: 9,  reply: 0.20, line: "Webs",        owner: "JS" },
  { id: 8,  name: "Retail premium",                uses: 7,  reply: 0.15, line: "Diagnóstico", owner: "JS" },
  { id: 9,  name: "Eventos & catering",            uses: 6,  reply: 0.33, line: "AIMA",        owner: "BR" },
  { id: 10, name: "Construcción & inmobiliaria",   uses: 4,  reply: 0.10, line: "Webs",        owner: "JS" },
];

export const BY_LINE: ByLine[] = [
  { id: "AIMA",        v: 4800, pct: 38 },
  { id: "Webs",        v: 3200, pct: 26 },
  { id: "B2B",         v: 2900, pct: 23 },
  { id: "Diagnóstico", v: 1440, pct: 13 },
];
