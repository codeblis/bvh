# Revisión de migraciones V1

**Estado:** Migraciones, actualización heredada, autorización y concurrencia validadas localmente  
**Corte:** 2026-09-06  
**Cambio OpenSpec:** `deliver-v1-core-platform`

## Alcance

Orden revisado:

1. `20260904090000_secure_profiles_and_roles.sql`
2. `20260904091000_course_offerings.sql`
3. `20260904092000_audit_events.sql`
4. `20260904093000_editorial_media.sql`
5. `20260904094000_form_delivery_state.sql`

También se comprobaron sus dependencias en la línea base: `profiles`, `articles`, `categories`, `courses`, `course_enrollments`, formularios, `is_admin()`, `handle_new_user()` y `update_updated_at_column()`.

## Resultado estático

| Migración | Revisión | Riesgo que debe probarse |
| --- | --- | --- |
| Seguridad de perfiles y roles | Elimina lectura pública, limita columnas editables, conserva autoalta con rol `usuario` y retira políticas editoriales de autor. | Confirmar privilegios efectivos por rol y que las consultas admin continúan funcionando. No existe aún una RPC/UI confiable para administrar roles. |
| Ofertas e inscripciones | Separa catálogo/oferta, migra inscripciones, añade unicidad por oferta, serializa cupo y restringe RPC administrativas. | Probar datos heredados, último cupo concurrente, reinscripción cancelada, RLS y cambios de capacidad. |
| Auditoría | Registra cambios transaccionales con metadata limitada a estados y lectura exclusiva de admin. | Confirmar actor en operaciones autenticadas/service role, volumen y ausencia de PII en filas reales. |
| Medios editoriales | Renombra portada, exige alt, cambia slug a unicidad por tipo y crea bucket/políticas admin. | Confirmar existencia/forma de `storage`, objetos previos y comportamiento de caché/URLs bajo OpenNext. |
| Formularios y correo | Cierra inserción anónima, crea RPC estrechas service-only, estado de entrega, token de intento, consentimiento y baja. | Probar firmas, grants, reintento incierto, duplicados, datos históricos y denegación con anon/authenticated. |

## Corrección realizada

La migración de ofertas convertía `date` heredado mediante `::timestamptz`, cuyo resultado depende de la zona de la sesión. Después etiquetaba la oferta como `America/Havana`; en una sesión UTC podía mostrarse el día anterior en Cuba. La conversión ahora interpreta explícitamente `start_date` y `end_date` como medianoche de `America/Havana` mediante `timestamp at time zone`.

La prueba de privilegios reveló además que Supabase concede `EXECUTE` directamente a los roles API cuando crea funciones. Revocar solo a `PUBLIC` no retiraba ese acceso. Las migraciones ahora revocan explícitamente a `anon` las RPC de cursos protegidas, y a `anon, authenticated` las RPC internas de formularios y auditoría antes de conceder únicamente los permisos previstos.

## Preflight requerido antes de ejecutar

- Confirmar que el objetivo es una base desechable de BVH, nunca producción.
- Obtener conteos y valores no conformes sin copiar PII: estados, filas huérfanas, slugs, emails duplicados y portadas existentes.
- Crear respaldo o snapshot recuperable del entorno de prueba.
- Aplicar toda la línea desde cero y luego sobre datos sintéticos con estados heredados.
- Ejecutar pruebas SQL como `anon`, `authenticated usuario`, `authenticated admin` y `service_role`.
- Regenerar `src/types/supabase.ts` solo desde el esquema comprobado y revisar el diff.

## Evidencia de ejecución local

- Supabase CLI `2.116.0`.
- Docker Engine `29.7.2`, ejecutado localmente sin iniciar sesión.
- Postgres Supabase `17.6.1.165` en `supabase_db_bvh`.
- `supabase start` aplicó la línea completa desde cero, desde `20260719235900` hasta `20260904094000`, y ejecutó `supabase/seed.sql` sin error.
- `supabase db reset --local --version 20260901160000` reconstruyó el esquema anterior a las cinco migraciones. `supabase/fixtures/legacy_v1_data.sql` cargó usuarios, roles, cursos en tres estados, inscripciones, un borrador con portada y los tres tipos de formulario.
- `supabase migration up --local` aplicó las cinco migraciones sobre ese estado. `supabase/fixtures/assert_legacy_v1_upgrade.sql` devolvió `legacy_v1_upgrade_ok`: perfiles y formularios permanecieron, cursos/ofertas y estados de inscripción se tradujeron, y el borrador no fue publicado.
- `supabase test db --local` ejecutó `supabase/tests/authorization_rls.test.sql`: 28 pruebas, 28 correctas. Incluye `anon`, usuario, admin y concesión exclusiva a `service_role`; cubre perfiles, elevación manipulada, borradores, cursos/ofertas, inscripciones, formularios, RPC internas y auditoría.
- `supabase/tests/course_enrollment_concurrency.test.sh` lanzó dos sesiones simultáneas contra el último cupo: una confirmó, otra recibió `course_full`; el reintento devolvió el identificador existente y quedó una sola fila confirmada.
- Los tipos se regeneraron mediante `supabase gen types typescript --local --schema public`; `pnpm typecheck` terminó sin errores ni nuevas conversiones inseguras.
- Servicios externos y proyecto Supabase enlazado no fueron usados; solo `127.0.0.1:54322`.

Todos los fixtures y comandos anteriores operan exclusivamente sobre la base local desechable. No deben ejecutarse sobre una base enlazada.

## Ampliación validada el 6 de septiembre

Se aplicaron sobre el stack local las migraciones adicionales:

- `20260906090000_private_enrollment_history.sql`: RPC de historial propio con proyección limitada, sin parámetros de identidad y acceso exclusivo autenticado. Conserva la restricción pública de cursos archivados y ofertas cerradas.
- `20260906091000_admin_enrollment_capacity.sql`: tanto confirmar como completar una inscripción requieren cupo; bloquea primero la oferta y luego la inscripción. Retira escrituras directas de inscripciones y cambios directos de capacidad a `authenticated`; conserva actualización de estado de oferta necesaria para el cierre del CMS, sujeta a RLS admin.

`pnpm test:db` pasó **45 pruebas**: las 28 originales, 10 de aislamiento/historial y 7 de capacidad administrativa. `pnpm test:concurrency` volvió a pasar. Los tipos locales incluyen la RPC de historial y el recorrido de cursos en navegador verifica cierre, cancelación y archivo sin perder información privada. Estas dos migraciones se probaron como actualización local; la evidencia de reconstrucción desde cero y actualización heredada del apartado anterior corresponde a las cinco migraciones iniciales.
