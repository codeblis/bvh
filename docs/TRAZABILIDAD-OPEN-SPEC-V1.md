# Trazabilidad OpenSpec — V1 BVH

**Estado:** Implementación y verificación local en curso  
**Corte:** 2026-09-08  
**Cambio:** `deliver-v1-core-platform`

Este documento relaciona el cambio OpenSpec con la implementación y pruebas locales observadas. No demuestra estado remoto, aceptación del propietario ni preparación productiva.

## Integridad del área de trabajo

- Rama observada: `main`, dos commits por delante de `origin/main`.
- El árbol ya estaba modificado antes de incorporar OpenSpec; se preservan todos los cambios existentes.
- `.claude/` era un directorio no rastreado preexistente. No fue creado, editado ni eliminado durante esta adopción.
- OpenSpec añadió únicamente `openspec/` y `.agents/skills/openspec-*`.
- `git diff --check` no reportó errores de espacios ni marcadores inválidos al realizar esta revisión.
- La adopción inicial no ejecutó migraciones. Después se validaron reconstrucción y actualización en Supabase local desechable, sin operar sobre cuentas externas ni desplegar.

## Matriz de capacidades

| Capacidad OpenSpec | Evidencia local observada | Brecha antes de aceptación |
| --- | --- | --- |
| `editorial-content` | Repositorio server-only en `src/modules/content`; Supabase es la única fuente productiva. Dos E2E pasan creación, preview, publicación, portada/alt, edición, despublicación, metadata y sitemap en build de producción local. | Falta gestión de categorías desde CMS y comprobar caché/Open Graph/404 en OpenNext. El límite local de 100 no sustituye paginación server-side futura. |
| `course-catalog-enrollment` | Separación curso/oferta y RPC transaccionales. E2E pasa catálogo vacío, dos ofertas, inscripción, cupo, estados administrativos y conservación del historial privado. Pasan RLS, concurrencia e idempotencia con Postgres real. | Falta correo de inscripción/cancelación y aceptación en preview remoto. |
| `identity-access` | Tres E2E pasan registro con validación en servidor, confirmación/recuperación por correo local, login/logout, callbacks hostiles y metadata manipulada. RLS restringe perfiles/roles; callbacks usan origen canónico (ADR-015). | Falta SMTP/callback en preview y verificar enlaces entre dispositivos. No existe todavía gestión CMS de usuarios/roles. |
| `admin-cms` | Layout exige admin; existen contenido, cursos, ofertas, inscripciones, formularios, newsletter, reintentos y auditoría. Todas las vistas comprueban el error de lectura y las escrituras devuelven aviso explícito; los borrados destructivos exigen confirmación. Cuatro E2E cubren las once vistas con admin, usuario y visitante. | Faltan pantallas de categorías y usuarios/roles; búsqueda/paginación no es uniforme; falta revisión con teclado y lector de pantalla (4.2). No existe exportación de datos, así que el escenario «Exportación segura» sigue sin demostrarse. `companies` e `indices` no tienen consumidor público. |
| `public-forms-delivery` | Contacto, RIE-BVH y newsletter validan cuerpo acotado, persisten antes del correo, guardan estado e intentos y soportan reintento; la baja requiere POST. Grants y RLS pasan localmente y las RPC internas quedan solo para `service_role`. Seis E2E cubren entradas inválidas, escritura anónima denegada, duplicados, baja/reactivación y el ciclo fallo → reintento → enviado con clave idempotente contra un proveedor sintético local. | Falta service role en preview aislado, entrega real con la credencial rotada, rate limiting/Turnstile y correo asociado a cursos. |
| `release-readiness` | `pnpm check` y OpenSpec estricto pasan. Hay base desechable, 35 unitarias, 54 pruebas SQL, concurrencia y 30 E2E reproducibles; documentación de infraestructura, operación, riesgos y rollback. | Faltan flujos funcionales restantes, preview aislado, restore, auditoría WCAG, rotación Resend, cuenta Cloudflare correcta y aceptación del propietario. |

## Brechas prioritarias

1. Mantener los gates SQL, concurrencia y E2E al completar los flujos restantes; la base inicial ya fue validada localmente.
2. Añadir gestión administrativa de categorías y usuarios/roles o ajustar el alcance contractual mediante un nuevo delta aprobado.
3. Validar el ciclo de auth ya probado localmente con SMTP y callbacks del preview autorizado.
4. Ampliar integración/E2E para gestión de roles y para la metadata de las páginas institucionales; editorial, cursos, identidad, formularios, avisos, CMS por rol y SEO del contenido ya tienen recorridos locales.
5. Configurar preview aislado, rotar Resend y proteger formularios solo después de confirmar las cuentas correctas.
6. Completar el recorrido con lector de pantalla, la decisión sobre exportación de datos, respaldo/restauración y aceptación del propietario antes de producción.

## Evidencia local disponible

- Pruebas unitarias: contenido/Markdown, esquemas de cursos, formularios, lectura acotada de solicitudes, redirecciones seguras, adaptador de correo e idempotencia de notificaciones.
- Migraciones en alcance: cinco del 4 de septiembre y dos del 6 de septiembre; [evidencia SQL](REVISION-MIGRACIONES-V1.md).
- Recorridos de navegador y límites de esa evidencia: [pruebas E2E](PRUEBAS-E2E-V1.md).
- Verificación registrada en `docs/relevo.md`: lint, tipos, 35 unitarias, 54 SQL, 30 E2E, concurrencia, build y OpenSpec estricto pasaron localmente.

Esta matriz debe actualizarse al completar tareas. Una fila no pasa a “aceptada” por existencia de código; requiere la evidencia indicada por sus escenarios OpenSpec.
