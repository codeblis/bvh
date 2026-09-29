# ADR — Arquitectura de BVH

**Estado del documento:** Actual  
**Última revisión:** 2026-09-04  
**Alcance:** primera versión entregable

## 1. Contexto

BVH combina portal institucional, publicación editorial, catálogo e inscripción de cursos y un CMS. El repositorio ya contiene una aplicación Next.js, Supabase, Resend y despliegue OpenNext sobre Cloudflare. La implementación inicial duplicaba noticias, blog y cursos en contenido estático mientras el CMS escribía en Supabase. La primera fase local ya eliminó esa duplicidad; falta aplicar y verificar las migraciones en los entornos remotos.

La V1 debe entregar, como mínimo, cursos, blog y noticias operativos en web pública y CMS, además de autenticación, roles, formularios, SEO y operación básica.

## 2. Cómo leer este registro

`Estado` describe la decisión. `Implementación` evita confundir una decisión aceptada con trabajo ya terminado. Las decisiones aceptadas permanecen inmutables; cualquier cambio futuro crea un ADR nuevo con referencia al anterior.

## 3. Resumen

| ADR | Decisión | Estado | Implementación |
| --- | --- | --- | --- |
| 001 | Monolito modular Next.js para sitio y CMS | Aceptada | Actual |
| 002 | Supabase como fuente única de verdad | Aceptada | Actual (parcial) |
| 003 | Noticias y blog comparten `articles` | Aceptada | Actual local; migración pendiente |
| 004 | Catálogo de cursos separado de sus ofertas | Aceptada | Actual local; migración pendiente |
| 005 | CMS propio dentro de la aplicación | Aceptada | Actual (parcial) |
| 006 | Autorización en servidor y RLS como defensa | Aceptada | Corrección local; migración pendiente |
| 007 | Markdown seguro para contenido V1 | Aceptada | Actual local |
| 008 | Supabase Storage para medios editoriales | Aceptada | Actual local; migración pendiente |
| 009 | Persistir antes de enviar efectos externos | Aceptada | Actual local; migración pendiente |
| 010 | Protección común de formularios públicos | Aceptada | Actual local parcial |
| 011 | Lectura pública en servidor con invalidación | Aceptada | Actual en contenido; parcial en cursos |
| 012 | Tres entornos separados y promoción controlada | Aceptada | Pendiente |
| 013 | Pruebas por riesgo y observabilidad mínima | Aceptada | Auditoría local; pruebas parciales |

## ADR-001 — Monolito modular Next.js

**Estado:** Aceptada  
**Implementación:** Actual

**Contexto.** La V1 necesita sitio público, autenticación y CMS, pero no tiene escala ni equipos que justifiquen servicios independientes.

**Decisión.** Mantener una aplicación Next.js App Router. Separar módulos por dominio (`contenido`, `cursos`, `auth`, `cms`) y capas de presentación, casos de uso, repositorios y proveedores externos. Las rutas públicas y administrativas viven en la misma aplicación, pero no comparten permisos implícitos.

**Alternativas descartadas.** Microservicios y CMS headless externo: aumentan despliegues, autenticación distribuida, coste y superficie operacional antes de demostrar necesidad.

**Consecuencias.** Entrega y trazabilidad simples. Los límites modulares deben cuidarse para que componentes React no contengan consultas o reglas de negocio dispersas.

## ADR-002 — Supabase como fuente única de verdad

**Estado:** Aceptada  
**Implementación:** Actual local; migración pendiente

**Contexto.** Al tomar la decisión, el CMS usaba Supabase, pero noticias, blog y cursos públicos dependían de arrays o contenido hardcodeado.

**Decisión.** Postgres/Supabase será la fuente canónica de perfiles, artículos, categorías, cursos, ofertas, inscripciones, newsletter y formularios. La web pública consultará repositorios server-side compartidos con el CMS. Los datos de demostración deberán estar identificados como semillas, no como segunda base de datos.

**Alternativas descartadas.** Mantener archivos TypeScript como contenido productivo; duplicar contenido en un CMS separado.

**Consecuencias.** Noticias, blog y cursos ya leen Supabase mediante repositorios server-only. La publicación debe confirmarse antes de invalidar las rutas públicas. Las migraciones nuevas aún requieren aplicación y prueba externa.

## ADR-003 — Modelo editorial unificado

**Estado:** Aceptada  
**Implementación:** Actual local; migración pendiente

**Contexto.** Noticias y blog comparten casi todos sus campos y ya existe `articles.type`.

**Decisión.** Mantener una tabla `articles` con discriminador cerrado `noticia | blog`, categorías y estado `borrador | publicado`. El slug será único por tipo. Los repositorios expondrán consultas explícitas por tipo y nunca mezclarán borradores en respuestas públicas.

**Alternativas descartadas.** Tablas independientes con esquemas duplicados; una tabla sin discriminador validado.

**Consecuencias.** Menos duplicación. Reglas específicas futuras deben permanecer en casos de uso, no llenar la tabla de campos nulos sin necesidad.

## ADR-004 — Catálogo y ofertas de cursos separados

**Estado:** Aceptada  
**Implementación:** Actual local; migración pendiente

**Contexto.** El esquema actual mezcla título y descripción estables con fecha, precio y cupo variables.

**Decisión.** `courses` describe el catálogo. `course_offerings` representa cada edición con fechas, modalidad, precio, moneda, capacidad y estado. `course_enrollments` referencia una oferta y un usuario. V1 permite inscripción o preinscripción; no cobra en línea.

**Alternativas descartadas.** Duplicar el curso por cohorte; integrar pagos antes de tener flujo educativo estable.

**Consecuencias.** El historial de ediciones se conserva y el curso no cambia de URL. Migración, UI multi-oferta, disponibilidad agregada e inscripción atómica están implementadas localmente; falta verificarlas contra una base desechable.

## ADR-005 — CMS propio dentro de BVH

**Estado:** Aceptada  
**Implementación:** Actual (parcial)

**Contexto.** Ya existen rutas administrativas. Cambiar ahora a otro CMS duplicaría autenticación y migración.

**Decisión.** Conservar `/admin` dentro de la aplicación. El CMS mínimo gestiona artículos, categorías, cursos/ofertas, inscripciones, newsletter y entradas de formularios. Componentes visuales pueden compartirse; consultas y mutaciones pertenecen a servicios server-only.

**Alternativas descartadas.** CMS SaaS, panel independiente o acceso directo de editores a Supabase Studio.

**Consecuencias.** Control total y menor coste. El equipo asume la calidad de permisos, auditoría, estados, accesibilidad y manejo de errores del panel.

## ADR-006 — Autorización server-side y RLS

**Estado:** Aceptada  
**Implementación:** Corrección local; migración pendiente

**Contexto.** El proxy de Next.js mejora navegación, pero no es frontera de seguridad. Las políticas heredadas permitían autoactualizar el perfil completo, incluido `role`, exponían perfiles y dejaban publicar artículos a cualquier autor autenticado.

**Decisión.** Cada Server Action y Route Handler verifica sesión, rol, propiedad y entrada. RLS repite el mínimo privilegio. Roles V1: `usuario` y `admin`; solo una operación confiable puede cambiar `role`. `editor` se difiere hasta que exista una necesidad confirmada. La lectura pública usa campos o vistas explícitas sin email ni PII. `callbackUrl` acepta solo rutas locales permitidas.

**Alternativas descartadas.** Confiar solo en proxy; confiar solo en ocultar botones; usar service role desde el cliente.

**Consecuencias.** La corrección local restringe perfiles y escritura editorial; falta aplicarla y probar abuso sobre una base desechable. También sigue pendiente rotar la clave de Resend expuesta históricamente.

## ADR-007 — Markdown sanitizado para la V1

**Estado:** Aceptada  
**Implementación:** Actual local

**Contexto.** Un editor WYSIWYG introduce formato complejo y riesgo XSS sin ser requisito de negocio para la primera entrega.

**Decisión.** Guardar cuerpo editorial como Markdown en texto. Validar longitud y estructura; renderizar un subconjunto explícito sin ejecutar HTML. El CMS ofrece edición y vista previa.

**Alternativas descartadas.** HTML arbitrario; TipTap/JSON desde el inicio.

**Consecuencias.** El renderer local admite encabezados H2/H3, párrafos, listas, citas, énfasis, código y enlaces con protocolos permitidos. React escapa el HTML crudo; no se usa `dangerouslySetInnerHTML`. Las necesidades editoriales avanzadas se evaluarán con contenido real.

## ADR-008 — Supabase Storage para medios

**Estado:** Aceptada  
**Implementación:** Actual local; migración pendiente

**Contexto.** V1 necesita portadas reales y ya depende de Supabase.

**Decisión.** Usar un bucket editorial de Supabase Storage. Guardar la ruta del objeto y metadatos, no una URL arbitraria. La subida se valida por rol, MIME, tamaño y nombre; reemplazar o borrar respeta referencias.

**Alternativas descartadas.** R2 en V1; URLs remotas libres; blobs en Postgres.

**Consecuencias.** La migración local crea el bucket público `editorial`, limita MIME y tamaño, y restringe escritura a admin. El servidor genera rutas aleatorias, revierte archivos huérfanos si falla la asociación y limpia versiones reemplazadas. Falta aplicar y probar RLS/Storage en una base desechable. R2 se reconsidera si volumen, transformación o coste lo justifican.

## ADR-009 — Persistencia antes de efectos externos

**Estado:** Aceptada  
**Implementación:** Actual (parcial)

**Contexto.** Contacto, inscripciones y newsletter no deben perder datos si Resend falla.

**Decisión.** Validar y persistir primero. Después enviar email transaccional. Registrar estado, intento y error resumido para reintento administrativo idempotente. No introducir una cola distribuida en V1.

**Alternativas descartadas.** Enviar antes de guardar; reportar éxito sin confirmación; añadir colas sin necesidad operacional demostrada.

**Consecuencias.** Contacto, solicitud empresarial y newsletter persisten mediante RPC transaccional antes de llamar a Resend. El panel muestra `pending/sent/failed`, intentos y reintento idempotente. Las RPC no están expuestas a la anon key: solo una credencial server-only puede invocarlas. Falta aplicar y probar la migración; el correo de cursos continúa pendiente.

## ADR-010 — Protección común de formularios públicos

**Estado:** Aceptada  
**Implementación:** Actual local parcial

**Contexto.** Contacto, newsletter, registro e inscripción reciben tráfico no confiable.

**Decisión.** Aplicar esquema Zod server-side, límites de tamaño, rate limiting, Turnstile donde corresponda, respuesta no reveladora y logs sin PII innecesaria. El cliente valida solo para UX.

**Alternativas descartadas.** Validación exclusiva en navegador; endpoints públicos ilimitados.

**Consecuencias.** Los tres endpoints ya exigen JSON, cortan streams mayores de 32 KiB y validan en servidor. La escritura directa con anon key queda cerrada para que no eluda la protección de aplicación. Rate limit y Turnstile siguen pendientes hasta identificar y autorizar la cuenta Cloudflare de BVH.

## ADR-011 — Lectura pública server-side e invalidación

**Estado:** Aceptada  
**Implementación:** Actual en contenido; parcial en cursos

**Contexto.** Contenido indexable no necesita hidratar una aplicación cliente completa. A la vez, publicar debe reflejarse sin un rebuild manual.

**Decisión.** Listas y detalles públicos se renderizan en servidor mediante repositorios `published-only`. Se usa caché con etiquetas por dominio y se invalida después de una mutación confirmada. El CMS no depende de la caché pública.

**Alternativas descartadas.** Fetch exclusivamente cliente; contenido compilado en arrays; reconstruir todo el sitio por publicación.

**Consecuencias.** Mejor SEO y menos JavaScript. La API exacta de caché debe quedar encapsulada para no acoplar el dominio a Next.js.

## ADR-012 — Entornos y promoción

**Estado:** Aceptada  
**Implementación:** Pendiente

**Contexto.** El repositorio demuestra configuración Cloudflare productiva, pero no un preview aislado completo. El script actual exige la rama `production`, mientras `main` es la línea activa.

**Decisión.** Usar `local`, `preview` y `production` con Supabase, dominios, secretos y correo separados. `main` es la línea canónica. Producción se promueve desde un commit o tag aprobado después de gates; el script y CI deben alinearse antes de usar este flujo.

**Alternativas descartadas.** Compartir base productiva con preview; despliegues desde cualquier rama; mantener dos ramas canónicas divergentes.

**Consecuencias.** Menor riesgo y trazabilidad. Crear preview aislado y resolver la discrepancia `main`/`production` son tareas V1.

## ADR-013 — Verificación por riesgo y observabilidad

**Estado:** Aceptada  
**Implementación:** Auditoría local; pruebas parciales

**Contexto.** Lint y tipos no detectan políticas RLS, flujos auth ni errores de publicación. La cobertura automática continúa siendo pequeña.

**Decisión.** El gate incluye lint, typecheck, unitarias, integración de base/RLS, E2E de flujos críticos y build sin red implícita. Producción conserva logs estructurados, identificador de solicitud, estado de efectos externos y comprobación de salud sin secretos.

**Alternativas descartadas.** Confiar solo en build; observar exclusivamente desde mensajes del navegador.

**Consecuencias.** Más trabajo inicial, menor probabilidad de una entrega aparentemente funcional pero insegura. Triggers locales registran cambios sensibles sin copiar contenido o PII; falta validar migración, integración RLS y observabilidad del entorno.

## ADR-014 — Historial propio independiente del catálogo público

**Estado:** Aceptada  
**Fecha:** 2026-09-06  
**Implementación:** Local; migración `20260906090000_private_enrollment_history.sql`

**Contexto.** Una prueba E2E demostró que cerrar una oferta ocultaba su título y calendario en `/cuenta`: las relaciones anidadas obedecían las políticas de lectura pública, aunque la inscripción propia seguía existiendo. La V1 requiere conservar el historial tras cerrar, cancelar o archivar.

**Decisión.** Consultar el historial mediante `get_my_course_enrollments()`, una función sin parámetros de identidad que filtra siempre por `auth.uid()`. Devuelve una proyección explícita de inscripción, título, slug, estados y calendario, sin participantes, emails ni ubicación. Solo `authenticated` puede ejecutarla; las políticas públicas de cursos y ofertas permanecen restringidas.

**Alternativas descartadas.** Abrir todas las columnas de las ofertas históricas a cualquier alumno; consultar el historial con service role desde el servidor y confiar exclusivamente en un filtro de aplicación; reemplazar el título por “Curso no disponible” al cerrar una edición.

**Consecuencias.** El alumno conserva la referencia de su curso y ve si la edición fue cancelada. Un curso archivado no ofrece un enlace público que devolvería 404. Cualquier campo adicional del historial requiere revisar expresamente la proyección y sus pruebas de aislamiento.

## ADR-015 — Validación de identidad y origen canónico de callbacks

**Estado:** Aceptada  
**Fecha:** 2026-09-06  
**Implementación:** Local; módulo `src/modules/identity`

**Contexto.** El registro validaba únicamente en cliente y trasladaba errores de Auth directamente a la interfaz. Una prueba con correo local detectó además que el callback construía la redirección con el host interno de Next (`localhost`), aunque la sesión se había establecido en el origen público configurado (`127.0.0.1`), perdiendo acceso al área privada.

**Decisión.** Validar registro y nueva contraseña en Server Actions con esquemas acotados, proyectar explícitamente metadata de perfil sin roles y comprobar sesión antes de cambiar contraseña. Registro duplicado usa la misma respuesta pública; recuperación para emails válidos no distingue aceptación, cuenta desconocida ni error del proveedor. Las incidencias de recuperación solo dejan avisos genéricos sin datos personales. Auth sigue siendo Supabase, sin service role para estos flujos.

Los enlaces de correo, callback y redirección a login usan el origen confiable de `NEXT_PUBLIC_SITE_URL`, con HTTPS salvo loopback local. Los destinos se normalizan y validan contra una lista de rutas permitidas; se rechazan escapes anidados y traversal fuera de esa lista. Callback y redirecciones privadas son `no-store`. La contraseña nueva requiere volver a iniciar sesión después de cerrar la sesión local.

**Alternativas descartadas.** Confiar en campos de cliente, mostrar errores internos del proveedor, construir URLs con encabezados no confiables o el host interno del runtime, y declarar “cuenta creada” sin comprobar si existe una sesión.

**Consecuencias.** Cada entorno debe configurar un origen público y callbacks coherentes. Se mantiene PKCE: el recorrido probado abre el correo en el navegador que inició la solicitud; apertura entre dispositivos requiere un diseño y prueba adicionales. La respuesta pública genérica no demuestra entrega de correo; hacen falta supervisión operativa, SMTP y antiabuso en preview. Referencias oficiales consultadas: [Auth con contraseña](https://supabase.com/docs/guides/auth/passwords), [PKCE y SSR](https://supabase.com/docs/guides/auth/server-side/advanced-guide).

## ADR-016 — Sin middleware: la autorización vive en cada ruta

**Estado:** Aceptada  
**Fecha:** 2026-09-29  
**Implementación:** Local; `src/proxy.ts` eliminado

**Contexto.** Al preparar el primer despliegue real, `opennextjs-cloudflare build` falló con `Node.js middleware is not currently supported`. La causa no es del proyecto: Next 16 sustituyó `middleware.ts` por `proxy.ts`, que se ejecuta **solo** en el runtime de Node; forzarlo a edge lo rechaza el propio compilador con `Proxy does not support Edge runtime`. OpenNext, que necesita middleware de edge, aborta. El síntoma importa: mientras existiera ese archivo, **la aplicación no se podía desplegar en Cloudflare en absoluto**, y eso no se había detectado porque toda la evidencia previa era `next build` local.

**Decisión.** Eliminar `src/proxy.ts`. La autorización no se pierde porque nunca dependió de él: `/admin/**` la resuelve `requireAdmin()` en `src/app/admin/layout.tsx` —que redirige a `/login` sin sesión y fuera del panel sin rol— y `/cuenta` comprueba la suya en la propia página. El middleware era una segunda capa, no la única.

**Alternativas descartadas.** Esperar a que OpenNext admita middleware de Node, que deja el despliegue bloqueado por un tercero. Volver a `middleware.ts`, que en Next 16 es el mismo archivo con otro nombre. Mover la comprobación a un punto único del runtime, que reintroduce el mismo acoplamiento que ahora estorba.

**Consecuencias.** La sesión deja de refrescarse en el borde a cada navegación: el token lo renueva el cliente del navegador, así que una sesión de panel muy larga puede pedir volver a entrar antes que antes. A cambio, la autorización queda donde se puede leer y probar —junto a la ruta que protege— y deja de haber un archivo cuya ausencia abriría el panel. Cada ruta privada nueva debe llamar a `requireAdmin()` o comprobar su sesión: ya no hay una red que la cubra por omisión. Los recorridos E2E de acceso por rol siguen siendo la prueba de que la protección se mantiene.

## 4. Modelo lógico objetivo

```text
profiles ──< articles >── categories
   │
   └──< course_enrollments >── course_offerings >── courses

newsletter_subscriptions
contact_messages
company_applications
```

Las tablas actuales adicionales —comentarios, likes, bookmarks, empresas e índices— pueden permanecer, pero no desplazan la prioridad V1.

## 5. Flujos principales

```text
Admin → CMS → autorizar + validar → Postgres → invalidar caché → web pública
Usuario → formulario → antiabuso + validar → Postgres → email → estado/reintento
Usuario → auth Supabase → perfil sin privilegios → rutas/acciones autorizadas
```

## 6. Riesgos abiertos

- **Bloqueado:** rotar la credencial de Resend expuesta en historial requiere acceso al proveedor.
- **Pendiente:** aplicar y probar las cinco migraciones locales del 4 de septiembre en una base desechable.
- **Pendiente:** comprobar la migración de semillas y slugs contra datos remotos reales.
- **Pendiente:** comprobar compatibilidad de render/caché elegida con OpenNext antes de cerrar implementación.
- **Pendiente:** validar jurisdicción, privacidad y avisos financieros con asesoría competente.
