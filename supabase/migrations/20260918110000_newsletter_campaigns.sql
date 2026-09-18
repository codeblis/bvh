-- Campañas del panel. Dos audiencias que no se mezclan:
--
--   'lista' → gente que consintió un boletín. Lleva enlace de baja.
--   'curso' → gente con una relación con una edición (inscritos o lista de
--             espera). Es correo OPERATIVO sobre ese curso; no consintieron
--             marketing y por eso no reciben boletín ni enlace de baja
--             genérico.
--
-- La restricción de abajo hace que una campaña no pueda apuntar a las dos, y
-- que una campaña de curso nunca acabe apuntando a una lista por descuido.

create table public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  subject text not null check (char_length(btrim(subject)) between 2 and 160),
  body text not null check (char_length(btrim(body)) between 10 and 50000),
  audience_kind text not null check (audience_kind in ('lista', 'curso')),
  list_id uuid references public.newsletter_lists(id) on delete restrict,
  offering_id uuid references public.course_offerings(id) on delete restrict,
  offering_scope text check (offering_scope in ('inscritos', 'lista_espera', 'todos')),
  status text not null default 'borrador'
    check (status in ('borrador', 'enviando', 'enviada', 'fallida')),
  created_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_audience_check check (
    (audience_kind = 'lista'
      and list_id is not null
      and offering_id is null
      and offering_scope is null)
    or
    (audience_kind = 'curso'
      and offering_id is not null
      and offering_scope is not null
      and list_id is null)
  )
);

create index newsletter_campaigns_status_idx
  on public.newsletter_campaigns (status, created_at desc);

create trigger set_newsletter_campaigns_updated_at
  before update on public.newsletter_campaigns
  for each row execute function public.update_updated_at_column();

-- El destinatario se congela al enviar: quien se dé de baja después sigue
-- constando como destinatario de lo que ya salió, que es lo que ocurrió.
create table public.newsletter_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null
    references public.newsletter_campaigns(id) on delete cascade,
  email text not null,
  full_name text,
  subscriber_id uuid
    references public.newsletter_subscriptions(id) on delete set null,
  enrollment_id uuid
    references public.course_enrollments(id) on delete set null,
  unsubscribe_token uuid,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  provider_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, email)
);

create index newsletter_campaign_recipients_pending_idx
  on public.newsletter_campaign_recipients (campaign_id, status);

alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_campaign_recipients enable row level security;

grant select, insert, update, delete on table public.newsletter_campaigns to authenticated;
grant select on table public.newsletter_campaign_recipients to authenticated;

create policy "Administradores gestionan campañas"
  on public.newsletter_campaigns for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Administradores ven destinatarios"
  on public.newsletter_campaign_recipients for select
  to authenticated
  using (public.is_admin());

create trigger audit_newsletter_campaigns
  after insert or update or delete on public.newsletter_campaigns
  for each row execute function public.capture_audit_event();

-- Materializa la audiencia y cierra la campaña a edición. Se hace en una
-- transacción para que nadie pueda cambiar el destinatario a mitad de envío.
create or replace function public.prepare_campaign_recipients(p_campaign_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_campaign public.newsletter_campaigns%rowtype;
  v_inserted integer := 0;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select * into v_campaign from public.newsletter_campaigns
  where id = p_campaign_id for update;
  if not found then
    raise exception 'campaign_not_found';
  end if;
  if v_campaign.status <> 'borrador' then
    raise exception 'campaign_not_draft';
  end if;

  if v_campaign.audience_kind = 'lista' then
    -- Consentimiento vigente en la lista Y sin baja global.
    insert into public.newsletter_campaign_recipients (
      campaign_id, email, full_name, subscriber_id, unsubscribe_token
    )
    select
      p_campaign_id, s.email, s.full_name, s.id, l.unsubscribe_token
    from public.newsletter_list_subscriptions l
    join public.newsletter_subscriptions s on s.id = l.subscriber_id
    where l.list_id = v_campaign.list_id
      and l.is_active
      and s.is_active
    on conflict (campaign_id, email) do nothing;
  else
    insert into public.newsletter_campaign_recipients (
      campaign_id, email, full_name, enrollment_id
    )
    select
      p_campaign_id, p.email, p.full_name, e.id
    from public.course_enrollments e
    join public.profiles p on p.id = e.user_id
    where e.offering_id = v_campaign.offering_id
      and p.email is not null
      and (
        (v_campaign.offering_scope = 'inscritos'
          and e.status in ('confirmada', 'completada'))
        or (v_campaign.offering_scope = 'lista_espera'
          and e.status = 'lista_espera')
        or (v_campaign.offering_scope = 'todos'
          and e.status <> 'cancelada')
      )
    on conflict (campaign_id, email) do nothing;
  end if;

  get diagnostics v_inserted = row_count;

  update public.newsletter_campaigns
  set status = 'enviando'
  where id = p_campaign_id;

  return v_inserted;
end;
$$;

create or replace function public.record_campaign_delivery(
  p_recipient_id uuid,
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
  update public.newsletter_campaign_recipients set
    status = case when p_success then 'sent' else 'failed' end,
    attempts = attempts + 1,
    last_error = case when p_success then null else left(p_error, 500) end,
    provider_id = case when p_success then left(p_provider_id, 200) else null end,
    sent_at = case when p_success then now() else null end
  where id = p_recipient_id and status <> 'sent';
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

-- Cierra la campaña según lo que realmente ocurrió, no según lo que se quiso.
create or replace function public.finish_campaign(p_campaign_id uuid)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_pending integer;
  v_failed integer;
  v_status text;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select
    count(*) filter (where status = 'pending'),
    count(*) filter (where status = 'failed')
  into v_pending, v_failed
  from public.newsletter_campaign_recipients
  where campaign_id = p_campaign_id;

  v_status := case
    when v_pending > 0 then 'enviando'
    when v_failed > 0 then 'fallida'
    else 'enviada'
  end;

  update public.newsletter_campaigns set
    status = v_status,
    sent_at = case when v_status = 'enviada' then coalesce(sent_at, now()) else sent_at end
  where id = p_campaign_id;

  return v_status;
end;
$$;

revoke all on function public.prepare_campaign_recipients(uuid) from public, anon;
grant execute on function public.prepare_campaign_recipients(uuid) to authenticated;
revoke all on function public.finish_campaign(uuid) from public, anon;
grant execute on function public.finish_campaign(uuid) to authenticated;
revoke all on function public.record_campaign_delivery(uuid, boolean, text, text) from public;
revoke all on function public.record_campaign_delivery(uuid, boolean, text, text) from anon, authenticated;
grant execute on function public.record_campaign_delivery(uuid, boolean, text, text) to service_role;

comment on table public.newsletter_campaigns is
  'Campañas del panel. Una campaña apunta a una lista consentida o a una audiencia de curso, nunca a ambas.';
comment on function public.prepare_campaign_recipients(uuid) is
  'Congela la audiencia de una campaña en borrador y la pasa a enviando.';
