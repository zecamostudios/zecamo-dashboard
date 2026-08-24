-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Zecamo Dashboard — Migración 0017: anti-rebote del monitor           ║
-- ╚══════════════════════════════════════════════════════════════════════╝
--
-- EL PROBLEMA (reportado por Joaco el 2026-08-24: "me llegan mil avisos")
-- El monitor avisaba en CADA cambio de estado. Suena razonable hasta que se
-- mira cómo se comporta internet de verdad:
--
--   · Un sitio que tarda 2,9 s en una corrida y 3,1 s en la siguiente rebota
--     entre `online` y `degraded`. Dos mensajes por rebote, cada 5 minutos.
--   · Los sitios en Workers arrancan en frío. Una primera respuesta lenta no
--     es una caída: es la normalidad de un sitio con poco tráfico.
--   · Un timeout aislado —una red que hipa un segundo— se veía igual que una
--     caída real.
--
-- El resultado es el peor posible: el canal se llena de ruido, se silencia, y
-- el día que se cae algo de verdad el aviso llega a un canal que nadie mira.
--
-- LA SOLUCIÓN, en dos partes (la otra está en el código del cron):
--   1. `fallos_seguidos`: hay que fallar DOS corridas seguidas —10 minutos—
--      para declarar una caída. Un tropiezo aislado no despierta a nadie.
--   2. El aviso solo se manda por caído/recuperado, nunca por lento. La
--      lentitud se ve en el panel, que es donde se la mira cuando uno quiere.

alter table public.monitor_estado
  add column if not exists fallos_seguidos int not null default 0;

comment on column public.monitor_estado.fallos_seguidos is
  'Corridas fallidas consecutivas. Se avisa recién a partir de la segunda: un '
  'timeout aislado no es una caída, y un monitor que grita por cada hipo de red '
  'termina silenciado.';
