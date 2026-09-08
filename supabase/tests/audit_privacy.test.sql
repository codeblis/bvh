-- Auditoría: registra quién cambió qué sin copiar cuerpos personales.
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '81000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'audit-admin@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Audit Admin","tipo":"empresa"}'::jsonb,
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '81000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'audit-user@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Audit User","tipo":"individual"}'::jsonb,
    now(), now()
  );

update public.profiles set role = 'admin'
where id = '81000000-0000-0000-0000-000000000001';

insert into public.courses (id, title, slug, description, status)
values (
  '84000000-0000-0000-0000-000000000001', 'Audit course',
  'audit-course', 'Curso para auditoría', 'activo'
);

insert into public.course_offerings (
  id, course_id, starts_at, timezone, modality, capacity, status
) values (
  '85000000-0000-0000-0000-000000000001',
  '84000000-0000-0000-0000-000000000001', now() + interval '7 days',
  'America/Havana', 'online', 10, 'abierta'
);

insert into public.course_enrollments (
  id, user_id, course_id, offering_id, status
) values (
  '86000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000002',
  '84000000-0000-0000-0000-000000000001',
  '85000000-0000-0000-0000-000000000001', 'pendiente'
);

delete from public.audit_events;

-- Un cambio de datos personales del perfil queda registrado como hecho, no
-- como copia: el nombre y el teléfono no viajan a la auditoría.
update public.profiles
set full_name = 'Nombre Personal Auditado',
    email = 'personal.auditado@example.test'
where id = '81000000-0000-0000-0000-000000000002';

select is(
  (select count(*) from public.audit_events
   where resource_type = 'profiles'
     and resource_id = '81000000-0000-0000-0000-000000000002'),
  1::bigint,
  'el cambio de perfil deja exactamente un evento'
);

select is(
  (select count(*) from jsonb_object_keys(
     (select metadata from public.audit_events
      where resource_type = 'profiles' limit 1)
   ) as k
   where k not in ('old_role', 'new_role')),
  0::bigint,
  'el evento de perfil solo puede describir el rol, ningún otro campo'
);

select is(
  (select count(*) from public.audit_events
   where metadata::text like '%Nombre Personal Auditado%'
      or metadata::text like '%personal.auditado@example.test%'),
  0::bigint,
  'la auditoría no copia nombre ni correo'
);

-- Un cambio de estado sí se describe, porque es el hecho auditado.
update public.course_enrollments set status = 'confirmada'
where id = '86000000-0000-0000-0000-000000000001';

select is(
  (select metadata->>'old_status' from public.audit_events
   where resource_type = 'course_enrollments' limit 1),
  'pendiente',
  'la auditoría conserva el estado anterior de la inscripción'
);
select is(
  (select metadata->>'new_status' from public.audit_events
   where resource_type = 'course_enrollments' limit 1),
  'confirmada',
  'la auditoría conserva el estado nuevo de la inscripción'
);

select is(
  (select count(*) from public.audit_events e,
     lateral jsonb_object_keys(e.metadata) as k
   where k not in ('old_status', 'new_status', 'old_role', 'new_role')),
  0::bigint,
  'ningún evento guarda claves distintas del estado o el rol'
);

select is(
  (select count(*) from public.audit_events
   where resource_id is null),
  0::bigint,
  'todo evento identifica el recurso afectado'
);

-- Solo los administradores consultan la auditoría.
reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-0000-0000-000000000002',
  true
);
select is(
  (select count(*) from public.audit_events),
  0::bigint,
  'un usuario autenticado sin rol no lee auditoría'
);

reset role;
set local role anon;
select throws_ok(
  $$select count(*) from public.audit_events$$,
  '42501',
  null,
  'un cliente anónimo ni siquiera puede consultar la auditoría'
);

reset role;
select * from finish();
rollback;
