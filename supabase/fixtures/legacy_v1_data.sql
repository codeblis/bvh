-- Datos sintéticos representativos del esquema anterior a 20260904090000.
-- Solo deben cargarse en la base local desechable detenida en 20260901160000.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'legacy-admin@example.test',
    crypt('local-test-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Legacy Admin","tipo":"empresa"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'legacy-user@example.test',
    crypt('local-test-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Legacy User","tipo":"individual"}'::jsonb,
    now(),
    now()
  );

update public.profiles
set role = 'admin'
where id = '10000000-0000-0000-0000-000000000001';

update public.courses
set
  status = case slug
    when 'finanzas-corporativas-avanzadas' then 'completado'
    when 'gobernanza-corporativa-mipymes' then 'inactivo'
    else 'activo'
  end,
  end_date = case
    when slug = 'finanzas-corporativas-avanzadas' then start_date + 30
    else end_date
  end;

insert into public.course_enrollments (
  id,
  user_id,
  course_id,
  status,
  enrolled_at,
  completed_at
)
select
  '20000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000002'::uuid,
  id,
  'inscrito',
  '2026-08-01 12:00:00+00'::timestamptz,
  null
from public.courses
where slug = 'introduccion-mercado-capitales'
union all
select
  '20000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000002'::uuid,
  id,
  'completado',
  '2026-07-01 12:00:00+00'::timestamptz,
  '2026-08-01 12:00:00+00'::timestamptz
from public.courses
where slug = 'finanzas-corporativas-avanzadas';

insert into public.articles (
  id,
  title,
  slug,
  excerpt,
  content,
  featured_image,
  type,
  author_id,
  status,
  published_at
) values
  (
    '30000000-0000-0000-0000-000000000001',
    'Borrador heredado',
    'borrador-heredado',
    'Contenido sintético previo a la migración.',
    'Este borrador permite verificar que la actualización no publica contenido privado.',
    'https://example.test/legacy-cover.jpg',
    'blog',
    '10000000-0000-0000-0000-000000000001',
    'borrador',
    null
  );

insert into public.contact_messages (
  id,
  name,
  email,
  subject,
  message,
  status
) values (
  '40000000-0000-0000-0000-000000000001',
  'Contacto legado',
  'contact@example.test',
  'Mensaje previo',
  'Mensaje sintético para validar conservación y estados de entrega.',
  'pendiente'
);

insert into public.company_applications (
  id,
  company_name,
  tax_id,
  legal_representative,
  corporate_email,
  phone,
  sector,
  founding_year,
  employee_count,
  description,
  wants_advisor_contact,
  status
) values (
  '50000000-0000-0000-0000-000000000001',
  'Empresa Legada SA',
  'TEST-LEGACY-001',
  'Representante Sintético',
  'company@example.test',
  '+0000000000',
  'servicios',
  2010,
  25,
  'Solicitud sintética creada antes de las migraciones V1.',
  true,
  'nueva'
);

insert into public.newsletter_subscriptions (
  id,
  email,
  full_name,
  profile,
  source,
  is_active,
  subscribed_at
) values (
  '60000000-0000-0000-0000-000000000001',
  'newsletter@example.test',
  'Suscriptor Legado',
  'inversionista',
  'legacy-fixture',
  true,
  '2026-08-15 12:00:00+00'::timestamptz
);
