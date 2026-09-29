-- Helper: evita repetir el subquery de rol admin y previene recursión en RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- CONTACT MESSAGES: los admins pueden leer y actualizar el estado
create policy "Administradores leen mensajes de contacto"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "Administradores actualizan mensajes de contacto"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin());

-- NEWSLETTER: los admins pueden leer la lista de suscriptores
create policy "Administradores leen suscripciones"
  on public.newsletter_subscriptions for select
  to authenticated
  using (public.is_admin());

-- COMPANY APPLICATIONS: los admins actualizan el estado de la solicitud
create policy "Administradores actualizan solicitudes"
  on public.company_applications for update
  to authenticated
  using (public.is_admin());

-- ARTICLES: los admins gestionan cualquier artículo (además del propio autor)
create policy "Administradores gestionan artículos"
  on public.articles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- CATEGORIES: solo admins escriben
create policy "Administradores gestionan categorías"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- COURSES: solo admins escriben
create policy "Administradores gestionan cursos"
  on public.courses for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- COMPANIES (directorio público): solo admins escriben
create policy "Administradores gestionan empresas del directorio"
  on public.companies for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- INDICES: solo admins escriben
create policy "Administradores gestionan índices"
  on public.indices for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- COMMENTS: los admins moderan cualquier comentario
create policy "Administradores moderan comentarios"
  on public.comments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
