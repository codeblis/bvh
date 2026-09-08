# SPEC — Primera versión entregable de BVH

**Estado:** Objetivo aprobado  
**Versión:** 1.0  
**Fecha:** 2026-09-04

## 1. Resultado esperado

La V1 permite que una persona autorizada publique y mantenga noticias, entradas de blog y cursos desde el CMS, y que esos cambios aparezcan correctamente en el sitio público. Incluye autenticación y operación mínima segura. Una pantalla de demostración o un formulario que solo simula éxito no satisface esta especificación.

## 2. Alcance obligatorio

| Módulo | Web pública | CMS |
| --- | --- | --- |
| Noticias | índice, búsqueda/filtro, detalle, SEO | crear, editar, publicar, despublicar |
| Blog | índice, búsqueda/filtro, detalle, SEO | crear, editar, publicar, despublicar |
| Cursos | catálogo, detalle, oferta e inscripción | curso, ofertas, cupo, estado e inscripciones |
| Auth | registro, verificación, login, logout, recuperación | usuarios, roles y acceso autorizado |
| Formularios | contacto, newsletter y curso con confirmación real | consulta, estado y reintento cuando aplique |
| Base operativa | navegación, errores, accesibilidad, privacidad, observación | auditoría mínima y manejo visible de errores |

Las reglas detalladas viven en [Contenido](specs/CONTENIDO.md), [Cursos](specs/CURSOS.md), [Auth y roles](specs/AUTH-Y-ROLES.md), [CMS](specs/CMS.md) y [Formularios y correo](specs/FORMULARIOS-Y-CORREO.md).

## 3. Usuarios V1

- **Visitante:** consulta contenido publicado, inicia auth y envía formularios protegidos.
- **Usuario:** administra su perfil permitido y sus inscripciones.
- **Administrador:** administra contenido, cursos, usuarios, formularios y operación.

El rol `editor` queda fuera de V1 salvo confirmación expresa del cliente.

## 4. Requisitos funcionales

### RF-01 — Fuente única

- Noticias, blog y cursos públicos provienen de Supabase mediante repositorios server-side.
- El CMS modifica los mismos registros.
- Borradores no son accesibles por URL pública ni por consulta anónima.

### RF-02 — Publicación editorial

- Slug validado y único por tipo.
- Crear, previsualizar, editar, publicar y despublicar.
- Portada real con texto alternativo.
- Índices con búsqueda, categoría, paginación o límite explícito.
- Detalle con metadata dinámica y estado 404 válido si no existe o no está publicado.

### RF-03 — Cursos

- Un curso conserva su identidad y puede tener varias ofertas.
- El visitante ve oferta vigente, modalidad, fecha, precio/moneda y disponibilidad.
- La inscripción autenticada es idempotente y nunca supera cupo confirmado.
- El CMS consulta y cambia el estado de inscripciones.

### RF-04 — Autenticación

- Registro email/password, verificación, login, logout y recuperación completan el ciclo.
- Redirecciones posteriores aceptan solo rutas locales permitidas.
- Proveedores OAuth no configurados no aparecen como acciones activas.
- El usuario no puede elevar su rol mediante cliente, API o actualización de perfil.

### RF-05 — Formularios y correo

- Validación server-side, límite de frecuencia y antiabuso.
- La información se persiste antes del correo.
- Un fallo externo se informa sin falso éxito y queda visible para reintento.
- Newsletter ofrece baja segura y registra consentimiento.

### RF-06 — CMS

- Toda ruta administrativa requiere sesión y rol suficiente.
- Toda mutación repite autorización, valida con Zod, verifica errores de base y registra actor/fecha/acción.
- Acciones destructivas tienen confirmación y resultado visible.

## 5. Requisitos no funcionales

- **Seguridad:** mínimo privilegio, RLS probado, secretos solo en gestores de entorno, sin PII en respuestas públicas.
- **Accesibilidad:** objetivo WCAG 2.2 nivel AA; teclado, foco, etiquetas, errores, contraste y movimiento reducido comprobados.
- **Rendimiento:** páginas editoriales renderizadas en servidor; imágenes dimensionadas; sin dependencias de red durante build que no tengan fallback controlado.
- **SEO:** `title`, description, canonical, Open Graph, sitemap y robots coherentes; borradores excluidos.
- **Fiabilidad:** errores externos no destruyen solicitudes; mutaciones idempotentes donde pueda haber reintento.
- **Observabilidad:** logs estructurados sin secretos/PII, identificador de solicitud y estados consultables en efectos externos.
- **Responsive:** flujos críticos completos a 320 px, tablet y escritorio; sin scroll horizontal accidental.

## 6. Fuera de alcance V1

- Trading, custodia, cartera o datos bursátiles en tiempo real.
- Pagos en línea para cursos.
- Campañas masivas de email.
- Editor WYSIWYG avanzado.
- Comentarios, likes y bookmarks como requisito de lanzamiento.
- Aplicación móvil nativa, multiidioma y microservicios.
- Dashboard avanzado de inversión o empresa.

## 7. Criterios de aceptación de entrega

| ID | Prueba observable | Resultado requerido |
| --- | --- | --- |
| AC-01 | Admin publica una noticia desde CMS | Aparece en `/noticias` y su detalle sin editar código ni reconstruir manualmente. |
| AC-02 | Admin publica un post | Aparece solo en `/blog`, con metadata y portada correctas. |
| AC-03 | Admin deja contenido en borrador | Usuario anónimo recibe 404 y no lo obtiene por API. |
| AC-04 | Admin crea curso y oferta | Catálogo y detalle reflejan fechas, modalidad, precio y cupo. |
| AC-05 | Usuario se inscribe dos veces | Existe una sola inscripción; el cupo no se duplica. |
| AC-06 | Último cupo recibe solicitudes concurrentes | No se confirman más inscripciones que capacidad. |
| AC-07 | Usuario cambia payload de perfil con `role=admin` | La base rechaza o ignora el campo; el rol no cambia. |
| AC-08 | Visitante consulta perfiles | No recibe email ni otros campos privados. |
| AC-09 | Recuperación de contraseña | Enlace válido permite establecer clave y volver a iniciar sesión. |
| AC-10 | `callbackUrl` externo o malformado | Se reemplaza por ruta local segura. |
| AC-11 | Resend falla tras un formulario válido | Registro permanece, estado indica fallo y admin puede reintentar. |
| AC-12 | Bot repite formulario | Rate limit/Turnstile bloquea abuso sin revelar datos internos. |
| AC-13 | Navegación solo con teclado | Foco visible, orden lógico, menús y formularios operables. |
| AC-14 | Gate de release | Lint, tipos, unitarias, integración, E2E y build pasan en entorno reproducible. |
| AC-15 | Restauración ensayada | Se recupera respaldo en entorno no productivo y queda evidencia fechada. |

## 8. Definición de terminado

La V1 está terminada cuando todos los criterios anteriores tienen evidencia enlazada, no quedan hallazgos críticos de seguridad, las variables y dominios productivos fueron comprobados, existe rollback probado y el propietario acepta contenido, legalidad y accesibilidad. “Funciona en local” no basta.

## 9. Trazabilidad

- Arquitectura: [ADR](ADR-Arquitectura-BVH.md)
- Ejecución: [Roadmap](ROADMAP-V1.md)
- Release: [Flujo de desarrollo](FLUJO-DESARROLLO.md)
- Producción: [Infraestructura](INFRAESTRUCTURA.md) y [Runbook](RUNBOOK-OPERACION.md)
- Riesgos legales: [Revisión legal y accesibilidad](REVISION-LEGAL-Y-ACCESIBILIDAD.md)
