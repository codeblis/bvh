## Context

El repositorio nació como una experiencia Next.js con páginas y datos de demostración. El trabajo local ya encaminó un monolito modular, repositorios server-side, CMS, migraciones de Supabase y pruebas, pero esas migraciones no se han ensayado ni aplicado en un entorno remoto verificado. OpenSpec entra a mitad del proceso; este cambio registra el diseño vigente y mantiene separadas la implementación local, la evidencia de entorno y la aceptación final. Véanse `proposal.md`, las specs de este cambio y `docs/ADR-Arquitectura-BVH.md`.

Restricciones principales:

- Noticias, blog y cursos son obligatorios en web y CMS.
- Supabase será la fuente de identidad, datos y medios; Resend enviará correo.
- El destino previsto usa OpenNext y Cloudflare, pero la cuenta correcta de BVH aún debe confirmarse antes de crear recursos.
- Hay cambios preexistentes y cinco migraciones locales que deben preservarse y probarse de forma ascendente.
- La V1 maneja PII y roles; la seguridad no puede depender de componentes ocultos.

## Goals / Non-Goals

**Goals:**

- Mantener una sola aplicación desplegable con límites claros entre contenido, cursos, identidad, formularios y administración.
- Hacer que la base aplique invariantes críticas y que el servidor orqueste autorización, validación, auditoría e invalidación.
- Tratar correo, caché y otros efectos externos como posteriores a la persistencia y reintentables.
- Permitir validar cada capa localmente y promoverla por entorno con evidencia.

**Non-Goals:**

- Extraer microservicios, introducir un CMS de terceros o construir una plataforma genérica de aprendizaje.
- Procesar pagos, enviar campañas masivas o almacenar HTML editorial arbitrario.
- Automatizar la selección de cuentas, secretos, migraciones o despliegues remotos.

## Decisions

### 1. Monolito modular con App Router como adaptador

La aplicación seguirá siendo un único artefacto Next.js. La lógica de dominio y acceso a datos se concentra en `src/modules/<dominio>`; páginas, Route Handlers y Server Actions traducen HTTP/UI a casos de uso.

**Razón:** reduce operación y latencia organizacional para la V1 sin mezclar reglas de negocio en componentes. **Alternativa descartada:** microservicios por módulo; agregan despliegues, contratos y observabilidad sin una escala que los justifique.

### 2. Supabase como fuente única, con invariantes en Postgres

Contenido, cursos, perfiles y formularios se leen y escriben en Supabase. Restricciones, índices, funciones transaccionales y RLS protegen unicidad, cupos, roles y acceso incluso si una ruta se invoca fuera de la UI.

**Razón:** las comprobaciones solo en React o en una acción no protegen concurrencia ni clientes alternativos. **Alternativa descartada:** mantener arrays TypeScript como fallback productivo; oculta fallos de entorno y divide la fuente de verdad.

### 3. Modelo editorial unificado y catálogo de cursos separado de ofertas

Noticias y blog comparten `articles` y se distinguen mediante un tipo validado. Los cursos conservan contenido estable y se relacionan con ofertas fechadas e inscripciones.

**Razón:** reutiliza flujo editorial donde el ciclo de vida es igual, pero evita duplicar un curso por cada cohorte. **Alternativa descartada:** tablas separadas de noticias/blog y una tabla plana de cursos; multiplican código o mezclan identidad con calendario.

### 4. Autorización doble: servidor y RLS

Una función común de servidor resuelve sesión y rol antes de una operación; RLS y funciones con permisos mínimos vuelven a imponer la frontera. El cliente nunca decide actor, rol efectivo ni propiedad.

**Razón:** mejora mensajes y navegación sin convertir el servidor web en el único control. **Alternativa descartada:** proteger solo `/admin` mediante navegación o proxy, porque las acciones y APIs seguirían invocables directamente.

### 5. Lectura pública server-side y preview autenticado

La web consulta repositorios server-side de registros publicados. Los borradores solo se renderizan en una ruta administrativa autenticada con `noindex`. La caché se invalida después de confirmar la mutación.

**Razón:** evita exponer credenciales o borradores y permite metadata real. **Alternativa descartada:** generar todo desde datos locales o consultar libremente desde el navegador.

### 6. Markdown restringido y medios administrados

La V1 renderiza un subconjunto seguro de Markdown y almacena rutas de portada con alt obligatorio en un bucket controlado. HTML crudo e imágenes embebidas en el cuerpo quedan fuera.

**Razón:** cubre el contenido requerido con una superficie XSS y editorial pequeña. **Alternativa descartada:** WYSIWYG/HTML arbitrario, que exige sanitización, migración y QA mucho mayores.

### 7. Persistir antes de efectos externos

Contacto, RIE-BVH, newsletter e inscripción registran primero el hecho de negocio y un estado de entrega. El correo se intenta después con una clave idempotente y cada resultado actualiza el registro; un operador puede reintentar.

**Razón:** un proveedor caído no debe borrar solicitudes ni producir falso éxito. **Alternativa descartada:** enviar primero o hacer envío flotante sin estado durable.

### 8. Credencial privilegiada solo en rutas server-only

Las operaciones públicas que necesitan atravesar políticas cerradas invocan funciones estrechas mediante una credencial de servicio sin prefijo público. Las funciones no son ejecutables directamente por roles de navegador.

**Razón:** permite persistencia controlada sin abrir inserciones generales. **Alternativa descartada:** conceder escritura anónima directa a tablas sensibles.

### 9. Documentación con responsabilidades separadas

OpenSpec administra propuestas, deltas de comportamiento, diseño y tareas. `docs/` conserva ADR inmutables, operación, infraestructura, riesgos, evidencia y la especificación contractual legible por negocio. Al archivar, las specs OpenSpec pasan a representar el comportamiento vigente.

**Razón:** evita que un roadmap o un relevo se interprete como contrato actual. **Alternativa descartada:** reemplazar de inmediato todos los documentos históricos y romper sus enlaces.

## Risks / Trade-offs

- **Migraciones no ensayadas pueden fallar con datos reales** → probar en base desechable, revisar restricciones y semillas, regenerar tipos y promover por etapas.
- **La service role amplía el impacto de un error server-side** → importar desde un módulo server-only, usar funciones estrechas, seleccionar columnas explícitas y no exponer valores en logs o cliente.
- **Invalidación/caché puede diferir bajo OpenNext** → probar publicación y despublicación en preview real antes de producción; no asumir equivalencia con desarrollo local.
- **Email aceptado con confirmación local fallida puede duplicarse** → reutilizar la misma clave idempotente para el mismo intento lógico y mostrar el estado incierto al operador.
- **Turnstile o rate limit en una cuenta equivocada crea recursos ajenos** → bloquear toda creación hasta confirmar cuenta, zona, nombres y propiedad de BVH.
- **Un solo rol administrador concentra privilegio** → mínimo privilegio, auditoría y protección contra cambios de rol propios; introducir `editor` solo si aparece una responsabilidad real separada.
- **OpenSpec incorporado a mitad del cambio pierde secuencia histórica perfecta** → declarar este hecho, no marcar evidencia remota inexistente y archivar solo tras completar aceptación.

## Migration Plan

1. Validar artefactos OpenSpec y alinear referencias de `docs/` sin eliminar historial.
2. Revisar las cinco migraciones locales, orden, compatibilidad con datos existentes y funciones/RLS por `anon`, `authenticated` y `admin`.
3. Aplicar desde cero y sobre una copia sintética representativa en una base desechable; regenerar tipos y ejecutar integración.
4. Configurar un preview aislado con Supabase, Storage, callbacks y Resend de prueba; confirmar después la cuenta Cloudflare correcta antes de antiabuso o despliegue.
5. Ejecutar `pnpm check`, integración, E2E, accesibilidad, seguridad, metadata, sitemap y smoke de los flujos de cada spec.
6. Preparar backup/restauración, migración correctiva y redeploy del último commit estable como mecanismos de recuperación.
7. Con autorización explícita, promover exactamente la candidata aprobada, ejecutar smoke no destructivo y registrar commit, migraciones, operador y resultado.

La recuperación de datos será mediante restauración comprobada o migración correctiva; no se borrará historial para revertir. Contenido problemático se despublica o archiva.

## Open Questions

- Definir retención, exportación y borrado de PII tras revisión legal del propietario.
- Confirmar dominio remitente, destinatarios operativos y política de alertas de Resend.
- Confirmar identificadores de la cuenta y zona Cloudflare de BVH antes de crear Turnstile, rate limiting o desplegar.
