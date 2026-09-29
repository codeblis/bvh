-- El contador de envíos vive en la base para que sea el mismo para todos los
-- procesos, y solo lo puede consultar el rol de servicio.
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

delete from public.form_rate_limit where bucket like 'prueba:%';

-- Dentro del límite: los tres primeros intentos pasan.
select ok(
  public.check_form_rate_limit('prueba:contacto', 3, 300),
  'el primer intento entra'
);
select ok(
  public.check_form_rate_limit('prueba:contacto', 3, 300),
  'el segundo intento entra'
);
select ok(
  public.check_form_rate_limit('prueba:contacto', 3, 300),
  'el tercero, justo en el límite, entra'
);
select ok(
  not public.check_form_rate_limit('prueba:contacto', 3, 300),
  'el cuarto excede y se rechaza'
);

-- Cada cliente y cada ruta cuentan por separado.
select ok(
  public.check_form_rate_limit('prueba:newsletter', 3, 300),
  'otra ruta del mismo cliente conserva su propio cupo'
);
select ok(
  public.check_form_rate_limit('prueba:contacto-otro-cliente', 3, 300),
  'otro cliente en la misma ruta conserva su propio cupo'
);

-- Argumentos imposibles se rechazan en vez de degradar el límite en silencio.
select throws_ok(
  $$select public.check_form_rate_limit('', 3, 300)$$,
  'invalid_bucket',
  'una clave vacía se rechaza'
);
select throws_ok(
  $$select public.check_form_rate_limit('prueba:x', 0, 300)$$,
  'invalid_limit',
  'un límite de cero se rechaza'
);

-- La tabla no es consultable desde el cliente.
reset role;
set local role anon;
select throws_ok(
  $$select count(*) from public.form_rate_limit$$,
  '42501',
  null,
  'un cliente anónimo no puede leer los contadores'
);

reset role;
select * from finish();
rollback;
