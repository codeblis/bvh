-- Una exportación de datos personales es una acción sensible: debe quedar
-- registrada como tal, con quién la hizo y cuántas filas se llevó, sin copiar
-- ninguna de ellas.

alter table public.audit_events
  drop constraint if exists audit_events_action_check;

alter table public.audit_events
  add constraint audit_events_action_check
  check (action in ('insert', 'update', 'delete', 'export'));

create or replace function public.record_data_export(
  p_resource_type text,
  p_rows integer
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if p_resource_type is null or p_resource_type = '' then
    raise exception 'invalid_resource';
  end if;
  if p_rows is null or p_rows < 0 then
    raise exception 'invalid_rows';
  end if;

  insert into public.audit_events (
    actor_id, action, resource_type, resource_id, metadata
  ) values (
    auth.uid(),
    'export',
    p_resource_type,
    null,
    jsonb_build_object('rows', p_rows)
  );
end;
$$;

revoke all on function public.record_data_export(text, integer) from public;
revoke all on function public.record_data_export(text, integer) from anon;
grant execute on function public.record_data_export(text, integer) to authenticated;

comment on function public.record_data_export(text, integer) is
  'Registra una exportación administrativa: actor, recurso y número de filas. No guarda el contenido exportado.';
