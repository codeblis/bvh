begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(28);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '71000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'rls-admin@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"RLS Admin","tipo":"empresa"}'::jsonb,
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '71000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'rls-user@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"RLS User","tipo":"individual"}'::jsonb,
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '71000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'rls-manipulated@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Manipulated User","tipo":"individual","role":"admin"}'::jsonb,
    now(), now()
  );

update public.profiles
set role = 'admin'
where id = '71000000-0000-0000-0000-000000000001';

insert into public.categories (id, name, slug)
values ('72000000-0000-0000-0000-000000000001', 'RLS', 'rls-test');

insert into public.articles (
  id, title, slug, excerpt, content, type, category_id, author_id, status,
  published_at
) values
  (
    '73000000-0000-0000-0000-000000000001', 'Public test',
    'rls-public-test', 'Published excerpt', 'Published body long enough.',
    'noticia', '72000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000001', 'publicado', now()
  ),
  (
    '73000000-0000-0000-0000-000000000002', 'Draft test',
    'rls-draft-test', 'Draft excerpt', 'Private draft body.',
    'noticia', '72000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000001', 'borrador', null
  );

insert into public.courses (id, title, slug, description, status)
values
  (
    '74000000-0000-0000-0000-000000000001', 'Active RLS course',
    'rls-active-course', 'Visible course', 'activo'
  ),
  (
    '74000000-0000-0000-0000-000000000002', 'Draft RLS course',
    'rls-draft-course', 'Private course', 'borrador'
  );

insert into public.course_offerings (
  id, course_id, starts_at, timezone, modality, capacity, status
) values
  (
    '75000000-0000-0000-0000-000000000001',
    '74000000-0000-0000-0000-000000000001', now() + interval '7 days',
    'America/Havana', 'online', 10, 'abierta'
  ),
  (
    '75000000-0000-0000-0000-000000000002',
    '74000000-0000-0000-0000-000000000002', null,
    'America/Havana', 'por_confirmar', 10, 'borrador'
  );

insert into public.course_enrollments (
  id, user_id, course_id, offering_id, status
) values
  (
    '76000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000002',
    '74000000-0000-0000-0000-000000000001',
    '75000000-0000-0000-0000-000000000001', 'confirmada'
  ),
  (
    '76000000-0000-0000-0000-000000000002',
    '71000000-0000-0000-0000-000000000001',
    '74000000-0000-0000-0000-000000000001',
    '75000000-0000-0000-0000-000000000001', 'confirmada'
  );

insert into public.contact_messages (
  id, name, email, subject, message, reference, notification_status
) values (
  '77000000-0000-0000-0000-000000000001', 'RLS Contact',
  'contact@example.test', 'RLS subject', 'RLS private message body.',
  'rls-contact-0001', 'pending'
);

insert into public.company_applications (
  id, company_name, tax_id, legal_representative, corporate_email, phone,
  sector, founding_year, description, accepted_terms_at, reference,
  notification_status
) values (
  '78000000-0000-0000-0000-000000000001', 'RLS Company', 'RLS-TAX-001',
  'RLS Representative', 'company@example.test', '+000000001', 'services',
  2015, 'Private RLS company application body.', now(),
  'rls-company-0001', 'pending'
);

insert into public.newsletter_subscriptions (
  id, email, full_name, source, consented_at, reference, notification_status
) values (
  '79000000-0000-0000-0000-000000000001', 'newsletter@example.test',
  'RLS Subscriber', 'rls-test', now(), 'rls-newsletter-0001', 'pending'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.record_form_notification(text,uuid,uuid,boolean,text,text)',
    'execute'
  ),
  'anon cannot execute internal notification RPC'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.submit_contact_message(text,text,text,text,text)',
    'execute'
  ),
  'anon cannot execute internal submission RPC'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.record_form_notification(text,uuid,uuid,boolean,text,text)',
    'execute'
  ),
  'authenticated cannot execute internal notification RPC'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.record_form_notification(text,uuid,uuid,boolean,text,text)',
    'execute'
  ),
  'service role can execute internal notification RPC'
);
select is(
  (select role from public.profiles
   where id = '71000000-0000-0000-0000-000000000003'),
  'usuario',
  'signup metadata cannot elevate role'
);

set local role anon;

select throws_ok(
  $$select * from public.profiles$$,
  '42501'
);
select results_eq(
  $$select slug from public.articles where slug like 'rls-%' order by slug$$,
  array['rls-public-test']::text[],
  'anon sees published articles only'
);
select results_eq(
  $$select slug from public.courses where slug like 'rls-%' order by slug$$,
  array['rls-active-course']::text[],
  'anon sees active courses only'
);
select results_eq(
  $$select id from public.course_offerings
    where id in (
      '75000000-0000-0000-0000-000000000001',
      '75000000-0000-0000-0000-000000000002'
    ) order by id$$,
  array['75000000-0000-0000-0000-000000000001'::uuid],
  'anon sees open offerings only'
);
select throws_ok(
  $$insert into public.contact_messages (name, email, subject, message)
    values ('Blocked', 'blocked@example.test', 'Blocked', 'Blocked message body')$$,
  '42501'
);
select throws_ok(
  $$select * from public.submit_contact_message(
    'Blocked', 'blocked@example.test', 'Blocked subject',
    'Blocked message body', 'blocked-reference'
  )$$,
  '42501'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '71000000-0000-0000-0000-000000000002',
  true
);

select results_eq(
  $$select id from public.profiles order by id$$,
  array['71000000-0000-0000-0000-000000000002'::uuid],
  'user sees own profile only'
);
select lives_ok(
  $$update public.profiles set full_name = 'Updated RLS User'
    where id = '71000000-0000-0000-0000-000000000002'$$,
  'user updates an allowed own-profile field'
);
select throws_ok(
  $$update public.profiles set role = 'admin'
    where id = '71000000-0000-0000-0000-000000000002'$$,
  '42501'
);
select is(
  (select role from public.profiles
   where id = '71000000-0000-0000-0000-000000000002'),
  'usuario',
  'user role remains unchanged'
);
select results_eq(
  $$select slug from public.articles where slug like 'rls-%' order by slug$$,
  array['rls-public-test']::text[],
  'normal user cannot see drafts'
);
select results_eq(
  $$select id from public.course_enrollments order by id$$,
  array['76000000-0000-0000-0000-000000000001'::uuid],
  'normal user sees own enrollment only'
);
select throws_ok(
  $$insert into public.course_enrollments (
      user_id, course_id, offering_id, status
    ) values (
      '71000000-0000-0000-0000-000000000002',
      '74000000-0000-0000-0000-000000000002',
      '75000000-0000-0000-0000-000000000002',
      'confirmada'
    )$$,
  '42501'
);
select throws_ok(
  $$select public.save_course_offering(
    '74000000-0000-0000-0000-000000000001',
    '{"modality":"online","currency":"USD","status":"borrador"}'::jsonb
  )$$,
  'P0001',
  'forbidden',
  'normal user cannot invoke admin offering mutation'
);
select throws_ok(
  $$select public.record_form_notification(
    'contact_message',
    '77000000-0000-0000-0000-000000000001',
    gen_random_uuid(), true, 'provider', null
  )$$,
  '42501'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '71000000-0000-0000-0000-000000000001',
  true
);

-- Un administrador ve las tres cuentas del escenario. Se cuentan por id para
-- que la prueba no dependa de los datos que existan en la base local.
select is(
  (select count(*) from public.profiles
   where id in (
     '71000000-0000-0000-0000-000000000001',
     '71000000-0000-0000-0000-000000000002',
     '71000000-0000-0000-0000-000000000003'
   )),
  3::bigint,
  'admin sees all profiles'
);
select is(
  (select count(*) from public.articles where slug like 'rls-%'),
  2::bigint,
  'admin sees published and draft articles'
);
select is(
  (select count(*) from public.course_enrollments
   where id in (
     '76000000-0000-0000-0000-000000000001',
     '76000000-0000-0000-0000-000000000002'
   )),
  2::bigint,
  'admin sees all enrollments'
);
select is(
  (select count(*) from public.contact_messages
   where id = '77000000-0000-0000-0000-000000000001'),
  1::bigint,
  'admin sees contact forms'
);
select is(
  (select count(*) from public.newsletter_subscriptions
   where id = '79000000-0000-0000-0000-000000000001'),
  1::bigint,
  'admin sees newsletter records'
);
select ok(
  (select count(*) > 0 from public.audit_events),
  'admin sees audit events'
);
select lives_ok(
  $$insert into public.articles (
      title, slug, excerpt, content, type, status, published_at
    ) values (
      'Admin insertion', 'rls-admin-insertion', 'Admin excerpt',
      'Admin article body.', 'blog', 'publicado', now()
    )$$,
  'admin can create editorial content'
);
select is(
  (select count(*) from public.audit_events
   where resource_type = 'articles'
     and resource_id = (
       select id from public.articles where slug = 'rls-admin-insertion'
     )
     and actor_id = '71000000-0000-0000-0000-000000000001'),
  1::bigint,
  'admin editorial mutation records actor and resource'
);

reset role;
select * from finish();
rollback;
