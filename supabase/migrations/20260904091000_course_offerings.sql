-- Separa el catálogo estable de cada edición concreta de un curso.

create table if not exists public.course_offerings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text not null default 'America/Havana',
  modality text not null default 'por_confirmar'
    check (modality in ('online', 'presencial', 'hibrido', 'por_confirmar')),
  location text,
  price numeric(12, 2) check (price is null or price >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  capacity integer check (capacity is null or capacity > 0),
  status text not null default 'borrador'
    check (status in ('borrador', 'abierta', 'cerrada', 'cancelada', 'finalizada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists course_offerings_course_id_idx
  on public.course_offerings (course_id);
create index if not exists course_offerings_public_idx
  on public.course_offerings (status, starts_at);

create trigger set_course_offerings_updated_at
  before update on public.course_offerings
  for each row execute function public.update_updated_at_column();

-- Convierte los datos actuales en una primera edición sin destruir las
-- columnas antiguas. Esas columnas quedan deprecadas durante la transición.
insert into public.course_offerings (
  course_id,
  starts_at,
  ends_at,
  price,
  capacity,
  status
)
select
  id,
  start_date::timestamp at time zone 'America/Havana',
  end_date::timestamp at time zone 'America/Havana',
  price,
  capacity,
  case
    when status = 'activo' then 'abierta'
    when status = 'completado' then 'finalizada'
    else 'borrador'
  end
from public.courses c
where not exists (
  select 1 from public.course_offerings o where o.course_id = c.id
);

-- El estado de finalización pertenece a la edición, no al catálogo estable.
alter table public.courses
  drop constraint if exists courses_status_check;

update public.courses
set status = case status
  when 'inactivo' then 'borrador'
  when 'completado' then 'archivado'
  else coalesce(status, 'borrador')
end;

alter table public.courses
  alter column status set default 'borrador',
  alter column status set not null;

alter table public.courses
  add constraint courses_status_check
  check (status in ('borrador', 'activo', 'archivado'));

alter table public.course_enrollments
  add column if not exists offering_id uuid references public.course_offerings(id) on delete restrict;

update public.course_enrollments e
set offering_id = (
  select id
  from public.course_offerings
  where course_id = e.course_id
  order by created_at
  limit 1
)
where e.offering_id is null;

alter table public.course_enrollments
  alter column offering_id set not null;

alter table public.course_enrollments
  drop constraint if exists course_enrollments_status_check;

update public.course_enrollments
set status = case status
  when 'inscrito' then 'confirmada'
  when 'completado' then 'completada'
  when 'cancelado' then 'cancelada'
  else coalesce(status, 'pendiente')
end;

alter table public.course_enrollments
  alter column status set default 'confirmada',
  alter column status set not null,
  add column if not exists updated_at timestamptz not null default now();

alter table public.course_enrollments
  add constraint course_enrollments_status_check
  check (status in ('pendiente', 'confirmada', 'lista_espera', 'cancelada', 'completada'));

create trigger set_course_enrollments_updated_at
  before update on public.course_enrollments
  for each row execute function public.update_updated_at_column();

alter table public.course_enrollments
  drop constraint if exists course_enrollments_user_id_course_id_key;

alter table public.course_enrollments
  add constraint course_enrollments_user_id_offering_id_key
  unique (user_id, offering_id);

alter table public.course_offerings enable row level security;

grant select on table public.course_offerings to anon, authenticated;
grant insert, update, delete on table public.course_offerings to authenticated;

create policy "Ofertas abiertas son públicas"
  on public.course_offerings for select
  to anon, authenticated
  using (status = 'abierta');

create policy "Administradores gestionan ofertas"
  on public.course_offerings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "El usuario se inscribe" on public.course_enrollments;
-- El rol Postgres `authenticated` también representa a los administradores.
-- RLS bloquea la escritura directa del usuario común; el alta propia usa RPC.
grant select, insert, update, delete on table public.course_enrollments to authenticated;

create policy "Administradores gestionan inscripciones"
  on public.course_enrollments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.enroll_in_course(p_offering_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  selected_offering public.course_offerings%rowtype;
  existing_id uuid;
  existing_status text;
  occupied integer;
  enrollment_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select * into selected_offering
  from public.course_offerings
  where id = p_offering_id
  for update;

  if not found or selected_offering.status <> 'abierta' then
    raise exception 'offering_not_open';
  end if;

  -- El bloqueo de la oferta serializa la comprobación de cupo y evita que
  -- dos solicitudes concurrentes creen una inscripción duplicada.
  select id, status into existing_id, existing_status
  from public.course_enrollments
  where user_id = current_user_id and offering_id = p_offering_id;

  if existing_id is not null and existing_status <> 'cancelada' then
    return existing_id;
  end if;

  if selected_offering.capacity is not null then
    select count(*) into occupied
    from public.course_enrollments
    where offering_id = p_offering_id
      and status in ('confirmada', 'completada');

    if occupied >= selected_offering.capacity then
      raise exception 'course_full';
    end if;
  end if;

  if existing_id is not null then
    update public.course_enrollments
    set status = 'confirmada', enrolled_at = now(), completed_at = null
    where id = existing_id
    returning id into enrollment_id;
  else
    insert into public.course_enrollments (user_id, course_id, offering_id, status)
    values (current_user_id, selected_offering.course_id, selected_offering.id, 'confirmada')
    returning id into enrollment_id;
  end if;

  return enrollment_id;
end;
$$;

revoke all on function public.enroll_in_course(uuid) from public;
revoke all on function public.enroll_in_course(uuid) from anon;
grant execute on function public.enroll_in_course(uuid) to authenticated;

-- Expone disponibilidad agregada sin revelar identidades ni filas de
-- inscripción. Solo acepta ofertas actualmente abiertas.
create or replace function public.get_course_offering_availability(
  p_offering_ids uuid[]
)
returns table (offering_id uuid, available_seats integer)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select
    o.id,
    case
      when o.capacity is null then null
      else greatest(
        o.capacity - count(e.id) filter (
          where e.status in ('confirmada', 'completada')
        )::integer,
        0
      )
    end
  from public.course_offerings o
  left join public.course_enrollments e on e.offering_id = o.id
  where o.status = 'abierta' and o.id = any(p_offering_ids)
  group by o.id, o.capacity;
$$;

revoke all on function public.get_course_offering_availability(uuid[]) from public;
grant execute on function public.get_course_offering_availability(uuid[]) to anon, authenticated;

-- Guardar una edición queda encapsulado para interpretar la hora local en la
-- zona indicada y proteger la capacidad frente a inscripciones existentes.
create or replace function public.save_course_offering(
  p_course_id uuid,
  p_offering jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  saved_offering_id uuid := nullif(p_offering->>'id', '')::uuid;
  requested_capacity integer := nullif(p_offering->>'capacity', '')::integer;
  occupied integer;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  perform 1 from public.courses where id = p_course_id;
  if not found then
    raise exception 'course_not_found';
  end if;

  if p_offering->>'status' = 'abierta'
     and nullif(p_offering->>'starts_at', '') is null then
    raise exception 'start_required';
  end if;

  if p_offering->>'modality' in ('presencial', 'hibrido')
     and nullif(p_offering->>'location', '') is null then
    raise exception 'location_required';
  end if;

  if saved_offering_id is null then
    insert into public.course_offerings (
      course_id, starts_at, ends_at, timezone, modality, location,
      price, currency, capacity, status
    ) values (
      p_course_id,
      nullif(p_offering->>'starts_at', '')::timestamp
        at time zone coalesce(nullif(p_offering->>'timezone', ''), 'America/Havana'),
      nullif(p_offering->>'ends_at', '')::timestamp
        at time zone coalesce(nullif(p_offering->>'timezone', ''), 'America/Havana'),
      coalesce(nullif(p_offering->>'timezone', ''), 'America/Havana'),
      p_offering->>'modality',
      nullif(p_offering->>'location', ''),
      nullif(p_offering->>'price', '')::numeric,
      p_offering->>'currency',
      nullif(p_offering->>'capacity', '')::integer,
      p_offering->>'status'
    ) returning id into saved_offering_id;
  else
    perform 1
    from public.course_offerings
    where id = saved_offering_id and course_id = p_course_id
    for update;
    if not found then
      raise exception 'offering_not_found';
    end if;

    if requested_capacity is not null then
      select count(*) into occupied
      from public.course_enrollments
      where offering_id = saved_offering_id
        and status in ('confirmada', 'completada');

      if occupied > requested_capacity then
        raise exception 'capacity_below_enrollments';
      end if;
    end if;

    update public.course_offerings o
    set
      starts_at = nullif(p_offering->>'starts_at', '')::timestamp
        at time zone coalesce(nullif(p_offering->>'timezone', ''), 'America/Havana'),
      ends_at = nullif(p_offering->>'ends_at', '')::timestamp
        at time zone coalesce(nullif(p_offering->>'timezone', ''), 'America/Havana'),
      timezone = coalesce(nullif(p_offering->>'timezone', ''), 'America/Havana'),
      modality = p_offering->>'modality',
      location = nullif(p_offering->>'location', ''),
      price = nullif(p_offering->>'price', '')::numeric,
      currency = p_offering->>'currency',
      capacity = nullif(p_offering->>'capacity', '')::integer,
      status = p_offering->>'status'
    where o.id = saved_offering_id and o.course_id = p_course_id;
  end if;

  return saved_offering_id;
end;
$$;

revoke all on function public.save_course_offering(uuid, jsonb) from public;
revoke all on function public.save_course_offering(uuid, jsonb) from anon;
grant execute on function public.save_course_offering(uuid, jsonb) to authenticated;

create or replace function public.update_course_enrollment_status(
  p_enrollment_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  selected_enrollment public.course_enrollments%rowtype;
  selected_offering public.course_offerings%rowtype;
  occupied integer;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if p_status not in ('pendiente', 'confirmada', 'lista_espera', 'cancelada', 'completada') then
    raise exception 'invalid_status';
  end if;

  select * into selected_enrollment
  from public.course_enrollments
  where id = p_enrollment_id
  for update;
  if not found then
    raise exception 'enrollment_not_found';
  end if;

  if p_status = 'confirmada'
     and selected_enrollment.status not in ('confirmada', 'completada') then
    select * into selected_offering
    from public.course_offerings
    where id = selected_enrollment.offering_id
    for update;

    if selected_offering.capacity is not null then
      select count(*) into occupied
      from public.course_enrollments
      where offering_id = selected_enrollment.offering_id
        and id <> selected_enrollment.id
        and status in ('confirmada', 'completada');

      if occupied >= selected_offering.capacity then
        raise exception 'course_full';
      end if;
    end if;
  end if;

  update public.course_enrollments
  set
    status = p_status,
    completed_at = case when p_status = 'completada' then now() else null end
  where id = selected_enrollment.id;
end;
$$;

revoke all on function public.update_course_enrollment_status(uuid, text) from public;
revoke all on function public.update_course_enrollment_status(uuid, text) from anon;
grant execute on function public.update_course_enrollment_status(uuid, text) to authenticated;

create or replace function public.archive_course(p_course_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  update public.course_offerings
  set status = 'cerrada'
  where course_id = p_course_id and status = 'abierta';

  update public.courses
  set status = 'archivado'
  where id = p_course_id;

  if not found then
    raise exception 'course_not_found';
  end if;
end;
$$;

revoke all on function public.archive_course(uuid) from public;
revoke all on function public.archive_course(uuid) from anon;
grant execute on function public.archive_course(uuid) to authenticated;
