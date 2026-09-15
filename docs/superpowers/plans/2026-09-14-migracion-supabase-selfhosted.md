# Migración Supabase Cloud → Supabase self-hosted en el VPS

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar de pagar los USD 25/mes de Supabase Pro corriendo Supabase self-hosted en el VPS Hostinger, migrando primero el dashboard de Zecamo y después Las Flores.

**Architecture:** Se levanta el stack oficial de Supabase (Postgres + GoTrue + PostgREST + Storage + Kong) como un **stack nuevo e independiente** en el VPS, desplegado desde el repo `zecamostudios/vps-stack` vía Portainer. El código del dashboard **no se reescribe**: sigue usando `supabase-js` y sólo cambian `NEXT_PUBLIC_SUPABASE_URL` y las keys. El Postgres actual del VPS (`postgres:16`, el de n8n) **no se toca**: Supabase trae el suyo propio en PG17.

**Tech Stack:** Docker Compose · Supabase self-hosted (GoTrue, PostgREST, Storage, Kong) · Postgres 17 · Nginx Proxy Manager · Cloudflare DNS · Resend SMTP · Next.js 15 (App Router) · Vercel

**Dónde se trabaja:** WSL Ubuntu-24.04, repos clonados en `~/zecamo/` (NO en `/mnt/c`).

## ⚠️ CUÁL ES EL REPO DEL DASHBOARD (leer antes de tocar un archivo)

Hay **dos copias** del dashboard en el disco de Joaco y sólo una es la buena:

| Carpeta | Commits | Estado |
|---|---|---|
| `Desktop\Zecamo\_repos-staging\zecamo-dashboard` | **112** (`cee5b9d`) | ✅ **ES ESTE.** Sincronizado con GitHub, tiene `wrangler.jsonc`, es el que se deploya a Cloudflare |
| `Desktop\zecamo-studios\zecamo-dashboard` | 92 (`4952f78`, 27/06) | ❌ Copia vieja, **20 commits atrás**, sin `wrangler.jsonc` |

El clon de trabajo en WSL (`~/zecamo/zecamo-dashboard`) ya sale del bueno. **Todas las rutas de este plan se refieren a ese.**

**Producción es Cloudflare Workers, no Vercel** (decisión de Joaco, 15/09): el Worker `zecamo-dashboard` sirve `panel.zecamostudios.com`, buildeado con OpenNext (`npm run cf:deploy`). Vercel se abandona.

- `panel.zecamostudios.com` → el dashboard (Cloudflare Worker) — **no se toca**
- `sb.zecamostudios.com` → Supabase self-hosted en el VPS — **este es el que hay que crear**

---

## Contexto medido (14/09/2026) — no re-investigar

| Dato | Valor real |
|---|---|
| Base del dashboard | **14 MB**, ~430 filas, tabla más grande `leads` (190) |
| Usuarios en `auth.users` | **1** |
| Archivos en Storage | **0** (bucket de carruseles vacío) |
| Superficie de código | **69 archivos**, 201 llamadas a `supabase-js` |
| Qué usa de Supabase | Auth (password + magic link), RLS, PostgREST desde el browser, Storage |
| Plan de la org | **`pro`** — org `xuufxrljnmpnejljuzcc` (`zecamostudios's Org`) |
| Proyectos en esa org | `wlvogtjpldglpiufnryy` (dashboard, us-west-1) y `lytfktsbrrjzxvewkntb` (lasflores, us-east-1) |
| VPS | 7.8 GB RAM (5.7 libres), 96 GB disco (75 libres), Docker 29.7.2 |
| Postgres del VPS | `postgres:16`, usuario `zecamo`, bases `n8n` + `agente_finca_cajal` |
| Supabase Cloud corre | Postgres **17** |

**El ahorro recién existe cuando los DOS proyectos salgan de Supabase** (el plan Pro se cobra por organización, no por proyecto). El dashboard es el ensayo general; Las Flores es el que libera la plata.

## Progreso (actualizado 15/09/2026, 01:00)

**🟢 SUPABASE ESTÁ ARRIBA EN EL VPS Y CON TODOS LOS DATOS ADENTRO.** Faltan el DNS + NPM (Joaco) y rebuildear el Worker.

| | Estado |
|---|---|
| Stack | **12/12 contenedores `healthy`** |
| Datos | **26/26 tablas con los conteos exactos del origen** (190 leads, 60 manual_blocks…) |
| Schema | **38 tablas · 79 policies · RLS en las 38** |
| Usuario | `zecamostudios@gmail.com` con su UUID original + perfil `owner` enganchado |
| Seguridad | `anon` devuelve `[]` en prospectos/leads/clientes/transacciones · `service_role` sí ve · gateway **sólo en 127.0.0.1** |
| Backup | probado: 146 KB, **86 `CREATE TABLE` adentro** |
| Storage | **no se usa** — el repo bueno no tiene una sola llamada a `.storage.from()` |

### Los tres pozos de esta sesión (para no repetirlos en Las Flores)

1. **`docker compose config` convierte las rutas relativas en absolutas de la máquina donde corre.** En el VPS no existen → Docker crea directorios vacíos donde van los archivos → `not a directory`. Se arregla con `--no-path-resolution`.
2. **Portainer usa `/data/compose/<id>` como directorio del proyecto, y esa ruta sólo existe DENTRO del contenedor de Portainer.** El daemon resuelve los binds contra el host y no la encuentra. **Los bind mounts relativos no funcionan con stacks de git.** Se arregla leyendo los configs del clon del servidor (`/home/zecamo-deploy/vps-stack`), con rutas absolutas → y por eso **antes de cada redeploy hay que correr `git -C ~/vps-stack pull`**.
3. **Postgres sólo corre los scripts de `initdb` si el directorio de datos está vacío.** Un deploy fallido alcanzó a crear la base *antes* de que los montajes funcionaran, y los roles quedaron **sin contraseña** (`User "authenticator" has no password assigned`). No se arregla redeployando: hay que borrar el volumen y dejar que nazca de nuevo.

Además: `imgproxy` monta el **mismo** `/var/lib/storage` que `storage`. Si sólo se cambia `storage` a volumen con nombre, imgproxy queda apuntando a otro lado y no ve un solo archivo.

---

**Fases 0 y 1 cerradas. Fase 2 lista del lado del código; falta lo que sólo puede hacer Joaco (DNS, NPM, Portainer).**

| Tarea | Estado |
|---|---|
| 0.1 Herramientas en WSL | ✅ **Resuelto sin sudo** — node v20.20.2 ya estaba (nvm). `pg_dump`/`psql` **17.11 corren dentro de un contenedor** (`docker run --rm postgres:17`), así que **NO hace falta instalar `postgresql-client-17`** |
| 0.2 Clonar repos en WSL | ✅ `~/zecamo/zecamo-dashboard` y `~/zecamo/vps-stack`, clonados del disco local (historial completo, sin tokens), `origin` → GitHub |
| 0.3 Acceso al VPS | ✅ entra como `zecamo-deploy` en `srv1703464` |
| 1.1 Backup previo | ✅ `SQL backup created successfully` — `n8n` 152 MB + `agente_finca_cajal` 44.6 KB |
| 1.2 Conexión a Cloud | ✅ password reseteada por Joaco · pooler `aws-1-us-west-1.pooler.supabase.com`, **puerto 5432 (session)**, user `postgres.wlvogtjpldglpiufnryy` |
| 1.3 Export de Cloud | ✅ **y probado restaurando** — ver abajo |
| 2.1 Red de NPM | ✅ NPM está en `npm_default` **y** `zecamo-core_zecamo-net` → el gateway va ahí |
| 2.2 Compose al repo | ✅ **commit local `a0795a3`** (sin push) |
| 2.3 Secretos | ✅ generados y verificados (firma HS256 OK en las dos keys) · copia en `_ACCESOS/supabase-selfhosted-vps.txt` · **bloque de Portainer listo en `_ACCESOS/supabase-portainer-env.txt`** (70 variables) |
| 2.4 DNS + NPM | ⛔ **Necesita a Joaco** |
| 2.5 Desplegar | ⛔ **Necesita a Joaco** (push + crear stack) |

**Números reales de la base de origen (para verificar del otro lado):** 38 tablas · **79 policies** · RLS activa en las 38 · 4 funciones.

**Prueba de restauración (14/09, en un Postgres 17 descartable):** el dump levantó **38 | 79 | 38** — tablas, policies y tablas con RLS — y los datos coincidieron (190 leads, 60 manual_blocks, 36 brand_memory…). **El backup no es teórico: se restauró.**

**Hallazgos que cambiaron el plan:** PG17 ya es el default del oficial (misma major que Cloud) · `analytics`/`vector` son opt-in, no hay que borrar nada · el gateway es Envoy con alias `kong` · el oficial no se edita: los cambios van en `docker-compose.zecamo.yml` · el puerto se ata a loopback **por variable** (`API_GW_HTTP_PORT`), porque un `ports:` en el override se **concatena** y dejaría el 8000 abierto igual.

## Reglas del VPS que este plan respeta (de `Desktop\SALUD-VPS\CLAUDE.md`)

- Se entra **siempre** con `ssh zecamo-vps-agente "<comando>"`. Nunca `zecamo-vps` (ese es root, el de Joaco).
- **El compose se toca SOLO en el repo** `zecamostudios/vps-stack` y se aplica con "Pull and redeploy" en Portainer. Editar el YAML en el disco del server no sirve: el próximo pull lo pisa.
- **Los secretos van en Portainer** (Environment variables), nunca en el repo.
- **Nunca borrar volúmenes de Docker.**
- **"Re-pull image" SIEMPRE apagado** en Portainer.
- Antes de un cambio grande: `docker exec postgres-backup /backup.sh`.
- Después de cada cambio, **verificar con un comando y mostrar la salida**. "Quedó funcionando" no es verificación.
- Si algo falla: **parar y avisar**. No improvisar.

## Expectativa de tiempo

Tres sesiones, no una tarde:
1. **Sesión 1** — Fases 0 a 2: entorno, backups y Supabase arriba en el VPS respondiendo por HTTPS.
2. **Sesión 2** — Fases 3 a 6: datos migrados, dashboard apuntando al VPS, n8n recableado, verificación.
3. **Sesión 3** — Fases 7 y 8: Las Flores y baja del plan Pro. **Recién acá se deja de pagar.**

---

# FASE 0 — Entorno de trabajo en WSL

### Task 0.1: Instalar las herramientas que faltan en WSL

**Estado actual verificado:** `git 2.43.0` ✅ · `npm 11.11.0` ✅ · `docker 29.7.2` ✅ · `node` ❌ no está en el PATH de shells no interactivos · `psql`/`pg_dump` ❌ no instalados.

**Files:** ninguno (setup de máquina)

- [ ] **Step 1: Ver si node existe pero está escondido detrás de nvm**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ls -d ~/.nvm 2>/dev/null; which -a node nodejs 2>/dev/null; cat ~/.nvmrc 2>/dev/null'
```

Si aparece `~/.nvm`, node está pero el shell no interactivo no carga nvm — saltear el Step 2 y usar siempre `bash -ic` (interactivo) o cargar nvm a mano con `source ~/.nvm/nvm.sh`.

- [ ] **Step 2: Instalar Node 22 LTS (sólo si el Step 1 no encontró nada)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs'
```

⚠️ Pide la contraseña de sudo de Joaco: es interactivo, lo corre él con `! wsl ...` o en su terminal.

- [ ] **Step 3: Instalar el cliente de Postgres 17 (tiene que ser 17, igual que Supabase Cloud)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'sudo install -d /usr/share/postgresql-common/pgdg && sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt noble-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list && sudo apt-get update && sudo apt-get install -y postgresql-client-17'
```

⚠️ También pide sudo. Lo corre Joaco.

- [ ] **Step 4: Verificar que las versiones son las correctas**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'node --version; pg_dump --version; psql --version'
```

Esperado: `v22.x` · `pg_dump (PostgreSQL) 17.x` · `psql (PostgreSQL) 17.x`

**Si `pg_dump` dice 16.x, PARAR**: un dump hecho con un cliente 16 contra un servidor 17 falla con `server version mismatch`.

---

### Task 0.2: Clonar los dos repos dentro de WSL

**Files:**
- Create: `~/zecamo/zecamo-dashboard/` (clon)
- Create: `~/zecamo/vps-stack/` (clon)

Hoy `~/zecamo/` sólo tiene `crear-usuario-agente.sh` y `zecamo-os/`. El dashboard vive en `C:\Users\Joaquin\Desktop\zecamo-studios\zecamo-dashboard` (Windows) y el clon de `vps-stack` está en `C:\Users\Joaquin\Desktop\SALUD-VPS` (Windows). Los dos se re-clonan en WSL.

- [ ] **Step 1: Confirmar que no hay trabajo sin commitear en el clon de Windows**

```bash
cd "C:/Users/Joaquin/Desktop/zecamo-studios/zecamo-dashboard" && git status --short && git log --oneline -1
cd "C:/Users/Joaquin/Desktop/SALUD-VPS" && git status --short && git log --oneline -1
```

Esperado: salida vacía en ambos `git status`. **Si hay archivos sin commitear, PARAR y preguntarle a Joaco qué hacer con ellos** — clonar de nuevo los deja atrás.

- [ ] **Step 2: Clonar el dashboard en WSL**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'mkdir -p ~/zecamo && cd ~/zecamo && git clone https://github.com/zecamostudios/zecamo-dashboard.git && cd zecamo-dashboard && git log --oneline -1'
```

Esperado: el último commit coincide con el del Step 1.

- [ ] **Step 3: Clonar vps-stack en WSL**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo && git clone https://github.com/zecamostudios/vps-stack.git && cd vps-stack && git log --oneline -1 && ls'
```

Esperado: aparece `docker-compose.yml` y el último commit es `624fca4`.

- [ ] **Step 4: Copiar el `.env.local` (tiene secretos, NO está en git)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cp "/mnt/c/Users/Joaquin/Desktop/zecamo-studios/zecamo-dashboard/.env.local" ~/zecamo/zecamo-dashboard/.env.local && wc -l ~/zecamo/zecamo-dashboard/.env.local'
```

Esperado: un número de líneas > 3.

- [ ] **Step 5: Copiar este plan al clon de WSL y commitearlo**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'mkdir -p ~/zecamo/zecamo-dashboard/docs/superpowers/plans && cp "/mnt/c/Users/Joaquin/Desktop/zecamo-studios/zecamo-dashboard/docs/superpowers/plans/2026-09-14-migracion-supabase-selfhosted.md" ~/zecamo/zecamo-dashboard/docs/superpowers/plans/'
```

- [ ] **Step 6: Instalar dependencias y confirmar que el proyecto buildea en WSL**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/zecamo-dashboard && npm ci 2>&1 | tail -5'
```

Esperado: termina sin `ERR!`. Tarda algunos minutos.

---

### Task 0.3: Confirmar que desde WSL se entra al VPS

- [ ] **Step 1: Probar el acceso del agente**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh -o BatchMode=yes -o ConnectTimeout=15 zecamo-vps-agente "whoami; hostname; docker ps --format \"{{.Names}}\" | sort"'
```

Esperado: `zecamo-deploy`, el hostname del VPS, y la lista de contenedores incluyendo `postgres`, `n8n`, `npm-npm-1`, `portainer`.

**Si dice `Could not resolve hostname`: el alias vive sólo en WSL.** Desde Git Bash de Windows no resuelve — eso ya está comprobado, no es un error nuevo.

- [ ] **Step 2: Commit del entorno preparado**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/zecamo-dashboard && git add docs/superpowers/plans/ && git commit -m "docs: plan de migracion a Supabase self-hosted"'
```

⚠️ **No pushear todavía** — se pushea recién cuando Joaco lo pida.

---

# FASE 1 — Red de seguridad (antes de tocar NADA)

### Task 1.1: Backup del VPS antes del cambio grande

- [ ] **Step 1: Forzar un dump fresco de las bases del VPS**

Qué hace: corre el script de backup que ya existe, sin esperar a la corrida automática de las 00:30.

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec postgres-backup /backup.sh"'
```

Esperado: termina en `SQL backup created successfully`.

- [ ] **Step 2: Confirmar que hay dumps de hoy**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker run --rm -v zecamo-core_postgres_backups:/b:ro alpine find /b/daily -type f -mtime -1 -exec ls -la {} \;"'
```

Esperado: archivos con fecha de hoy. **Si no hay, PARAR y arreglar el backup primero.**

- [ ] **Step 3: Guardar copia de las variables de entorno de Portainer**

⚠️ **Acción manual de Joaco (2 min):** Portainer → Stacks → `zecamo-core` → Environment variables → **Advanced mode** → copiar todo el texto a `Desktop\_ACCESOS\vps-compose\stack-env-ANTES-supabase-20260914.txt`.

Ese es el botón de pánico si algo se rompe: las variables no están en ningún repo.

---

### Task 1.2: Conseguir la cadena de conexión a Supabase Cloud

La password de la base del dashboard **no está en `_ACCESOS`** (sólo está la de `lasflores`). Hay que resetearla.

- [ ] **Step 1: Resetear la password de la base**

⚠️ **Acción manual de Joaco (2 min):** [Supabase Dashboard](https://supabase.com/dashboard/project/wlvogtjpldglpiufnryy/settings/database) → Database → **Reset database password** → generar una nueva → guardarla en `Desktop\_ACCESOS\supabase.md` como `zecamo dashboard db_pass`.

**Esto es seguro:** el dashboard se conecta con las API keys (`anon` / `service_role`), no con la connection string. Resetear la password de Postgres no lo desloguea ni lo rompe.

- [ ] **Step 2: Copiar la cadena de conexión del Session Pooler**

⚠️ **Acción manual de Joaco:** en esa misma página → **Connect** → pestaña **Session pooler** → copiar la URI completa (arranca con `postgresql://postgres.wlvogtjpldglpiufnryy:...`).

**Por qué el pooler y no la conexión directa:** `db.<ref>.supabase.co` es IPv6-only y WSL habitualmente no tiene IPv6 de salida; el pooler responde por IPv4.

- [ ] **Step 3: Guardar la URI en un archivo fuera de todo repo y probarla**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'mkdir -p ~/.zecamo-secrets && chmod 700 ~/.zecamo-secrets && cat > ~/.zecamo-secrets/supabase-cloud-dashboard.env <<EOF
export SUPA_CLOUD_URL="<PEGAR ACA LA URI DEL STEP 2>"
EOF
chmod 600 ~/.zecamo-secrets/supabase-cloud-dashboard.env'
```

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-cloud-dashboard.env && psql "$SUPA_CLOUD_URL" -c "select current_database(), version();"'
```

Esperado: `postgres` y `PostgreSQL 17.x`.

---

### Task 1.3: Export completo de Supabase Cloud

**Files:**
- Create: `~/zecamo/backups-supabase/20260914/roles.sql`
- Create: `~/zecamo/backups-supabase/20260914/schema-public.sql`
- Create: `~/zecamo/backups-supabase/20260914/data-public.sql`
- Create: `~/zecamo/backups-supabase/20260914/auth-users.sql`

- [ ] **Step 1: Crear la carpeta de backups (fuera de todo repo)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'mkdir -p ~/zecamo/backups-supabase/20260914 && echo ok'
```

- [ ] **Step 2: Dump del schema `public` (estructura + RLS policies + funciones)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-cloud-dashboard.env && pg_dump "$SUPA_CLOUD_URL" --schema-only --schema=public --no-owner --no-privileges --file ~/zecamo/backups-supabase/20260914/schema-public.sql && wc -l ~/zecamo/backups-supabase/20260914/schema-public.sql'
```

Esperado: varios cientos de líneas. **Este archivo es la verdad sobre el schema** — las migraciones de `supabase/migrations/` tienen drift conocido (la vista `prospectos_ext` está en la migración 0009 pero NO existe en la base).

- [ ] **Step 3: Verificar que el dump trajo las RLS policies**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'grep -c "CREATE POLICY" ~/zecamo/backups-supabase/20260914/schema-public.sql'
```

Esperado: un número **mayor a 20**. Si da 0, el dump quedó incompleto: **PARAR**, sin policies la base nueva queda abierta.

- [ ] **Step 4: Dump de los datos del schema `public`**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-cloud-dashboard.env && pg_dump "$SUPA_CLOUD_URL" --data-only --schema=public --no-owner --no-privileges --disable-triggers --file ~/zecamo/backups-supabase/20260914/data-public.sql && du -h ~/zecamo/backups-supabase/20260914/data-public.sql'
```

Esperado: un archivo de algunos MB.

- [ ] **Step 5: Dump sólo de los datos de `auth.users` e `auth.identities`**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-cloud-dashboard.env && pg_dump "$SUPA_CLOUD_URL" --data-only --table=auth.users --table=auth.identities --no-owner --no-privileges --file ~/zecamo/backups-supabase/20260914/auth-users.sql && grep -c "INSERT INTO\|COPY" ~/zecamo/backups-supabase/20260914/auth-users.sql'
```

**Por qué sólo los datos:** el Supabase self-hosted crea el schema `auth` solo (GoTrue corre sus propias migraciones). Restaurarle la estructura de Cloud encima lo rompe.

- [ ] **Step 6: Guardar el `user_id` del único usuario (lo necesitamos después)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-cloud-dashboard.env && psql "$SUPA_CLOUD_URL" -c "select id, email, created_at from auth.users;" && psql "$SUPA_CLOUD_URL" -c "select id, nombre from public.profiles;"'
```

Anotar el `id` y el `email`. **`profiles.id` referencia a `auth.users.id`**, así que el usuario nuevo tiene que conservar el mismo UUID o el perfil queda huérfano.

- [ ] **Step 7: Verificar que el export es restaurable (prueba en local, sin tocar nada remoto)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'docker run --rm -d --name pgtest -e POSTGRES_PASSWORD=test -p 55432:5432 postgres:17 && sleep 15 && PGPASSWORD=test psql -h localhost -p 55432 -U postgres -c "create role anon; create role authenticated; create role service_role; create schema auth; create or replace function auth.uid() returns uuid language sql stable as \$\$ select null::uuid \$\$;" && PGPASSWORD=test psql -h localhost -p 55432 -U postgres -f ~/zecamo/backups-supabase/20260914/schema-public.sql 2>&1 | grep -c ERROR'
```

Esperado: **0 errores** (o sólo errores de extensiones propias de Supabase, que en el server real sí existen). Este paso es el que prueba que el backup sirve **antes** de depender de él.

- [ ] **Step 8: Bajar el Postgres de prueba**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'docker rm -f pgtest && echo "limpio"'
```

---

# FASE 2 — Supabase self-hosted arriba en el VPS

### Task 2.1: Averiguar a qué red tiene que engancharse el stack

**Gotcha conocido:** en este VPS hay 5 vhosts que devuelven 502 porque **Nginx Proxy Manager no comparte red con esos contenedores**. Si el stack de Supabase no está en la red de NPM, va a pasar exactamente lo mismo.

- [ ] **Step 1: Ver en qué redes está NPM**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker inspect npm-npm-1 --format \"{{range \\\$k, \\\$v := .NetworkSettings.Networks}}{{\\\$k}} {{end}}\"; echo ---; docker network ls"'
```

Anotar el nombre exacto de la red de NPM. Esa red se declara como `external: true` en el compose nuevo.

- [ ] **Step 2: Confirmar cómo llega NPM a n8n hoy (el modelo a copiar)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker inspect n8n --format \"{{range \\\$k, \\\$v := .NetworkSettings.Networks}}{{\\\$k}} {{end}}\""'
```

n8n publica en `127.0.0.1:5678` y NPM lo alcanza por ahí. **Supabase va a usar el mismo patrón: Kong sólo en `127.0.0.1:8000`, nunca expuesto a internet directo.**

---

### Task 2.2: Traer el compose oficial de Supabase al repo

**Files:**
- Create: `~/zecamo/vps-stack/supabase/docker-compose.yml`
- Create: `~/zecamo/vps-stack/supabase/volumes/**` (configs de Kong, Vector, init de la DB)
- Create: `~/zecamo/vps-stack/supabase/README.md`

- [x] **Step 1: Bajar el compose oficial a una carpeta temporal** ✅ HECHO 14/09

Con sparse-checkout, para no traer el repo entero de Supabase:

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'rm -rf ~/zecamo/tmp-supabase && mkdir -p ~/zecamo/tmp-supabase && cd ~/zecamo/tmp-supabase && git clone --depth 1 --filter=blob:none --sparse https://github.com/supabase/supabase.git && cd supabase && git sparse-checkout set docker && ls docker/'
```

Resultado real: el compose base (587 líneas, 13 servicios) más los overrides `pg17`, `logs`, `kong`, `s3`, `nginx`, `caddy`, `envoy`, `pgbouncer`, `rustfs`.

- [ ] **Step 2: Copiar el oficial a `upstream/` (sin modificar)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'mkdir -p ~/zecamo/vps-stack/supabase/upstream && cp -r ~/zecamo/tmp-supabase/supabase/docker/docker-compose.yml ~/zecamo/tmp-supabase/supabase/docker/volumes ~/zecamo/vps-stack/supabase/upstream/ && cp ~/zecamo/tmp-supabase/supabase/docker/.env.example ~/zecamo/vps-stack/supabase/upstream/ && ls ~/zecamo/vps-stack/supabase/upstream/'
```

Esperado: `docker-compose.yml`, `.env.example`, `volumes/`.

**Anotar la versión que se copió**, para saber desde dónde se actualiza después:

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/tmp-supabase/supabase && git log --oneline -1 > ~/zecamo/vps-stack/supabase/upstream/VERSION.txt && cat ~/zecamo/vps-stack/supabase/upstream/VERSION.txt'
```

- [ ] **Step 3: NO editar el compose oficial — poner los cambios en un override**

**Inspeccionado el 14/09/2026, y es mejor de lo que suponía el plan original:**

- **Postgres 17 ya es el default** (`supabase/postgres:17.6.1.136`). Cloud corre 17.6.1.121 → **misma major, el dump entra sin drama.** El override `docker-compose.pg17.yml` es redundante.
- **`analytics` y `vector` NO están en el compose base**: viven en `docker-compose.logs.yml`, que es **opt-in**. No hay que borrar nada — alcanza con no incluirlo. Se cae solo el riesgo de romper los `depends_on`.
- El gateway ya no es Kong: es **Envoy** (`container_name: supabase-envoy`), con alias de red `envoy` **y** `kong`, así que las dos formas resuelven.
- Servicios del base: `studio`, `api-gw`, `auth`, `rest`, `realtime`, `storage`, `imgproxy`, `meta`, `functions`, `db`, `supavisor`, `db-config`, `deno-cache`.

**Decisión: se deja el compose oficial intacto y nuestros cambios van en un override propio.** Sacar `realtime`/`functions`/`supavisor` obligaría a editar el archivo oficial y a rehacer esa cirugía en cada upgrade; con 5.7 GB libres, no vale la pena. Si algún día la RAM aprieta, se apagan ahí.

Estructura en el repo:

```
supabase/
  upstream/docker-compose.yml        ← copia textual del oficial (no se toca)
  upstream/volumes/**                ← configs de envoy/db/storage
  docker-compose.zecamo.yml          ← NUESTRO override (red de NPM + backup)
  docker-compose.yml                 ← generado, es el que Portainer despliega
  README.md
```

- [ ] **Step 4: Escribir el override**

Crear `~/zecamo/vps-stack/supabase/docker-compose.zecamo.yml`:

```yaml
# Cambios de Zecamo sobre el compose oficial de Supabase.
# El archivo oficial no se edita: asi un upgrade es re-copiar upstream/ y regenerar.
services:
  api-gw:
    networks:
      default:
        aliases:
          - envoy
          - kong
      zecamo-core_zecamo-net: {}
    ports:
      - "127.0.0.1:8000:8000"

  supabase-backup:
    image: prodrigestivill/postgres-backup-local
    container_name: supabase-backup
    restart: always
    environment:
      POSTGRES_HOST: db
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      SCHEDULE: "@daily"
      BACKUP_KEEP_DAYS: 7
    volumes:
      - supabase_backups:/backups
    depends_on:
      - db

networks:
  zecamo-core_zecamo-net:
    external: true

volumes:
  supabase_backups:
```

⚠️ **El `ports` con `127.0.0.1:` es la línea que mantiene la base fuera de internet.** El compose oficial publica `8000:8000` (todas las interfaces); esta línea lo pisa y lo deja sólo en loopback, como n8n.

- [ ] **Step 5: Generar el compose final que despliega Portainer**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/vps-stack/supabase && docker compose -f upstream/docker-compose.yml -f docker-compose.zecamo.yml config --no-interpolate > docker-compose.yml && grep -c "" docker-compose.yml'
```

⚠️ **`--no-interpolate` no es opcional:** sin esa bandera, `docker compose config` resuelve las variables y **hornea los secretos en un archivo que va a git**.

- [ ] **Step 6: Verificar que NO quedó ningún secreto en el archivo generado**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/vps-stack/supabase && grep -nE "eyJhbGciOi|POSTGRES_PASSWORD: [^$]|JWT_SECRET: [^$]" docker-compose.yml | head; echo "--- (vacio = limpio) ---"; grep -c "127.0.0.1:8000" docker-compose.yml'
```

Esperado: la primera búsqueda **sin resultados**, y el conteo del puerto en loopback = **1**.

**Si aparece un `eyJhbGciOi`, PARAR**: se interpolaron los secretos. Borrar el archivo y rehacer el Step 5 con `--no-interpolate`.

- [ ] **Step 7: Confirmar que el gateway quedó en la red compartida**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/vps-stack/supabase && docker compose -f docker-compose.yml config --no-interpolate 2>/dev/null | grep -A6 "api-gw:" | head -20'
```

Esperado: `api-gw` con las dos redes (`default` con los alias `envoy`/`kong`, y `zecamo-core_zecamo-net`).

**Sólo el gateway va en la red compartida.** La base, auth, rest y storage se quedan en la red interna, donde NPM no las ve: la única puerta de entrada es Envoy.

- [ ] **Step 8: Escribir el README del stack**

Crear `~/zecamo/vps-stack/supabase/README.md`:

```markdown
# Stack `supabase` — Supabase self-hosted

Reemplaza a Supabase Cloud para el dashboard de Zecamo (y después Las Flores).

## Cómo está armado

- `upstream/` es la **copia textual del compose oficial**. No se edita nunca.
  La versión copiada está en `upstream/VERSION.txt`.
- `docker-compose.zecamo.yml` son **nuestros cambios**: la red que comparte con NPM,
  el puerto atado a loopback y el contenedor de backup.
- `docker-compose.yml` es **generado** (`docker compose -f upstream/... -f zecamo... config
  --no-interpolate`) y es el que despliega Portainer. **No editarlo a mano: se regenera.**

## Operación

- Se despliega desde este repo: Portainer → Stacks → `supabase` → **Pull and redeploy**.
- **Los secretos viven en Portainer**, no acá. El archivo generado sólo tiene `${VARIABLES}`.
- El gateway (Envoy) escucha SOLO en `127.0.0.1:8000`; sale a internet por NPM
  en `sb.zecamostudios.com`.
- Postgres propio **PG17** (`supabase/postgres:17.6.1.136`). **NO es el Postgres de n8n.**
- Backups: contenedor `supabase-backup` → volumen `supabase_backups`.
- `analytics` y `vector` no están: son opt-in vía `docker-compose.logs.yml` y no se incluyen.

## Para actualizar Supabase

1. Re-copiar `upstream/` desde `github.com/supabase/supabase` (carpeta `docker/`).
2. Regenerar `docker-compose.yml`.
3. Pull and redeploy en Portainer.

Como el archivo oficial nunca se editó, el upgrade no tiene que rehacer ninguna cirugía.
```

- [ ] **Step 9: Commit**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/vps-stack && git add supabase/ && git commit -m "supabase: stack self-hosted (oficial intacto + override de Zecamo)"'
```

---

### Task 2.3: Generar los secretos

**Files:**
- Create: `~/.zecamo-secrets/supabase-selfhosted.env` (fuera de todo repo)

- [ ] **Step 1: Generar JWT_SECRET, POSTGRES_PASSWORD y las claves internas**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cat > ~/.zecamo-secrets/supabase-selfhosted.env <<EOF
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)
SECRET_KEY_BASE=$(openssl rand -hex 32)
VAULT_ENC_KEY=$(openssl rand -hex 16)
DASHBOARD_PASSWORD=$(openssl rand -hex 16)
EOF
chmod 600 ~/.zecamo-secrets/supabase-selfhosted.env && cat ~/.zecamo-secrets/supabase-selfhosted.env | sed "s/=.*/=<generado>/"'
```

Esperado: las 5 variables listadas (con los valores tapados en pantalla).

- [ ] **Step 2: Generar ANON_KEY y SERVICE_ROLE_KEY firmadas con ese JWT_SECRET**

Las keys de Supabase son JWT HS256 firmados con `JWT_SECRET`. Este script los genera sin dependencias:

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cat > ~/.zecamo-secrets/gen-keys.sh <<'"'"'SCRIPT'"'"'
#!/usr/bin/env bash
set -euo pipefail
source ~/.zecamo-secrets/supabase-selfhosted.env
b64() { openssl base64 -e -A | tr "+/" "-_" | tr -d "="; }
mk() {
  local role="$1"
  local iat; iat=$(date +%s)
  local exp=$((iat + 315360000))   # 10 años
  local h; h=$(printf %s "{\"alg\":\"HS256\",\"typ\":\"JWT\"}" | b64)
  local p; p=$(printf %s "{\"role\":\"$role\",\"iss\":\"supabase\",\"iat\":$iat,\"exp\":$exp}" | b64)
  local s; s=$(printf %s "$h.$p" | openssl dgst -binary -sha256 -hmac "$JWT_SECRET" | b64)
  printf %s "$h.$p.$s"
}
echo "ANON_KEY=$(mk anon)"
echo "SERVICE_ROLE_KEY=$(mk service_role)"
SCRIPT
chmod +x ~/.zecamo-secrets/gen-keys.sh && ~/.zecamo-secrets/gen-keys.sh >> ~/.zecamo-secrets/supabase-selfhosted.env && grep -c "KEY=" ~/.zecamo-secrets/supabase-selfhosted.env'
```

Esperado: `2`.

- [ ] **Step 3: Verificar que las keys son JWT válidos y con el rol correcto**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && for k in "$ANON_KEY" "$SERVICE_ROLE_KEY"; do echo "$k" | cut -d. -f2 | tr "_-" "/+" | base64 -d 2>/dev/null; echo; done'
```

Esperado: dos JSON, uno con `"role":"anon"` y otro con `"role":"service_role"`, ambos con `iss: supabase`.

**Si el payload sale ilegible, PARAR**: una key mal firmada hace que todo devuelva `401 Invalid JWT` y es carísimo de diagnosticar después.

- [ ] **Step 4: Guardar copia en la carpeta de accesos de Joaco**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cp ~/.zecamo-secrets/supabase-selfhosted.env "/mnt/c/Users/Joaquin/Desktop/_ACCESOS/supabase-selfhosted-vps.txt" && echo "copiado a _ACCESOS"'
```

⚠️ Si se pierde el `JWT_SECRET`, **todas las sesiones y keys quedan inválidas**. Esta copia no es opcional.

---

### Task 2.4: DNS y proxy para `sb.zecamostudios.com`

- [ ] **Step 1: Ver cómo está configurado `zecamon8n` en DNS (el modelo a copiar)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'dig +short zecamon8n.zecamostudios.com; echo ---; dig +short zecamostudios.com'
```

- [ ] **Step 2: Crear el registro DNS**

⚠️ **Acción manual de Joaco (2 min):** Cloudflare → `zecamostudios.com` → DNS → agregar registro **A**: nombre `sb`, contenido `2.25.130.87`, **con la misma configuración de proxy (nube naranja o gris) que tiene `zecamon8n`** — copiar lo que muestre ese registro, no adivinar.

- [ ] **Step 3: Verificar que el DNS resuelve**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'dig +short sb.zecamostudios.com'
```

Esperado: una IP. Si no sale nada, esperar 2 minutos y repetir.

- [ ] **Step 4: Crear el Proxy Host en NPM**

⚠️ **Acción manual de Joaco (3 min):** Nginx Proxy Manager → Proxy Hosts → Add:
- Domain: `sb.zecamostudios.com`
- Scheme `http`, Forward Hostname **`supabase-envoy`**, Forward Port `8000`
- **Websockets Support: ON**
- SSL → Request a new certificate, Force SSL: ON

El hostname es **`supabase-envoy`** — el `container_name` real del gateway (el compose oficial ya no usa Kong; los alias `kong`/`envoy` sólo existen dentro de la red interna del stack, no en la compartida). Funciona porque el override lo metió en `zecamo-core_zecamo-net`, la red que NPM comparte: el mismo mecanismo por el que NPM llega a n8n hoy.

---

### Task 2.5: Desplegar el stack

- [ ] **Step 1: Pushear el compose al repo (Portainer lo lee de ahí)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/vps-stack && git push origin main && git log --oneline -1'
```

⚠️ **Este push sí es necesario** para desplegar: Portainer despliega desde git, no desde el disco del server. Confirmar con Joaco antes de correrlo.

- [ ] **Step 2: Crear el stack en Portainer**

⚠️ **Acción manual de Joaco (5 min):** Portainer → Stacks → **Add stack** → nombre `supabase` → **Repository**:
- URL: `https://github.com/zecamostudios/vps-stack`
- Reference: `refs/heads/main`
- Compose path: `supabase/docker-compose.yml`
- **Re-pull image: APAGADO**
- Environment variables → **Advanced mode** → pegar el contenido de `Desktop\_ACCESOS\supabase-selfhosted-vps.txt` más estas:

```
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432
SITE_URL=https://panel.zecamostudios.com
API_EXTERNAL_URL=https://sb.zecamostudios.com
SUPABASE_PUBLIC_URL=https://sb.zecamostudios.com
ADDITIONAL_REDIRECT_URLS=http://localhost:3000
JWT_EXPIRY=3600
DISABLE_SIGNUP=true
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
ENABLE_ANONYMOUS_USERS=false
ENABLE_PHONE_SIGNUP=false
ENABLE_PHONE_AUTOCONFIRM=false
STUDIO_DEFAULT_ORGANIZATION=Zecamo Studios
STUDIO_DEFAULT_PROJECT=zecamo-dashboard
DASHBOARD_USERNAME=joaco
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443
PGRST_DB_SCHEMAS=public,storage,graphql_public
STUDIO_PORT=3000
IMGPROXY_ENABLE_WEBP_DETECTION=true
SMTP_ADMIN_EMAIL=joaco@zecamostudios.com
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<LA API KEY DE RESEND, de _ACCESOS>
SMTP_SENDER_NAME=Zecamo Studios
MAILER_URLPATHS_CONFIRMATION=/auth/callback
MAILER_URLPATHS_INVITE=/auth/callback
MAILER_URLPATHS_RECOVERY=/auth/callback
MAILER_URLPATHS_EMAIL_CHANGE=/auth/callback
```

**`DISABLE_SIGNUP=true`** es a propósito: el dashboard es interno, nadie se registra solo. **SMTP es obligatorio** porque el login tiene magic link (`signInWithOtp`) y sin SMTP ese botón no manda nada.

- [ ] **Step 3: Ver que los contenedores levantaron**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker ps --filter name=supabase --format \"{{.Names}}|{{.Status}}\""'
```

Esperado: `supabase-db`, `supabase-auth`, `supabase-rest`, `supabase-storage`, `supabase-kong`, `supabase-studio`, `supabase-meta`, `supabase-imgproxy` todos en `Up`.

**Si alguno está en `Restarting`, PARAR** y mirar sus logs:
```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker logs --tail 50 supabase-auth"'
```

- [ ] **Step 4: Confirmar que no se rompió nada de lo que ya andaba**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker ps --format \"{{.Names}}|{{.Status}}\" | sort; echo ---RAM---; free -h | head -2"'
```

Esperado: `n8n`, `postgres`, `redis`, `uptime-kuma`, `portainer`, `npm-npm-1`, los dos de `agente-finca-cajal` — todos `Up`. Y **memoria disponible > 1.5 GB**.

**Si la RAM disponible bajó de 1 GB, PARAR**: el próximo pico mata a n8n.

---

### Task 2.6: Verificar que la API responde de verdad

- [ ] **Step 1: PostgREST responde por HTTPS con la anon key**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && curl -s -o /dev/null -w "%{http_code}\n" "https://sb.zecamostudios.com/rest/v1/" -H "apikey: $ANON_KEY"'
```

Esperado: `200`. Si da `502`, es el problema de redes de la Task 2.1. Si da `401`, la key no coincide con el `JWT_SECRET` del stack.

- [ ] **Step 2: GoTrue (auth) responde**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'curl -s "https://sb.zecamostudios.com/auth/v1/health" | head -c 200; echo'
```

Esperado: un JSON con `"name":"GoTrue"`.

- [ ] **Step 3: Confirmar que Postgres es la versión correcta**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-db psql -U postgres -t -c \"select version();\"" | head -1'
```

Esperado: **`PostgreSQL 17.6.1.136`** (verificado el 14/09: PG17 ya es el default del compose oficial, y Cloud corre `17.6.1.121` → misma major, el dump entra sin conversión).

**Si dice 15.x, PARAR**: quedó tomando una imagen vieja, probablemente por un volumen `db-config` de una instalación previa.

---

# FASE 3 — Migrar los datos

### Task 3.1: Restaurar el schema `public`

- [ ] **Step 1: Copiar los dumps al VPS**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'scp ~/zecamo/backups-supabase/20260914/*.sql zecamo-vps-agente:/tmp/ && ssh zecamo-vps-agente "ls -la /tmp/*.sql"'
```

- [ ] **Step 2: Meter los dumps dentro del contenedor de la base**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "for f in /tmp/schema-public.sql /tmp/data-public.sql /tmp/auth-users.sql; do docker cp \$f supabase-db:\$f; done; docker exec supabase-db ls -la /tmp/"'
```

- [ ] **Step 3: Restaurar el schema (estructura + policies)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-db psql -U postgres -v ON_ERROR_STOP=0 -f /tmp/schema-public.sql 2>&1 | grep -i error | head -20; echo \"---fin errores---\""'
```

Errores tolerables: `already exists` en extensiones o en el schema `public`. **Cualquier `ERROR` sobre una tabla o una policy hay que mirarlo.**

- [ ] **Step 4: Verificar que están las tablas y las policies**

`$$` en lugar de comillas simples, para que el string sobreviva las tres capas de shell (Windows → WSL → ssh → docker):

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-db psql -U postgres -t -A -F, -c \"select (select count(*) from pg_tables where schemaname = \$\$public\$\$), (select count(*) from pg_policies where schemaname = \$\$public\$\$);\""'
```

Esperado: dos números — tablas (debería rondar 35-40) y policies (**más de 20**).

**Si las policies dan 0, PARAR Y NO SEGUIR**: sin RLS, cualquiera con la anon key lee toda la base.

---

### Task 3.2: Restaurar los datos

- [ ] **Step 1: Cargar los datos de `public`**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-db psql -U postgres -v ON_ERROR_STOP=0 -f /tmp/data-public.sql 2>&1 | grep -i error | head -20; echo \"---fin errores---\""'
```

- [ ] **Step 2: Comparar los conteos contra la base de origen**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-db psql -U postgres -c \"select relname, n_live_tup from pg_stat_user_tables where schemaname = \$\$public\$\$ and n_live_tup > 0 order by n_live_tup desc;\""'
```

**Esperado — tiene que coincidir con esto (medido en Cloud el 14/09/2026):**

| tabla | filas | | tabla | filas |
|---|---|---|---|---|
| leads | 190 | | pipeline_stages | 9 |
| manual_blocks | 60 | | content_posts | 8 |
| brand_memory | 36 | | manual_sections | 8 |
| playbook_steps | 24 | | content_planner | 8 |
| transacciones | 13 | | monitor_estado | 8 |
| workflow_events | 11 | | principles | 7 |
| scripts | 6 | | tareas | 5 |
| pricing_floors | 5 | | clientes | 4 |
| playbooks | 3 | | team_members | 3 |
| service_lines_config | 3 | | commission_rules | 3 |
| roadmap_months | 3 | | platform_accounts | 3 |
| app_config | 2 | | profiles | 1 |
| keepalive | 1 | | prospectos | 1 |

**Si alguna tabla tiene menos filas que acá, PARAR.** (`prospectos` puede tener 1 o 2 según si Joaco cargó alguno; el resto tiene que dar igual.)

- [ ] **Step 3: Recrear el usuario con el MISMO UUID que tenía**

`profiles.id` apunta a `auth.users.id`, así que el UUID tiene que ser el mismo (el que se anotó en la Task 1.3 Step 6).

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-db psql -U postgres -v ON_ERROR_STOP=0 -f /tmp/auth-users.sql 2>&1 | grep -i error | head; echo ---; docker exec supabase-db psql -U postgres -c \"select id, email, email_confirmed_at is not null as confirmado from auth.users;\""'
```

Esperado: 1 fila, con el mismo `id` y `email` de la base de Cloud.

**Si el INSERT falla** (los schemas de `auth` cambian entre versiones de GoTrue), la alternativa es crear el usuario por API y después corregirle el UUID:

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && curl -s -X POST "https://sb.zecamostudios.com/auth/v1/admin/users" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY" -H "Content-Type: application/json" -d "{\"email\":\"<EMAIL DE JOACO>\",\"password\":\"<PASSWORD NUEVA>\",\"email_confirm\":true,\"id\":\"<UUID ANOTADO EN 1.3>\"}" | head -c 300; echo'
```

- [ ] **Step 4: Verificar que el perfil quedó enganchado al usuario**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-db psql -U postgres -c \"select p.id, p.nombre, u.email from public.profiles p join auth.users u on u.id = p.id;\""'
```

Esperado: **1 fila**. Si vuelve vacío, el UUID no coincide y el login va a entrar pero sin perfil (ni permisos de admin).

---

### Task 3.3: Recrear el bucket de Storage

El bucket de carruseles está **vacío** (0 archivos), así que no hay nada que copiar — sólo hay que crearlo.

- [ ] **Step 1: Ver qué bucket espera el código**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'grep -n "BUCKET" ~/zecamo/zecamo-dashboard/lib/services/carousel/carousel-service.ts | head -5'
```

- [ ] **Step 2: Crearlo con ese nombre exacto**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && curl -s -X POST "https://sb.zecamostudios.com/storage/v1/bucket" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY" -H "Content-Type: application/json" -d "{\"name\":\"<NOMBRE DEL STEP 1>\",\"public\":true}"; echo'
```

Esperado: un JSON con el nombre del bucket.

- [ ] **Step 3: Verificar**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && curl -s "https://sb.zecamostudios.com/storage/v1/bucket" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY"; echo'
```

Esperado: un array con el bucket adentro.

---

### Task 3.4: Backups automáticos de la base nueva

**Sin esto la migración no está terminada.** La base vieja tenía backups de Supabase; la nueva no tiene nada hasta que se configure.

El contenedor `supabase-backup` **ya viene en el override** (Task 2.2, Step 4), así que acá sólo se verifica que funcione de verdad. Un backup que nunca se probó no es un backup.

- [ ] **Step 1: Confirmar que el contenedor está corriendo**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker ps --filter name=supabase-backup --format \"{{.Names}}|{{.Status}}\""'
```

Esperado: `supabase-backup|Up ...`. Si no aparece, revisar el override y hacer Pull and redeploy.

- [ ] **Step 2: Probar el backup de verdad (no esperar a mañana)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-backup /backup.sh 2>&1 | tail -3"'
```

Esperado: `SQL backup created successfully`.

- [ ] **Step 6: Confirmar que el archivo existe y pesa**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker run --rm -v supabase_supabase_backups:/b:ro alpine find /b -type f -name \"*.sql.gz\" -exec ls -lh {} \;"'
```

Esperado: al menos un archivo. **Si está vacío, el backup no anda: PARAR.**

⚠️ **Pendiente a coordinar con Joaco:** sumar este volumen a la copia a R2 (el script `backup-nightly.sh` de `SALUD-VPS` hoy sólo cubre `zecamo-core_postgres_backups`). Un backup que vive en el mismo disco que la base **no es un backup**.

---

# FASE 4 — Apuntar el dashboard al VPS

### Task 4.1: Probar en local contra el Supabase nuevo

**Files:**
- Modify: `~/zecamo/zecamo-dashboard/.env.local`

- [ ] **Step 1: Guardar el `.env.local` actual como respaldo**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cp ~/zecamo/zecamo-dashboard/.env.local ~/.zecamo-secrets/env.local.CLOUD.bak && echo "respaldado"'
```

- [ ] **Step 2: Apuntar el `.env.local` al VPS**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && cd ~/zecamo/zecamo-dashboard && sed -i "s|^NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://sb.zecamostudios.com|; s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY|; s|^SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|" .env.local && grep "SUPABASE_URL" .env.local'
```

Esperado: `NEXT_PUBLIC_SUPABASE_URL=https://sb.zecamostudios.com`

- [ ] **Step 3: Levantar el dev server**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/zecamo-dashboard && npm run dev'
```

(Correr en background y seguir; el server queda escuchando en `http://localhost:3000`.)

- [ ] **Step 4: Probar el login de verdad**

⚠️ **Acción manual de Joaco (3 min):** abrir `http://localhost:3000`, entrar con email + password, y recorrer: **CRM · Clientes · Proyectos · Tareas · Finanzas · Prospección**.

Checklist de lo que tiene que pasar:
- El login entra (no "Email o contraseña incorrectos")
- El CRM muestra el prospecto que existe (no vacío)
- Prospección muestra los **190 leads**
- Finanzas muestra las **13 transacciones**
- Clientes muestra **4**

**Si una vista queda vacía**, casi siempre es RLS: la policy existe pero `auth.uid()` vuelve null. Diagnóstico:
```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker logs --tail 30 supabase-rest"'
```

- [ ] **Step 5: Probar una escritura (que es lo que hoy está roto)**

⚠️ **Acción manual de Joaco:** crear un prospecto nuevo en el CRM.

⚠️ **OJO:** hay un **bug conocido pendiente** — si dejás "Fecha de contacto" vacía, falla con `invalid input syntax for type date: ""`. **Eso no es culpa de la migración**, ya pasaba en Cloud. Para esta prueba, completá la fecha. El fix va en la Task 4.2, acá abajo.

---

### Task 4.2: Arreglar el bug de fechas vacías (aprovechando el viaje)

**Files:**
- Create: `~/zecamo/zecamo-dashboard/lib/forms/empty-to-null.ts`
- Modify: `~/zecamo/zecamo-dashboard/components/crm/crm-detalle.tsx:112-113`
- Modify: `~/zecamo/zecamo-dashboard/components/dashboard/tareas-kanban.tsx:89,100`
- Modify: `~/zecamo/zecamo-dashboard/app/(dashboard)/clientes/[id]/page.tsx:107`
- Modify: `~/zecamo/zecamo-dashboard/app/(dashboard)/proyectos/[id]/page.tsx:97-98,110-111`

- [ ] **Step 1: Crear el helper**

```typescript
// lib/forms/empty-to-null.ts
/**
 * Los <input type="date"> sin completar devuelven "" (string vacio), no undefined.
 * Postgres rechaza "" en una columna `date` con 22007 invalid input syntax,
 * y el `?? null` de toda la vida no lo agarra porque "" no es nullish.
 */
export function emptyToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
```

- [ ] **Step 2: Usarlo en el CRM**

En `components/crm/crm-detalle.tsx`, agregar el import:

```typescript
import { emptyToNull } from "@/lib/forms/empty-to-null";
```

Y reemplazar las líneas 112-113:

```typescript
      fecha_contacto: emptyToNull(data.fecha_contacto),
      volver_a_llamar: emptyToNull(data.volver_a_llamar),
```

- [ ] **Step 3: Probar que ahora guarda sin fecha**

⚠️ **Acción manual de Joaco:** crear un prospecto poniendo **sólo el nombre del negocio**.

Esperado: toast verde "Guardado" y el prospecto aparece en el CRM.

- [ ] **Step 4: Aplicar el mismo helper en los otros tres formularios**

Mismo patrón (import + envolver el valor) en:
- `components/dashboard/tareas-kanban.tsx` líneas 89 y 100 → `fecha_limite`
- `app/(dashboard)/clientes/[id]/page.tsx` línea 107 → `fecha_inicio`
- `app/(dashboard)/proyectos/[id]/page.tsx` líneas 97, 98, 110, 111 → `fecha_inicio`, `fecha_entrega`

- [ ] **Step 5: Confirmar que no quedó ningún `?? null` sobre una columna date**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/zecamo-dashboard && grep -rn "fecha[a-z_]*: data\.[a-z_]* ?? null\|fecha[a-z_]*: data\.[a-z_]*,"  components app | grep -v emptyToNull'
```

Esperado: **sin resultados**.

- [ ] **Step 6: Commit**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/zecamo-dashboard && git add lib/forms/empty-to-null.ts components app && git commit -m "fix: fecha vacia mandaba \"\" a columnas date y abortaba el guardado"'
```

---

### Task 4.3: Buildear antes de tocar producción

- [ ] **Step 1: Build de Next**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/zecamo-dashboard && OPENAI_API_KEY=sk-dummy npm run build 2>&1 | tail -20'
```

Esperado: `✓ Compiled successfully`.

**`OPENAI_API_KEY=sk-dummy` no es opcional**: sin esa variable el build muere en "collecting page data" porque hay rutas que instancian OpenAI al importarse.

- [ ] **Step 2: Build de OpenNext para Cloudflare**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/zecamo-dashboard && OPENAI_API_KEY=sk-dummy npm run cf:build 2>&1 | tail -15'
```

Esperado: termina sin errores y genera `.open-next/worker.js` (es el `main` que declara `wrangler.jsonc`).

---

### Task 4.4: Pasar producción al VPS — Cloudflare Workers, NO Vercel

⚠️ **Esto cambió respecto al plan original (descubierto el 15/09).** El dashboard en producción **no es el de Vercel**: es el Worker `zecamo-dashboard` de Cloudflare, servido en `panel.zecamostudios.com`, buildeado con **OpenNext** y deployado con **wrangler** (último deploy real: 12/09/2026). Decisión de Joaco: **Vercel se abandona, sólo Cloudflare.**

⚠️ **Y lo más importante:** el Worker **no tiene** `NEXT_PUBLIC_SUPABASE_URL` como variable — las `NEXT_PUBLIC_*` de Next se **hornean dentro del bundle en tiempo de build**. O sea: **cambiar la URL de Supabase obliga a rebuildear y redeployar el Worker.** No alcanza con tocar variables en el panel de Cloudflare.

Los secrets que el Worker sí tiene hoy: `CRON_SECRET`, `N8N_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`.

- [ ] **Step 1: Guardar los valores viejos (son el rollback)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cp ~/zecamo/zecamo-dashboard/.env.local ~/.zecamo-secrets/env.local.CLOUD.bak && grep -c "" ~/.zecamo-secrets/env.local.CLOUD.bak'
```

- [ ] **Step 2: Apuntar el `.env.local` al VPS (de acá sale el build)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && cd ~/zecamo/zecamo-dashboard && sed -i "s|^NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://sb.zecamostudios.com|; s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY|; s|^SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|" .env.local && grep "^NEXT_PUBLIC_SUPABASE_URL" .env.local'
```

Esperado: `NEXT_PUBLIC_SUPABASE_URL=https://sb.zecamostudios.com`

- [ ] **Step 3: Actualizar el secret del Worker**

El `SUPABASE_SERVICE_ROLE_KEY` del Worker es un **secret de Cloudflare**, no vive en el bundle. Se actualiza aparte:

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && cd ~/zecamo/zecamo-dashboard && echo "$SERVICE_ROLE_KEY" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY'
```

Esperado: `✨ Success! Uploaded secret SUPABASE_SERVICE_ROLE_KEY`.

**Si pide login**, lo hace Joaco con `npx wrangler login` (abre el navegador), o se exporta `CLOUDFLARE_API_TOKEN` desde `_ACCESOS/cloudflare.md`.

- [ ] **Step 4: Rebuildear y deployar el Worker**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/zecamo-dashboard && OPENAI_API_KEY=sk-dummy npm run cf:deploy 2>&1 | tail -15'
```

Esperado: `Deployed zecamo-dashboard` con una URL de versión.

- [ ] **Step 5: Confirmar que el bundle quedó apuntando al VPS (no a Supabase Cloud)**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'grep -rc "wlvogtjpldglpiufnryy" ~/zecamo/zecamo-dashboard/.open-next/ 2>/dev/null | grep -v ":0" | head; echo "--- (vacio = ya no queda rastro de Supabase Cloud) ---"; grep -rl "sb.zecamostudios.com" ~/zecamo/zecamo-dashboard/.open-next/ 2>/dev/null | head -3'
```

Esperado: **ninguna** referencia a `wlvogtjpldglpiufnryy` y **sí** a `sb.zecamostudios.com`.

**Este chequeo es el que prueba que el rebuild sirvió.** Si sigue apareciendo el ref viejo, el build usó un `.env.local` desactualizado o quedó caché en `.open-next/`.

- [ ] **Step 6: Probar producción a mano**

⚠️ **Acción manual de Joaco:** entrar a `https://panel.zecamostudios.com`, loguearse, y repetir el checklist de la Task 4.1 Step 4. Además: crear un prospecto **sin fecha** y confirmar que guarda.

- [ ] **Step 7: Decidir qué hacer con Vercel**

El proyecto de Vercel va a quedar apuntando a Supabase Cloud y sirviendo una versión vieja en `dashboardzecamostudios.vercel.app`. Como Joaco decidió quedarse sólo con Cloudflare, corresponde **pausar o borrar ese proyecto** para que no quede un dashboard fantasma escribiendo en una base que ya no es la buena.

⚠️ Hacerlo **después** de que Cloudflare esté verificado, no antes.

---

# FASE 5 — n8n

### Task 5.1: Recablear los workflows que escriben en la base

Dos workflows usan la credencial `Supabase Zecamo Dashboard (SDR)` (id `TGnYQvwf2ZIdmYLl`, service_role): **WF-Outbound-SDR** (`8aU2Ios4Rjsg8Oa9`) y **WF-SDR-Agent** (`nn1AMnSfcC5uhsaT`). Si no se tocan, siguen escribiendo en **Supabase Cloud** y los leads nuevos no aparecen más en el dashboard.

- [ ] **Step 1: Confirmar qué nodos usan esa credencial**

Con el MCP de n8n, no por ssh:

```
n8n_get_workflow({ id: "8aU2Ios4Rjsg8Oa9", mode: "structure" })
n8n_get_workflow({ id: "nn1AMnSfcC5uhsaT", mode: "structure" })
```

Anotar los nodos Supabase de cada uno (en WF-Outbound-SDR son `Leads Existentes` e `Insert Lead`; en WF-SDR-Agent es `Update Lead`).

- [ ] **Step 2: Actualizar la credencial en n8n**

⚠️ **Acción manual de Joaco (2 min):** n8n → Credentials → `Supabase Zecamo Dashboard (SDR)` → Host: `https://sb.zecamostudios.com` → Service Role Secret: el `SERVICE_ROLE_KEY` nuevo → Save.

**Se edita la credencial existente, no se crea una nueva** — así los dos workflows quedan apuntados sin tocar ningún nodo.

- [ ] **Step 3: Probar con una ejecución real**

⚠️ **Acción manual de Joaco:** n8n → WF-Outbound-SDR → **Execute workflow** (trigger manual).

Esperado: la ejecución termina con status **`success`**.

⚠️ **Regla del server: `active: true` no prueba nada y los logs tampoco. La única prueba es una ejecución con status `success`.**

- [ ] **Step 4: Confirmar que los leads nuevos llegaron a la base NUEVA**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "docker exec supabase-db psql -U postgres -c \"select count(*) from public.leads;\""'
```

Esperado: **más de 190**.

---

# FASE 6 — Verificación y cierre del dashboard

### Task 6.1: Checklist de seguridad (la parte que no se puede saltear)

- [ ] **Step 1: Confirmar que la anon key NO puede leer datos sin login**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/supabase-selfhosted.env && echo "prospectos:"; curl -s "https://sb.zecamostudios.com/rest/v1/prospectos?select=id" -H "apikey: $ANON_KEY"; echo; echo "leads:"; curl -s "https://sb.zecamostudios.com/rest/v1/leads?select=id" -H "apikey: $ANON_KEY"; echo; echo "clientes:"; curl -s "https://sb.zecamostudios.com/rest/v1/clientes?select=id" -H "apikey: $ANON_KEY"; echo'
```

Esperado: `[]` en las tres (RLS bloqueando), **no** una lista de registros.

**Si devuelve datos, la base está abierta a internet: PARAR TODO y avisar.**

- [ ] **Step 2: Confirmar que Studio NO está expuesto a internet**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'curl -s -o /dev/null -w "%{http_code}\n" --max-time 10 http://2.25.130.87:3000/ ; curl -s -o /dev/null -w "%{http_code}\n" --max-time 10 http://2.25.130.87:8000/'
```

Esperado: timeout o connection refused en ambos (el firewall sólo deja 22/80/443).

- [ ] **Step 3: Confirmar que el firewall sigue cerrado**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "ss -tlnp 2>/dev/null | grep -v 127.0.0.1 | head -20"'
```

Esperado: sólo 22, 80 y 443 escuchando en `0.0.0.0`/`*`.

---

### Task 6.2: Dejar el rollback escrito

**Files:**
- Create: `~/zecamo/vps-stack/supabase/ROLLBACK.md`

- [ ] **Step 1: Escribir el procedimiento de vuelta atrás**

```markdown
# Rollback — volver el dashboard a Supabase Cloud

Mientras el proyecto `wlvogtjpldglpiufnryy` siga existiendo (no borrarlo hasta 30 días
después de la migración), volver atrás son 3 minutos:

1. Vercel → proyecto `zecamostudios` → Environment Variables → restaurar los 3 valores
   viejos (guardados en `_ACCESOS/supabase.md` como "valores Cloud pre-migracion").
2. Redeploy en Vercel (Deployments → el último → Redeploy).
3. n8n → credencial `Supabase Zecamo Dashboard (SDR)` → host y service_role viejos.

**Lo que se pierde al volver:** todo lo que se haya cargado en el VPS después de la
migración. Por eso el corte tiene que ser limpio y corto.

**NO borrar el proyecto de Supabase Cloud hasta que pasen 30 días sin incidentes.**
```

- [ ] **Step 2: Commit y push**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/vps-stack && git add supabase/ROLLBACK.md && git commit -m "supabase: procedimiento de rollback a Cloud" && git push origin main'
```

---

### Task 6.3: Monitoreo

- [ ] **Step 1: Agregar el health check a Uptime Kuma**

⚠️ **Acción manual de Joaco (2 min):** Uptime Kuma → Add New Monitor → HTTP(s) → URL `https://sb.zecamostudios.com/auth/v1/health` → intervalo 60s.

**Esto importa más que antes:** Supabase Cloud se monitoreaba solo. Ahora si la base se cae, se cae el dashboard y nadie avisa.

- [ ] **Step 2: Actualizar el estado del VPS**

Agregar a `~/zecamo/vps-stack/ESTADO.md` (o `Desktop\SALUD-VPS\ESTADO.md`) una sección con: stack `supabase` nuevo, qué contiene, dónde están las keys, y el link al ROLLBACK.

- [ ] **Step 3: Correr el chequeo general del server**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'cd ~/zecamo/vps-stack && ./chequeo.sh 2>&1 | tail -30'
```

Esperado: modo **COMPLETO** y **0 alertas**. Si sale en modo PARCIAL o CIEGO, el script lo dice arriba de todo.

---

# FASE 7 — Las Flores (recién después del gate)

### 🚧 GATE — no empezar la Fase 7 hasta que se cumplan las tres

- [ ] El dashboard lleva **14 días corridos** andando contra el VPS sin que Joaco tenga que tocar nada
- [ ] Hay **al menos 7 backups diarios** de la base nueva, y **uno se restauró de prueba** (no alcanza con que el archivo exista)
- [ ] El uso de RAM del VPS se mantiene estable (no crece día a día)

**Por qué el gate:** Las Flores es de un **cliente en producción**, con auditoría de seguridad hecha (RLS, auth, storage, CSP en enforce, migración 0012 cerrando 3 agujeros de abuso del form público). Si algo de la arquitectura self-hosted no cierra, tiene que descubrirse con el producto propio, no con el del cliente.

### Task 7.1: Repetir el proceso para Las Flores

Mismo camino, con estas diferencias:

- [ ] **Step 1: Confirmar la superficie real de Las Flores antes de planear**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'source ~/.zecamo-secrets/lasflores.env 2>/dev/null; psql "$LF_URL" -c "select pg_size_pretty(pg_database_size(current_database())), (select count(*) from auth.users), (select count(*) from storage.objects);"'
```

La `db_pass` de Las Flores **ya está** en `_ACCESOS/supabase.md` (buscar "lasflores db_pass"), así que no hace falta resetearla.

⚠️ **A diferencia del dashboard, Las Flores SÍ usa Storage con archivos adentro** (fotos de cabañas). El Storage hay que migrarlo de verdad, no sólo recrear el bucket. Eso es una tarea propia que se dimensiona con el resultado de este Step.

- [ ] **Step 2: Decidir si va en el mismo Supabase o en uno separado**

**Recomendación: proyecto separado** (otro stack, otra base). Mezclar los datos de un cliente con los internos de Zecamo en la misma base es un problema de aislamiento que después no se deshace.

Costo: otro Postgres + GoTrue + PostgREST + Kong ≈ 600-800 MB de RAM más. **Verificar que entra antes de arrancar:**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'ssh zecamo-vps-agente "free -h | head -2"'
```

- [ ] **Step 3: Rehacer las Fases 1 a 6 para Las Flores**

Mismo orden, mismos gates, más la migración de los archivos de Storage.

⚠️ **Esto se planea aparte cuando se llegue.** Escribir los pasos ahora, sin saber cuántos archivos tiene el Storage ni cuánta RAM quedó libre, sería inventar.

---

# FASE 8 — Bajar el plan (acá se deja de pagar)

### Task 8.1: Dar de baja Supabase Pro

- [ ] **Step 1: Confirmar que ningún proyecto recibe tráfico**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'TOK=$(grep -oE "sbp_[A-Za-z0-9]{40}" /mnt/c/Users/Joaquin/Desktop/_ACCESOS/supabase.md | tail -1); curl -s -H "Authorization: Bearer $TOK" https://api.supabase.com/v1/projects | head -c 800; echo'
```

- [ ] **Step 2: Esperar los 30 días de gracia**

**No borrar los proyectos de Cloud todavía.** Son el rollback. Pasado el mes sin incidentes, recién ahí.

- [ ] **Step 3: Bajar la organización a Free**

⚠️ **Acción manual de Joaco:** Supabase → Organization → Billing → Change subscription → Free.

⚠️ **Antes de tocar ese botón, tener presente qué implica Free:** los proyectos que sigan activos se **pausan a los 7 días de inactividad**, hay 500 MB de límite y no hay backups automáticos. Por eso este paso va **después** de que los dos productos estén afuera, no antes.

- [ ] **Step 4: Verificar que el plan cambió**

```bash
wsl -d Ubuntu-24.04 -- bash -lc 'TOK=$(grep -oE "sbp_[A-Za-z0-9]{40}" /mnt/c/Users/Joaquin/Desktop/_ACCESOS/supabase.md | tail -1); curl -s -H "Authorization: Bearer $TOK" https://api.supabase.com/v1/organizations/xuufxrljnmpnejljuzcc | head -c 300; echo'
```

Esperado: `"plan":"free"`.

- [ ] **Step 5: Anotar el resultado**

Actualizar `ESTADO.md` con la fecha de la baja y el ahorro mensual conseguido.

---

## Lo que este plan NO hace (a propósito)

- **No reescribe el data layer.** Los 69 archivos con `supabase-js` quedan igual. Ese refactor (Postgres pelado + auth propia) es otro proyecto y se evaluó con peor relación riesgo/beneficio.
- **No toca el `postgres:16` de n8n.** Supabase trae su propio Postgres 17 en un stack aparte.
- **No borra nada de Supabase Cloud.** Los proyectos quedan vivos 30 días como rollback.
- **No crea la vista `prospectos_ext`.** No existe en la base real, el código ya no la usa, y el dump sale de la base real y no de las migraciones. Si algún día se quiere, es una tarea aparte.

## Lo que hay que tener presente antes de arrancar

**Lo que se gana:** USD 25/mes (USD 300/año), y los datos dejan de estar en una nube de terceros.

**Lo que se paga a cambio:** Supabase Cloud hoy se encarga solo de los backups, los upgrades de seguridad de Postgres/GoTrue, el uptime y el monitoreo. Todo eso pasa a ser tarea de Joaco. Si el VPS se cae un domingo, **el dashboard y (en la Fase 7) el producto de un cliente se caen con él** — y el VPS es una sola máquina, sin réplica.

Las tres cosas que hacen que eso sea manejable, y que por eso están en el plan y no son opcionales: **backups probados** (Task 3.4), **rollback escrito** (Task 6.2) y **monitoreo** (Task 6.3).
