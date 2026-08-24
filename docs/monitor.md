# Monitor de sitios

Vigila las webs y los paneles de los clientes, y avisa por Telegram cuando algo
se cae o vuelve.

## Las piezas

| Pieza | Dónde | Qué hace |
|---|---|---|
| Lista de sitios | `lib/monitor/sitios.ts` | La fuente única. La comparten la pantalla y el cron. |
| Pantalla | `/health` | Estado actual, en tres secciones. Se mira. |
| Endpoint del cron | `/api/cron/monitor` | Chequea, guarda estado y avisa. Se ejecuta solo. |
| Disparador | Worker `zecamo-monitor-cron` | Lo despierta cada 5 minutos. |

Desde el 2026-08-24 el panel vive en `panel.zecamostudios.com`, sobre Cloudflare
Workers. Eso vuelve **redundante** al Worker disparador: el cron puede correr
nativo dentro del propio Worker del dashboard. Queda pendiente de simplificar.
| Estado | tabla `monitor_estado` | Para avisar solo en los cambios. |

## Un 401 de n8n no es n8n caído

El chequeo de n8n distingue entre el servidor caído y **nuestra clave
rechazada**. Ante un 401 o 403 reporta "n8n responde, pero rechaza la API key".

No es un matiz: decir "offline" ahí manda a revisar el servidor cuando el
problema está de este lado. Pasó el 2026-08-24 — el panel marcaba n8n caído y el
servidor estaba perfecto.

⚠️ Ojo con `_ACCESOS/n8n.md`: tiene **varias** claves acumuladas y la primera
está vencida. Agarrar "la clave" del archivo devuelve la equivocada.

## ⚠️ Por qué el cron NO está en `vercel.json`

**El plan Hobby de Vercel solo admite crons diarios.** Y no falla como uno
esperaría: una expresión más frecuente no es que "no corre" — hace que Vercel
**rechace el deploy entero** con `cron_jobs_limits_reached`.

El síntoma es el peor posible: los push dejan de publicarse, GitHub no muestra
ningún error, y el dashboard sigue sirviendo la versión vieja. Ya pasó el
2026-08-21 y costó un rato darse cuenta.

Segunda trampa del mismo archivo: **`vercel.json` tiene esquema estricto.** No
admite comentarios (`//`) ni propiedades extra. Cualquiera de las dos cosas
rompe el deploy con un mensaje que solo se ve pidiendo el detalle del deploy por
API. Por eso esta nota vive acá y no ahí.

## Por qué el disparador tampoco está en n8n

Sería lo más cómodo, porque n8n ya está corriendo. Pero **n8n es uno de los
servicios que este monitor vigila**: si se cae, el monitor dejaría de correr en
silencio justo cuando hay algo que reportar.

Un vigilante no puede depender de lo que vigila. Cloudflare no está en la lista
de monitoreados, y sus Cron Triggers son gratis en el plan free.

## Los paneles se miden por el login

`/dashboard` está protegido por Clerk, que devuelve **404 a propósito** cuando
no hay sesión. Un monitor apuntando ahí diría "caído" las veinticuatro horas
estando todo perfecto — y un monitor que grita siempre deja de mirarse en una
semana. Por eso la lista apunta a `/sign-in`, que responde 200 cuando el panel
está sano.

## Cuándo avisa, y por qué tan poco

Corriendo cada 5 minutos, un sitio caído mandaría 288 mensajes por día. Ese
canal se silencia el primer día, y el día que se cae otra cosa el aviso llega a
un canal que nadie mira. **Un monitor ruidoso es peor que ninguno**: encima deja
creyendo que uno está cubierto.

La primera versión avisaba en cada cambio de estado y fue exactamente eso: ruido
(reportado el 2026-08-24). Tres reglas lo acotan:

1. **Dos corridas fallidas seguidas** para declarar una caída — diez minutos
   sostenidos. Un timeout aislado o un Worker arrancando en frío ya no despierta
   a nadie. Mientras no se confirma, el panel tampoco se pinta de rojo.
2. **Solo se avisa por caído y recuperado, nunca por lento.** Un sitio que tarda
   2,9 s en una corrida y 3,1 s en la siguiente rebotaría para siempre entre
   `online` y `degraded`. La lentitud importa, pero se mira en el panel cuando
   uno quiere mirarla.
3. **El umbral de lento es 5 s**, no 3: abajo de eso los Workers en frío entran
   en amarillo sin que pase nada.

Dos mensajes por incidente: cuando se cae y cuando vuelve, con cuánto estuvo mal.

La primera corrida nunca avisa: sin estado previo, todo "cambia".

## Variables

En Vercel (proyecto `zecamostudios`):

- `TELEGRAM_BOT_TOKEN` · `TELEGRAM_CHAT_ID` — sin ellas el monitor sigue
  guardando estado, pero no avisa.
- `CRON_SECRET` — protege el endpoint. **Tiene que ser el mismo** que el secret
  del Worker.

En el Worker `zecamo-monitor-cron`: `CRON_SECRET`, `MONITOR_URL`, `TOKEN_PRUEBA`.

## Probarlo sin esperar

```
https://zecamo-monitor-cron.zecamostudios.workers.dev/disparar?t=<TOKEN_PRUEBA>
```

Devuelve el estado de los ocho sitios y cuántos cambios avisó.

## Agregar un sitio

Una línea en `lib/monitor/sitios.ts` y aparece en la pantalla y en el cron. Si
es un panel con Clerk, apuntar a `/sign-in`.
