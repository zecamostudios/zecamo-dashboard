-- ============================================================
-- APPLY_CONTENT_OS.sql
-- Combined idempotent migration for Content OS (0009 + 0010)
-- Paste this entire file into the Supabase SQL Editor and run.
-- Safe to run multiple times (uses IF NOT EXISTS / DO NOTHING).
-- ============================================================

-- ============================================================
-- 1. prospectos: add missing columns
-- ============================================================
ALTER TABLE prospectos
  ADD COLUMN IF NOT EXISTS linea_servicio TEXT DEFAULT 'Webs',
  ADD COLUMN IF NOT EXISTS etapa          TEXT DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity  TEXT DEFAULT '—';

UPDATE prospectos SET etapa = estado
WHERE estado IN ('lead','discovery','call1','propuesta','call2','venta','noresp','noventa','seguim')
  AND etapa IS NULL;

-- ============================================================
-- 2. profiles: add initials column
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS initials TEXT;

UPDATE profiles SET initials = UPPER(
  LEFT(SPLIT_PART(nombre, ' ', 1), 1) ||
  COALESCE(LEFT(SPLIT_PART(nombre, ' ', 2), 1), LEFT(SPLIT_PART(nombre, ' ', 1), 2))
)
WHERE nombre IS NOT NULL AND initials IS NULL;

-- ============================================================
-- 3. prospectos_ext view
-- ============================================================
CREATE OR REPLACE VIEW prospectos_ext AS
SELECT
  p.*,
  COALESCE(pr.initials, 'JS') AS asignado_initials,
  pr.nombre AS asignado_nombre
FROM prospectos p
LEFT JOIN profiles pr ON pr.id = p.asignado_a;

-- ============================================================
-- 4. content_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS content_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  contenido       TEXT,
  plataforma      TEXT NOT NULL DEFAULT 'linkedin',
  tipo            TEXT NOT NULL DEFAULT 'post',
  estado          TEXT NOT NULL DEFAULT 'borrador',
  ai_score        NUMERIC,
  ai_feedback     TEXT,
  hook            TEXT,
  cta             TEXT,
  hashtags        TEXT[],
  media_urls      TEXT[],
  programado_para TIMESTAMPTZ,
  publicado_en    TIMESTAMPTZ,
  creado_por      UUID REFERENCES profiles(id),
  aprobado_por    UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extend content_posts with Phase 2 columns
ALTER TABLE content_posts
  ADD COLUMN IF NOT EXISTS notas              text,
  ADD COLUMN IF NOT EXISTS rejected_reason    text,
  ADD COLUMN IF NOT EXISTS generation_id      uuid,
  ADD COLUMN IF NOT EXISTS version            int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS external_id        text,
  ADD COLUMN IF NOT EXISTS pillar             text,
  ADD COLUMN IF NOT EXISTS word_count         int,
  ADD COLUMN IF NOT EXISTS ai_score_breakdown jsonb;

-- ============================================================
-- 5. content_ai_generations
-- ============================================================
CREATE TABLE IF NOT EXISTS content_ai_generations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  resultado   TEXT,
  plataforma  TEXT,
  modelo      TEXT DEFAULT 'gpt-4o',
  tokens_in   INT,
  tokens_out  INT,
  post_id     UUID REFERENCES content_posts(id) ON DELETE SET NULL,
  creado_por  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. content_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS content_assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  tipo        TEXT NOT NULL,
  contenido   TEXT,
  tags        TEXT[],
  metadata    JSONB DEFAULT '{}',
  url         TEXT,
  uses        INT DEFAULT 0,
  favorito    BOOLEAN DEFAULT FALSE,
  creado_por  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. content_planner
-- ============================================================
CREATE TABLE IF NOT EXISTS content_planner (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID REFERENCES content_posts(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  hora        TIME,
  plataforma  TEXT NOT NULL,
  estado      TEXT DEFAULT 'programado',
  orden       INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. content_automation_runs
-- ============================================================
CREATE TABLE IF NOT EXISTS content_automation_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  tipo          TEXT NOT NULL,
  estado        TEXT DEFAULT 'pending',
  payload       JSONB DEFAULT '{}',
  resultado     JSONB DEFAULT '{}',
  error_msg     TEXT,
  iniciado_en   TIMESTAMPTZ DEFAULT NOW(),
  finalizado_en TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. brand_memory
-- ============================================================
CREATE TABLE IF NOT EXISTS brand_memory (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria    text        NOT NULL CHECK (categoria IN (
                             'tono','posicionamiento','servicios','audiencia',
                             'cta_patterns','pilares','frameworks','vocabulario','restricciones'
                           )),
  clave        text        NOT NULL,
  valor        text        NOT NULL,
  descripcion  text,
  activo       boolean     NOT NULL DEFAULT true,
  orden        int         NOT NULL DEFAULT 0,
  metadata     jsonb,
  creado_por   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (categoria, clave)
);

-- ============================================================
-- 10. analytics_snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id            uuid        REFERENCES content_posts(id) ON DELETE CASCADE,
  plataforma         text        NOT NULL,
  external_post_id   text,
  fecha_snapshot     timestamptz NOT NULL DEFAULT now(),
  impresiones        int         NOT NULL DEFAULT 0,
  alcance            int         NOT NULL DEFAULT 0,
  engagement         int         NOT NULL DEFAULT 0,
  clicks             int         NOT NULL DEFAULT 0,
  likes              int         NOT NULL DEFAULT 0,
  comentarios        int         NOT NULL DEFAULT 0,
  compartidos        int         NOT NULL DEFAULT 0,
  guardados          int         NOT NULL DEFAULT 0,
  seguidores_ganados int         NOT NULL DEFAULT 0,
  engagement_rate    numeric(7,4) NOT NULL DEFAULT 0,
  metadata           jsonb,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. platform_accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_accounts (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  plataforma     text        NOT NULL CHECK (plataforma IN ('linkedin','twitter','instagram','facebook')),
  nombre_cuenta  text        NOT NULL,
  username       text,
  account_id     text,
  access_token   text,
  refresh_token  text,
  expires_at     timestamptz,
  activo         boolean     NOT NULL DEFAULT true,
  is_mock        boolean     NOT NULL DEFAULT false,
  owner_initials text,
  metadata       jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plataforma, username)
);

-- ============================================================
-- 12. publishing_jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS publishing_jobs (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id          uuid        NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  plataforma       text        NOT NULL,
  account_id       uuid        REFERENCES platform_accounts(id),
  estado           text        NOT NULL DEFAULT 'pending'
                               CHECK (estado IN ('pending','processing','success','error','cancelled')),
  programado_para  timestamptz,
  procesado_en     timestamptz,
  intentos         int         NOT NULL DEFAULT 0,
  max_intentos     int         NOT NULL DEFAULT 3,
  resultado        jsonb,
  error_msg        text,
  external_post_id text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. workflow_events
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_events (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  entidad_tipo    text        NOT NULL,
  entidad_id      uuid        NOT NULL,
  evento          text        NOT NULL,
  estado_anterior text,
  estado_nuevo    text,
  actor           text,
  notas           text,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 14. RLS
-- ============================================================
ALTER TABLE content_posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ai_generations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_planner            ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_automation_runs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_memory               ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_accounts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_jobs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_events            ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_posts' AND policyname='auth_crud_content_posts') THEN
    CREATE POLICY "auth_crud_content_posts" ON content_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_ai_generations' AND policyname='auth_crud_ai_generations') THEN
    CREATE POLICY "auth_crud_ai_generations" ON content_ai_generations FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_assets' AND policyname='auth_crud_content_assets') THEN
    CREATE POLICY "auth_crud_content_assets" ON content_assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_planner' AND policyname='auth_crud_content_planner') THEN
    CREATE POLICY "auth_crud_content_planner" ON content_planner FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_automation_runs' AND policyname='auth_crud_automation_runs') THEN
    CREATE POLICY "auth_crud_automation_runs" ON content_automation_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DROP POLICY IF EXISTS "auth_all" ON brand_memory;
DROP POLICY IF EXISTS "auth_all" ON analytics_snapshots;
DROP POLICY IF EXISTS "auth_all" ON platform_accounts;
DROP POLICY IF EXISTS "auth_all" ON publishing_jobs;
DROP POLICY IF EXISTS "auth_all" ON workflow_events;

CREATE POLICY "auth_all" ON brand_memory        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON analytics_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON platform_accounts   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON publishing_jobs     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON workflow_events     FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 15. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_content_posts_estado          ON content_posts(estado);
CREATE INDEX IF NOT EXISTS idx_content_posts_plataforma      ON content_posts(plataforma);
CREATE INDEX IF NOT EXISTS idx_content_posts_programado_para ON content_posts(programado_para);
CREATE INDEX IF NOT EXISTS idx_content_assets_tipo           ON content_assets(tipo);
CREATE INDEX IF NOT EXISTS idx_content_planner_fecha         ON content_planner(fecha);
CREATE INDEX IF NOT EXISTS idx_prospectos_etapa              ON prospectos(etapa);
CREATE INDEX IF NOT EXISTS idx_brand_memory_categoria        ON brand_memory(categoria);
CREATE INDEX IF NOT EXISTS idx_brand_memory_activo           ON brand_memory(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_analytics_post_id             ON analytics_snapshots(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_plataforma          ON analytics_snapshots(plataforma);
CREATE INDEX IF NOT EXISTS idx_analytics_fecha               ON analytics_snapshots(fecha_snapshot DESC);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_plataforma  ON platform_accounts(plataforma);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_estado        ON publishing_jobs(estado);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_post_id       ON publishing_jobs(post_id);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_programado    ON publishing_jobs(programado_para);
CREATE INDEX IF NOT EXISTS idx_workflow_events_entidad       ON workflow_events(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_created       ON workflow_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_ai_gen_tipo           ON content_ai_generations(tipo);

-- ============================================================
-- 16. updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS brand_memory_updated_at      ON brand_memory;
DROP TRIGGER IF EXISTS platform_accounts_updated_at ON platform_accounts;
DROP TRIGGER IF EXISTS publishing_jobs_updated_at   ON publishing_jobs;

CREATE TRIGGER brand_memory_updated_at
  BEFORE UPDATE ON brand_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER platform_accounts_updated_at
  BEFORE UPDATE ON platform_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER publishing_jobs_updated_at
  BEFORE UPDATE ON publishing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 17. Seed — brand_memory
-- ============================================================
INSERT INTO brand_memory (categoria, clave, valor, descripcion, orden) VALUES
  ('tono','tono_general','Profesional pero cercano. Sin tecnicismos innecesarios. Directo al punto.','El tono general de la marca',1),
  ('tono','personalidad','Confiable, moderno, ejecutable. Hablamos de resultados reales, no de teoría.','Personalidad de marca',2),
  ('tono','idioma','Español rioplatense. Vos/nosotros. Sin anglicismos innecesarios.','Idioma y registro',3),
  ('posicionamiento','propuesta_valor','Automatizamos los procesos más costosos de los negocios usando IA para que escalen sin aumentar el equipo.','Propuesta de valor central',1),
  ('posicionamiento','diferenciacion','Implementamos, no consultamos. En semanas, no meses. Sin setup fees absurdos.','Diferenciación competitiva',2),
  ('posicionamiento','prueba_social','Más de 20 negocios automatizados. Clínicas, agencias, inmobiliarias, estudios contables.','Prueba social',3),
  ('servicios','aima','AIMA: Automatización con IA. Flujos n8n + IA integrados en las operaciones reales del negocio.','Servicio AIMA',1),
  ('servicios','webs','Webs: Sitios y landing pages que convierten. Next.js, Framer, Webflow. Diseño que vende.','Servicio Webs',2),
  ('servicios','b2b','B2B Outbound: Sistemas de prospección automatizada en LinkedIn y email frío. Volumen con personalización.','Servicio B2B Outbound',3),
  ('audiencia','perfil_principal','Dueños de PyMEs y gerentes operativos. 5-50 empleados. Ya usan herramientas digitales. Sienten que podrían hacer más con menos.','Perfil del cliente ideal',1),
  ('audiencia','dolores','Tareas repetitivas que consumen tiempo del equipo. Seguimiento manual de leads. Onboarding lento. Reportes hechos a mano. Crecimiento que genera caos.','Dolores principales',2),
  ('audiencia','objeciones','Creen que es caro. Creen que necesitan un equipo técnico. Tuvieron malas experiencias previas con tecnología.','Objeciones comunes',3),
  ('pilares','pilar_resultados','Resultados reales: Casos de uso con números reales, transformaciones de clientes.','Pilar 1',1),
  ('pilares','pilar_educacion','Educación práctica: Cómo funciona la IA aplicada a negocios. Sin humo, sin buzzwords.','Pilar 2',2),
  ('pilares','pilar_proceso','Proceso: Qué hacemos, cómo lo hacemos, por qué funciona. Transparencia total.','Pilar 3',3),
  ('pilares','pilar_cultura','Cultura: El equipo, la visión, el por qué detrás de Zecamo. Humanizar la agencia.','Pilar 4',4),
  ('cta_patterns','cta_engagement','¿Qué proceso en tu negocio consume más tiempo hoy?','CTA de engagement estándar',1),
  ('cta_patterns','cta_dm','Si querés saber cómo aplicarlo en tu negocio, mandame un DM.','CTA de conversión directa',2),
  ('cta_patterns','cta_reflexion','¿Cuánto tiempo pierde tu equipo en esto por semana?','CTA de reflexión/dolor',3),
  ('cta_patterns','cta_prueba','Empezamos en 2 semanas. Sin compromisos de largo plazo.','CTA de prueba bajo riesgo',4),
  ('frameworks','historia','ANTES: situación con problema medible → GIRO: solución que encontramos → AHORA: resultado con número concreto.','Framework Historia',1),
  ('frameworks','lista_valor','N cosas que [insight contraintuitivo]: [lista numerada con evidencia] → La que más impacto tiene es el #X.','Framework Lista de valor',2),
  ('frameworks','pregunta_abridora','¿Por qué [negocio tipo] que hace [proceso] a mano no escala? Porque [razón real]. Acá lo que hacemos.','Framework Pregunta abridor',3),
  ('vocabulario','palabras_clave','automatización, flujos, implementar, resultado, semanas, escalar, eficiencia, operaciones, proceso, agencia','Palabras clave a usar',1),
  ('restricciones','evitar','No usar: "revolucionario", "disruptivo", "empoderamos", "blockchain", "sinergias", "game changer". No hacer promesas de ingresos garantizados.','Palabras y frases a evitar',1)
ON CONFLICT (categoria, clave) DO NOTHING;

-- ============================================================
-- 18. Seed — platform_accounts
-- ============================================================
INSERT INTO platform_accounts (plataforma, nombre_cuenta, username, is_mock, activo) VALUES
  ('linkedin',  'Zecamo Studios',  'zecamo',          true, true),
  ('twitter',   'Zecamo',          'zecamo_co',        true, true),
  ('instagram', 'zecamo.studios',  'zecamo.studios',   true, true),
  ('facebook',  'Zecamo Studios',  'zecamostudios',    true, true)
ON CONFLICT (plataforma, username) DO NOTHING;

-- ============================================================
-- Done! Verify with:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- ============================================================
