-- Seguimiento de llamadas en prospectos
alter table public.prospectos
  add column if not exists notas_llamadas text,
  add column if not exists ultimo_resultado text;
