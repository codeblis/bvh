-- Las mutaciones que afectan cupo usan las RPC transaccionales, también en CMS.
revoke insert, update, delete on public.course_enrollments from authenticated;
revoke insert, update, delete on public.course_offerings from authenticated;
-- El cierre administrativo existente solo cambia estado; el resto usa save_course_offering.
grant update (status) on public.course_offerings to authenticated;

create or replace function public.update_course_enrollment_status(
  p_enrollment_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  selected_enrollment public.course_enrollments%rowtype;
  selected_offering public.course_offerings%rowtype;
  target_offering_id uuid;
  occupied integer;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if p_status is null or p_status not in ('pendiente', 'confirmada', 'lista_espera', 'cancelada', 'completada') then
    raise exception 'invalid_status';
  end if;

  select offering_id into target_offering_id
  from public.course_enrollments where id = p_enrollment_id;
  if not found then
    raise exception 'enrollment_not_found';
  end if;

  -- Mismo orden que enroll_in_course: primero oferta, después inscripción.
  select * into selected_offering from public.course_offerings
  where id = target_offering_id for update;
  select * into selected_enrollment from public.course_enrollments
  where id = p_enrollment_id and offering_id = target_offering_id for update;
  if not found then
    raise exception 'enrollment_not_found';
  end if;

  -- Tanto confirmada como completada cuentan para la capacidad.
  if p_status in ('confirmada', 'completada')
     and selected_enrollment.status not in ('confirmada', 'completada')
     and selected_offering.capacity is not null then
    select count(*) into occupied from public.course_enrollments
    where offering_id = target_offering_id
      and id <> p_enrollment_id
      and status in ('confirmada', 'completada');
    if occupied >= selected_offering.capacity then
      raise exception 'course_full';
    end if;
  end if;

  update public.course_enrollments
  set status = p_status,
      completed_at = case when p_status = 'completada' then coalesce(completed_at, now()) else null end
  where id = p_enrollment_id;
end;
$$;

revoke all on function public.update_course_enrollment_status(uuid, text) from public, anon;
grant execute on function public.update_course_enrollment_status(uuid, text) to authenticated;
