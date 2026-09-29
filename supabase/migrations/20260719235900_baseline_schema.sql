-- Línea base reconstruida del esquema BVH.
--
-- Estas tablas ya existían en el proyecto remoto (creadas antes de que se
-- empezara a versionar el historial de migraciones), por lo que este archivo
-- documenta el estado real de la base de datos y NO debe re-ejecutarse en el
-- proyecto donde fue extraído. Está pensado para levantar el esquema en
-- entornos nuevos (local, staging) desde cero.

create extension if not exists pgcrypto;

-- PROFILES: uno por usuario de auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  email text not null,
  full_name text,
  role text not null default 'usuario',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CATEGORIES: categorías de noticias/blog
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

-- ARTICLES: noticias y entradas de blog
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  featured_image text,
  type text not null default 'noticia' check (type = any (array['noticia', 'blog'])),
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  status text default 'borrador' check (status = any (array['borrador', 'publicado'])),
  published_at timestamptz,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COMMENTS: comentarios anidados en artículos
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  status text default 'aprobado' check (status = any (array['aprobado', 'pendiente', 'rechazado'])),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LIKES
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, article_id)
);

-- BOOKMARKS
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, article_id)
);

-- COURSES: catálogo del Instituto de Bolsa
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  content text,
  image text,
  instructor text,
  start_date date,
  end_date date,
  capacity integer,
  price numeric,
  status text default 'activo' check (status = any (array['activo', 'inactivo', 'completado'])),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COURSE_ENROLLMENTS
create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text default 'inscrito' check (status = any (array['inscrito', 'completado', 'cancelado'])),
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

-- COMPANIES: directorio público de empresas cotizando/interesadas
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  logo_url text,
  sector text,
  website text,
  status text default 'interesada' check (status = any (array['interesada', 'cotizando', 'inactiva'])),
  registered_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INDICES: índices bursátiles BVH
create table if not exists public.indices (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  value numeric not null,
  change numeric,
  change_percent numeric,
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

-- NEWSLETTER_SUBSCRIPTIONS
create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz,
  is_active boolean default true
);

-- CONTACT_MESSAGES
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'pendiente' check (status = any (array['pendiente', 'leído', 'respondido'])),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS en todas las tablas (las políticas se agregan en la
-- migración rls_policies_public_content)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.courses enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.companies enable row level security;
alter table public.indices enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.contact_messages enable row level security;

-- FUNCIONES Y TRIGGERS

-- Crea el perfil automáticamente cuando se registra un usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'usuario');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantiene updated_at al día en cada UPDATE
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger set_updated_at
  before update on public.articles
  for each row execute function public.update_updated_at_column();

create trigger set_updated_at
  before update on public.companies
  for each row execute function public.update_updated_at_column();

create trigger set_updated_at
  before update on public.contact_messages
  for each row execute function public.update_updated_at_column();

create trigger set_updated_at
  before update on public.courses
  for each row execute function public.update_updated_at_column();
