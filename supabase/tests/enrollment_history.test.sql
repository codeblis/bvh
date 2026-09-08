begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(10);

insert into auth.users (id, email, raw_user_meta_data) values
 ('91000000-0000-0000-0000-000000000001', 'history-one@example.test', '{"nombre":"Historial uno","tipo":"individual"}'),
 ('91000000-0000-0000-0000-000000000002', 'history-two@example.test', '{"nombre":"Historial dos","tipo":"individual"}');
insert into public.courses (id, title, slug, status) values
 ('92000000-0000-0000-0000-000000000001', 'Curso histórico', 'history-test-one', 'archivado'),
 ('92000000-0000-0000-0000-000000000002', 'Curso ajeno', 'history-test-two', 'borrador');
insert into public.course_offerings (id, course_id, status) values
 ('93000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', 'cerrada'),
 ('93000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000002', 'cancelada');
insert into public.course_enrollments (user_id, course_id, offering_id, status) values
 ('91000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001', 'completada'),
 ('91000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000002', '93000000-0000-0000-0000-000000000002', 'cancelada');

select ok(not has_function_privilege('anon', 'public.get_my_course_enrollments()', 'execute'), 'anon has no history grant');
set local role anon;
select throws_ok('select * from public.get_my_course_enrollments()', '42501');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '', true);
select is((select count(*) from public.get_my_course_enrollments()), 0::bigint, 'missing identity yields no history');
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000001', true);
select results_eq('select course_title from public.get_my_course_enrollments()', array['Curso histórico'], 'own archived title survives closure');
select results_eq('select status from public.get_my_course_enrollments()', array['completada'], 'enrollment status survives closure');
select results_eq('select offering_status from public.get_my_course_enrollments()', array['cerrada'], 'closed offering state is explicit');
select is((select count(*) from public.courses where slug like 'history-test-%'), 0::bigint, 'private catalog rows remain hidden by RLS');
select is((select count(*) from public.course_offerings where id in ('93000000-0000-0000-0000-000000000001','93000000-0000-0000-0000-000000000002')), 0::bigint, 'private offering rows remain hidden by RLS');
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000002', true);
select results_eq('select course_title from public.get_my_course_enrollments()', array['Curso ajeno'], 'another user receives only their own history');
select results_eq('select offering_status from public.get_my_course_enrollments()', array['cancelada'], 'canceled offering state survives');

reset role;
select * from finish();
rollback;
