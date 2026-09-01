-- Diferenciación individual/empresa pedida en el PRD (4.8) y ya recolectada
-- por el formulario de registro (campo "tipo"), pero ignorada hasta ahora.
alter table public.profiles
  add column if not exists account_type text not null default 'individual'
  check (account_type in ('individual', 'empresa'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, account_type, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nombre',
    coalesce(new.raw_user_meta_data->>'tipo', 'individual'),
    'usuario'
  );
  return new;
end;
$$;
