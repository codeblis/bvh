begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(17);

-- Las RPC del newsletter son internas: solo el cliente server-only las cruza.
select ok(
  not has_function_privilege('anon', 'public.submit_newsletter_subscription(text, text, text, text, text, text)', 'execute'),
  'anon cannot subscribe directly'
);
select ok(
  not has_function_privilege('authenticated', 'public.submit_newsletter_subscription(text, text, text, text, text, text)', 'execute'),
  'an authenticated user cannot subscribe directly'
);
select ok(
  not has_function_privilege('anon', 'public.unsubscribe_newsletter_all(uuid)', 'execute'),
  'anon cannot trigger a global opt-out'
);
select is(
  (select count(*) from public.newsletter_lists where is_active),
  3::bigint,
  'the three V1 lists exist and are active'
);

-- Nombrar una lista inexistente no deposita consentimiento en ninguna parte.
select throws_ok(
  $$select public.submit_newsletter_subscription(
      'listas@example.test', 'Persona', '', 'prueba', 'BVH-NEWS-0001', 'inventada')$$,
  '22023',
  'unknown newsletter list',
  'an unknown list is rejected'
);

create temporary table alta_noticias on commit drop as
  select * from public.submit_newsletter_subscription(
    'listas@example.test', 'Persona', 'Inversor', 'prueba', 'BVH-NEWS-0001', 'noticias');
create temporary table alta_blog on commit drop as
  select * from public.submit_newsletter_subscription(
    'LISTAS@example.test', '', '', 'prueba', 'BVH-NEWS-0002', 'blog');

select is((select should_notify from alta_noticias), true, 'a new list subscription is notified');
select is((select should_notify from alta_blog), true, 'the second list is notified on its own');
select is(
  (select count(*) from public.newsletter_subscriptions where email = 'listas@example.test'),
  1::bigint,
  'the same person is not duplicated by a second list'
);
select is(
  (select count(*) from public.newsletter_list_subscriptions l
     join public.newsletter_subscriptions s on s.id = l.subscriber_id
   where s.email = 'listas@example.test' and l.is_active),
  2::bigint,
  'two independent consents are recorded'
);
select isnt(
  (select unsubscribe_token from public.newsletter_list_subscriptions
   where id = (select submission_id from alta_noticias)),
  (select unsubscribe_token from public.newsletter_list_subscriptions
   where id = (select submission_id from alta_blog)),
  'each list carries its own unsubscribe token'
);

-- Repetir un alta ya activa no encola otro correo.
create temporary table alta_repetida on commit drop as
  select * from public.submit_newsletter_subscription(
    'listas@example.test', '', '', 'prueba', 'BVH-NEWS-0003', 'noticias');
select is((select should_notify from alta_repetida), false, 'an active consent is not renotified');

-- Baja de una lista: la otra sobrevive.
select is(
  public.unsubscribe_newsletter(
    (select unsubscribe_token from public.newsletter_list_subscriptions
     where id = (select submission_id from alta_noticias))),
  true,
  'the list token unsubscribes its own list'
);
select is(
  (select is_active from public.newsletter_list_subscriptions
   where id = (select submission_id from alta_noticias)),
  false,
  'the unsubscribed list is inactive'
);
select is(
  (select is_active from public.newsletter_list_subscriptions
   where id = (select submission_id from alta_blog)),
  true,
  'the other list is untouched'
);

-- Baja global: silencia lo que quede y marca a la persona.
select is(
  public.unsubscribe_newsletter_all(
    (select unsubscribe_token from public.newsletter_list_subscriptions
     where id = (select submission_id from alta_blog))),
  true,
  'any valid token can trigger the global opt-out'
);
select is(
  (select bool_or(l.is_active) from public.newsletter_list_subscriptions l
     join public.newsletter_subscriptions s on s.id = l.subscriber_id
   where s.email = 'listas@example.test'),
  false,
  'no list survives a global opt-out'
);
select is(
  (select is_active from public.newsletter_subscriptions
   where email = 'listas@example.test'),
  false,
  'the person is marked as globally opted out'
);

select * from finish();
rollback;
