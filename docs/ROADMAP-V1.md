# Roadmap técnico de la V1

**Estado:** Objetivo  
**Corte:** 2026-09-04

El orden sigue riesgo y dependencia. Seguridad y fuente única preceden al pulido visual. Cada fase termina con evidencia; marcar una tarea no sustituye sus criterios.

## Fase 0 — Contención de riesgos críticos

- Rotar la clave de Resend expuesta y verificar revocación.
- [x] Preparar corrección RLS de `profiles`: sin lectura pública de email, sin autoedición de rol.
- [x] Sanitizar `callbackUrl` con allowlist local.
- [x] Hacer visibles los errores del CMS editorial y de cursos.
- Añadir pruebas negativas para usuario, admin y anónimo.

**Salida:** no existe escalación conocida, la clave antigua falla y las pruebas de abuso pasan.

## Fase 1 — Base de dominio y repositorios

- [x] Definir tipos/esquemas Zod para contenido y cursos en límites, no en UI.
- [x] Crear repositorios server-only de contenido y cursos.
- [x] Diseñar migración `course_offerings` e inscripción por oferta.
- [x] Preparar auditoría mínima transaccional y consulta administrativa.
- [x] Diseñar e implementar localmente estado observable de email para formularios.
- [x] Definir bucket/políticas de Storage en migración local.

**Salida:** migraciones pasan en base desechable; repositorios tienen pruebas y no exponen borradores/PII.

## Fase 2 — Noticias y blog end-to-end

- Migrar semillas actuales a Supabase conservando slugs.
- [x] Reemplazar y retirar `src/data/noticias.ts` y `src/data/blog.ts` de la lectura pública.
- [x] Implementar renderer Markdown seguro, portada, preview, publicación e invalidación.
- [x] Completar búsqueda/categorías compartibles por URL y paginación local acotada.
- [x] Completar 404, metadata, sitemap publicado y Open Graph con portada.
- Retirar código estático cuando paridad esté probada.

**Salida:** AC-01, AC-02, AC-03 y [SPEC de contenido](specs/CONTENIDO.md) pasan.

## Fase 3 — Cursos end-to-end

- [x] Preparar migración de catálogo a modelo curso/oferta.
- [x] Crear catálogo y detalle público; reparar CTAs 404.
- [x] Implementar inscripción autenticada idempotente y cupo atómico mediante RPC.
- [x] Completar CMS para varias ofertas e inscripciones.
- [x] Completar emails reintentables para inscripciones.

**Salida:** AC-04, AC-05, AC-06 y [SPEC de cursos](specs/CURSOS.md) pasan.

## Fase 4 — Auth, CMS y formularios

- Completar prueba E2E de verificación y recuperación de contraseña.
- [x] Ocultar OAuth no configurado.
- Aplicar roles `usuario/admin` en cada acción y RLS; diferir `editor` hasta confirmación.
- Añadir rate limiting, Turnstile y validación uniforme.
- [x] Resolver contrato newsletter: alta idempotente, consentimiento y baja confirmada por token.
- [x] Añadir estados/auditoría/reintento para contacto, solicitudes y avisos de newsletter.

**Salida:** specs [Auth](specs/AUTH-Y-ROLES.md) y [CMS](specs/CMS.md) pasan sin accesos laterales.

## Fase 5 — Calidad de entrega

- Aumentar unitarias y añadir integración DB/RLS.
- Añadir E2E de visitante, usuario y admin.
- Corregir overflow móvil, foco, reducción de movimiento y estados accesibles.
- Validar la sustitución ya realizada de Google Fonts por una estrategia local definitiva.
- Reducir componentes cliente donde no aporten interacción.
- [x] Añadir error boundaries a módulos públicos y CMS.
- [x] Añadir página 404 coherente.
- Añadir observabilidad operacional.

**Salida:** `pnpm check`, integración y E2E pasan en CI reproducible; WCAG objetivo revisado.

## Fase 6 — Preview y producción

- Crear recursos preview aislados.
- Alinear `main`, CI y comando de promoción; retirar ambigüedad de rama `production`.
- Confirmar dominio/TLS, Supabase, Storage, Resend, Turnstile, callbacks, alertas y backups.
- Ensayar restore y rollback.
- Ejecutar aceptación con cliente y revisión legal/contenido.
- Promover commit aprobado y ejecutar smoke/observación.

**Salida:** todos los AC de [SPEC V1](SPEC-V1-BVH.md) tienen evidencia; no quedan bloqueos críticos.

## Después de V1

Pagos, comentarios/likes/bookmarks, WYSIWYG, analítica avanzada, multiidioma, datos bursátiles reales y posible R2 se evalúan con uso y requisitos reales; no se adelantan por conveniencia técnica.

**Adelantado a la V1 por decisión del propietario (2026-09-18):** las campañas de
newsletter, que este documento situaba después de la V1. El alcance acordado son
listas de consentimiento (Noticias, Blog, Institucional) y audiencias de curso
tratadas como correo operativo, no como marketing. Queda por hacer la edición de
las páginas institucionales por bloques desde el CMS.
