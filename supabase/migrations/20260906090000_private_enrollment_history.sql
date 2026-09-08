-- El historial propio no depende de que el catálogo siga publicado.
-- La proyección es cerrada: sin participantes, PII de terceros ni ubicación.
create or replace function public.get_my_course_enrollments()
returns table (
  id uuid,
  status text,
  enrolled_at timestamptz,
  course_title text,
  course_slug text,
  course_status text,
  offering_status text,
  starts_at timestamptz,
  timezone text,
  modality text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select e.id, e.status, e.enrolled_at, c.title, c.slug, c.status,
         o.status, o.starts_at, o.timezone, o.modality
  from public.course_enrollments e
  join public.course_offerings o on o.id = e.offering_id
  join public.courses c on c.id = o.course_id
  where e.user_id = auth.uid()
  order by e.enrolled_at desc, e.id;
$$;

revoke all on function public.get_my_course_enrollments() from public, anon, authenticated, service_role;
grant execute on function public.get_my_course_enrollments() to authenticated;

comment on function public.get_my_course_enrollments() is
  'Historial propio por auth.uid(); conserva descripción mínima tras cierre, cancelación o archivo sin abrir RLS del catálogo.';
