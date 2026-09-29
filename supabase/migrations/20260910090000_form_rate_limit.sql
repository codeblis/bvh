-- Límite de envíos por cliente y ruta. Vive en la base y no en memoria del
-- proceso a propósito: en Cloudflare cada isolate tendría su propio contador y
-- el límite sería una ilusión. Aquí el conteo es el mismo para todos.
--
-- La clave del cubo es un hash que calcula la aplicación: la base nunca ve una
-- dirección IP.

create table if not exists public.form_rate_limit (
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, window_start)
);

create index if not exists form_rate_limit_window_idx
  on public.form_rate_limit (window_start);

alter table public.form_rate_limit enable row level security;
revoke all on table public.form_rate_limit from anon, authenticated;

comment on table public.form_rate_limit is
  'Contadores por ventana para limitar envíos públicos. La clave es un hash; no guarda direcciones IP.';

create or replace function public.check_form_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_window timestamptz;
  current_hits integer;
begin
  if p_bucket is null or p_bucket = '' then
    raise exception 'invalid_bucket';
  end if;
  if p_limit is null or p_limit < 1 then
    raise exception 'invalid_limit';
  end if;
  if p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'invalid_window';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.form_rate_limit (bucket, window_start, hits)
  values (p_bucket, current_window, 1)
  on conflict (bucket, window_start)
    do update set hits = public.form_rate_limit.hits + 1
  returning hits into current_hits;

  -- Limpieza oportunista: las ventanas viejas ya no deciden nada.
  delete from public.form_rate_limit
  where window_start < now() - interval '1 day';

  return current_hits <= p_limit;
end;
$$;

revoke all on function public.check_form_rate_limit(text, integer, integer) from public;
revoke all on function public.check_form_rate_limit(text, integer, integer) from anon, authenticated;
grant execute on function public.check_form_rate_limit(text, integer, integer) to service_role;

comment on function public.check_form_rate_limit(text, integer, integer) is
  'Cuenta un intento en la ventana actual y responde si sigue dentro del límite. Solo service_role.';
