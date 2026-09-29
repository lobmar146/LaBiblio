-- La Biblio: esquema completo.
-- Correr una sola vez en Supabase → SQL Editor. Es idempotente: se puede volver a correr.
--
-- Modelo de permisos:
--   * Cualquiera (incluso sin sesión) puede VER la colección y las portadas.
--   * Solo los usuarios listados en public.admins pueden agregar, editar o borrar.
--   Aunque alguien lograra registrarse, sin estar en admins no puede escribir nada.

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- RLS sin políticas: nadie la lee ni la escribe desde la API; solo via is_admin().
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Comics
-- ---------------------------------------------------------------------------
create table if not exists public.comics (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null check (char_length(titulo) between 1 and 200),
  serie        text check (char_length(serie) <= 200),
  -- Texto y no número: hay "1/2", "Annual 3", "0", "1.5"...
  numero       text check (char_length(numero) <= 30),
  editorial    text check (char_length(editorial) <= 100),
  guion        text check (char_length(guion) <= 200),
  dibujo       text check (char_length(dibujo) <= 200),
  anio         smallint check (anio between 1900 and 2100),
  formato      text not null default 'grapa'
               check (formato in ('grapa', 'tomo', 'tpb', 'hardcover', 'manga', 'novela_grafica', 'otro')),
  -- 'tengo' = está en la biblioteca; 'quiero' = lista de deseos.
  estado       text not null default 'tengo' check (estado in ('tengo', 'quiero')),
  leido        boolean not null default false,
  notas        text check (char_length(notas) <= 2000),
  portada_path text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists comics_serie_idx on public.comics (serie);
create index if not exists comics_created_at_idx on public.comics (created_at desc);

create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists comics_updated_at on public.comics;
create trigger comics_updated_at
  before update on public.comics
  for each row execute function public.tocar_updated_at();

alter table public.comics enable row level security;

drop policy if exists "comics: lectura publica" on public.comics;
create policy "comics: lectura publica" on public.comics
  for select to anon, authenticated using (true);

drop policy if exists "comics: admin inserta" on public.comics;
create policy "comics: admin inserta" on public.comics
  for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "comics: admin edita" on public.comics;
create policy "comics: admin edita" on public.comics
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "comics: admin borra" on public.comics;
create policy "comics: admin borra" on public.comics
  for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Storage: bucket público de portadas
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portadas', 'portadas', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Al ser público, las URLs de las portadas se sirven sin política de select.
-- Las de abajo solo habilitan escribir (y listar, que Storage necesita para borrar) al admin.
drop policy if exists "portadas: admin lee" on storage.objects;
create policy "portadas: admin lee" on storage.objects
  for select to authenticated
  using (bucket_id = 'portadas' and (select public.is_admin()));

drop policy if exists "portadas: admin sube" on storage.objects;
create policy "portadas: admin sube" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portadas' and (select public.is_admin()));

drop policy if exists "portadas: admin edita" on storage.objects;
create policy "portadas: admin edita" on storage.objects
  for update to authenticated
  using (bucket_id = 'portadas' and (select public.is_admin()));

drop policy if exists "portadas: admin borra" on storage.objects;
create policy "portadas: admin borra" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portadas' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Último paso (manual): hacerte admin.
-- 1. Authentication → Users → Add user → creá tu usuario con email y contraseña.
-- 2. Corré esto con tu email:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'TU-EMAIL@ejemplo.com'
--   on conflict do nothing;
-- ---------------------------------------------------------------------------
