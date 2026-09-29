# La Biblio

Mi colección de comics: qué tengo, qué me falta y qué quiero comprar.

- **Colección pública** con portadas, búsqueda instantánea (sin tildes, por serie, número o autor) y filtros por estado, lectura, formato y editorial.
- **Vista por serie**: un chip por número, para ver de un vistazo qué números tengo de cada serie.
- **Lista de deseos**: cada comic es "Lo tengo" o "Lo quiero".
- **Aviso de duplicados** al cargar uno nuevo: "Ya tenés Batman #2".
- **Portadas** sacadas con el celular: se achican en el navegador a WebP de ~100 KB antes de subirse.
- Solo el admin (yo) puede agregar, editar o borrar. Lo controla la base de datos con Row Level Security, no el frontend.

## Stack

| Parte | Tecnología |
|---|---|
| Frontend | React 19 + Vite + Material UI, React Router |
| Base de datos | Supabase Postgres con políticas RLS |
| Imágenes | Supabase Storage (bucket público `portadas`) |
| Login | Supabase Auth (email y contraseña) |
| Deploy | Vercel |

No hay backend propio: el frontend habla directo con Supabase y las políticas de la base deciden quién puede escribir. Todo entra en los planes gratuitos.

## Puesta en marcha

### 1. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com) (plan Free).
2. En **SQL Editor**, pegá y corré [`supabase/schema.sql`](supabase/schema.sql). Crea la tabla, el bucket de portadas y los permisos.
3. En **Authentication → Users → Add user**, creá tu usuario con email y contraseña.
4. Hacete admin (en el SQL Editor):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'tu-email@ejemplo.com';
   ```
5. Recomendado: en **Authentication → Sign In / Providers**, desactivá "Allow new users to sign up". Aunque alguien se registrara no podría escribir, pero así ni se puede crear cuentas.

### 2. Local

```bash
cp .env.example .env   # completá URL y clave pública (Project Settings → API)
npm install
npm run dev            # http://localhost:5174
```

### 3. Vercel

1. Subí el repo a GitHub e importalo en [vercel.com](https://vercel.com). Detecta Vite solo.
2. En **Settings → Environment Variables** cargá `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Deploy. `vercel.json` ya redirige todas las rutas a `index.html`.

> El plan gratis de Supabase pausa el proyecto después de 7 días sin uso. Se reactiva desde el dashboard con un clic.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Tests de la lógica de colección (`node --test`) |
| `npm run lint` | ESLint |
| `node scripts/subir-portadas.mjs <carpeta> "<serie>"` | Sube portadas en lote (el número sale del nombre del archivo: `vol-3.jpg`). Pide tu login de admin |

## Estructura

```
supabase/schema.sql      tablas, políticas RLS y bucket
src/lib/coleccion.js     lógica pura: filtros, orden, series, duplicados (con tests)
src/lib/comics.js        acceso a Supabase: CRUD y subida de portadas
src/lib/imagen.js        achica la portada en el navegador
src/context/             sesión/admin y colección en memoria
src/components/          tarjeta, portada, filtros, formulario, vista por serie
src/pages/               colección, detalle, alta, edición, login
```
