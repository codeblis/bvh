## Why

BVH necesita convertir una demostración visual en una primera versión operable: noticias, blog y cursos deben compartir una fuente de verdad con el CMS, y los flujos de identidad, formularios y operación deben fallar de forma segura. OpenSpec se incorpora con el trabajo ya iniciado para dejar explícito qué está implementado localmente, qué falta verificar y qué debe aceptar el cliente antes de una entrega.

## What Changes

- Sustituir los datos editoriales de demostración por contenido administrable en Supabase para noticias y blog, con publicación, preview, medios, búsqueda, filtros y SEO.
- Separar la identidad permanente de cada curso de sus ofertas e inscripciones, con control transaccional de cupo e idempotencia.
- Completar registro, verificación, login, logout y recuperación, con roles protegidos en servidor y RLS.
- Convertir `/admin` en el CMS mínimo de contenido, cursos, formularios, usuarios y auditoría, con errores visibles y autorización repetida en cada mutación.
- Persistir formularios antes de enviar correo, registrar su entrega y permitir reintentos idempotentes; completar consentimiento y baja de newsletter.
- Establecer gates de seguridad, accesibilidad, SEO, pruebas, migraciones y promoción para que “funciona en local” no sea equivalente a “entregable”.
- Retirar de la ruta productiva los datos TypeScript de muestra y ocultar integraciones decorativas o no configuradas.

## Capabilities

### New Capabilities

- `editorial-content`: ciclo público y administrativo de noticias y blog, incluida publicación segura, medios y descubrimiento.
- `course-catalog-enrollment`: catálogo, ofertas, cupos e inscripciones autenticadas de cursos.
- `identity-access`: autenticación completa, perfiles, roles y fronteras de autorización.
- `admin-cms`: operaciones administrativas, estados, auditoría y tratamiento seguro de PII.
- `public-forms-delivery`: contacto, solicitud RIE-BVH, newsletter y seguimiento fiable del correo.
- `release-readiness`: condiciones transversales que hacen verificable y promovible la V1.

### Modified Capabilities

Ninguna. OpenSpec se incorpora por primera vez y todavía no existen especificaciones base en `openspec/specs/`.

## Impact

- **Código:** rutas públicas y administrativas de App Router, `src/modules`, componentes compartidos, manejadores API, auth y middleware/proxy.
- **Datos:** tablas, funciones, triggers, RLS y Storage de Supabase mediante migraciones ascendentes.
- **Integraciones:** Supabase Auth/Storage, Resend y, cuando se autorice la cuenta correcta, protección antiabuso de Cloudflare.
- **Operación:** variables server-only, previews aislados, gates de prueba, evidencia de migración, rollback y runbooks.
- **Compatibilidad:** no se promete conservar URLs de slugs cambiados en V1; el CMS debe advertir y evitar cambios accidentales después de publicar.

## Non-goals

- Pagos en línea, trading, cartera, cotizaciones bursátiles en tiempo real o dashboard avanzado de inversión.
- Campañas masivas de email, comentarios, WYSIWYG avanzado, aplicación nativa o arquitectura de microservicios.
- Crear recursos, desplegar o aplicar migraciones en cuentas remotas como parte automática de este cambio.

## Risks and external dependencies

- Las migraciones locales deben probarse contra una base desechable y luego promoverse con autorización; todavía no hay evidencia remota.
- La credencial histórica expuesta de Resend requiere rotación en el proveedor y los secretos productivos deben configurarse fuera del repositorio.
- Rate limit y Turnstile dependen de identificar y autorizar la cuenta Cloudflare correcta de BVH.
- Privacidad, retención, accesibilidad y avisos financieros necesitan validación del propietario y, donde corresponda, asesoría competente.
