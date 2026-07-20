import type { Article } from "@/components/bvh/ArticleIndex";

export const CATEGORIES = ["BVH", "Economía", "Internacional", "Educación", "Mercados", "Regulación"];

export const NEWS: Article[] = [
  { id: "n1", slug: "bvh-lanza-indice-general", cat: "BVH", date: "2026-07-15", title: "BVH lanza su Índice General: transparencia histórica para el mercado cubano", excerpt: "El BVH General nace con 14 empresas fundadoras y metodología abierta. Primera referencia de precios para el empresariado cubano en 60 años.", author: "Equipo BVH", readMin: 5, views: 4520, image: "El índice BVH General en una pantalla, gráfico azul y dorado ascendente con 14 puntos luminosos representando las empresas fundadoras" },
  { id: "n2", slug: "mipymes-crecimiento-2026", cat: "Economía", date: "2026-07-12", title: "MIPYMES crecen 34% en primer semestre: el motor silencioso de la economía", excerpt: "Datos del ONEI y estimaciones BVH confirman la expansión del sector privado no estatal. Sectores líderes: alimentos, tech y servicios.", author: "Dra. María López", readMin: 7, views: 3210, image: "Gráfico de barras verdes ascendentes con etiquetas de crecimiento económico cubano" },
  { id: "n3", slug: "diaspora-inversion-cuba", cat: "Internacional", date: "2026-07-08", title: "La diáspora cubana mueve $3.2B anuales: ¿cómo canalizarlo hacia inversión productiva?", excerpt: "Análisis de remesas, ahorro e intenciones de inversión. El Club de Inversión BVH como vehículo estructurado.", author: "Roberto García", readMin: 8, views: 6100, image: "Mapamundi con líneas de conexión doradas desde Miami, Madrid y Panamá hacia La Habana" },
  { id: "n4", slug: "valoracion-empresas-cubanas", cat: "Educación", date: "2026-07-03", title: "Cómo valorar una empresa cubana: guía práctica para MIPYMES", excerpt: "Métodos DCF adaptados, múltiplos de mercado y valoración por activos. Incluye plantilla Excel descargable para socios del Instituto.", author: "Dr. Carlos Méndez", readMin: 12, views: 2810, image: "Documento financiero con fórmulas, gráficos de valoración y una calculadora sobre escritorio de madera" },
  { id: "n5", slug: "hse-avance-tecnico", cat: "Mercados", date: "2026-07-01", title: "HSE avanza en su motor de matching: pruebas de carga superan 10k ops/seg", excerpt: "La infraestructura tecnológica de Havana Stock Exchange completa hitos críticos. Integración con custodios y liquidadores en Q4.", author: "Equipo Tech HSE", readMin: 4, views: 1950, image: "Servidores con luces LED azules, código fluyendo en pantallas, etiqueta HSE Engine v2.0" },
  { id: "n6", slug: "nueva-ley-mercados-valores", cat: "Regulación", date: "2026-06-28", title: "Proyecto de Ley de Mercados de Valores: claves para el empresariado", excerpt: "Análisis del borrador circulante: emisores, intermediarios, ofertas públicas, sanciones y protección al inversor minorista.", author: "Lic. Ana Rodríguez", readMin: 10, views: 3740, image: "Documento legal abierto con sello oficial, gavel de juez y pilares de columnas al fondo" },
];

export function getNoticia(slug: string) {
  return NEWS.find((a) => a.slug === slug) ?? null;
}

export function getNoticiasRelacionadas(article: Article, limit = 3) {
  return NEWS.filter((a) => a.id !== article.id && a.cat === article.cat).slice(0, limit);
}

export const NEWS_CONTENT: Record<string, string[]> = {
  "bvh-lanza-indice-general": [
    "El Bolsa de Valores de La Habana (BVH) presentó oficialmente su Índice General, un instrumento diseñado para medir el comportamiento del mercado de valores cubano con rigurosidad metodológica. Este índice, compuesto inicialmente por 14 empresas fundadoras, representa la primera referencia pública de precios para el empresariado cubano en más de seis décadas.",
    "La metodología del BVH General sigue estándares internacionales: capitalización bursátil ajustada por free float, revisión semestral de la canasta y un comité técnico independiente que supervisa los cambios. Las empresas incluidas abarcan sectores como agroindustria, tecnología, energía renovable y servicios financieros.",
    "«Este índice no es solo un número — es un termómetro de la confianza empresarial en Cuba», declaró el director de investigaciones del BVH. «Por primera vez, inversores locales e internacionales podrán observar en tiempo real cómo se comporta el mercado cubano.»",
    "El lanzamiento incluye una serie histórica reconstruida desde enero de 2025, permitiendo análisis de tendencias y volatilidad. El BVH General se actualizará cada 15 segundos durante la sesión de mercado, con datos disponibles gratuitamente en el portal del BVH.",
  ],
  "mipymes-crecimiento-2026": [
    "El sector privado no estatal cubano continúa su expansión acelerada. Según datos del ONEI y estimaciones propias del BVH, las MIPYMES crecieron un 34% en el primer semestre de 2026, consolidándose como el principal motor de generación de empleo e innovación en la isla.",
    "Los sectores que lideran este crecimiento son: alimentos procesados (42% del total), tecnología y servicios digitales (28%), y servicios profesionales (18%). La provincia de La Habana concentra el 45% de las nuevas MIPYMES, seguida de Matanzas y Villa Clara.",
    "«Estamos viendo una maduración del ecosistema emprendedor cubano», comenta la Dra. María López, economista senior del BVH. «Las MIPYMES ya no solo buscan sobrevivir, sino escalar. Están demandando financiamiento, formalización y acceso a mercados más grandes.»",
    "El informe completo del BVH, disponible para socios del Instituto, incluye un análisis detallado por provincia, sector, tamaño de empresa y acceso a financiamiento. Los datos confirman que las MIPYMES que participan en programas de acompañamiento del BVH crecen al doble de la tasa promedio del sector.",
  ],
  "diaspora-inversion-cuba": [
    "La diáspora cubana transfiere aproximadamente 3.200 millones de dólares anuales a la isla, según estimaciones del BVH basadas en remesas formales e informales, envíos de bienes y transferencias digitales. Sin embargo, menos del 5% de ese flujo se canaliza hacia inversión productiva de largo plazo.",
    "«El cubano en el exterior no solo envía dinero para consumo familiar — tiene capital, conocimiento técnico, redes comerciales y, cada vez más, intención de invertir en la isla», explica Roberto García, director de Relaciones con Inversores del BVH. «Lo que falta son vehículos institucionales confiables.»",
    "El Club de Inversión BVH nace precisamente para cerrar esa brecha. Con una estructura transparente, custodia independiente y reportes trimestrales auditados, el club permite a la diáspora participar en proyectos productivos cubanos desde montos desde 1,000 USD.",
    "El análisis identifica tres perfiles de inversor en la diáspora: el familiar (remesas para vivienda y consumo), el emprendedor (proyectos comerciales con socios en la isla) y el institucional (fondos de inversión y family offices cubano-americanos). El BVH está diseñando productos específicos para cada perfil.",
  ],
  "valoracion-empresas-cubanas": [
    "Valorar una empresa en el contexto cubano presenta desafíos únicos que requieren adaptaciones metodológicas significativas. La ausencia de un mercado de capitales líquido, las restricciones de convertibilidad monetaria y la volatilidad regulatoria hacen que los métodos tradicionales requieran ajustes sustanciales.",
    "En esta guía práctica, el Dr. Carlos Méndez, director del Instituto BVH, presenta tres enfoques adaptados al contexto cubano: valoración por flujo de caja descontado (DCF) con ajuste por riesgo país, valoración por múltiplos de mercado comparables (limitado pero útil para sectores con transacciones recientes) y valoración por activos netos ajustados.",
    "«El método DCF es el más robusto para el contexto cubano, siempre que se ajuste correctamente la tasa de descuento», explica Méndez. «La prima de riesgo soberano de Cuba, la restricción de convertibilidad CUP/USD y el horizonte de inversión a 5-7 años deben modelarse explícitamente.»",
    "La guía incluye una plantilla Excel descargable para socios del Instituto BVH, con parámetros preconfigurados y escenarios ajustables. También aborda temas como valoración de startups tecnológicas, empresas familiares y activos inmobiliarios en el contexto cubano.",
  ],
  "hse-avance-tecnico": [
    "Havana Stock Exchange (HSE), la infraestructura tecnológica que soporta las operaciones del BVH, completó exitosamente las pruebas de carga de su motor de matching de órdenes, alcanzando un rendimiento sostenido de más de 10,000 operaciones por segundo con una latencia promedio inferior a 5 milisegundos.",
    "«Estos resultados nos colocan a la par de bolsas regionales consolidadas», afirmó el líder técnico del proyecto. «La arquitectura distribuida y el uso de algoritmos de matching optimizados nos permiten escalar horizontalmente según crezca el volumen de operaciones.»",
    "Los hitos alcanzados en el Q3 incluyen: motor de matching completo (orden-límite, mercado, stop-loss), integración con el sistema de custodia digital, API REST y WebSocket para brokers autorizados, y un sandbox de pruebas abierto a desarrolladores externos. El próximo hito crítico es la integración con los sistemas de liquidación y compensación, programada para Q4 2026.",
    "El equipo técnico de HSE está compuesto por ingenieros cubanos y extranjeros con experiencia en mercados de capitales, fintech y sistemas distribuidos. La hoja de ruta incluye la implementación de contratos inteligentes para tokenización de activos antes del cierre de 2027.",
  ],
  "nueva-ley-mercados-valores": [
    "El borrador del proyecto de Ley de Mercados de Valores, actualmente en circulación para consulta pública, representa el marco regulatorio más comprehensivo para el mercado de capitales cubano en décadas. La licenciada Ana Rodríguez, especialista en regulación financiera del BVH, analiza las claves del documento.",
    "Entre los aspectos más relevantes del borrador destacan: la creación de la Superintendencia de Valores como ente regulador autónomo, la definición de categorías de emisores (públicos, privados y mixtos), los requisitos para ofertas públicas y privadas, el régimen de intermediarios y corredores, y un capítulo dedicado a la protección del inversor minorista.",
    "«El proyecto de ley toma lo mejor de las regulaciones de mercados emergentes y lo adapta a la realidad cubana», comenta Rodríguez. «Especialmente relevante es el tratamiento de las MIPYMES como emisores, con requisitos proporcionados a su tamaño.»",
    "El BVH ha presentado observaciones técnicas al borrador, proponiendo mejoras en: claridad del régimen de ofertas públicas, flexibilidad para instrumentos de renta fija privada, y mecanismos de resolución de disputas. La expectativa es que la ley sea sometida a la Asamblea Nacional en el primer semestre de 2027.",
  ],
};
