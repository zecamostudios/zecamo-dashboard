-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Zecamo Dashboard — Migración 0015: estado del monitor de sitios       ║
-- ╚══════════════════════════════════════════════════════════════════════╝
--
-- POR QUÉ HACE FALTA GUARDAR ESTADO
-- El monitor corre cada 5 minutos. Sin memoria de la corrida anterior, un sitio
-- caído dispararía un mensaje de Telegram CADA 5 MINUTOS: 288 por día.
--
-- Eso no es una molestia menor — es lo que rompe el sistema. Un canal que manda
-- 288 avisos de lo mismo se silencia, y el día que se cae otra cosa el mensaje
-- llega a un canal que nadie mira. Un monitor ruidoso es peor que ninguno,
-- porque da la sensación de estar cubierto.
--
-- Con esta tabla se avisa solo en los CAMBIOS: cuando algo se cae y cuando
-- vuelve. Dos mensajes por incidente, no doscientos.

create table if not exists public.monitor_estado (
  clave         text primary key,           -- 'maximob', 'cabanas-panel', …
  nombre        text not null,
  estado        text not null,              -- online | degraded | offline
  desde         timestamptz not null default now(),
  ultimo_chequeo timestamptz not null default now(),
  latencia_ms   int,
  detalle       text
);

comment on table public.monitor_estado is
  'Última condición conocida de cada sitio monitoreado. Existe para avisar solo '
  'en los cambios de estado: sin esto, un sitio caído mandaría un Telegram cada '
  '5 minutos y el canal se volvería inútil.';

comment on column public.monitor_estado.desde is
  'Desde cuándo está en este estado. Permite decir "caído hace 40 minutos" en '
  'vez de solo "caído".';

alter table public.monitor_estado enable row level security;

-- Lo escribe únicamente el cron, del lado del servidor. Sin políticas para
-- `anon` ni `authenticated`: nadie desde el navegador tiene por qué tocar esto.
revoke all on public.monitor_estado from anon, authenticated;
grant all on public.monitor_estado to service_role;
