-- Portadas editoriales: ruta controlada en Storage, alt accesible y slug por tipo.

alter table public.articles
  rename column featured_image to featured_image_path;

alter table public.articles
  add column featured_image_alt text;

update public.articles
set featured_image_alt = left('Portada de ' || title, 300)
where featured_image_path is not null
  and nullif(btrim(featured_image_alt), '') is null;

alter table public.articles
  add constraint articles_featured_image_alt_check
  check (
    featured_image_path is null
    or char_length(btrim(featured_image_alt)) between 3 and 300
  );

alter table public.articles
  drop constraint if exists articles_slug_key;

alter table public.articles
  add constraint articles_type_slug_key unique (type, slug);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial',
  'editorial',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portadas editoriales son públicas" on storage.objects;
create policy "Portadas editoriales son públicas"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'editorial');

drop policy if exists "Administradores suben portadas editoriales" on storage.objects;
create policy "Administradores suben portadas editoriales"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'editorial' and public.is_admin());

drop policy if exists "Administradores actualizan portadas editoriales" on storage.objects;
create policy "Administradores actualizan portadas editoriales"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'editorial' and public.is_admin())
  with check (bucket_id = 'editorial' and public.is_admin());

drop policy if exists "Administradores eliminan portadas editoriales" on storage.objects;
create policy "Administradores eliminan portadas editoriales"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'editorial' and public.is_admin());

comment on column public.articles.featured_image_path is
  'Ruta relativa dentro del bucket público editorial; nunca una URL aportada por el cliente.';
comment on column public.articles.featured_image_alt is
  'Texto alternativo accesible requerido cuando existe portada.';
