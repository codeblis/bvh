-- ÍNDICES
insert into public.indices (name, value, change, change_percent) values
  ('BVH General', 1847.32, 38.6, 2.14),
  ('BVH Tecnología', 324.80, 3.12, 0.97),
  ('BVH Turismo', 512.60, -6.85, -1.32),
  ('BVH Agroindustria', 218.45, 6.51, 3.08),
  ('BVH Energía', 409.17, -1.81, -0.44)
on conflict (name) do nothing;

-- CATEGORÍAS
insert into public.categories (name, slug, description) values
  ('BVH', 'bvh', 'Novedades institucionales de la Bolsa de Valores de La Habana'),
  ('Economía Cuba', 'economia-cuba', 'Análisis y contexto de la economía cubana'),
  ('Internacional', 'internacional', 'Mercados y finanzas globales relevantes para Cuba'),
  ('Educación', 'educacion', 'Contenido formativo en finanzas y gobernanza corporativa')
on conflict (slug) do nothing;

-- CURSOS DEL INSTITUTO
insert into public.courses (title, slug, description, instructor, start_date, price, capacity, status) values
  ('Fundamentos de Valoración de Empresas', 'fundamentos-valoracion-empresas', 'Aprende a estimar el valor real de tu MIPYME con metodologías internacionales adaptadas al contexto cubano.', 'Lic. Daniela Roque', '2026-09-07', 45, 30, 'activo'),
  ('Gobernanza Corporativa para MIPYMES', 'gobernanza-corporativa-mipymes', 'Estructura tu empresa para atraer inversión: juntas directivas, estatutos y buenas prácticas.', 'MSc. Rafael Cabrera', '2026-09-21', 39, 25, 'activo'),
  ('Introducción al Mercado de Capitales', 'introduccion-mercado-capitales', 'Conceptos esenciales sobre acciones, deuda y cómo funcionará el Havana Stock Exchange.', 'Lic. Yordanka Pino', '2026-10-05', 0, 60, 'activo'),
  ('Finanzas Corporativas Avanzadas', 'finanzas-corporativas-avanzadas', 'Modelado financiero, proyecciones y análisis de flujo de caja para directivos.', 'MSc. Rafael Cabrera', '2026-10-19', 55, 20, 'activo')
on conflict (slug) do nothing;

-- EMPRESAS REGISTRADAS (directorio público)
insert into public.companies (name, slug, description, sector, status) values
  ('Grupo Empresarial AZCUBA', 'azcuba', 'Conglomerado agroindustrial cubano, líder en producción de derivados de la caña.', 'Agroindustria', 'cotizando'),
  ('CIMEX S.A.', 'cimex', 'Cadena de comercio minorista y servicios con presencia nacional.', 'Comercio', 'interesada'),
  ('Cubacar S.A.', 'cubacar', 'Empresa de transporte y renta de vehículos.', 'Transporte', 'interesada'),
  ('Cadena Islazul', 'islazul', 'Red hotelera nacional orientada al turismo interno.', 'Turismo', 'cotizando')
on conflict (slug) do nothing;
