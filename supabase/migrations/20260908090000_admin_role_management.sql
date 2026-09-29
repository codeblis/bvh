-- Gestión administrativa de roles. El rol nunca fue editable desde el cliente:
-- el GRANT por columnas de profiles excluye `role` y no hay política de UPDATE
-- para administradores. Esta operación transaccional es la única vía, y no
-- permite que el panel se quede sin ninguna cuenta administradora.

create or replace function public.set_profile_role(
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_role_value text;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if p_role is null or p_role not in ('usuario', 'admin') then
    raise exception 'invalid_role';
  end if;
  if p_user_id = auth.uid() then
    -- Nadie cambia su propio rol. Como quien ejecuta esto ya es administrador,
    -- la regla garantiza además que el panel nunca se queda sin ninguno.
    raise exception 'self_role_change';
  end if;

  select role into current_role_value from public.profiles
  where id = p_user_id for update;
  if not found then
    raise exception 'profile_not_found';
  end if;
  if current_role_value = p_role then
    return;
  end if;

  update public.profiles set role = p_role where id = p_user_id;
end;
$$;

revoke all on function public.set_profile_role(uuid, text) from public;
revoke all on function public.set_profile_role(uuid, text) from anon;
grant execute on function public.set_profile_role(uuid, text) to authenticated;

comment on function public.set_profile_role(uuid, text) is
  'Única vía de cambio de rol. Exige administrador y prohíbe cambiar el rol propio, de modo que siempre queda al menos una cuenta administradora.';

-- La auditoría describía solo cambios de estado. Un cambio de rol es una acción
-- sensible que debe poder revisarse: se proyecta el rol, que no es PII, y se
-- mantiene fuera cualquier otro campo del registro.
create or replace function public.capture_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  row_data jsonb;
  previous_data jsonb;
begin
  if tg_op = 'DELETE' then
    row_data := to_jsonb(old);
    previous_data := to_jsonb(old);
  elsif tg_op = 'UPDATE' then
    row_data := to_jsonb(new);
    previous_data := to_jsonb(old);
  else
    row_data := to_jsonb(new);
    previous_data := '{}'::jsonb;
  end if;

  insert into public.audit_events (
    actor_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    nullif(row_data->>'id', '')::uuid,
    jsonb_strip_nulls(jsonb_build_object(
      'old_status', previous_data->>'status',
      'new_status', row_data->>'status',
      'old_role', previous_data->>'role',
      'new_role', row_data->>'role'
    ))
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.capture_audit_event() from public;
revoke all on function public.capture_audit_event() from anon, authenticated;

-- Las categorías son la taxonomía editorial: un administrador ya podía
-- gestionarlas por política, pero sus cambios no quedaban registrados.
drop trigger if exists audit_categories on public.categories;
create trigger audit_categories
  after insert or update or delete on public.categories
  for each row execute function public.capture_audit_event();
