-- Formularios V1: persistencia transaccional antes del correo y estado reintentable.

alter table public.contact_messages
  add column reference text,
  add column notification_status text not null default 'unknown',
  add column notification_attempts integer not null default 0,
  add column notification_last_error text,
  add column notification_provider_id text,
  add column notified_at timestamptz,
  add column notification_token uuid;

alter table public.company_applications
  add column accepted_terms_at timestamptz,
  add column reference text,
  add column notification_status text not null default 'unknown',
  add column notification_attempts integer not null default 0,
  add column notification_last_error text,
  add column notification_provider_id text,
  add column notified_at timestamptz,
  add column notification_token uuid;

alter table public.newsletter_subscriptions
  add column consented_at timestamptz,
  add column unsubscribe_token uuid not null default gen_random_uuid(),
  add column reference text,
  add column notification_status text not null default 'unknown',
  add column notification_attempts integer not null default 0,
  add column notification_last_error text,
  add column notification_provider_id text,
  add column notified_at timestamptz,
  add column notification_token uuid;

alter table public.contact_messages
  alter column notification_status set default 'pending',
  add constraint contact_notification_status_check
    check (notification_status in ('unknown', 'pending', 'sent', 'failed')),
  add constraint contact_notification_attempts_check
    check (notification_attempts >= 0);

alter table public.company_applications
  alter column notification_status set default 'pending',
  add constraint application_notification_status_check
    check (notification_status in ('unknown', 'pending', 'sent', 'failed')),
  add constraint application_notification_attempts_check
    check (notification_attempts >= 0);

alter table public.newsletter_subscriptions
  alter column notification_status set default 'pending',
  add constraint newsletter_notification_status_check
    check (notification_status in ('unknown', 'pending', 'sent', 'failed')),
  add constraint newsletter_notification_attempts_check
    check (notification_attempts >= 0);

create unique index contact_messages_reference_key
  on public.contact_messages (reference) where reference is not null;
create unique index company_applications_reference_key
  on public.company_applications (reference) where reference is not null;
create unique index newsletter_subscriptions_reference_key
  on public.newsletter_subscriptions (reference) where reference is not null;
create unique index newsletter_subscriptions_unsubscribe_token_key
  on public.newsletter_subscriptions (unsubscribe_token);

drop policy if exists "Cualquiera envía un mensaje de contacto" on public.contact_messages;
drop policy if exists "Cualquiera puede enviar una solicitud" on public.company_applications;
drop policy if exists "Cualquiera se suscribe al newsletter" on public.newsletter_subscriptions;

revoke insert on public.contact_messages from anon, authenticated;
revoke insert on public.company_applications from anon, authenticated;
revoke insert on public.newsletter_subscriptions from anon, authenticated;

create policy "Administradores actualizan suscripciones"
  on public.newsletter_subscriptions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.submit_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_reference text
)
returns table(submission_id uuid, notification_token uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid := gen_random_uuid();
  v_token uuid := gen_random_uuid();
begin
  if char_length(btrim(p_name)) not between 2 and 160
    or char_length(btrim(p_email)) not between 3 and 254
    or lower(btrim(p_email)) !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$'
    or char_length(btrim(p_subject)) not between 2 and 160
    or char_length(btrim(p_message)) not between 10 and 5000
    or char_length(btrim(p_reference)) not between 8 and 80 then
    raise exception using errcode = '22023', message = 'invalid contact submission';
  end if;

  insert into public.contact_messages (
    id, name, email, subject, message, reference, notification_status,
    notification_token
  ) values (
    v_id, btrim(p_name), lower(btrim(p_email)), btrim(p_subject),
    btrim(p_message), btrim(p_reference), 'pending', v_token
  );

  return query select v_id, v_token;
end;
$$;

create or replace function public.submit_company_application(
  p_company_name text,
  p_tax_id text,
  p_legal_representative text,
  p_email text,
  p_phone text,
  p_sector text,
  p_founding_year integer,
  p_annual_revenue text,
  p_employee_count integer,
  p_description text,
  p_wants_advisor boolean,
  p_accepted_terms boolean,
  p_reference text
)
returns table(submission_id uuid, notification_token uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid := gen_random_uuid();
  v_token uuid := gen_random_uuid();
begin
  if char_length(btrim(p_company_name)) not between 2 and 160
    or char_length(btrim(p_tax_id)) not between 5 and 50
    or char_length(btrim(p_legal_representative)) not between 2 and 160
    or char_length(btrim(p_email)) not between 3 and 254
    or lower(btrim(p_email)) !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$'
    or char_length(btrim(p_phone)) not between 6 and 40
    or char_length(btrim(p_sector)) not between 2 and 160
    or char_length(btrim(p_description)) not between 20 and 5000
    or p_founding_year is null
    or p_founding_year not between 1800 and extract(year from now())::integer
    or p_accepted_terms is not true
    or char_length(btrim(p_reference)) not between 8 and 80 then
    raise exception using errcode = '22023', message = 'invalid company application';
  end if;

  insert into public.company_applications (
    id, company_name, tax_id, legal_representative, corporate_email, phone,
    sector, founding_year, annual_revenue, employee_count, description,
    wants_advisor_contact, accepted_terms_at, reference, notification_status,
    notification_token
  ) values (
    v_id, btrim(p_company_name), btrim(p_tax_id), btrim(p_legal_representative),
    lower(btrim(p_email)), btrim(p_phone), btrim(p_sector), p_founding_year,
    nullif(btrim(p_annual_revenue), ''), p_employee_count, btrim(p_description),
    p_wants_advisor, now(), btrim(p_reference), 'pending', v_token
  );

  return query select v_id, v_token;
end;
$$;

create or replace function public.submit_newsletter_subscription(
  p_email text,
  p_full_name text,
  p_profile text,
  p_source text,
  p_reference text
)
returns table(
  submission_id uuid,
  notification_token uuid,
  should_notify boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_token uuid;
  v_was_active boolean;
  v_email text := lower(btrim(p_email));
begin
  if char_length(v_email) not between 3 and 254
    or v_email !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$'
    or char_length(coalesce(p_full_name, '')) > 160
    or char_length(coalesce(p_profile, '')) > 100
    or char_length(coalesce(p_source, '')) > 80
    or char_length(btrim(p_reference)) not between 8 and 80 then
    raise exception using errcode = '22023', message = 'invalid newsletter subscription';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_email));
  select id, coalesce(is_active, false)
  into v_id, v_was_active
  from public.newsletter_subscriptions
  where email = v_email
  for update;

  if v_id is null then
    v_id := gen_random_uuid();
    v_token := gen_random_uuid();
    v_was_active := false;
    insert into public.newsletter_subscriptions (
      id, email, full_name, profile, source, reference, is_active,
      subscribed_at, consented_at, unsubscribed_at, notification_status,
      notification_token
    ) values (
      v_id, v_email, nullif(btrim(p_full_name), ''), nullif(btrim(p_profile), ''),
      nullif(btrim(p_source), ''), btrim(p_reference), true, now(), now(), null,
      'pending', v_token
    );
  elsif not v_was_active then
    v_token := gen_random_uuid();
    update public.newsletter_subscriptions set
      full_name = coalesce(nullif(btrim(p_full_name), ''), full_name),
      profile = coalesce(nullif(btrim(p_profile), ''), profile),
      source = coalesce(nullif(btrim(p_source), ''), source),
      reference = btrim(p_reference),
      is_active = true,
      subscribed_at = now(),
      consented_at = now(),
      unsubscribed_at = null,
      notification_status = 'pending',
      notification_attempts = 0,
      notification_last_error = null,
      notification_provider_id = null,
      notified_at = null,
      notification_token = v_token,
      unsubscribe_token = gen_random_uuid()
    where id = v_id;
  else
    update public.newsletter_subscriptions set
      full_name = coalesce(nullif(btrim(p_full_name), ''), full_name),
      profile = coalesce(nullif(btrim(p_profile), ''), profile),
      source = coalesce(nullif(btrim(p_source), ''), source)
    where id = v_id;
  end if;

  return query select v_id, v_token, not v_was_active;
end;
$$;

create or replace function public.unsubscribe_newsletter(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_updated integer := 0;
begin
  update public.newsletter_subscriptions set
    is_active = false,
    unsubscribed_at = now()
  where unsubscribe_token = p_token and is_active is true;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

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
  else
    return false;
  end if;

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text, text) from public;
revoke all on function public.submit_company_application(text, text, text, text, text, text, integer, text, integer, text, boolean, boolean, text) from public;
revoke all on function public.submit_newsletter_subscription(text, text, text, text, text) from public;
revoke all on function public.record_form_notification(text, uuid, uuid, boolean, text, text) from public;
revoke all on function public.unsubscribe_newsletter(uuid) from public;

-- Supabase concede EXECUTE a los roles API cuando se crea una función. La
-- revocación a PUBLIC no elimina esas concesiones directas: estas operaciones
-- internas solo pueden atravesarse desde el cliente server-only.
revoke all on function public.submit_contact_message(text, text, text, text, text) from anon, authenticated;
revoke all on function public.submit_company_application(text, text, text, text, text, text, integer, text, integer, text, boolean, boolean, text) from anon, authenticated;
revoke all on function public.submit_newsletter_subscription(text, text, text, text, text) from anon, authenticated;
revoke all on function public.record_form_notification(text, uuid, uuid, boolean, text, text) from anon, authenticated;
revoke all on function public.unsubscribe_newsletter(uuid) from anon, authenticated;

grant execute on function public.submit_contact_message(text, text, text, text, text) to service_role;
grant execute on function public.submit_company_application(text, text, text, text, text, text, integer, text, integer, text, boolean, boolean, text) to service_role;
grant execute on function public.submit_newsletter_subscription(text, text, text, text, text) to service_role;
grant execute on function public.record_form_notification(text, uuid, uuid, boolean, text, text) to service_role;
grant execute on function public.unsubscribe_newsletter(uuid) to service_role;

create trigger audit_contact_messages
  after insert or update or delete on public.contact_messages
  for each row execute function public.capture_audit_event();
create trigger audit_company_applications
  after insert or update or delete on public.company_applications
  for each row execute function public.capture_audit_event();
create trigger audit_newsletter_subscriptions
  after insert or update or delete on public.newsletter_subscriptions
  for each row execute function public.capture_audit_event();

comment on function public.record_form_notification(text, uuid, uuid, boolean, text, text) is
  'Completa un intento inicial mediante una capacidad UUID no expuesta por las rutas públicas.';
