insert into public.articles (title, slug, excerpt, content, type, category_id, status, published_at, views)
select
  a.title, a.slug, a.excerpt, a.content, a.type, c.id, 'publicado', a.published_at, a.views
from (
  values
    ('BVH publica su primer índice sectorial de agroindustria', 'bvh-indice-sectorial-agroindustria',
     'El nuevo índice sigue el desempeño de las principales empresas del sector agroalimentario cubano.',
     'La Bolsa de Valores de La Habana anunció el lanzamiento de su índice sectorial de agroindustria, una herramienta diseñada para dar seguimiento objetivo al desempeño de las empresas cubanas del sector agroalimentario. El índice se calculará diariamente con una metodología pública y auditable, replicando estándares utilizados por bolsas internacionales.

Según el equipo de análisis de BVH, la agroindustria representa uno de los sectores con mayor potencial de atracción de capital de la diáspora en el corto plazo, dada la relevancia de la seguridad alimentaria en la agenda económica nacional.

El índice arranca con una base de diez empresas representativas y se espera incorporar nuevas compañías a medida que completen su proceso de registro en el RIE-BVH.',
     'noticia', 'bvh', now() - interval '2 days', 412),
    ('176 medidas de apertura: qué significan para las MIPYMES cubanas', '176-medidas-apertura-mipymes',
     'Un análisis de BVH sobre el paquete de reformas anunciado en junio de 2026 y su impacto en el ecosistema privado.',
     'El paquete de 176 medidas anunciado por las autoridades cubanas en junio de 2026 introduce cambios relevantes para el sector privado, entre ellos ajustes en el régimen de divisas, simplificación de trámites de importación y nuevas facilidades para la contratación de personal.

Desde BVH consideramos que estas medidas, aunque graduales, generan un entorno más favorable para que las MIPYMES avancen en su proceso de profesionalización y preparación para eventualmente cotizar en el Havana Stock Exchange.

Nuestro equipo de análisis continuará dando seguimiento a la implementación de estas medidas y su efecto real sobre la actividad empresarial privada en la isla.',
     'noticia', 'economia-cuba', now() - interval '5 days', 891),
    ('Cómo valorar tu empresa: guía práctica para emprendedores', 'como-valorar-tu-empresa-guia-practica',
     'Cinco métodos accesibles para que un emprendedor cubano estime el valor real de su negocio.',
     'Uno de los mayores obstáculos que enfrentan los emprendedores cubanos es no saber cuánto vale realmente su empresa. Esta guía resume cinco métodos prácticos que cualquier directivo puede aplicar con la información contable básica de su negocio: múltiplos de EBITDA, flujo de caja descontado, valor de activos netos, comparables de mercado y el método de capitalización de ingresos.

Ninguno de estos métodos es perfecto por sí solo. La recomendación del Instituto BVH es combinar al menos dos enfoques y contrastar el resultado con el criterio de un analista con experiencia en el sector.

Este es exactamente el tipo de acompañamiento que ofrecemos a las empresas que se registran en el proceso de preparación para cotizar en el HSE.',
     'blog', 'educacion', now() - interval '9 days', 1204),
    ('La diáspora cubana y el futuro del capital productivo', 'diaspora-cubana-capital-productivo',
     'Por qué la inversión de la diáspora podría ser la palanca de crecimiento más importante de la próxima década.',
     'Se estima que la diáspora cubana mueve miles de millones de dólares en remesas cada año, la mayoría destinados a consumo. BVH nace con la convicción de que una fracción creciente de ese capital puede canalizarse hacia inversión productiva si existen los mecanismos de transparencia y confianza adecuados.

El Club de Inversión BVH busca precisamente ser ese puente: una comunidad donde inversores de la diáspora y nacionales pueden conectar directamente con empresas cubanas analizadas y preparadas por nuestro equipo.',
     'blog', 'internacional', now() - interval '14 days', 673)
) as a(title, slug, excerpt, content, type, category_slug, published_at, views)
join public.categories c on c.slug = a.category_slug
on conflict (slug) do nothing;
