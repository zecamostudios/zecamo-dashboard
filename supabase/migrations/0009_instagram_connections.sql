-- ============================================================
-- 0009_instagram_connections.sql
-- Almacena los tokens de Instagram Business Login.
-- Una fila por cuenta de Instagram conectada (propia o de cliente).
-- ============================================================

create table if not exists public.instagram_connections (
  id               uuid primary key default gen_random_uuid(),
  ig_user_id       text not null unique,            -- ID de la cuenta IG Business
  cliente_id       uuid references public.clientes(id) on delete cascade, -- null = cuenta propia de Zecamo
  username         text,
  access_token     text not null,                   -- token de larga duración (60 días)
  token_expires_at timestamptz not null,
  permissions      text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_instagram_connections_cliente
  on public.instagram_connections (cliente_id);

-- ──────────────────────────────────────────────
-- RLS: solo owner/admin lee desde el dashboard.
-- La escritura la hace el callback con service role (bypassa RLS).
-- ──────────────────────────────────────────────
alter table public.instagram_connections enable row level security;

create policy "instagram_connections_select"
  on public.instagram_connections for select
  using (public.is_admin());
