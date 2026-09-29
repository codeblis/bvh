create table if not exists public.company_applications (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  tax_id text not null,
  legal_representative text not null,
  corporate_email text not null,
  phone text not null,
  sector text not null,
  founding_year integer,
  annual_revenue text,
  employee_count integer,
  description text,
  wants_advisor_contact boolean not null default false,
  status text not null default 'nueva' check (status = any (array['nueva','en_revision','contactada','descartada'])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_applications enable row level security;

create policy "Cualquiera puede enviar una solicitud"
  on public.company_applications for insert
  to anon, authenticated
  with check (true);

create policy "Solo administradores leen solicitudes"
  on public.company_applications for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
