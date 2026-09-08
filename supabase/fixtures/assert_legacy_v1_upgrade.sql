-- Aserciones reproducibles para la actualización del fixture heredado V1.

do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.profiles
  where id in (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002'
  );
  if v_count <> 2 then
    raise exception 'legacy profiles were not preserved';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = '10000000-0000-0000-0000-000000000001'
      and role = 'admin'
      and account_type = 'empresa'
  ) then
    raise exception 'legacy admin profile changed unexpectedly';
  end if;

  if not exists (
    select 1
    from public.courses c
    join public.course_offerings o on o.course_id = c.id
    where c.slug = 'introduccion-mercado-capitales'
      and c.status = 'activo'
      and o.status = 'abierta'
      and o.capacity = 60
  ) then
    raise exception 'active legacy course was not mapped to an open offering';
  end if;

  if not exists (
    select 1
    from public.courses c
    join public.course_offerings o on o.course_id = c.id
    where c.slug = 'finanzas-corporativas-avanzadas'
      and c.status = 'archivado'
      and o.status = 'finalizada'
      and o.ends_at > o.starts_at
  ) then
    raise exception 'completed legacy course was not mapped correctly';
  end if;

  if not exists (
    select 1
    from public.courses c
    join public.course_offerings o on o.course_id = c.id
    where c.slug = 'gobernanza-corporativa-mipymes'
      and c.status = 'borrador'
      and o.status = 'borrador'
  ) then
    raise exception 'inactive legacy course was not mapped correctly';
  end if;

  select count(*) into v_count
  from public.course_enrollments
  where id in (
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002'
  ) and offering_id is not null;
  if v_count <> 2 then
    raise exception 'legacy enrollments were not mapped to offerings';
  end if;

  if not exists (
    select 1 from public.course_enrollments
    where id = '20000000-0000-0000-0000-000000000001'
      and status = 'confirmada'
  ) or not exists (
    select 1 from public.course_enrollments
    where id = '20000000-0000-0000-0000-000000000002'
      and status = 'completada'
  ) then
    raise exception 'legacy enrollment statuses were not preserved semantically';
  end if;

  if not exists (
    select 1 from public.articles
    where id = '30000000-0000-0000-0000-000000000001'
      and status = 'borrador'
      and featured_image_path = 'https://example.test/legacy-cover.jpg'
      and featured_image_alt = 'Portada de Borrador heredado'
  ) then
    raise exception 'legacy editorial draft or cover was changed unexpectedly';
  end if;

  if not exists (
    select 1 from public.contact_messages
    where id = '40000000-0000-0000-0000-000000000001'
      and status = 'pendiente'
      and notification_status = 'unknown'
      and notification_attempts = 0
  ) then
    raise exception 'legacy contact message was not preserved';
  end if;

  if not exists (
    select 1 from public.company_applications
    where id = '50000000-0000-0000-0000-000000000001'
      and status = 'nueva'
      and notification_status = 'unknown'
      and notification_attempts = 0
  ) then
    raise exception 'legacy company application was not preserved';
  end if;

  if not exists (
    select 1 from public.newsletter_subscriptions
    where id = '60000000-0000-0000-0000-000000000001'
      and is_active is true
      and notification_status = 'unknown'
      and notification_attempts = 0
      and unsubscribe_token is not null
  ) then
    raise exception 'legacy newsletter subscription was not preserved';
  end if;
end
$$;

select 'legacy_v1_upgrade_ok' as result;
