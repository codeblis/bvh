# SPEC — Cursos e inscripciones

**Estado:** Objetivo  
**Última revisión:** 2026-09-04

## 1. Propósito

Publicar un catálogo mantenible del Instituto BVH, abrir ediciones concretas e inscribir usuarios sin pagos en línea.

## 2. Modelo objetivo

### `courses`

Identidad estable del curso: `id`, `title`, `slug`, `summary`, `description_markdown`, `instructor`, `featured_image_path`, `featured_image_alt`, `status`, timestamps y campos SEO opcionales.

Estados: `borrador`, `activo`, `archivado`. Solo `activo` con una oferta visible aparece en catálogo, salvo que producto decida mostrar “próximamente”.

### `course_offerings`

Edición concreta: `id`, `course_id`, `starts_at`, `ends_at`, `timezone`, `modality`, `location_or_url`, `price_amount`, `currency`, `capacity`, `status` y timestamps.

Estados: `borrador`, `abierta`, `cerrada`, `cancelada`, `finalizada`. Precio usa decimal/numeric y moneda ISO; nunca coma flotante.

### `course_enrollments`

`id`, `offering_id`, `user_id`, `status`, `created_at`, `updated_at`, datos mínimos de contacto necesarios y fuente de consentimiento si aplica.

Restricción única `(offering_id, user_id)`. Estados: `pendiente`, `confirmada`, `lista_espera`, `cancelada`, `completada`.

## 3. Rutas públicas

- `/instituto`: catálogo y próximas ofertas.
- `/instituto/cursos/[slug]`: descripción, instructor y ofertas visibles.
- Acción de inscripción: requiere sesión; conserva destino seguro para volver tras login.
- Área de usuario mínima: muestra sus inscripciones y estados.

Todos los enlaces de curso deben resolver. La V1 no acepta tarjetas con CTA a rutas inexistentes.

## 4. Reglas de negocio

- La inscripción es idempotente: repetir petición no crea duplicados.
- Confirmar cupo ocurre atómicamente en base; contar en cliente no protege concurrencia.
- Si no hay cupo, se rechaza o crea `lista_espera` según configuración explícita de la oferta.
- Oferta cerrada, cancelada o finalizada no admite nuevas inscripciones.
- Cambiar capacidad por debajo de confirmadas requiere error y decisión administrativa.
- Cancelar curso no elimina historial ni inscripciones.
- Modalidad presencial exige ubicación; modalidad en línea no expone enlace privado públicamente.
- V1 muestra precio informativo y no procesa cobro.

## 5. CMS

El admin puede:

- crear y editar catálogo;
- adjuntar portada accesible;
- crear, abrir, cerrar, cancelar y finalizar ofertas;
- revisar cupo e inscripciones;
- cambiar estado de una inscripción con trazabilidad;
- exportar lista solo si el rol y la política de privacidad lo permiten.

No se elimina físicamente un curso con historial. Se archiva.

## 6. Permisos

| Acción | Visitante | Usuario | Admin |
| --- | ---: | ---: | ---: |
| Ver catálogo/ofertas públicas | Sí | Sí | Sí |
| Crear inscripción propia | No | Sí | Sí |
| Ver inscripción propia | No | Sí | Sí |
| Gestionar curso/oferta | No | No | Sí |
| Ver todas las inscripciones | No | No | Sí |
| Exportar PII | No | No | Sí |

## 7. Notificaciones

La base confirma la inscripción antes del email. Un fallo de Resend no elimina ni duplica la inscripción. El estado de envío queda visible y puede reintentarse idempotentemente.

## 8. Criterios de aceptación

- Admin crea curso y dos ofertas sin duplicar el contenido base.
- Publicar/archivar cambia catálogo y detalle mediante fuente única.
- Usuario inicia sesión, se inscribe y ve su estado.
- Dos solicitudes concurrentes al último cupo no sobrepasan capacidad.
- Repetir inscripción produce el mismo registro.
- Visitante no lee PII de inscritos ni enlaces privados de clase.
- Cancelación conserva historial y permite notificar/reintentar.
- Todos los estados vacíos, cerrados y sin cupo son comprensibles y accesibles.
