## 1. Reconciliar implementación y contrato

- [x] 1.1 Trazar el diff local existente contra las seis specs del cambio, registrar cualquier brecha concreta y verificar que no se sobrescribieron cambios ajenos mediante `git diff` y `git status --short`.
- [x] 1.2 Actualizar `docs/README.md`, `docs/FLUJO-DESARROLLO.md`, `docs/relevo.md` y referencias afectadas para explicar la autoridad y el ciclo OpenSpec; verificar enlaces y `openspec doctor`.
- [x] 1.3 Revisar que los antiguos datos TypeScript de noticias/blog ya no sean una fuente productiva ni exista un fallback silencioso; verificar búsquedas de imports y pruebas de repositorio.

## 2. Base de datos y autorización

- [x] 2.1 Revisar en orden las cinco migraciones locales del 4 de septiembre, sus dependencias, compatibilidad con filas existentes, privilegios, triggers e índices; documentar hallazgos y validar SQL en una base desechable.
- [x] 2.2 Aplicar las migraciones desde cero y sobre datos sintéticos representativos; verificar que la migración ascendente termina sin intervención ni pérdida inesperada.
- [x] 2.3 Ejecutar pruebas de RLS por tabla sensible con `anon`, usuario autenticado y admin, incluyendo elevación de rol, borradores, perfiles, inscripciones, formularios y funciones internas; conservar resultados reproducibles.
- [x] 2.4 Probar simultáneamente dos inscripciones al último cupo y el reintento de una inscripción existente; verificar una sola inscripción por usuario/oferta y capacidad nunca excedida.
- [x] 2.5 Regenerar tipos de Supabase desde el esquema validado y comprobar que `pnpm typecheck` pasa sin conversiones inseguras nuevas.

## 3. Flujos funcionales de la V1

- [x] 3.1 Cubrir con integración/E2E la creación, preview, publicación, edición y despublicación de una noticia y un post; verificar separación por tipo, portada/alt, caché, 404, metadata y sitemap.
- [x] 3.2 Cubrir con integración/E2E el catálogo, detalle, ofertas, inscripción autenticada, área de usuario y gestión administrativa de estados; verificar vacío, cerrado, sin cupo y cancelado.
- [x] 3.3 Cubrir registro, confirmación, login, logout y recuperación en un entorno controlado; verificar respuestas no enumeradoras, callbacks hostiles y que `role=admin` desde cliente no cambia privilegios.
- [x] 3.4 Cubrir contacto, RIE-BVH, suscripción, reactivación y baja de newsletter; verificar JSON inválido, cuerpo excesivo, duplicados, confirmación POST y denegación de escritura directa con la anon key.
- [x] 3.5 Simular fallo y resultado incierto de Resend; verificar persistencia previa, estados `pending/sent/failed`, reintento administrativo y reutilización de la clave idempotente.
- [x] 3.6 Revisar cada vista del CMS con admin, usuario y visitante; verificar carga, vacío, error, sin permiso, confirmación destructiva y que ninguna falla de base se muestre como éxito.

## 4. Calidad transversal

- [x] 4.1 Ejecutar `pnpm check` y `openspec validate deliver-v1-core-platform --strict --no-interactive`; corregir toda regresión y guardar el resumen de resultados.
- [ ] 4.2 Ejecutar los flujos críticos a 320 px, tablet y escritorio solo con teclado y con lector de pantalla básico; verificar foco, etiquetas, errores, contraste, movimiento reducido y ausencia de scroll accidental.
- [x] 4.3 Verificar SEO de home, índices y detalles publicados: title, description, canonical, Open Graph, robots, sitemap y exclusión de borradores/previews mediante pruebas automatizadas o evidencia reproducible.
- [x] 4.4 Revisar logs, respuestas públicas y exportaciones para impedir secretos, tokens, SQL y PII ajena; verificar que CSV neutraliza fórmulas y que auditoría no duplica cuerpos personales.

## 5. Entornos e integraciones externas autorizadas

- [ ] 5.1 Rotar la credencial histórica de Resend en el proveedor autorizado, configurar secretos nuevos fuera del repositorio y verificar que el valor anterior ya no funciona sin registrar ninguno de los dos.
- [ ] 5.2 Configurar un preview aislado con Supabase, Storage, callbacks de Auth, service role server-only, dominio remitente y destinatarios de prueba; verificar que no comparte datos o secretos de producción.
- [ ] 5.3 Confirmar con el propietario la cuenta, zona y proyecto Cloudflare pertenecientes a BVH antes de crear recursos; registrar identificadores no secretos y comprobar que no corresponden a Yela Pérgolas.
- [ ] 5.4 Con autorización explícita sobre la cuenta confirmada, configurar rate limiting y Turnstile para formularios; verificar aceptación humana, rechazo automatizado y manejo seguro de caída del verificador.
- [ ] 5.5 Probar la candidata con OpenNext en preview real; verificar publicación/despublicación, caché, imágenes, auth, correo, errores y compatibilidad de runtime.

## 6. Aceptación y promoción

- [ ] 6.1 Acordar y documentar retención, exportación y borrado de PII, avisos financieros, privacidad y accesibilidad con el propietario y la asesoría necesaria; verificar textos y consentimientos en la candidata.
- [ ] 6.2 Restaurar un respaldo en un entorno no productivo, ejecutar smoke sobre los datos recuperados y registrar fecha, operador, duración y resultado sin copiar información sensible.
- [ ] 6.3 Ejecutar aceptación completa de los escenarios OpenSpec y AC-01 a AC-15 de `docs/SPEC-V1-BVH.md` en preview; enlazar evidencia y aprobación del propietario.
- [ ] 6.4 Con autorización explícita, promover exactamente el commit y migraciones aprobados, ejecutar smoke no destructivo y registrar despliegue, observación y estrategia de recuperación.
- [ ] 6.5 Sincronizar las specs aceptadas, archivar `deliver-v1-core-platform` y verificar `openspec validate --all --strict --no-interactive` solo cuando no quede ninguna tarea ni evidencia obligatoria pendiente.
