-- Auditoría mínima, transaccional y sin contenido sensible.

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('insert', 'update', 'delete')),
  resource_type text not null,
  resource_id uuid,
  result text not null default 'success' check (result in ('success')),
  metadata jsonb not null default '{}'::jsonb,
  request_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create index if not exists audit_events_created_at_idx
  on public.audit_events (created_at desc);
create index if not exists audit_events_resource_idx
  on public.audit_events (resource_type, resource_id, created_at desc);
create index if not exists audit_events_actor_idx
  on public.audit_events (actor_id, created_at desc);

alter table public.audit_events enable row level security;
revoke all on table public.audit_events from anon, authenticated;
grant select on table public.audit_events to authenticated;

create policy "Administradores leen auditoría"
  on public.audit_events for select
  to authenticated
  using (public.is_admin());

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
      'new_status', row_data->>'status'
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

create trigger audit_articles
  after insert or update or delete on public.articles
  for each row execute function public.capture_audit_event();
create trigger audit_courses
  after insert or update or delete on public.courses
  for each row execute function public.capture_audit_event();
create trigger audit_course_offerings
  after insert or update or delete on public.course_offerings
  for each row execute function public.capture_audit_event();
create trigger audit_course_enrollments
  after insert or update or delete on public.course_enrollments
  for each row execute function public.capture_audit_event();
create trigger audit_profiles
  after update on public.profiles
  for each row execute function public.capture_audit_event();

comment on table public.audit_events is
  'Registro transaccional de cambios sensibles. No almacena contenido ni PII completa.';
