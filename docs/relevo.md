# Relevo — BVH

**Estado:** Fotografía transitoria, no fuente canónica  
**Corte:** 2026-09-08

Para decisiones y alcance usar [ADR](ADR-Arquitectura-BVH.md), [SPEC V1](SPEC-V1-BVH.md) y el cambio OpenSpec activo [`deliver-v1-core-platform`](../openspec/changes/deliver-v1-core-platform/proposal.md). La relación detallada con el código está en [Trazabilidad OpenSpec V1](TRAZABILIDAD-OPEN-SPEC-V1.md).

## Estado Git al iniciar esta documentación

```text
Rama: main
Relación remota: ahead 2 de origin/main
Cambio preexistente no rastreado: .claude/
```

`.claude/` pertenece al estado previo y no debe asumirse generado ni eliminarse.

## Estado del producto

- **Actual:** OpenSpec está inicializado con schema `spec-driven`; el primer cambio tiene proposal, seis specs, diseño y 28 tareas; 17 completadas al corte, no equivalentes a aceptación productiva.
- **Actual:** Next.js 16.2.10, React 19, Tailwind 4, Supabase, Resend y OpenNext/Cloudflare.
- **Actual:** rutas públicas y CMS existen para varios dominios.
- **Actual:** noticias y blog públicos leen artículos publicados desde Supabase mediante `src/modules/content`.
- **Actual local:** el CMS editorial valida en servidor, conserva `published_at`, protege slug/tipo publicado y exige extracto, categoría, portada y alt al publicar.
- **Actual local:** portadas usan un bucket `editorial`, ruta generada por servidor, validación de 5 MB/MIME, reemplazo compensado y limpieza; la web muestra portada y Open Graph.
- **Actual local:** preview admin no indexable y renderer Markdown seguro sin HTML ejecutable.
- **Actual local:** catálogo, detalle, disponibilidad e inscripción de cursos leen el modelo curso/oferta; el CMS gestiona varias ediciones e inscripciones.
- **Actual local:** auditoría transaccional registra cambios de artículos, cursos, ofertas, inscripciones y perfiles; el admin dispone de consulta.
- **Actual local:** `src/proxy.ts` reemplaza la convención middleware deprecada de Next.js.
- **Actual local:** los estados de curso distinguen catálogo (`borrador`, `activo`, `archivado`) de cada edición.
- **Actual local:** búsqueda, categoría y página editoriales quedan en URL; la lectura pública tiene límite explícito de 100 artículos por tipo.
- **Actual local:** contacto, solicitudes y newsletter persisten antes del correo, guardan estado del aviso y permiten reintento admin idempotente.
- **Actual local:** newsletter no duplica altas activas, registra consentimiento, rota token al reactivar y ofrece baja confirmada por POST.
- **Actual local:** endpoints públicos exigen JSON y cortan cuerpos mayores de 32 KiB; sus RPC internas requieren service role.
- **Actual local:** las cinco migraciones del 4 de septiembre se aplicaron desde cero y sobre datos sintéticos heredados. Hay pruebas SQL de autorización y de concurrencia; véase [evidencia](REVISION-MIGRACIONES-V1.md). Las migraciones remotas siguen pendientes.
- **Actual local:** Docker Desktop y Supabase CLI están instalados. El stack local dispone de Postgres, Auth, API, Storage y Mailpit.
- **Actual local:** noticias, blog y cursos pasan tres recorridos E2E en Chrome sobre build de producción y Supabase local, con sesiones separadas. Historial propio conserva cursos archivados y ofertas cerradas/canceladas mediante RPC restringida (ADR-014). Véase [E2E](PRUEBAS-E2E-V1.md).
- **Actual local:** dos migraciones adicionales del 6 de septiembre protegen historial y capacidad administrativa; pasan 45 pruebas SQL y concurrencia de último cupo.
- **Pendiente:** mover paginación al servidor cuando el corpus supere el límite V1 y completar aceptación en preview remoto.
- **Actual local:** formularios públicos y entrega de avisos tienen recorrido E2E propio. Un proveedor de correo sintético local (`e2e/resend-stub.mjs`) permite provocar rechazo, aceptación y corte de conexión: la solicitud persiste antes del correo, los estados `pending/sent/failed` y el contador de intentos son coherentes, el reintento administrativo cierra el aviso y un resultado incierto reutiliza la misma clave idempotente. Tareas 3.4 y 3.5 completas; véase [E2E](PRUEBAS-E2E-V1.md).
- **Actual local:** registro y contraseña validan en servidor; confirmación/recuperación pasan con Mailpit, callbacks usan origen canónico y metadata manipulada no eleva roles. Tres E2E de identidad y diez unitarias nuevas; ADR-015.
- **Actual local:** las once vistas del panel pasan revisión por rol (admin, usuario y visitante) con E2E propio. Empresas e índices —los dos módulos que aún ignoraban errores de Supabase— ahora validan en servidor, suben la lectura fallida al límite de error, explican el fallo de escritura y confirman el borrado. Tarea 3.6 completa.
- **Actual local:** existe `robots.txt` con las áreas privadas excluidas; home y los tres índices declaran título, descripción y canonical propios; el detalle publicado entra al sitemap y el borrador y su preview quedan fuera. Tarea 4.3 completa.
- **Actual local:** ni el HTML ni los scripts públicos llevan la clave de servicio o la del proveedor de correo; los fallos de consulta no exponen SQL al navegador; el acuse de los formularios solo devuelve la referencia; la auditoría guarda el hecho y no el contenido personal. Tarea 4.4 verificada salvo la exportación.
- **Actual local:** los formularios públicos tienen límite de envíos por cliente y ruta, con el contador en la base y la clave en forma de hash. Turnstile está implementado y queda inerte sin claves; con ellas rechaza envíos sin token y también los rechaza si el verificador no responde.
- **Actual local:** el panel exporta los suscriptores del newsletter en CSV con las fórmulas neutralizadas y la descarga auditada (actor, recurso y número de filas, sin contenido). Tarea 4.4 completa. Exportar mensajes y solicitudes es trivial con el mismo ayudante, pero su retención la decide el propietario (6.1).
- **Actual local:** el sitio respeta `prefers-reduced-motion`, las páginas públicas tienen región principal y salto al contenido, los flujos críticos no desbordan a 320/768/1280 px y contacto se envía solo con teclado. Tarea 4.2 verificada salvo el recorrido con lector de pantalla real.
- **Actual local:** el panel se rediseñó como mesa de trabajo: la cabecera pública ofrece «Panel» a las cuentas administradoras —antes no había ningún enlace visible—, la navegación se agrupa por trabajo y muestra cuántos asuntos esperan, el resumen prioriza lo que requiere acción sobre las cifras, y el editor separa manuscrito de ficha de publicación con la acción principal siempre visible. El ticker de mercado ya no aparece en el panel.
- **Actual local:** el CMS gestiona categorías y roles. `set_profile_role` es la única vía de cambio de rol: exige administrador y prohíbe cambiar el propio, de modo que siempre queda alguien con acceso al panel. La auditoría describe además el rol anterior y el nuevo.
- **Pendiente:** antiabuso, correo de cursos y operación productiva verificada.
- **Nota:** `companies` e `indices` se administran desde el CMS pero ninguna página pública los consume todavía; `/mercados` e `/indices` siguen con datos estáticos.

## Verificación observada

- `pnpm check`: pasó con configuración local; incluye lint, typecheck, 35 unitarias y build.
- `pnpm test:e2e`: 39/39 correctas (1,8 min), sobre servidor de producción local.
- `pnpm test:db`: 79/79 correctas; concurrencia del último cupo e idempotencia también correctas.
- Validación OpenSpec estricta y `git diff --check`: correctos.

## Bloqueos críticos

1. Completar flujos restantes, gestión CMS faltante y validación en preview aislado antes de promover migraciones.
2. Credencial histórica de Resend expuesta; requiere rotación en proveedor.
3. Turnstile espera claves de la cuenta Cloudflare correcta. El límite de envíos ya está activo y no depende de nadie.

## Otros defectos conocidos

- Auth pasa E2E local; falta validar SMTP externo, callbacks del preview y apertura de enlaces entre dispositivos.
- Las páginas institucionales y de autenticación siguen siendo componentes cliente sin metadata propia: heredan título y descripción del layout raíz y no declaran canonical.

## Próximo movimiento recomendado

Las once tareas restantes están convertidas en pasos ejecutables con su comprobación en [Puesta en marcha](PUESTA-EN-MARCHA.md); ninguna se ha ejecutado. Con categorías y roles, el CMS ya cubre la lista del contrato. Quedan dos tareas de la sección 4 a falta de un paso cada una: 4.2 espera un recorrido manual con lector de pantalla y 4.4 espera la decisión del propietario sobre la exportación de datos. El resto —rotación de Resend, preview aislado, Turnstile y rate limit, aceptación y promoción— depende de cuentas y autorizaciones externas. Turnstile/rate limit espera la cuenta Cloudflare correcta. Los recorridos editoriales, de cursos e identidad se ejecutan con `pnpm test:e2e`.

## Comandos de trabajo

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
openspec status --change deliver-v1-core-platform
openspec validate deliver-v1-core-platform --strict --no-interactive
```

No ejecutar `pnpm deploy` sin autorización, gates y reconciliación previa del flujo de ramas.
