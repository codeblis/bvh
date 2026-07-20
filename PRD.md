# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Plataforma Web de la BOLSA DE VALORES DE LA HABANA (BVH)
### Incluyendo integración con Havana Stock Exchange (HSE)

**Versión 1.0 | Julio 2026**  
*Documento Confidencial – Uso Interno del Equipo BVH*

---

## 1. Resumen Ejecutivo y Visión del Producto

### 1.1 Visión del Producto

La Plataforma Web de la Bolsa de Valores de La Habana (BVH) es el principal punto de contacto digital entre la institución y sus usuarios clave: emprendedores cubanos (MIPYMES), directivos, inversores de la diáspora y el ecosistema financiero cubano.

Su propósito es posicionar a la BVH como *“la casa de los emprendedores cubanos”* proporcionando transparencia, análisis profesional, educación de calidad y un camino claro hacia la captación de capital a través de la preparación para cotizar en el Havana Stock Exchange (HSE).

### 1.2 Objetivo del PRD

Este documento define de forma clara, estructurada y priorizada todos los requisitos funcionales y no funcionales necesarios para diseñar, desarrollar y lanzar la plataforma web de la BVH en su Etapa 1 Fundacional, incluyendo la integración con el HSE.

### 1.3 Alcance del Producto (MVP - Etapa 1)

El alcance inicial (MVP) incluye las siguientes secciones principales:

- Inicio (Home)
- Índices BVH (visualización y descarga)
- Instituto de Bolsa (catálogo de cursos y registro)
- Mercados (información + enlace a HSE)
- Cotizar en Bolsa (formulario de registro de MIPYMES + flujo de onboarding)
- Noticias y Blog
- Acerca de la BVH
- Login / Registro de usuarios

> **Fuera del alcance del MVP inicial:** Trading real en HSE (se integrará como enlace externo en Etapa 1), dashboard avanzado de usuario, sistema de pagos completo y herramientas de back-office internas.

---

## 2. Objetivos de Negocio y Métricas de Éxito

### 2.1 Objetivos Estratégicos (Etapa 1)

1. Posicionar a la BVH como la fuente más confiable de información y análisis financiero sobre Cuba.
2. Registrar al menos 80-100 MIPYMES de calidad en los primeros 12 meses.
3. Construir una comunidad activa de inversores (Club de Inversión) con mínimo 150 miembros.
4. Lograr que el 40% de las empresas registradas avancen al menos una etapa en el proceso de preparación para cotizar.
5. Alcanzar break-even operativo del core antes de diciembre 2027.

### 2.2 KPIs Principales

- Número de empresas registradas (meta: 100 en 12 meses)
- Tasa de retención de usuarios registrados (>60% a los 3 meses)
- Engagement con índices (descargas y visualizaciones)
- Inscripciones a cursos del Instituto
- Miembros activos del Club de Inversión
- Tiempo promedio en sitio y páginas por sesión

---

## 3. Usuarios Objetivo y Personas

### 3.1 Segmentos Principales

1. Emprendedores / Dueños de MIPYMES cubanas (Prioridad Alta)
2. Directivos y Gerentes de empresas privadas
3. Inversores de la diáspora cubana (Prioridad Alta)
4. Analistas, periodistas y académicos
5. Estudiantes y profesionales interesados en finanzas

### 3.2 Persona Principal: *“Carlos – Emprendedor MIPYME”*

**Perfil:**  
Carlos, 42 años, dueño de una empresa de alimentos procesados en La Habana con 18 empleados. Tiene 4 años de operación y factura aproximadamente $180k USD anuales. Quiere profesionalizar su empresa y atraer inversión para expandirse.

- **Dolores (Pains):** No sabe cómo valorar su empresa. No tiene acceso a inversores serios. Le falta formación en finanzas y gobernanza. No confía en la información que circula.
- **Ganancias deseadas (Gains):** Conocer el valor real de su empresa. Acceder a capital de calidad. Aprender a gestionar mejor. Ganar visibilidad.
- **Cómo lo ayuda la BVH:** Registro fácil → Análisis de su empresa → Cursos prácticos → Preparación para cotizar en HSE → Conexión con inversores a través del Club.

---

## 4. Requisitos Funcionales Detallados

### 4.1 Página de Inicio (Home)

**Objetivo de la página**  
Transmitir credibilidad, claridad sobre qué es la BVH y guiar al usuario hacia las acciones principales (registrar empresa, inscribirse en cursos, unirse al Club o ver índices).

**Elementos principales requeridos**

- **Hero Section:** Título impactante + subtítulo + botones CTA principales (*"Registrar mi empresa"* y *"Ver Índices"*).
- **Sección "¿Qué es la BVH?":** Resumen breve de misión y valor (máx. 4-5 líneas).
- **Sección de Servicios Destacados:** Tarjetas con Íconos para: Índices, Instituto, Cotizar, Club de Inversión.
- **Testimonios / Casos de Éxito:** 3-4 testimonios de emprendedores (inicialmente placeholders o reales cuando existan).
- **CTA Final:** Banner con llamado fuerte a registrar la empresa o contactar.
- **Enlace visible a HSE:** *"Accede a la plataforma de negociación HSE – Havana Stock Exchange"* (abrir en nueva pestaña).

**Criterios de Aceptación (Home)**

- El hero debe cargar en menos de 2 segundos.
- Botones CTA deben tener tracking de clics (Google Analytics / Meta Pixel).
- Diseño 100% responsive (mobile-first).

---

### 4.2 Página de Índices

**Objetivo**  
Mostrar de forma clara y profesional los índices de la BVH y permitir su consulta histórica y descarga.

**Funcionalidades requeridas**

- Listado de índices disponibles (BVH General, BVH Sectoriales, BVH Top 10, etc.).
- Gráfico interactivo de evolución (línea o velas) con selector de período (1M, 3M, 6M, 1Y, YTD, Máx).
- Tabla con valores actuales, variación diaria, semanal y mensual.
- Botón de descarga en PDF/Excel por índice.
- Sección *"Metodología"* con explicación breve de cómo se calcula cada índice (colapsable).
- Nota clara: *"Datos actualizados al [fecha] – Fuente: BVH"*

---

### 4.3 Página del Instituto de Bolsa

**Objetivo**  
Posicionar al Instituto como el principal centro de formación en finanzas y mercado de capitales para el ecosistema cubano.

**Funcionalidades**

- Catálogo de cursos y talleres con filtros (Nivel: Básico / Intermedio / Avanzado | Modalidad: Online / Presencial / Híbrido).
- Ficha de cada curso: descripción, objetivos, duración, precio, fecha de inicio, instructor y botón de inscripción.
- Calendario de próximos eventos/webinars.
- Formulario de pre-inscripción o inscripción con pago (integración con pasarela).
- Sección de testimonios de alumnos.

---

### 4.4 Página de Mercados

**Objetivo**  
Informar sobre los mercados que operará la BVH/HSE y dirigir tráfico hacia la plataforma de negociación (HSE).

**Contenido y funcionalidad**

- Secciones claras: Mercado de Acciones, Mercado de Commodities, Mercado de Deuda, Criptoactivos (en evaluación).
- Para cada mercado: descripción breve + estado actual (*En desarrollo / Próximamente / Activo*).
- CTA destacado y repetido: *"Acceder a la plataforma de negociación HSE – Havana Stock Exchange"* (abre en nueva pestaña o redirige a HSE).
- Nota: *"El trading real en HSE estará disponible a partir de la Etapa 2"*

---

### 4.5 Página "Cotizar en Bolsa" (Flujo de Registro de MIPYMES) – Alta Prioridad

**Objetivo**  
Convertir visitantes en empresas registradas y comenzar el proceso de preparación para cotizar en el HSE.

**Estructura de la página**

- **Beneficios de cotizar:** Lista clara con íconos (Acceso a capital, Visibilidad, Profesionalización, Valoración, Liquidez futura).
- **Requisitos iniciales:** Lista clara y realista (ser MIPYME formal, mínimo 2 años de operación, estados financieros, etc.).
- **Proceso en 4 pasos:** 1. Registro → 2. Evaluación → 3. Preparación → 4. Cotización (Etapa 2).
- **Formulario de Registro:** Campos obligatorios: Razón social, NIT, Representante legal, Email corporativo, Teléfono, Sector, Año de fundación, Facturación aproximada anual, Número de empleados, Breve descripción del negocio.
- Checkbox de aceptación de términos y política de privacidad.
- Botón principal: *"Enviar solicitud de registro"*
- Mensaje de confirmación + *"¿Quieres que un asesor te contacte?"* (checkbox opcional).

**Flujo posterior al envío (Backend)**

- Email de confirmación automático al usuario.
- Notificación interna al equipo BVH (email + registro en CRM o Google Sheet / Airtable).
- Asignación de un *"asesor de registro"* que contactará en las siguientes 48-72 horas.

---

### 4.6 Noticias y Blog

**Funcionalidades**

- Listado de artículos con imagen destacada, título, extracto y fecha.
- Filtros: Categoría (BVH, Economía Cuba, Internacional, Educación) y Búsqueda.
- Página individual de artículo con formato limpio y botones de compartir.
- Sección *"Artículos relacionados"*.
- Posibilidad de suscripción al newsletter (email).

---

### 4.7 Página "Acerca de la BVH"

Debe contener: Historia, Misión, Visión, Valores, Equipo (fotos + cargos), y un mensaje claro sobre la independencia del proyecto.

---

### 4.8 Login / Registro de Usuarios

**Funcionalidades mínimas MVP**

- Registro con email + contraseña (o Google/LinkedIn en futuro).
- Login tradicional.
- Recuperación de contraseña.
- Dashboard básico del usuario (mis cursos, mis empresas registradas, descargas).
- Diferenciación clara entre usuario individual y empresa (rol).

---

## 5. Requisitos No Funcionales

### 5.1 Rendimiento y Disponibilidad

- Tiempo de carga de páginas principales < 3 segundos en conexión 4G.
- Uptime mínimo del 99.5%.
- Optimización para mobile (Core Web Vitals).

### 5.2 Seguridad

- HTTPS obligatorio en todo el sitio.
- Protección contra inyección SQL, XSS y CSRF.
- Almacenamiento seguro de contraseñas (bcrypt o similar).
- Cumplimiento básico de protección de datos personales (GDPR-like).

### 5.3 Accesibilidad y Diseño

- Cumplimiento WCAG 2.1 Nivel AA mínimo.
- Diseño responsive (mobile-first).
- Soporte para modo oscuro (recomendado pero no obligatorio en MVP).

### 5.4 Idiomas

Idioma principal: Español. Versión en Inglés recomendada para la Etapa 1 (especialmente para inversores de la diáspora).

---

## 6. User Stories Principales (MVP)

**Como emprendedor...**

- Quiero ver los índices actualizados para entender cómo está mi sector.
- Quiero registrarme fácilmente para que me ayuden a preparar mi empresa para cotizar.
- Quiero inscribirme en un curso práctico de valoración de empresas.

**Como inversor de la diáspora...**

- Quiero entender qué oportunidades existen en Cuba de forma transparente.
- Quiero unirme al Club de Inversión para acceder a información privilegiada y eventos.

---

## 7. Priorización y Fases de Desarrollo

### Fase 0 – Pre-MVP (4-6 semanas)

- Diseño de identidad visual completa (BVH + HSE)
- Arquitectura técnica y elección de stack
- Estructura de base de datos y CMS

### Fase 1 – MVP (8-12 semanas)

- Home + Índices + Acerca de + Login/Registro básico
- Página Cotizar en Bolsa con formulario funcional + flujo de email interno
- Instituto (catálogo + fichas de cursos)
- Mercados + enlace a HSE
- Blog/Noticias básico

### Fase 2 – Post-MVP

- Dashboard de usuario
- Sistema de pagos para cursos
- Integración más profunda con HSE (single sign-on, datos compartidos)
- Área de miembros del Club de Inversión

---

## 8. Integraciones Técnicas

- **HSE (Havana Stock Exchange):** Enlace principal + futura integración de SSO y datos compartidos.
- **Email / Notificaciones:** SendGrid, Mailgun o similar.
- **Analytics:** Google Analytics 4 + Meta Pixel + Hotjar o similar.
- **CRM / Gestión de empresas:** Airtable, Notion o HubSpot (recomendado).
- **Pagos (Fase 2):** Stripe o pasarela local soportada.

---

## 9. Riesgos y Mitigaciones

- **Riesgo:** Baja adopción inicial por parte de las MIPYMES.  
  **Mitigación:** Campaña fuerte de contenido + eventos offline + partnerships con cámaras empresariales.

- **Riesgo:** Cambios regulatorios que afecten el modelo.  
  **Mitigación:** Mantener flexibilidad en la arquitectura y comunicación constante con reguladores.

- **Riesgo:** Dificultad para mantener datos actualizados de índices.  
  **Mitigación:** Automatización de fuentes + equipo dedicado a investigación.

---

## 10. Próximos Pasos Recomendados

1. Aprobación de este PRD por el CEO y equipo directivo.
2. Definición del stack tecnológico y equipo de desarrollo.
3. Inicio de Fase 0 (Diseño y Arquitectura).
4. Reunión de alineación con el equipo de HSE para definir integración.

---

**— Fin del PRD v1.0 —**

*Referencia: Documento de Caracterización Estratégica BVH-HSE v1.0 (Julio 2026)*

## Para devs:
Resumen de la arquitectura, el stack tecnológico y la estrategia de gestión para el desarrollo del portal oficial de La Bolsa de Valores de La Habana (BVH):  

**🏛️ El Ecosistema Tecnológico (Tech Stack)**  
**Frontend y Rendimiento (SEO & Tipado)**  

- **Next.js:** Framework principal para garantizar un **SEO impecable**, renderizando las páginas del lado del servidor (SSR) para que Google indexe al instante las noticias y los cursos.  
    
- **TypeScript:** Implementación de tipado estricto para asegurar el manejo de datos financieros e institucionales sin errores en tiempo de ejecución.  
    
- **TailwindCSS:** Framework de diseño para maquetar interfaces densas y profesionales rápidamente, eliminando los estilos inline.  
    

**Gestión de Estado Inteligente**  

- **TanStack Query (React Query):** Absorberá el **Estado del Servidor** (85% de la app), controlando la caché, paginación de noticias y actualización en segundo plano de las cotizaciones informativas de la BVH.  
    
- **Context API:** Reservado exclusivamente para el **Estado de la Interfaz** (Cliente) de bajo impacto, como el cambio de tema (claro/oscuro) y el estado de la sesión.  
    

**Backend y Servicios**  

- **Supabase (PostgreSQL):** Base de datos relacional y servicios de Backend-as-a-Service (BaaS) para almacenar usuarios, histórico de mercados, cursos y artículos de manera unificada, segura y en tiempo real.  
    
- **Resend (+ React Email):** Motor de mensajería para el envío de boletines, alertas y confirmaciones de inscripción a los cursos del instituto.  
    

**🛠️ Estrategia de Administración (Módulo CMS a Medida)**  
En lugar de utilizar un CMS externo (Headless CMS) que fragmentaría tus datos, se opta por un enfoque híbrido nativo dentro del propio proyecto de Next.js.  
**Características del Panel de Administración:**  

- **Rutas Protegidas:** Se crearán rutas exclusivas (ej. `/admin/blog`, `/admin/cursos`) protegidas mediante _Middleware_ y la autenticación nativa de Supabase Auth basada en roles.  
    
- **Única Fuente de la Verdad:** Todo el contenido cargado por el cliente se guardará directamente en las tablas de tu base de datos relacional en Supabase.  
    
- **Aceleradores de Desarrollo:** Uso de componentes listos para usar (**Shadcn/ui**), gestión avanzada de formularios (**React Hook Form + Zod**) y un editor de texto rico integrado (**TipTap**) para facilitarle la escritura de artículos al cliente sin complicar tu código.  
    

Con esta estructura, el portal de la BVH resulta en un software independiente, robusto, altamente escalable y listo para ser autogestionado de forma sencilla por el cliente final.

- **Framework:** Next.js 16 + (App Router) + React 19 + SEO Nativo.
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Linting y formato:** Biome
- **App Router (Layout global compartido), `src/directory` e import alias (@/) :** Para la organización de las rutas, los imports y los archivos del proyecto.
- **Turbopack:** Para facilitar el desarrollo.
- **Base de datos y backend:** Supabase y PostgreSQL
- **Autenticación:** Supabase Auth
- **Mailing:** Resend