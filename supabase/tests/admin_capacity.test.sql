begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(7);

insert into auth.users (id, email) values
 ('94000000-0000-0000-0000-000000000001', 'capacity-admin@example.test'),
 ('94000000-0000-0000-0000-000000000002', 'capacity-student@example.test');
update public.profiles set role = 'admin' where id = '94000000-0000-0000-0000-000000000001';
insert into public.courses (id, title, slug, status) values
 ('95000000-0000-0000-0000-000000000001', 'Capacidad admin', 'capacity-admin-test', 'activo');
insert into public.course_offerings (id, course_id, capacity, status) values
 ('96000000-0000-0000-0000-000000000001', '95000000-0000-0000-0000-000000000001', 1, 'abierta');
insert into public.course_enrollments (id, user_id, course_id, offering_id, status) values
 ('97000000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000001', '95000000-0000-0000-0000-000000000001', '96000000-0000-0000-0000-000000000001', 'confirmada'),
 ('97000000-0000-0000-0000-000000000002', '94000000-0000-0000-0000-000000000002', '95000000-0000-0000-0000-000000000001', '96000000-0000-0000-0000-000000000001', 'cancelada');

set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000001', true);
select throws_ok($$select public.update_course_enrollment_status('97000000-0000-0000-0000-000000000002', 'completada')$$, 'P0001', 'course_full', 'completion cannot overbook');
select throws_ok($$select public.update_course_enrollment_status('97000000-0000-0000-0000-000000000002', 'confirmada')$$, 'P0001', 'course_full', 'confirmation cannot overbook');
select throws_ok($$update public.course_enrollments set status = 'completada' where id = '97000000-0000-0000-0000-000000000002'$$, '42501');
select throws_ok($$update public.course_offerings set capacity = 0 where id = '96000000-0000-0000-0000-000000000001'$$, '42501');
select lives_ok($$update public.course_offerings set status = 'cerrada' where id = '96000000-0000-0000-0000-000000000001'$$, 'admin can still close offerings');
select lives_ok($$select public.update_course_enrollment_status('97000000-0000-0000-0000-000000000001', 'completada')$$, 'existing confirmed participant can complete at capacity');
select is((select count(*) from public.course_enrollments where offering_id = '96000000-0000-0000-0000-000000000001' and status in ('confirmada','completada')), 1::bigint, 'capacity remains one');

reset role;
select * from finish();
rollback;
