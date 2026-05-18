-- ============================================================
-- 0007_manual_seed.sql — Contenido del Manual Operativo Zecamo
-- ============================================================

-- ──────────────────────────────────────────────
-- manual_sections (8 secciones en 2 grupos)
-- ──────────────────────────────────────────────
insert into public.manual_sections (slug, title, lede, grp, position) values
  ('manifiesto', 'Manifiesto Zecamo',        'No somos una agencia más. Somos un equipo chico que combina marketing, IA y desarrollo para hacer ganar plata a otros negocios. Punto. Si lo que hacemos no se traduce en facturación del cliente, no lo hacemos.', 'operacion', 1),
  ('servicios',  'Líneas de servicio',        'Tres líneas, tres clientes ideales, tres modelos económicos. No mezclamos: cuando un cliente AIMA pide un agente, le cotizamos como B2B aparte. Cuando un B2B pide una landing, cotizamos webs aparte.', 'operacion', 2),
  ('stack',      'Stack técnico y entrega',   'Stack único, dos modos de entrega: todo en mi infra (clientes AIMA chicos) o todo en infra del cliente (B2B y webs). El modo se decide en la primera llamada y se documenta en la propuesta.', 'operacion', 3),
  ('crm',        'Proceso comercial (CRM)',   'Un solo pipeline en Airtable, nueve estados, dueños claros. Si un lead no cambió de estado en 7 días, se mueve solo a "Seguimiento futuro". La regla de oro: ningún lead se pierde por desorden interno.', 'operacion', 4),
  ('pricing',    'Pricing y modelos económicos', 'Precios mínimos no negociables, modelo económico recomendado por línea, y una regla clara para comisiones. Si dudás del número, cobrá más caro: bajar un precio es fácil, subirlo no.', 'negocio', 5),
  ('playbooks',  'Playbooks de entrega',      'Un checklist por línea, desde "se firmó la propuesta" hasta "el cliente está operativo y feliz". Si un paso no se puede tildar, el cliente no está entregado.', 'negocio', 6),
  ('interna',    'Operación interna',         'Cómo nos organizamos los tres entre nosotros: plata, tareas, reuniones y reportes. Reglas pocas, ejecutadas siempre.', 'negocio', 7),
  ('roadmap',    'Roadmap primeros 90 días',  'Tres meses para validar el modelo, no para escalarlo. Mes a mes con objetivos concretos. Si al final del mes 3 no llegamos al MRR mínimo, replanteamos antes de seguir invirtiendo tiempo.', 'negocio', 8)
on conflict (slug) do nothing;

-- ──────────────────────────────────────────────
-- principles (7 principios operativos)
-- ──────────────────────────────────────────────
insert into public.principles (code, title, body, position) values
  ('P.01', 'Primero ingresos, después perfección',     'Antes de pulir, validar. Un sistema feo que ya factura es infinitamente mejor que uno hermoso que todavía no salió. Iteramos sobre algo vivo, no sobre un Figma.', 1),
  ('P.02', 'El negocio manda sobre la técnica',        'Si la solución más rentable para el cliente es un Airtable con tres botones, hacemos un Airtable con tres botones. La elegancia técnica no paga el alquiler.', 2),
  ('P.03', 'Simplicidad radical',                       'Menos partes móviles, menos integraciones, menos clicks. Si una automatización tiene más de 12 nodos en n8n, la rompimos en dos. Si una web tiene más de 4 secciones, sobran.', 3),
  ('P.04', 'Orden antes que automatización',            'No se automatiza el caos. Primero el cliente tiene que tener un proceso humano que funcione. Recién ahí lo automatizamos. Saltar este paso es la receta del retrabajo.', 4),
  ('P.05', 'Cobrar siempre, descontar nunca',           'Setup mínimo, mensualidad mínima, comisión mínima. El precio se sube, no se baja. Si el cliente no llega, no es nuestro cliente — todavía.', 5),
  ('P.06', 'Una sola fuente de verdad por cliente',    'Cada cliente vive en un único Airtable / Notion / dashboard. Si algo importante está en un WhatsApp suelto, no existe. Si no está documentado, no lo entregamos.', 6),
  ('P.07', 'Decir que no es vender',                   'Rechazar al cliente equivocado protege la operación. Tres clientes buenos rinden más que diez clientes regulares peleando por nuestra atención.', 7)
on conflict (code) do nothing;

-- ──────────────────────────────────────────────
-- team_members (Joaco, Lisandro, Benjamín)
-- ──────────────────────────────────────────────
insert into public.team_members (name, initial, role, bullets, position) values
  ('Joaco',    'J', 'founder · ops + delivery', array[
    'Full-stack: dev + ops + infra.',
    'Owner del VPS y del stack interno.',
    'Cuello de botella técnico hasta M3.',
    'Cierra ventas si Lisandro no puede.'
  ], 1),
  ('Lisandro', 'L', 'co-founder · comercial + B2B', array[
    'Owner del pipeline comercial.',
    'Hace discovery + cierre de B2B.',
    'Outbound y contenido orgánico.',
    'Cara visible con clientes premium.'
  ], 2),
  ('Benjamín', 'B', 'co-founder · agentes IA', array[
    'Diseña y construye agentes en n8n.',
    'Owner del componente IA / RAG.',
    'Testing y monitoreo de flows.',
    'Handover técnico a clientes B2B.'
  ], 3)
on conflict do nothing;

-- ──────────────────────────────────────────────
-- service_lines_config (AIMA, B2B, Webs)
-- ──────────────────────────────────────────────
insert into public.service_lines_config (
  code, title, subtitle, description, badge_label, currency,
  ticket_label, ticket_sublabel, modelo_label, modelo_sublabel,
  tiempo_label, tiempo_sublabel,
  what_in, what_out, ideal_client, reject_client, position
) values
(
  'AIMA',
  'Meta Ads + funnel + leads + seguimiento',
  'Para negocios locales chicos que necesitan llenar agenda o turnos. Ticket bajo, volumen, recurrencia.',
  'LÍNEA 01 · AIMA STACK',
  'Línea core local', 'USD',
  'USD 300–500 / mes', 'o equivalente ARS · setup gratis',
  'Fijo + comisión', 'base mensual + % sobre cierres trackeados',
  '5–7 días hábiles', 'de firma a primera campaña corriendo',
  array[
    'Setup de cuenta y píxel Meta Ads.',
    'Creatividades básicas (texto + 2 placas).',
    'Funnel corto (landing 1 sección + WhatsApp).',
    'Airtable de leads con etapas.',
    'Bot WAHA para clasificar y avisar.',
    'Reporte semanal de leads y costo por lead.',
    '1 ajuste creativo por semana.'
  ],
  array[
    'Content / Reels / community.',
    'Diseño gráfico custom.',
    'Más de 1 país o idioma.',
    'Atención de leads (eso lo hace el cliente).',
    'Email marketing.',
    'Tracking más allá de Airtable.'
  ],
  array[
    'Negocio físico o de servicios locales.',
    'Ticket de venta > 30k ARS.',
    'Ya factura, no está empezando.',
    'Atiende WhatsApp en menos de 1h.',
    'Le sobran 200–500 USD/mes para ads.'
  ],
  array[
    '"Quiero más seguidores."',
    'Cero presupuesto de ads.',
    'No contesta el WhatsApp.',
    'Ticket < 15k ARS (no cierra el LTV).',
    'Quiere "probar 1 mes y vemos".'
  ],
  1
),
(
  'B2B',
  'Agentes en n8n + integraciones + automatización de procesos',
  'Línea principal con los tres socios. Empresas medianas que pierden plata en tareas repetitivas o atención. Ticket alto en USD.',
  'LÍNEA 02 · AGENTES IA Y AUTOMATIZACIONES B2B',
  'Línea principal', 'USD',
  'USD 1.500–5.000 setup', '+ USD 300–800 / mes mantenimiento',
  'Setup + mantenimiento', '50% al firmar · 50% al handover · mensual desde día 31',
  '3–6 semanas', 'según complejidad y disponibilidad del cliente',
  array[
    'Discovery + mapeo de proceso actual.',
    'Diseño funcional del agente o flow.',
    'Desarrollo en n8n (cloud o self-hosted).',
    'Integraciones (CRM, WhatsApp, Sheets, APIs).',
    'RAG / base de conocimiento si aplica.',
    'Testing con casos reales del cliente.',
    'Handover técnico + documentación.',
    '30 días de soporte post-go-live.'
  ],
  array[
    'Hosting indefinido en nuestra infra.',
    'Cambios de scope sin recotizar.',
    'Fine-tuning de modelos custom.',
    'Compra de licencias del cliente.',
    'Soporte 24/7 (sólo en horario comercial AR).',
    'Capacitación masiva de equipo.'
  ],
  array[
    'PyME / empresa > 10 empleados.',
    'Tiene un proceso documentado (mal, pero documentado).',
    'Decisor único o máximo 2.',
    'Paga en USD o tiene caja para hacerlo.',
    'Sabe cuánto le cuesta NO automatizar.'
  ],
  array[
    '"Quiero un agente como ChatGPT."',
    'No tiene proceso, sólo intuición.',
    'Comité de 5 personas para decidir.',
    'Quiere pagar por outputs ("por cada lead").',
    'Quiere todo on-premise + sin internet.'
  ],
  2
),
(
  'WEBS',
  'Desarrollo frontend en React / Next + Supabase + Vercel',
  'Webs corporativas, dashboards internos, paneles para clientes. Setup + mantenimiento opcional. Sin templates pre-hechos.',
  'LÍNEA 03 · WEBS Y DASHBOARDS A MEDIDA',
  'Complementaria', 'USD',
  'USD 800–3.000 setup', '+ mantenimiento opcional USD 80–200 / mes',
  'Setup + mantenimiento opcional', '50/50 · mantenimiento sólo si lo necesitan',
  '2–4 semanas', 'según número de secciones y conexiones',
  array[
    'Brief técnico + wireframe rápido.',
    'Diseño en código (Tailwind, sin Figma extenso).',
    'Frontend en React / Next.',
    'Backend en Supabase si hace falta.',
    'Deploy en Vercel del cliente.',
    'Repo de GitHub propio del cliente.',
    'Documentación de stack y de cómo desplegar.'
  ],
  array[
    'Diseño visual de marca / logo / paleta.',
    'WordPress, Wix, Webflow.',
    'E-commerce con stock real.',
    'Apps mobile nativas.',
    'SEO técnico avanzado.',
    'Migración de webs viejas pesadas.'
  ],
  array[
    'Necesita web/dashboard simple pero serio.',
    'Tiene marca definida (logos, colores, fuentes).',
    'Acepta el stack que proponemos.',
    'Confía en "deploy en su cuenta de Vercel".',
    'No pide rediseños cada 2 meses.'
  ],
  array[
    '"Quiero algo como Apple."',
    'No tiene marca y no quiere pagar branding.',
    'Pide e-commerce completo con stock.',
    'Hosting "en mi servidor cPanel".',
    'Cambios visuales semanales.'
  ],
  3
)
on conflict (code) do nothing;

-- ──────────────────────────────────────────────
-- scripts (Discovery + Cierre)
-- ──────────────────────────────────────────────
insert into public.scripts (slug, title, description, steps, closing) values
(
  'discovery',
  'Script de Discovery Call',
  '25–35 minutos. El objetivo no es vender, es decidir si vale la pena vender. Si descalifica, descalifica.',
  '[
    {"num": 1, "title": "Qué vendés", "question": "Contame en una frase qué hace tu negocio y a quién le vendés.", "note": "Si no lo puede decir en 30\", es bandera roja."},
    {"num": 2, "title": "Cuánto vendés", "question": "¿Cuánto facturás al mes hoy y cuál es tu ticket promedio?", "note": "Si no sabe, no está listo para invertir."},
    {"num": 3, "title": "Dónde perdés plata", "question": "¿En qué parte del proceso sentís que se te escapa la oportunidad / el tiempo / el lead?", "note": "Acá aparece el dolor real."},
    {"num": 4, "title": "Qué probaste", "question": "¿Ya intentaste algo para resolver esto? ¿Con quién? ¿Qué pasó?", "note": "Si ya falló con otro, entender por qué antes de prometer nada."},
    {"num": 5, "title": "Qué presupuesto manejás", "question": "Pensando en este problema específico, ¿qué rango de inversión mensual manejabas?", "note": "Si no se anima a tirar número, encuadrar con rangos."}
  ]'::jsonb,
  'Cierre de la llamada: "Te mando mañana una propuesta concreta. ¿Te queda bien que nos veamos el [día] a las [hora] para revisarla juntos?"'
),
(
  'cierre',
  'Script de Llamada de Cierre — 7 pasos',
  '20–30 minutos. Estructura de 7 pasos para cerrar en la llamada.',
  '[
    {"num": 1, "title": "Contexto", "body": "Recap de lo hablado en discovery. \"La última vez me contaste que [problema X] te está costando [Y]. ¿Sigue siendo así o cambió?\""},
    {"num": 2, "title": "Problema", "body": "Reafirmar el dolor con sus propias palabras. Que él te diga que sí, esto es lo que duele."},
    {"num": 3, "title": "Consecuencia", "body": "\"Si esto sigue así 6 meses más, ¿qué pasa?\" — que dimensione él el costo de no actuar."},
    {"num": 4, "title": "Sistema", "body": "Explicar la solución en pasos numerados: \"lo resolvemos así, 1, 2, 3\". Visual simple, sin tecnicismos."},
    {"num": 5, "title": "Modelo económico", "body": "Mostrar inversión + retorno esperado. \"Esto vale X y, si funciona como esperamos, te devuelve Y en Z meses.\""},
    {"num": 6, "title": "Objeciones", "body": "\"¿Qué te frenaría hoy de avanzar?\" — directo. Tratamos cada objeción con el bloque de abajo."},
    {"num": 7, "title": "Decisión", "body": "\"¿Avanzamos?\" + pausa. No hablar primero. Si dice sí: mando link de pago / contrato en el momento. Si dice \"déjame pensarlo\": agendar decisión en 5 días."}
  ]'::jsonb,
  null
)
on conflict (slug) do nothing;

-- ──────────────────────────────────────────────
-- pipeline_stages (9 etapas)
-- ──────────────────────────────────────────────
insert into public.pipeline_stages (slug, name, subtitle, description, action, owner_label, sla, position) values
  ('lead-nuevo',           'Lead nuevo',           'entrada',     'Entra por formulario, WhatsApp o referido.',                                                                   'Lisandro contesta dentro de 24h con plantilla corta y propone Discovery de 25''.', 'Lisandro', '<24h', 1),
  ('discovery-agendada',   'Discovery agendada',   'paso 1',      'Calendly confirmado.',                                                                                          '30'' antes, revisar Instagram/web del prospecto y anotar hipótesis.', 'quien tome la call', null, 2),
  ('llamada-1-hecha',      'Llamada 1 (discovery)','paso 2',      'Usar script de discovery. 25–35 minutos.',                                                                     'Al cierre, agendar Llamada 2 en vivo en el mismo calendar. Nunca "te mando opciones".', 'Lisandro / Joaco', '48h', 3),
  ('propuesta-agendada',   'Propuesta agendada',   'paso 3',      'Doc breve (1 página) con problema → solución → precio → entregables → tiempos.',                              'Mandar la propuesta 24h antes de la Llamada 2.', 'quien lleva el lead', '72h', 4),
  ('llamada-2-cierre',     'Llamada 2 (cierre)',   'paso 4',      'Pitch + objeciones + decisión. 20–30 minutos.',                                                               'Intentar cierre en la llamada. Si necesita pensarlo, agendar "decisión" en máximo 5 días.', 'Lisandro / Joaco', null, 5),
  ('venta',                'Venta',                'cerrada ✓',   'Firma de propuesta + primer pago. Pasa a playbook de delivery según línea.',                                  'Joaco arranca playbook de delivery dentro de 48h.', 'ops (Joaco)', null, 6),
  ('no-responde',          'No responde',          'stall',       'Sin respuesta 7+ días. 2 follow-ups máximo.',                                                                  'Automatización en n8n pasa a "Seguimiento futuro" a los 14 días.', 'automatizado', null, 7),
  ('no-venta',             'No venta',             'cerrado ✗',   'Dijo que no. Anotar motivo real (precio, timing, scope, perfil).',                                            'Revisita en 90 días si es relevante.', 'analytics', null, 8),
  ('seguimiento-futuro',   'Seguimiento futuro',   'long-tail',   'Cooldown. Toque cada 60–90 días con contenido útil. No se borra nunca.',                                      'Toque cada 60–90 días con contenido útil.', 'Lisandro', null, 9)
on conflict (slug) do nothing;

-- ──────────────────────────────────────────────
-- pricing_floors (3 pisos de precio)
-- ──────────────────────────────────────────────
insert into public.pricing_floors (line_code, label, amount, currency, period, sublabel, floor_amount, floor_note, position) values
  ('AIMA',  'AIMA',              300, 'USD', '/mes',   'Ads aparte (mín. 200 USD/mes managed por el cliente).', 250, 'Floor absoluto: 250 USD/mes para clientes muy locales. Nunca menos.', 1),
  ('B2B',   'B2B Agentes',      1500, 'USD', ' setup', '+ USD 300/mes mantenimiento mínimo si lo quieren.',      1200, 'Floor absoluto: 1.200 USD setup. Por debajo cae el margen y no compensa.', 2),
  ('WEBS',  'Webs / Dashboards', 800, 'USD', ' setup', 'Landing simple. Dashboards con auth desde 1.500.',        600, 'Floor absoluto: 600 USD para landings de 1 sección + form.', 3)
on conflict do nothing;

-- ──────────────────────────────────────────────
-- commission_rules
-- ──────────────────────────────────────────────
insert into public.commission_rules (client_type, basis, range_min, range_max, when_to_apply, position) values
  ('Vende servicios (consultoría, salud, fitness, profesionales)', 'Precio bruto del servicio cobrado',  10, 20, 'Cuando los leads pasan por un único canal trackeable (WhatsApp con bot, form, llamada agendada).', 1),
  ('Vende productos (e-commerce, retail, mayorista)',              'Beneficio neto (precio − costo)',     15, 25, 'Cuando el cliente comparte costos reales y hay attribution clara (UTM, cupón, link único).', 2),
  ('Modelo mixto / no claro',                                       '—',                                  null, null, 'No aplicar. Quedarse con fijo mensual. La comisión sin tracking es regalar plata.', 3)
on conflict do nothing;

-- ──────────────────────────────────────────────
-- playbooks (UUIDs hardcodeados para ser idempotentes)
-- ──────────────────────────────────────────────
insert into public.playbooks (id, line_code, title, description) values
  ('11111111-1111-1111-1111-111111111111', 'AIMA',  'Playbook AIMA · de firma a primera campaña corriendo', 'Desde la firma hasta la primera campaña activa y el cliente operativo.'),
  ('22222222-2222-2222-2222-222222222222', 'B2B',   'Playbook Agentes B2B · de kickoff a soporte 30 días', 'Desde el kickoff hasta los 30 días de soporte post go-live.'),
  ('33333333-3333-3333-3333-333333333333', 'WEBS',  'Playbook Webs y Dashboards · de brief a deploy',      'Desde el brief técnico hasta el deploy en producción y handover.')
on conflict (id) do nothing;

-- ──────────────────────────────────────────────
-- playbook_steps
-- ──────────────────────────────────────────────
-- AIMA
insert into public.playbook_steps (playbook_id, position, title, description, timing, badge_type) values
  ('11111111-1111-1111-1111-111111111111', 1, '01 · Onboarding call (45'')',        'Recolectar: acceso a Meta Business, dominios, ticket promedio, ofertas a promocionar, horarios de atención.', 'día 1', 'blue'),
  ('11111111-1111-1111-1111-111111111111', 2, '02 · Setup técnico base',            'Crear stack en Portainer + base Airtable + contenedor WAHA + número de WhatsApp Business linkeado.', 'día 1–2', 'blue'),
  ('11111111-1111-1111-1111-111111111111', 3, '03 · Funnel corto',                  'Landing de 1 sección en Vercel + form que postea a Airtable + redirect a WhatsApp con mensaje precargado.', 'día 2–3', 'blue'),
  ('11111111-1111-1111-1111-111111111111', 4, '04 · Creatividades + estructura',    '2 placas + 2 textos por audiencia. Estructura: 1 campaña, 2 conjuntos, 4 anuncios. Píxel + Conversions API.', 'día 3–4', 'blue'),
  ('11111111-1111-1111-1111-111111111111', 5, '05 · Primera campaña live',          'Lanzar con presupuesto chico (USD 10–20/día). Monitoreo diario los primeros 3 días.', 'día 5–6', 'accent'),
  ('11111111-1111-1111-1111-111111111111', 6, '06 · Handover',                      'Cliente recibe link a Airtable + dashboard de reporting + manual corto (3 pgs) de cómo responder leads.', 'día 6', 'blue'),
  ('11111111-1111-1111-1111-111111111111', 7, '07 · Reporting semanal + ajustes',   'Cada lunes: snapshot de leads, CPL, conversiones. 1 ajuste creativo por semana.', 'recurrente', 'green');

-- B2B
insert into public.playbook_steps (playbook_id, position, title, description, timing, badge_type) values
  ('22222222-2222-2222-2222-222222222222', 1,  '01 · Kickoff call (60'')',           'Definir alcance final, owner del lado del cliente, canales de comunicación, calendario de hitos.', 'sem 1', 'blue'),
  ('22222222-2222-2222-2222-222222222222', 2,  '02 · Mapeo de procesos',             'Sesión de 90'' con quien hace HOY la tarea a automatizar. Documentar paso a paso en Notion. Foto del proceso real, no del ideal.', 'sem 1', 'blue'),
  ('22222222-2222-2222-2222-222222222222', 3,  '03 · Diseño funcional del agente',   'Diagrama de flow + decisiones + outputs + casos límite. Aprobación del cliente antes de tocar n8n.', 'sem 1–2', 'blue'),
  ('22222222-2222-2222-2222-222222222222', 4,  '04 · Provisión de infra del cliente','Cliente abre n8n cloud + Supabase + cuentas API necesarias. Nos da acceso de colaborador.', 'sem 2', 'amber'),
  ('22222222-2222-2222-2222-222222222222', 5,  '05 · Desarrollo en n8n',             'Implementar flow + integraciones + RAG si aplica. Commits documentados, versiones nombradas.', 'sem 2–4', 'blue'),
  ('22222222-2222-2222-2222-222222222222', 6,  '06 · Testing con casos reales',      '10–20 casos reales del cliente, no inventados. Tabla de resultados esperados vs. obtenidos.', 'sem 4', 'blue'),
  ('22222222-2222-2222-2222-222222222222', 7,  '07 · Workshop de handover (1h)',     'Sesión con el equipo del cliente. Mostrar cómo funciona, cómo se monitorea, qué hacer si falla.', 'sem 5', 'accent'),
  ('22222222-2222-2222-2222-222222222222', 8,  '08 · Documentación + video',         'Notion con arquitectura + variables + endpoints. Video Loom de 10'' explicando el flow nodo por nodo.', 'sem 5', 'blue'),
  ('22222222-2222-2222-2222-222222222222', 9,  '09 · Go-live + 30 días de soporte',  'Soporte por Slack/WhatsApp en horario AR. Hotfixes incluidos, nuevos features cotizan aparte.', 'sem 5–9', 'green'),
  ('22222222-2222-2222-2222-222222222222', 10, '10 · Cierre o renovación',           'Día 30: decidir si entra a mantenimiento mensual o cierra como proyecto único.', 'sem 9+', 'green');

-- WEBS
insert into public.playbook_steps (playbook_id, position, title, description, timing, badge_type) values
  ('33333333-3333-3333-3333-333333333333', 1, '01 · Brief técnico (45'')',           'Objetivo de la web, secciones, integraciones, branding existente (logo, colores, fuentes), fecha tope.', 'sem 1', 'blue'),
  ('33333333-3333-3333-3333-333333333333', 2, '02 · Wireframe rápido',              'Boceto en Excalidraw o Figma minimalista. 1 ida y vuelta máximo antes de empezar a codear.', 'sem 1', 'blue'),
  ('33333333-3333-3333-3333-333333333333', 3, '03 · Setup de infra del cliente',    'Cliente crea repo en su GitHub + cuenta en Vercel + Supabase si aplica. Nos invita.', 'sem 1', 'amber'),
  ('33333333-3333-3333-3333-333333333333', 4, '04 · Desarrollo',                   'Next + Tailwind. Deploys preview en cada PR. Cliente puede ver el avance en una URL.', 'sem 1–3', 'blue'),
  ('33333333-3333-3333-3333-333333333333', 5, '05 · QA + ajustes finales',         'Revisión mobile, performance (Lighthouse), formularios, links rotos, copy. 1 ronda de feedback final.', 'sem 3', 'blue'),
  ('33333333-3333-3333-3333-333333333333', 6, '06 · Deploy + handover',            'Producción en su Vercel + dominio apuntando + doc de stack en su repo.', 'sem 3–4', 'accent'),
  ('33333333-3333-3333-3333-333333333333', 7, '07 · Mantenimiento opcional',        'Mensualidad chica: 1–2 cambios por mes + monitoreo de uptime + updates de dependencias.', 'recurrente', 'green');

-- ──────────────────────────────────────────────
-- roadmap_months
-- ──────────────────────────────────────────────
insert into public.roadmap_months (month_num, label, title, bullets, target_mrr, target_clients) values
(
  1, 'Mes 01 · Validar', 'Primer cliente AIMA + primer cliente B2B',
  array[
    'Cerrar 1 cliente AIMA (red caliente, conocidos, descuento ok).',
    'Cerrar 1 cliente B2B chico para probar el playbook end-to-end.',
    'Foco en orgánico: Lisandro y Joaco publican 2x/semana cada uno.',
    'Documentar TODO mientras pasa — el primer playbook real nace de acá.',
    'VPS + Portainer + n8n estables, monitoreado a mano.',
    'NO invertir en ads propios todavía.'
  ],
  'MRR ≥ 600 USD', '2 clientes'
),
(
  2, 'Mes 02 · Iterar', '3 AIMA + 1–2 B2B · ajustar pricing',
  array[
    'Subir a 3 clientes AIMA activos (canal: referidos + orgánico).',
    'Cerrar 1 B2B nuevo (o un mantenimiento del primero).',
    'Documentar el playbook AIMA real (versión 1 con aprendizajes del M1).',
    'Revisar pricing: si todos cierran al primer número, subir el precio.',
    'Empezar testeo de WAHA con flow más serio.',
    'Dashboard interno de tareas en producción.'
  ],
  'MRR ≥ 1.500 USD', '4–5 clientes'
),
(
  3, 'Mes 03 · Consolidar', '5+ recurrentes · decidir si lanzar Meta Ads propios',
  array[
    '5+ clientes recurrentes entre AIMA y B2B.',
    'MRR objetivo: USD 2.000–3.000.',
    'Decisión: ¿lanzamos Meta Ads propios de Zecamo para captar AIMA?',
    'Revisar capacidad: ¿necesitamos sumar a alguien part-time?',
    'Cerrar playbooks v1 de las 3 líneas — esto es lo que entregamos al primer empleado.',
    'Plan trimestral M4–M6 con los 3 socios.'
  ],
  'MRR 2–3k USD', '5+ recurrentes'
)
on conflict (month_num) do nothing;
