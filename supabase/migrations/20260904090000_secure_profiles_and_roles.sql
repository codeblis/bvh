-- Cierra tres fallos críticos de la línea base:
-- 1. la lectura pública de profiles exponía email y demás PII;
-- 2. el UPDATE propio permitía intentar cambiar role;
-- 3. cualquier cuenta autenticada podía publicar artículos propios.

drop policy if exists "Perfiles visibles públicamente" on public.profiles;
drop policy if exists "El usuario edita su propio perfil" on public.profiles;
drop policy if exists "El usuario inserta su propio perfil" on public.profiles;

revoke all on table public.profiles from anon;
revoke insert, update, delete on table public.profiles from authenticated;

-- La identidad se crea mediante handle_new_user(). El cliente solo puede
-- modificar los campos expresamente permitidos; role y email quedan fuera.
grant select on table public.profiles to authenticated;
grant update (full_name, avatar_url, account_type) on table public.profiles to authenticated;

create policy "El usuario lee su propio perfil"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Administradores leen perfiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "El usuario actualiza campos permitidos de su perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('usuario', 'admin'));

comment on column public.profiles.role is
  'Rol controlado por operaciones administrativas confiables; nunca editable por el usuario.';

-- V1 no tiene rol editorial separado. Las políticas históricas de autor
-- permitían a cualquier cuenta autenticada crear o publicar artículos propios.
drop policy if exists "El autor ve sus propios borradores" on public.articles;
drop policy if exists "El autor gestiona sus artículos" on public.articles;
drop policy if exists "El autor actualiza sus artículos" on public.articles;
