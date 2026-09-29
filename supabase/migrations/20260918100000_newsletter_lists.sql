-- Newsletter por listas. Hasta aquí `newsletter_subscriptions` era a la vez la
-- persona y su única suscripción: el email es UNIQUE y `source` solo guardaba
-- dónde se dio de alta, no a qué. Una persona no podía seguir Noticias y Blog
-- por separado, ni darse de baja de una sola cosa.
--
-- A partir de ahora la tabla es la PERSONA y el consentimiento vive por lista.
-- La baja global sigue existiendo: `is_active = false` en la persona silencia
-- todas sus listas sin borrar el histórico.

create table public.newsletter_lists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_newsletter_lists_updated_at
  before update on public.newsletter_lists
  for each row execute function public.update_updated_at_column();

insert into public.newsletter_lists (slug, name, description) values
 ('noticias', 'Noticias', 'Boletín de noticias del mercado y de la institución.'),
 ('blog', 'Blog', 'Análisis y artículos publicados en el blog de la BVH.'),
 ('institucional', 'Institucional', 'Comunicaciones institucionales de la BVH.');

create table public.newsletter_list_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null
    references public.newsletter_subscriptions(id) on delete cascade,
  list_id uuid not null
    references public.newsletter_lists(id) on delete restrict,
  source text,
  reference text,
  is_active boolean not null default true,
  subscribed_at timestamptz not null default now(),
  consented_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid(),
  notification_status text not null default 'pending'
    check (notification_status in ('unknown', 'pending', 'sent', 'failed')),
  notification_attempts integer not null default 0
    check (notification_attempts >= 0),
  notification_last_error text,
  notification_provider_id text,
  notified_at timestamptz,
  notification_token uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subscriber_id, list_id)
);

create unique index newsletter_list_subscriptions_token_key
  on public.newsletter_list_subscriptions (unsubscribe_token);
create unique index newsletter_list_subscriptions_reference_key
  on public.newsletter_list_subscriptions (reference) where reference is not null;
create index newsletter_list_subscriptions_list_idx
  on public.newsletter_list_subscriptions (list_id, is_active);

create trigger set_newsletter_list_subscriptions_updated_at
  before update on public.newsletter_list_subscriptions
  for each row execute function public.update_updated_at_column();

-- Traslado del consentimiento existente. `source` es la única pista de a qué
-- se suscribió cada quien; lo que no la tenga cae en institucional, que es la
-- lista de la portada y la de menor expectativa temática.
insert into public.newsletter_list_subscriptions (
  subscriber_id, list_id, source, reference, is_active, subscribed_at,
  consented_at, unsubscribed_at, unsubscribe_token, notification_status,
  notification_attempts, notification_last_error, notification_provider_id,
  notified_at, notification_token
)
select
  s.id,
  (select id from public.newsletter_lists where slug = case
     when s.source ilike '%noticia%' then 'noticias'
     when s.source ilike '%blog%' then 'blog'
     else 'institucional'
   end),
  s.source,
  s.reference,
  coalesce(s.is_active, true),
  coalesce(s.subscribed_at, now()),
  s.consented_at,
  s.unsubscribed_at,
  coalesce(s.unsubscribe_token, gen_random_uuid()),
  s.notification_status,
  s.notification_attempts,
  s.notification_last_error,
  s.notification_provider_id,
  s.notified_at,
  s.notification_token
from public.newsletter_subscriptions s;

-- La persona conserva identidad y baja global; el resto pertenecía a la lista.
alter table public.newsletter_subscriptions
  drop column source,
  drop column reference,
  drop column consented_at,
  drop column unsubscribe_token,
  drop column notification_status,
  drop column notification_attempts,
  drop column notification_last_error,
  drop column notification_provider_id,
  drop column notified_at,
  drop column notification_token;

alter table public.newsletter_list_subscriptions enable row level security;
alter table public.newsletter_lists enable row level security;

grant select on table public.newsletter_lists to anon, authenticated;
grant select on table public.newsletter_list_subscriptions to authenticated;

-- Las listas activas son públicas: los formularios necesitan nombrarlas.
create policy "Listas activas son públicas"
  on public.newsletter_lists for select
  to anon, authenticated
  using (is_active);

create policy "Administradores gestionan listas"
  on public.newsletter_lists for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Administradores ven suscripciones por lista"
  on public.newsletter_list_subscriptions for select
  to authenticated
  using (public.is_admin());

create policy "Administradores actualizan suscripciones por lista"
  on public.newsletter_list_subscriptions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger audit_newsletter_list_subscriptions
  after insert or update or delete on public.newsletter_list_subscriptions
  for each row execute function public.capture_audit_event();

-- Alta por lista. Reutiliza la persona por email y trata cada lista aparte:
-- reactivar Noticias no toca Blog, y estar ya activo no encola otro correo.
create or replace function public.submit_newsletter_subscription(
  p_email text,
  p_full_name text,
  p_profile text,
  p_source text,
  p_reference text,
  p_list_slug text
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
  v_subscriber uuid;
  v_list uuid;
  v_row public.newsletter_list_subscriptions%rowtype;
  v_token uuid;
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

  select id into v_list from public.newsletter_lists
  where slug = btrim(p_list_slug) and is_active;
  if v_list is null then
    raise exception using errcode = '22023', message = 'unknown newsletter list';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_email));

  select id into v_subscriber from public.newsletter_subscriptions
  where email = v_email for update;

  if v_subscriber is null then
    v_subscriber := gen_random_uuid();
    insert into public.newsletter_subscriptions (
      id, email, full_name, profile, is_active, subscribed_at, unsubscribed_at
    ) values (
      v_subscriber, v_email, nullif(btrim(p_full_name), ''),
      nullif(btrim(p_profile), ''), true, now(), null
    );
  else
    -- Un alta nueva revierte una baja global: es consentimiento fresco.
    update public.newsletter_subscriptions set
      full_name = coalesce(nullif(btrim(p_full_name), ''), full_name),
      profile = coalesce(nullif(btrim(p_profile), ''), profile),
      is_active = true,
      unsubscribed_at = null
    where id = v_subscriber;
  end if;

  select * into v_row from public.newsletter_list_subscriptions
  where subscriber_id = v_subscriber and list_id = v_list for update;

  if v_row.id is null then
    v_token := gen_random_uuid();
    insert into public.newsletter_list_subscriptions (
      subscriber_id, list_id, source, reference, is_active, subscribed_at,
      consented_at, notification_status, notification_token
    ) values (
      v_subscriber, v_list, nullif(btrim(p_source), ''), btrim(p_reference),
      true, now(), now(), 'pending', v_token
    )
    returning id into v_row.id;
    return query select v_row.id, v_token, true;
  elsif not v_row.is_active then
    v_token := gen_random_uuid();
    update public.newsletter_list_subscriptions set
      source = coalesce(nullif(btrim(p_source), ''), source),
      reference = btrim(p_reference),
      is_active = true,
      subscribed_at = now(),
      consented_at = now(),
      unsubscribed_at = null,
      unsubscribe_token = gen_random_uuid(),
      notification_status = 'pending',
      notification_attempts = 0,
      notification_last_error = null,
      notification_provider_id = null,
      notified_at = null,
      notification_token = v_token
    where id = v_row.id;
    return query select v_row.id, v_token, true;
  else
    return query select v_row.id, null::uuid, false;
  end if;
end;
$$;

-- Baja de una lista concreta: el token identifica la lista, no a la persona.
create or replace function public.unsubscribe_newsletter(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_updated integer := 0;
begin
  update public.newsletter_list_subscriptions set
    is_active = false,
    unsubscribed_at = now()
  where unsubscribe_token = p_token and is_active is true;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

-- Baja global desde cualquier token válido: silencia todas las listas.
create or replace function public.unsubscribe_newsletter_all(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_subscriber uuid;
  v_updated integer := 0;
begin
  select subscriber_id into v_subscriber
  from public.newsletter_list_subscriptions
  where unsubscribe_token = p_token;
  if v_subscriber is null then
    return false;
  end if;

  update public.newsletter_list_subscriptions set
    is_active = false,
    unsubscribed_at = now()
  where subscriber_id = v_subscriber and is_active is true;
  get diagnostics v_updated = row_count;

  update public.newsletter_subscriptions set
    is_active = false,
    unsubscribed_at = now()
  where id = v_subscriber;

  return v_updated > 0;
end;
$$;

-- El aviso de alta pasa a colgar de la suscripción por lista.
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
    update public.newsletter_list_subscriptions set
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

revoke all on function public.submit_newsletter_subscription(text, text, text, text, text, text) from public;
revoke all on function public.submit_newsletter_subscription(text, text, text, text, text, text) from anon, authenticated;
grant execute on function public.submit_newsletter_subscription(text, text, text, text, text, text) to service_role;

revoke all on function public.unsubscribe_newsletter_all(uuid) from public;
revoke all on function public.unsubscribe_newsletter_all(uuid) from anon, authenticated;
grant execute on function public.unsubscribe_newsletter_all(uuid) to service_role;

-- La firma de cinco argumentos deja de existir: obligar a nombrar la lista
-- evita que una llamada antigua deposite consentimiento en la lista errónea.
drop function if exists public.submit_newsletter_subscription(text, text, text, text, text);

comment on table public.newsletter_lists is
  'Listas de consentimiento del boletín. No incluye audiencias derivadas de cursos.';
comment on table public.newsletter_list_subscriptions is
  'Consentimiento por persona y lista, con su propio token de baja.';
