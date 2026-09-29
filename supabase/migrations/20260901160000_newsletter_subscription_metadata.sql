-- El formulario de newsletter ya recolecta nombre, perfil y origen, pero la
-- tabla solo tenía email. Se agregan para no perder esos datos al persistir.
alter table public.newsletter_subscriptions
  add column if not exists full_name text,
  add column if not exists profile text,
  add column if not exists source text;
