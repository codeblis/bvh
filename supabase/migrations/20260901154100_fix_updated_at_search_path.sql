-- Cierra el warning de linter "function_search_path_mutable": sin search_path
-- fijo, la función es vulnerable a hijacking si alguien crea un esquema/objeto
-- malicioso que quede antes en el search_path del rol que la ejecuta.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;
