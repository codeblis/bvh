-- El rol solo cambia por la operación administrativa, nunca desde el cliente.
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '91000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'roles-admin@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Roles Admin","tipo":"empresa"}'::jsonb,
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '91000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'roles-user@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Roles User","tipo":"individual"}'::jsonb,
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '91000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'roles-other@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Roles Other","tipo":"individual"}'::jsonb,
    now(), now()
  );

update public.profiles set role = 'admin'
where id = '91000000-0000-0000-0000-000000000001';

-- Un usuario sin rol no puede promoverse ni promover a nadie.
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '91000000-0000-0000-0000-000000000002',
  true
);

select throws_ok(
  $$select public.set_profile_role(
      '91000000-0000-0000-0000-000000000002'::uuid, 'admin')$$,
  'forbidden',
  'un usuario sin rol no puede promoverse a administrador'
);
select throws_ok(
  $$select public.set_profile_role(
      '91000000-0000-0000-0000-000000000003'::uuid, 'admin')$$,
  'forbidden',
  'un usuario sin rol no puede promover a otra cuenta'
);
select throws_ok(
  $$update public.profiles set role = 'admin'
    where id = '91000000-0000-0000-0000-000000000002'$$,
  '42501',
  null,
  'la escritura directa de role está denegada por permisos de columna'
);
select is(
  (select role from public.profiles
   where id = '91000000-0000-0000-0000-000000000002'),
  'usuario',
  'el rol del usuario no cambió en ningún intento'
);

-- El anónimo ni siquiera puede ejecutar la operación.
reset role;
set local role anon;
select throws_ok(
  $$select public.set_profile_role(
      '91000000-0000-0000-0000-000000000003'::uuid, 'admin')$$,
  '42501',
  null,
  'un cliente anónimo no puede ejecutar el cambio de rol'
);

-- El administrador sí, sobre cuentas ajenas.
reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '91000000-0000-0000-0000-000000000001',
  true
);

select lives_ok(
  $$select public.set_profile_role(
      '91000000-0000-0000-0000-000000000002'::uuid, 'admin')$$,
  'un administrador promueve a otra cuenta'
);
select is(
  (select role from public.profiles
   where id = '91000000-0000-0000-0000-000000000002'),
  'admin',
  'la promoción quedó persistida'
);
select lives_ok(
  $$select public.set_profile_role(
      '91000000-0000-0000-0000-000000000002'::uuid, 'usuario')$$,
  'un administrador retira el rol de otra cuenta'
);

-- Nadie cambia su propio rol: así siempre queda un administrador en pie.
select throws_ok(
  $$select public.set_profile_role(
      '91000000-0000-0000-0000-000000000001'::uuid, 'usuario')$$,
  'self_role_change',
  'un administrador no puede cambiar su propio rol'
);
select throws_ok(
  $$select public.set_profile_role(
      '91000000-0000-0000-0000-000000000003'::uuid, 'editor')$$,
  'invalid_role',
  'un rol fuera de la lista permitida se rechaza'
);
select throws_ok(
  $$select public.set_profile_role(
      '99000000-0000-0000-0000-000000000009'::uuid, 'admin')$$,
  'profile_not_found',
  'una cuenta inexistente se rechaza sin tocar nada'
);

-- El cambio queda auditado con actor, recurso y rol, sin datos personales.
select is(
  (select count(*) from public.audit_events
   where resource_type = 'profiles'
     and resource_id = '91000000-0000-0000-0000-000000000002'
     and actor_id = '91000000-0000-0000-0000-000000000001'
     and metadata->>'old_role' = 'usuario'
     and metadata->>'new_role' = 'admin'),
  1::bigint,
  'la promoción queda registrada con actor y rol anterior y nuevo'
);

reset role;
select * from finish();
rollback;
