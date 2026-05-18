-- ============================================================
-- MANUAL_BLOQUES_para_SQL_editor.sql
-- Solo los bloques de contenido — schema y seed ya aplicados.
-- Pegá este archivo en Supabase Dashboard → SQL Editor → Run
-- ============================================================
-- NOTA: El archivo 0006_manual_schema.sql (en este mismo directorio)
-- corresponde a un schema diferente — NO lo corras. El schema que ya
-- tenés aplicado en la DB es el correcto.
-- ============================================================

-- ──────────────────────────────────────────────
-- Sección 01 · Manifiesto
-- ──────────────────────────────────────────────
DO $$
DECLARE sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM manual_sections WHERE slug = 'manifiesto';
  IF sec_id IS NULL OR EXISTS (SELECT 1 FROM manual_blocks WHERE section_id = sec_id) THEN RETURN; END IF;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 1, 'text',
'**Zecamo Studios** es un estudio de automatización e IA para negocios reales. Tres socios (Joaco, Lisandro, Benjamín), radicados en Tucumán, Argentina.

No somos una agencia de marketing. No somos una consultora de transformación digital. Somos un equipo chico que construye sistemas funcionales, cobra bien, y mantiene lo que entrega.');

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 1 + position, 'principle', id
  FROM principles ORDER BY position;

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 8 + position, 'team_member', id
  FROM team_members ORDER BY position;
END $$;

-- ──────────────────────────────────────────────
-- Sección 02 · Líneas de servicio
-- ──────────────────────────────────────────────
DO $$
DECLARE sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM manual_sections WHERE slug = 'lineas-servicio';
  IF sec_id IS NULL OR EXISTS (SELECT 1 FROM manual_blocks WHERE section_id = sec_id) THEN RETURN; END IF;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 1, 'text',
'Tres líneas de servicio. Cada una con su propio modelo de delivery, pricing y cliente ideal. No mezclamos líneas sin razón.');

  INSERT INTO manual_blocks (section_id, position, type, content_jsonb) VALUES
    (sec_id, 2, 'service_line', '{"line": "aima"}'::jsonb),
    (sec_id, 3, 'service_line', '{"line": "b2b_agents"}'::jsonb),
    (sec_id, 4, 'service_line', '{"line": "webs"}'::jsonb);
END $$;

-- ──────────────────────────────────────────────
-- Sección 03 · Stack y entrega
-- ──────────────────────────────────────────────
DO $$
DECLARE sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM manual_sections WHERE slug = 'stack-entrega';
  IF sec_id IS NULL OR EXISTS (SELECT 1 FROM manual_blocks WHERE section_id = sec_id) THEN RETURN; END IF;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 1, 'text',
'El stack que usamos no está elegido por tendencia — está elegido por confiabilidad, velocidad de deploy y costo operativo real.

**Infra base:** VPS Contabo (2 vCPU / 4 GB RAM) + Portainer para contenedores Docker + Cloudflare para DNS y certificados.

**Automatización:** n8n self-hosted para todos los flows de los clientes. Cada cliente tiene su propio contenedor con credenciales aisladas.

**IA:** OpenAI GPT-4o como modelo principal. Whisper para transcripción. Embeddings en Supabase (pgvector) para RAG cuando aplica.

**Webs y dashboards:** Next.js 14 + Tailwind CSS + Supabase + Vercel. Stack del cliente en la cuenta del cliente.

**Comunicación con clientes:** WAHA (WhatsApp HTTP API) self-hosted para integrar WhatsApp en flows n8n. Cada cliente tiene su propio contenedor WAHA.');

  INSERT INTO manual_blocks (section_id, position, type, variant, title, content_md) VALUES
    (sec_id, 2, 'callout', 'info', 'Modelo C híbrido',
'El **Modelo C híbrido** significa que la infra corre en nuestra VPS pero el acceso y los datos son del cliente. El cliente puede llevarse todo en cualquier momento. Nunca lockout.'),
    (sec_id, 3, 'callout', 'warn', 'Límite de capacidad actual',
'**1 VPS para todo.** Joaco es el único que accede a Portainer. Si el VPS cae, caen todos los clientes. Este es el SPOF crítico de la operación — se resuelve en M2/M3.');
END $$;

-- ──────────────────────────────────────────────
-- Sección 04 · Proceso comercial
-- ──────────────────────────────────────────────
DO $$
DECLARE sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM manual_sections WHERE slug = 'proceso-comercial';
  IF sec_id IS NULL OR EXISTS (SELECT 1 FROM manual_blocks WHERE section_id = sec_id) THEN RETURN; END IF;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 1, 'text',
'El proceso comercial de Zecamo tiene 9 etapas. Lisandro es el owner del pipeline. El objetivo es **velocidad y calidad**: no dejar leads enfriarse y no cerrar clientes que no deberían ser clientes.');

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 1 + position, 'pipeline_stage', id
  FROM pipeline_stages ORDER BY position;

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 11, 'script', id
  FROM scripts WHERE type = 'discovery' ORDER BY position LIMIT 1;

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 12, 'script', id
  FROM scripts WHERE type = 'closing' ORDER BY position LIMIT 1;

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 12 + ROW_NUMBER() OVER (ORDER BY position), 'objection', id
  FROM scripts WHERE type = 'objection' ORDER BY position;
END $$;

-- ──────────────────────────────────────────────
-- Sección 05 · Pricing
-- ──────────────────────────────────────────────
DO $$
DECLARE sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM manual_sections WHERE slug = 'pricing';
  IF sec_id IS NULL OR EXISTS (SELECT 1 FROM manual_blocks WHERE section_id = sec_id) THEN RETURN; END IF;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 1, 'text',
'Los precios están establecidos con floors duros. **Nunca negociar hacia abajo**. Si el cliente no llega al piso, no es el cliente correcto todavía.

**Regla de comisión:** solo aplica cuando hay tracking real. Sin tracking, no hay comisión — hay fijo.');

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 1 + ROW_NUMBER() OVER (ORDER BY position), 'pricing_floor', id
  FROM pricing_floors ORDER BY position;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 7, 'text',
'## Comisiones

| Tipo de negocio | Base de cálculo | Rango | Cuándo aplica |
|---|---|---|---|
| Servicios (salud, fitness, profesionales) | Precio bruto | 10–20% | Único canal trackeable |
| Productos (e-commerce, retail) | Beneficio neto | 15–25% | Attribution clara (UTM, cupón) |
| Mixto / no claro | No aplicar | — | Quedarse con fijo mensual |');

  INSERT INTO manual_blocks (section_id, position, type, variant, title, content_md) VALUES
    (sec_id, 8, 'callout', 'tip', 'Modelo fijo + comisión',
'El modelo **fijo + comisión** es el ideal. Cubre el costo fijo del equipo y premia los resultados. Nunca proponer solo comisión — eso financia al cliente con tu tiempo.'),
    (sec_id, 9, 'callout', 'danger', 'Nunca comisión pura sin tracking',
'Si el cliente no puede mostrarte de dónde viene cada venta, estás regalando tu trabajo. El precio de "vemos si funciona" lo paga Zecamo.');
END $$;

-- ──────────────────────────────────────────────
-- Sección 06 · Playbooks
-- ──────────────────────────────────────────────
DO $$
DECLARE sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM manual_sections WHERE slug = 'playbooks';
  IF sec_id IS NULL OR EXISTS (SELECT 1 FROM manual_blocks WHERE section_id = sec_id) THEN RETURN; END IF;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 1, 'text',
'Los playbooks son checklists de entrega, no planes de proyecto. Son ejecutables: si sabés leer y tenés acceso, podés hacer el deploy.

Cada línea tiene su propio playbook. Los tres están en producción desde el primer cliente.');

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 1 + ROW_NUMBER() OVER (ORDER BY position), 'playbook', id
  FROM playbooks ORDER BY position;

  INSERT INTO manual_blocks (section_id, position, type, variant, title, content_md) VALUES
    (sec_id, 5, 'callout', 'info', 'Regla del checklist',
'Si el paso no está en el playbook, no existe. Si algo salió mal y no estaba en el playbook, se agrega al playbook antes del siguiente cliente.');
END $$;

-- ──────────────────────────────────────────────
-- Sección 07 · Operación interna
-- ──────────────────────────────────────────────
DO $$
DECLARE sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM manual_sections WHERE slug = 'operacion-interna';
  IF sec_id IS NULL OR EXISTS (SELECT 1 FROM manual_blocks WHERE section_id = sec_id) THEN RETURN; END IF;

  INSERT INTO manual_blocks (section_id, position, type, variant, title, content_md) VALUES
    (sec_id, 2, 'callout', 'info', 'MRR objetivo',
'**MRR objetivo M3: USD 2.000–3.000.** Por debajo de eso, la operación no cubre el tiempo de los tres socios a valor de mercado.');

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 1, 'text',
'## Finanzas internas

**Separación por línea:** cada ingreso se etiqueta con su línea de origen (AIMA / B2B / Webs). Al final del mes, vemos qué línea rindió.

**USD vs ARS:** cobramos en USD cuando podemos, ARS cuando el cliente no puede. El costo interno (VPS, APIs, herramientas) está en USD — por eso el pricing base es en USD.

**Regla de reinversión:** 30% de lo que entra va a infra, herramientas y aprendizaje antes de repartir.

**Distribución de socios:** 33/33/33 hasta M3. A partir de M4, revisamos según dedicación real y resultados.'),

    (sec_id, 3, 'text',
'## Roles y reuniones

| Nombre | Rol | Foco principal |
|---|---|---|
| Joaco | Delivery + infra | Dev, VPS, backup comercial |
| Lisandro | Comercial | Pipeline, outbound, cierres |
| Benjamín | Agentes IA | n8n, RAG, testing |'),

    (sec_id, 4, 'text',
'## Agenda semanal (lunes 10:00, 45 min)

1. ¿Qué entregué esta semana? (cada uno, 2 min)
2. ¿Qué está trabado? (bloqueantes, 5 min)
3. Pipeline: revisión de las etapas 1–5 (Lisandro lidera, 10 min)
4. Clientes activos: ¿hay alguno con riesgo de churn? (5 min)
5. Prioridad de la semana que viene — máximo 3 acciones por persona (10 min)
6. Temas urgentes (5 min)'),

    (sec_id, 5, 'text',
'## Herramientas internas

- **Dashboard Zecamo:** CRM, tareas, finanzas, manual.
- **Notion:** documentación técnica de proyectos, briefings de clientes.
- **GitHub:** repos de todos los proyectos (cliente en su cuenta, nosotros como colaboradores).
- **Vercel:** deploy de webs. Siempre en la cuenta del cliente.
- **Portainer:** gestión de contenedores en el VPS (n8n, WAHA, bases de datos).'),

    (sec_id, 6, 'text',
'## Reporting

**A clientes:**
- AIMA: reporte semanal de leads, CPL y tasa de conversión. Formato: Loom de 3 min + tabla en Airtable.
- B2B: reporte quincenal de ejecuciones, errores y mejoras. Formato: Notion con tabla de resultados.
- Webs: reporte mensual de uptime y cambios aplicados (si están en mantenimiento).

**Interno:** al final de cada mes, los tres revisamos MRR, pipeline y prioridades del mes siguiente. 30 minutos.');
END $$;

-- ──────────────────────────────────────────────
-- Sección 08 · Roadmap 90 días
-- ──────────────────────────────────────────────
DO $$
DECLARE sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM manual_sections WHERE slug = 'roadmap';
  IF sec_id IS NULL OR EXISTS (SELECT 1 FROM manual_blocks WHERE section_id = sec_id) THEN RETURN; END IF;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 1, 'text',
'El roadmap de 90 días tiene tres meses claramente diferenciados: **Validar**, **Iterar** y **Consolidar**. No hay hitos blandos — cada mes tiene un target de clientes y MRR.');

  INSERT INTO manual_blocks (section_id, position, type, ref_id)
  SELECT sec_id, 1 + month_number, 'roadmap_month', id
  FROM roadmap_months ORDER BY month_number;

  INSERT INTO manual_blocks (section_id, position, type, content_md) VALUES
    (sec_id, 5, 'text',
'## Indicadores semanales

| KPI | Target M1 | Target M2 | Target M3 |
|---|---|---|---|
| Clientes activos | 2 | 4–5 | 5+ |
| MRR | ≥ 600 USD | ≥ 1.500 USD | 2–3k USD |
| Pipeline activo (etapas 1–5) | 5+ | 8+ | 10+ |
| Tasa de cierre | >30% | >40% | >45% |');

  INSERT INTO manual_blocks (section_id, position, type, variant, title, content_md) VALUES
    (sec_id, 6, 'callout', 'warn', 'Checkpoint mes 3',
'Si no llegamos a USD 2.000 MRR con 5+ clientes, hacemos una retrospectiva y ajustamos el modelo. No seguimos igual. El mes 4 arranca con un plan revisado o con uno de los socios redirigiendo su foco.');
END $$;

-- ============================================================
-- Verificación
-- ============================================================
-- SELECT s.slug, count(b.id) as blocks
-- FROM manual_sections s
-- LEFT JOIN manual_blocks b ON b.section_id = s.id
-- GROUP BY s.slug, s.position ORDER BY s.position;
