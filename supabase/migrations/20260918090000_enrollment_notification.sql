-- Inscripciones V1: confirmación por correo con el mismo estado reintentable
-- que ya tienen contacto, solicitudes y newsletter. La inscripción se
-- persiste antes del correo; el correo nunca decide si el alumno queda dentro.

alter table public.course_enrollments
  add column reference text,
  add column notification_status text not null default 'unknown',
  add column notification_attempts integer not null default 0,
  add column notification_last_error text,
  add column notification_provider_id text,
  add column notification_token uuid,
  add column notified_at timestamptz;

alter table public.course_enrollments
  add constraint enrollment_notification_status_check
    check (notification_status in ('unknown', 'pending', 'sent', 'failed')),
  add constraint enrollment_notification_attempts_check
    check (notification_attempts >= 0);

-- A diferencia de los formularios, el defecto se queda en 'unknown': una
-- inscripción creada a mano desde el panel no promete un correo que nadie
-- encoló. Solo la RPC con referencia declara 'pending'.
create unique index course_enrollments_reference_key
  on public.course_enrollments (reference) where reference is not null;

-- Alta con capacidad de aviso. Sin referencia se comporta como antes y no
-- abre ciclo de correo; con referencia devuelve el token que permite cerrar
-- el primer intento exactamente una vez.
create or replace function public.enroll_in_course(
  p_offering_id uuid,
  p_reference text
)
returns table(enrollment_id uuid, notification_token uuid, should_notify boolean)
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
  v_id uuid;
  v_token uuid;
  v_reference text := nullif(btrim(coalesce(p_reference, '')), '');
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if v_reference is not null
    and char_length(v_reference) not between 8 and 80 then
    raise exception using errcode = '22023', message = 'invalid enrollment reference';
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

  -- Ya estaba dentro: el alta es idempotente y no encola un segundo correo.
  if existing_id is not null and existing_status <> 'cancelada' then
    return query select existing_id, null::uuid, false;
    return;
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

  if v_reference is not null then
    v_token := gen_random_uuid();
  end if;

  if existing_id is not null then
    update public.course_enrollments set
      status = 'confirmada',
      enrolled_at = now(),
      completed_at = null,
      reference = coalesce(v_reference, reference),
      notification_status = case when v_reference is null then 'unknown' else 'pending' end,
      notification_attempts = 0,
      notification_last_error = null,
      notification_provider_id = null,
      notified_at = null,
      notification_token = v_token
    where id = existing_id
    returning id into v_id;
  else
    insert into public.course_enrollments (
      user_id, course_id, offering_id, status, reference,
      notification_status, notification_token
    ) values (
      current_user_id, selected_offering.course_id, selected_offering.id,
      'confirmada', v_reference,
      case when v_reference is null then 'unknown' else 'pending' end,
      v_token
    )
    returning id into v_id;
  end if;

  return query select v_id, v_token, v_reference is not null;
end;
$$;

-- La forma de un solo argumento sobrevive como envoltorio para no duplicar la
-- lógica de cupo: sin referencia, ningún ciclo de correo se abre.
create or replace function public.enroll_in_course(p_offering_id uuid)
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$
  select enrollment_id from public.enroll_in_course(p_offering_id, null);
$$;

revoke all on function public.enroll_in_course(uuid, text) from public;
revoke all on function public.enroll_in_course(uuid, text) from anon;
-- El alta necesita la identidad de quien la pide, así que corre como
-- `authenticated` y no como service role. El token que devuelve es inerte
-- para el navegador: cerrarlo exige `record_form_notification`, revocada a
-- todos los roles del API.
grant execute on function public.enroll_in_course(uuid, text) to authenticated;

create or replace function public.record_form_notification(
  p_resource_type text,
  p_resource_id uuid,
  p_notification_token uuid,
  p_success boolean,
  p_provider_id text default null,
  p_error text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_updated integer := 0;
begin
  if p_resource_type = 'contact_message' then
    update public.contact_messages set
      notification_status = case when p_success then 'sent' else 'failed' end,
      notification_attempts = notification_attempts + 1,
      notification_last_error = case when p_success then null else left(p_error, 500) end,
      notification_provider_id = case when p_success then left(p_provider_id, 200) else null end,
      notified_at = case when p_success then now() else null end,
      notification_token = null
    where id = p_resource_id and notification_token = p_notification_token;
  elsif p_resource_type = 'company_application' then
    update public.company_applications set
      notification_status = case when p_success then 'sent' else 'failed' end,
      notification_attempts = notification_attempts + 1,
      notification_last_error = case when p_success then null else left(p_error, 500) end,
      notification_provider_id = case when p_success then left(p_provider_id, 200) else null end,
      notified_at = case when p_success then now() else null end,
      notification_token = null
    where id = p_resource_id and notification_token = p_notification_token;
  elsif p_resource_type = 'newsletter_subscription' then
    update public.newsletter_subscriptions set
      notification_status = case when p_success then 'sent' else 'failed' end,
      notification_attempts = notification_attempts + 1,
      notification_last_error = case when p_success then null else left(p_error, 500) end,
      notification_provider_id = case when p_success then left(p_provider_id, 200) else null end,
      notified_at = case when p_success then now() else null end,
      notification_token = null
    where id = p_resource_id and notification_token = p_notification_token;
  elsif p_resource_type = 'course_enrollment' then
    update public.course_enrollments set
      notification_status = case when p_success then 'sent' else 'failed' end,
      notification_attempts = notification_attempts + 1,
      notification_last_error = case when p_success then null else left(p_error, 500) end,
      notification_provider_id = case when p_success then left(p_provider_id, 200) else null end,
      notified_at = case when p_success then now() else null end,
      notification_token = null
    where id = p_resource_id and notification_token = p_notification_token;
  else
    return false;
  end if;

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.record_form_notification(text, uuid, uuid, boolean, text, text) from public;
revoke all on function public.record_form_notification(text, uuid, uuid, boolean, text, text) from anon, authenticated;
grant execute on function public.record_form_notification(text, uuid, uuid, boolean, text, text) to service_role;

-- El panel no puede escribir la tabla de inscripciones: desde
-- `admin_enrollment_capacity` toda mutación pasa por RPC transaccional. El
-- reintento del aviso sigue la misma regla y no reabre un ciclo ya cerrado.
create or replace function public.record_enrollment_notification_retry(
  p_enrollment_id uuid,
  p_reference text,
  p_success boolean,
  p_provider_id text default null,
  p_error text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_updated integer := 0;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  update public.course_enrollments set
    reference = coalesce(nullif(btrim(p_reference), ''), reference),
    notification_status = case when p_success then 'sent' else 'failed' end,
    notification_attempts = notification_attempts + 1,
    notification_last_error = case when p_success then null else left(p_error, 500) end,
    notification_provider_id = case when p_success then left(p_provider_id, 200) else null end,
    notified_at = case when p_success then now() else null end,
    notification_token = null
  where id = p_enrollment_id
    and notification_status <> 'sent';

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.record_enrollment_notification_retry(uuid, text, boolean, text, text) from public;
revoke all on function public.record_enrollment_notification_retry(uuid, text, boolean, text, text) from anon;
grant execute on function public.record_enrollment_notification_retry(uuid, text, boolean, text, text) to authenticated;

comment on function public.enroll_in_course(uuid, text) is
  'Alta idempotente con cupo atómico que además abre el ciclo de aviso cuando recibe referencia.';
comment on function public.record_enrollment_notification_retry(uuid, text, boolean, text, text) is
  'Cierra un reintento administrativo del aviso de inscripción sin abrir escritura directa a la tabla.';
