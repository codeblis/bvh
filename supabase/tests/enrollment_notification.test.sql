begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(17);

insert into auth.users (id, email, raw_user_meta_data) values
 ('94000000-0000-0000-0000-000000000001', 'aviso-uno@example.test', '{"nombre":"Aviso uno","tipo":"individual"}'),
 ('94000000-0000-0000-0000-000000000002', 'aviso-dos@example.test', '{"nombre":"Aviso dos","tipo":"individual"}');
insert into public.courses (id, title, slug, status) values
 ('95000000-0000-0000-0000-000000000001', 'Curso con aviso', 'notification-test-one', 'activo');
insert into public.course_offerings (id, course_id, status, capacity) values
 ('96000000-0000-0000-0000-000000000001', '95000000-0000-0000-0000-000000000001', 'abierta', 5);

select ok(
  not has_function_privilege('authenticated', 'public.record_form_notification(text, uuid, uuid, boolean, text, text)', 'execute'),
  'authenticated cannot close a notification cycle'
);
select ok(
  has_function_privilege('authenticated', 'public.enroll_in_course(uuid, text)', 'execute'),
  'the enrolling role keeps its grant'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000001', true);

-- Alta con referencia: abre ciclo de aviso.
create temporary table first_call on commit drop as
  select * from public.enroll_in_course('96000000-0000-0000-0000-000000000001', 'BVH-INS-AAAAAAAA');

select is((select should_notify from first_call), true, 'a fresh enrollment asks for its email');
select isnt((select notification_token from first_call), null, 'a fresh enrollment carries a capability token');

reset role;
select is(
  (select notification_status from public.course_enrollments where id = (select enrollment_id from first_call)),
  'pending',
  'the row records the email as pending'
);
select is(
  (select reference from public.course_enrollments where id = (select enrollment_id from first_call)),
  'BVH-INS-AAAAAAAA',
  'the reference is stored for the retry path'
);

-- Segunda alta del mismo usuario: idempotente y sin correo nuevo.
set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000001', true);
create temporary table second_call on commit drop as
  select * from public.enroll_in_course('96000000-0000-0000-0000-000000000001', 'BVH-INS-BBBBBBBB');

select is(
  (select enrollment_id from second_call),
  (select enrollment_id from first_call),
  'enrolling twice returns the same enrollment'
);
select is((select should_notify from second_call), false, 'enrolling twice does not queue a second email');
reset role;
select is(
  (select reference from public.course_enrollments where id = (select enrollment_id from first_call)),
  'BVH-INS-AAAAAAAA',
  'the second attempt does not overwrite the first reference'
);

-- Cierre del ciclo: solo el token correcto lo cierra, y solo una vez.
select is(
  public.record_form_notification(
    'course_enrollment',
    (select enrollment_id from first_call),
    gen_random_uuid(),
    true,
    'provider-id'
  ),
  false,
  'a wrong token closes nothing'
);
select is(
  public.record_form_notification(
    'course_enrollment',
    (select enrollment_id from first_call),
    (select notification_token from first_call),
    true,
    'provider-id'
  ),
  true,
  'the issued token closes the cycle'
);
select row_eq(
  $$select notification_status, notification_attempts, notification_token
    from public.course_enrollments
    where id = (select enrollment_id from first_call)$$,
  row('sent'::text, 1::integer, null::uuid),
  'a delivered email is recorded once and burns its token'
);
select is(
  public.record_form_notification(
    'course_enrollment',
    (select enrollment_id from first_call),
    (select notification_token from first_call),
    true,
    'provider-id'
  ),
  false,
  'the same token cannot close the cycle twice'
);

-- El reintento administrativo: ni escritura directa, ni reapertura de lo enviado.
select ok(
  not has_table_privilege('authenticated', 'public.course_enrollments', 'update'),
  'the panel cannot write enrollments directly'
);
update public.profiles set role = 'admin'
 where id = '94000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000001', true);
select is(
  public.record_enrollment_notification_retry(
    (select enrollment_id from first_call), 'BVH-INS-AAAAAAAA', true, 'provider-id'
  ),
  false,
  'a delivered notice is not reopened by a retry'
);
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000002', true);
select throws_ok(
  $$select public.record_enrollment_notification_retry(
      '00000000-0000-0000-0000-000000000000'::uuid, null, true, null)$$,
  'forbidden',
  'a non-admin cannot retry a notice'
);
reset role;

-- La forma de un argumento no promete ningún correo.
set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000002', true);
create temporary table wrapper_call on commit drop as
  select public.enroll_in_course('96000000-0000-0000-0000-000000000001') as enrollment_id;
reset role;
select is(
  (select notification_status from public.course_enrollments
   where user_id = '94000000-0000-0000-0000-000000000002'),
  'unknown',
  'enrolling without a reference leaves no email promised'
);

select * from finish();
rollback;
