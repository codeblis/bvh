begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(15);

insert into auth.users (id, email, raw_user_meta_data) values
 ('a1000000-0000-0000-0000-000000000001', 'camp-admin@example.test', '{"nombre":"Admin","tipo":"individual"}'),
 ('a1000000-0000-0000-0000-000000000002', 'camp-lector@example.test', '{"nombre":"Lector","tipo":"individual"}'),
 ('a1000000-0000-0000-0000-000000000003', 'camp-alumno@example.test', '{"nombre":"Alumno","tipo":"individual"}'),
 ('a1000000-0000-0000-0000-000000000004', 'camp-espera@example.test', '{"nombre":"Espera","tipo":"individual"}');
update public.profiles set role = 'admin'
 where id = 'a1000000-0000-0000-0000-000000000001';

-- Dos suscriptores de la lista de noticias: uno vigente y otro con baja global.
insert into public.newsletter_subscriptions (id, email, full_name, is_active) values
 ('a2000000-0000-0000-0000-000000000001', 'vigente@example.test', 'Vigente', true),
 ('a2000000-0000-0000-0000-000000000002', 'baja-global@example.test', 'Baja', false),
 ('a2000000-0000-0000-0000-000000000003', 'baja-lista@example.test', 'Lista', true);
insert into public.newsletter_list_subscriptions (subscriber_id, list_id, is_active)
select s.id, (select id from public.newsletter_lists where slug = 'noticias'), s.active
from (values
  ('a2000000-0000-0000-0000-000000000001'::uuid, true),
  ('a2000000-0000-0000-0000-000000000002'::uuid, true),
  ('a2000000-0000-0000-0000-000000000003'::uuid, false)
) as s(id, active);

insert into public.courses (id, title, slug, status) values
 ('a3000000-0000-0000-0000-000000000001', 'Curso campañas', 'campaign-course', 'activo');
insert into public.course_offerings (id, course_id, status) values
 ('a4000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 'abierta');
insert into public.course_enrollments (user_id, course_id, offering_id, status) values
 ('a1000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000001', 'confirmada'),
 ('a1000000-0000-0000-0000-000000000004', 'a3000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000001', 'lista_espera');

-- Una campaña no puede apuntar a una lista y a un curso a la vez.
select throws_ok(
  $$insert into public.newsletter_campaigns
      (reference, subject, body, audience_kind, list_id, offering_id, offering_scope)
    values ('BVH-CAMP-MIX', 'Mezcla', 'Cuerpo suficientemente largo.', 'lista',
      (select id from public.newsletter_lists where slug = 'noticias'),
      'a4000000-0000-0000-0000-000000000001', 'inscritos')$$,
  '23514',
  NULL,
  'a campaign cannot target a list and a course at once'
);
-- Ni una de curso quedarse sin destinatario concreto.
select throws_ok(
  $$insert into public.newsletter_campaigns
      (reference, subject, body, audience_kind, offering_id)
    values ('BVH-CAMP-NOSCOPE', 'Sin alcance', 'Cuerpo suficientemente largo.',
      'curso', 'a4000000-0000-0000-0000-000000000001')$$,
  '23514',
  NULL,
  'a course campaign must say who it targets'
);

insert into public.newsletter_campaigns
  (id, reference, subject, body, audience_kind, list_id)
values
  ('a5000000-0000-0000-0000-000000000001', 'BVH-CAMP-0001', 'Boletín',
   'Cuerpo del boletín, suficientemente largo.', 'lista',
   (select id from public.newsletter_lists where slug = 'noticias'));
insert into public.newsletter_campaigns
  (id, reference, subject, body, audience_kind, offering_id, offering_scope)
values
  ('a5000000-0000-0000-0000-000000000002', 'BVH-CAMP-0002', 'Aviso del curso',
   'El aula cambia, aviso operativo.', 'curso',
   'a4000000-0000-0000-0000-000000000001', 'lista_espera');

-- Quien no es administrador no puede preparar ni cerrar una campaña.
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000002', true);
select throws_ok(
  $$select public.prepare_campaign_recipients('a5000000-0000-0000-0000-000000000001')$$,
  'forbidden',
  'a non-admin cannot prepare a campaign'
);
select throws_ok(
  $$select public.finish_campaign('a5000000-0000-0000-0000-000000000001')$$,
  'forbidden',
  'a non-admin cannot close a campaign'
);
reset role;
select ok(
  not has_function_privilege('authenticated', 'public.record_campaign_delivery(uuid, boolean, text, text)', 'execute'),
  'the panel cannot write delivery results directly'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true);

-- Lista: entra el consentimiento vigente; no entran la baja de lista ni la global.
select is(
  public.prepare_campaign_recipients('a5000000-0000-0000-0000-000000000001'),
  1,
  'only the live consent becomes a recipient'
);
reset role;
select results_eq(
  $$select email from public.newsletter_campaign_recipients
    where campaign_id = 'a5000000-0000-0000-0000-000000000001'$$,
  array['vigente@example.test'],
  'neither the list opt-out nor the global opt-out receives the campaign'
);
select is(
  (select status from public.newsletter_campaigns
   where id = 'a5000000-0000-0000-0000-000000000001'),
  'enviando',
  'preparing a campaign closes it to edits'
);
select isnt(
  (select unsubscribe_token from public.newsletter_campaign_recipients
   where campaign_id = 'a5000000-0000-0000-0000-000000000001'),
  null,
  'a list recipient carries its unsubscribe token'
);

-- Preparar dos veces no reabre ni duplica.
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true);
select throws_ok(
  $$select public.prepare_campaign_recipients('a5000000-0000-0000-0000-000000000001')$$,
  'campaign_not_draft',
  'a campaign is not prepared twice'
);

-- Curso: solo la lista de espera, y sin token de baja porque no es boletín.
select is(
  public.prepare_campaign_recipients('a5000000-0000-0000-0000-000000000002'),
  1,
  'the course scope selects only the waiting list'
);
reset role;
select results_eq(
  $$select email from public.newsletter_campaign_recipients
    where campaign_id = 'a5000000-0000-0000-0000-000000000002'$$,
  array['camp-espera@example.test'],
  'the enrolled student is not in a waiting-list campaign'
);
select is(
  (select unsubscribe_token from public.newsletter_campaign_recipients
   where campaign_id = 'a5000000-0000-0000-0000-000000000002'),
  null,
  'an operational course notice carries no newsletter unsubscribe token'
);

-- El cierre refleja lo ocurrido, no lo pretendido.
select is(
  public.record_campaign_delivery(
    (select id from public.newsletter_campaign_recipients
     where campaign_id = 'a5000000-0000-0000-0000-000000000002'),
    false, null, 'rechazo sintético'),
  true,
  'a failed delivery is recorded'
);
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true);
select is(
  public.finish_campaign('a5000000-0000-0000-0000-000000000002'),
  'fallida',
  'a campaign with failures does not close as delivered'
);
reset role;

select * from finish();
rollback;
