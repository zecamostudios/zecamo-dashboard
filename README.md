# Zecamo Dashboard

Dashboard interno de operaciones para Zecamo Studios. Centraliza CRM, proyectos, finanzas, outbound, tareas y una calculadora de pricing para soluciones de IA.

## Stack

- **Next.js 14** (App Router, Server Components)
- **Supabase** (Postgres, Auth, Row Level Security)
- **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** (gráficos)
- **React Hook Form** + **Zod** (formularios)
- **pnpm**

## Módulos

| Ruta | Descripción |
|---|---|
| `/` | Home con KPIs: MRR, pipeline, tareas pendientes |
| `/crm` | Pipeline de prospectos (kanban por estado) |
| `/crm/[id]` | Detalle de prospecto + timeline de interacciones |
| `/clientes` | Clientes activos con MRR |
| `/clientes/[id]` | Detalle / edición de cliente |
| `/proyectos` | Proyectos por estado (kanban) |
| `/proyectos/[id]` | Detalle / edición de proyecto |
| `/finanzas` | Transacciones con gráfico ingresos vs egresos |
| `/outbound` | Campañas y envíos de outbound |
| `/tareas` | Kanban de tareas del equipo |
| `/pricing` | Lista de calculaciones de pricing |
| `/pricing/[id]` | Calculadora de valor / precio para soluciones de IA |

## Configuración inicial

### 1. Crear proyecto Supabase

En [supabase.com](https://supabase.com), creá un nuevo proyecto. Anotá:
- `Project URL` (ej. `https://xyzxyz.supabase.co`)
- `anon public` key
- `service_role` key (solo para migraciones)

### 2. Clonar e instalar dependencias

```bash
git clone <repo>
cd zecamo-dashboard
pnpm install
```

### 3. Variables de entorno

Creá `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### 4. Ejecutar migraciones

Desde el SQL Editor de Supabase, ejecutá en orden:

```
supabase/migrations/0001_init.sql   — tablas y triggers
supabase/migrations/0002_rls.sql    — Row Level Security
supabase/migrations/0003_seed.sql   — datos de ejemplo (opcional)
```

O con la Supabase CLI:

```bash
supabase db push
```

### 5. Primer usuario

Registrá el primer usuario desde la UI de autenticación de Supabase o desde `/login`. El trigger `on_auth_user_created` crea automáticamente el perfil. **El primer usuario queda como `owner`**, los siguientes como `member`.

Para promover un usuario a `admin`:

```sql
update public.profiles set rol = 'admin' where email = 'tu@email.com';
```

### 6. Correr en local

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Desarrollo

```bash
pnpm dev          # servidor de desarrollo
pnpm build        # build de producción
pnpm exec tsc --noEmit  # chequeo de tipos
```

## Despliegue

### Vercel (recomendado)

1. Conectá el repo en [vercel.com](https://vercel.com)
2. Agregá las variables de entorno en Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Vercel detecta Next.js automáticamente — no hace falta configuración extra

### Docker / VPS

```bash
pnpm build
pnpm start        # corre en puerto 3000
```

## Seguridad

- **Row Level Security** activo en las 10 tablas. Toda consulta pasa por las políticas de Supabase.
- **Middleware** bloquea acceso no autenticado a todas las rutas excepto `/login`.
- **Headers HTTP**: `X-Frame-Options`, `CSP`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Roles**: `owner` y `admin` pueden eliminar y editar cualquier registro. `member` solo puede editar lo que le está asignado.
- Las claves de entorno se leen solo en el servidor; la `anon key` de Supabase es pública por diseño y está protegida por RLS.

## Estructura del proyecto

```
app/
  (auth)/login/          — página de login
  (dashboard)/           — layout con sidebar
    page.tsx             — home / KPIs
    crm/                 — CRM
    clientes/            — clientes
    proyectos/           — proyectos
    finanzas/            — finanzas
    outbound/            — outbound
    tareas/              — tareas
    pricing/             — calculadora de pricing
components/
  dashboard/             — componentes del home y módulos compartidos
  crm/                   — CRM detalle
  pricing/               — calculadora
  ui/                    — shadcn/ui components
lib/
  supabase/              — clients (server, client, middleware)
  pricing/calculator.ts  — lógica de scoring y precios
  utils.ts               — formatUSD, formatDate, cn
  constants.ts           — enums de estados, labels, colores
supabase/
  migrations/            — SQL de init, RLS y seed
types/
  database.ts            — tipos generados de la DB
```
