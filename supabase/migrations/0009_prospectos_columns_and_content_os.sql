-- ============================================================
-- Migration 0009: Fix prospectos schema + Content OS tables
-- ============================================================

-- ---- 1. prospectos: add missing columns ----
ALTER TABLE prospectos
  ADD COLUMN IF NOT EXISTS linea_servicio TEXT DEFAULT 'Webs',
  ADD COLUMN IF NOT EXISTS etapa          TEXT DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity  TEXT DEFAULT '—';

-- Backfill: etapa from estado where estado matches a known etapa value
UPDATE prospectos SET etapa = estado
WHERE estado IN ('lead','discovery','call1','propuesta','call2','venta','noresp','noventa','seguim');

-- ---- 2. profiles: add initials column ----
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS initials TEXT;

-- Backfill initials from nombre (first letters of first+last word)
UPDATE profiles SET initials = UPPER(
  LEFT(SPLIT_PART(nombre, ' ', 1), 1) ||
  COALESCE(LEFT(SPLIT_PART(nombre, ' ', 2), 1), LEFT(SPLIT_PART(nombre, ' ', 1), 2))
)
WHERE nombre IS NOT NULL AND initials IS NULL;

-- ---- 3. prospectos view with owner initials ----
CREATE OR REPLACE VIEW prospectos_ext AS
SELECT
  p.*,
  COALESCE(pr.initials, 'JS') AS asignado_initials,
  pr.nombre AS asignado_nombre
FROM prospectos p
LEFT JOIN profiles pr ON pr.id = p.asignado_a;

-- ---- 4. Content OS: posts table ----
CREATE TABLE IF NOT EXISTS content_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  contenido       TEXT,
  plataforma      TEXT NOT NULL DEFAULT 'linkedin', -- linkedin | twitter | instagram | facebook
  tipo            TEXT NOT NULL DEFAULT 'post',     -- post | thread | carousel | story
  estado          TEXT NOT NULL DEFAULT 'borrador', -- borrador | revision | aprobado | programado | publicado | rechazado
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

-- ---- 5. Content OS: ai_generations table ----
CREATE TABLE IF NOT EXISTS content_ai_generations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        TEXT NOT NULL, -- hook | post | thread | carousel | rewrite
  prompt      TEXT NOT NULL,
  resultado   TEXT,
  plataforma  TEXT,
  modelo      TEXT DEFAULT 'claude-sonnet-4-6',
  tokens_in   INT,
  tokens_out  INT,
  post_id     UUID REFERENCES content_posts(id) ON DELETE SET NULL,
  creado_por  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- 6. Content OS: assets library ----
CREATE TABLE IF NOT EXISTS content_assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  tipo        TEXT NOT NULL, -- hook | cta | template_carousel | logo | brand | inspiracion | framework
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

-- ---- 7. Content OS: planner slots ----
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

-- ---- 8. Content OS: automation runs log ----
CREATE TABLE IF NOT EXISTS content_automation_runs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  tipo         TEXT NOT NULL, -- n8n | scheduled | manual
  estado       TEXT DEFAULT 'pending', -- pending | running | success | error
  payload      JSONB DEFAULT '{}',
  resultado    JSONB DEFAULT '{}',
  error_msg    TEXT,
  iniciado_en  TIMESTAMPTZ DEFAULT NOW(),
  finalizado_en TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- 9. RLS policies for content tables ----
ALTER TABLE content_posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ai_generations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_planner            ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_automation_runs    ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to CRUD (internal team only)
CREATE POLICY "auth_crud_content_posts"           ON content_posts              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_crud_ai_generations"          ON content_ai_generations     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_crud_content_assets"          ON content_assets             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_crud_content_planner"         ON content_planner            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_crud_automation_runs"         ON content_automation_runs    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---- 10. Indexes for performance ----
CREATE INDEX IF NOT EXISTS idx_content_posts_estado          ON content_posts(estado);
CREATE INDEX IF NOT EXISTS idx_content_posts_plataforma      ON content_posts(plataforma);
CREATE INDEX IF NOT EXISTS idx_content_posts_programado_para ON content_posts(programado_para);
CREATE INDEX IF NOT EXISTS idx_content_assets_tipo           ON content_assets(tipo);
CREATE INDEX IF NOT EXISTS idx_content_planner_fecha         ON content_planner(fecha);
CREATE INDEX IF NOT EXISTS idx_prospectos_etapa              ON prospectos(etapa);
