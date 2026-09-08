# SPEC — Noticias y blog

**Estado:** Objetivo  
**Última revisión:** 2026-09-04

## 1. Propósito

Definir un flujo editorial único para dos productos visibles: noticias institucionales y blog analítico. Ambos se administran en CMS y se publican desde Supabase.

## 2. Modelo mínimo

`articles`:

| Campo | Regla V1 |
| --- | --- |
| `id` | UUID inmutable. |
| `type` | `noticia` o `blog`; validado en base y aplicación. |
| `title` | Requerido, 5–160 caracteres. |
| `slug` | Minúsculas, URL-safe, único por `type`; no cambia automáticamente tras publicar. |
| `excerpt` | Requerido, máximo editorial definido en esquema. |
| `content` | Markdown requerido, sanitizado al renderizar. |
| `category_id` | Categoría válida; no puede apuntar a una categoría eliminada. |
| `author_id` | Perfil autorizado; la vista pública expone nombre, no email. |
| `featured_image_path` | Ruta de Storage, no URL arbitraria. |
| `featured_image_alt` | Requerido cuando existe portada. |
| `status` | `borrador` o `publicado`. |
| `published_at` | Solo se establece al publicar; se conserva al editar. |
| `created_at`, `updated_at` | Administrados por servidor/base. |

Los campos SEO opcionales `meta_title` y `meta_description` pueden sobrescribir los derivados. Si faltan, se derivan de título y extracto dentro de límites.

## 3. Rutas públicas

- `/noticias`: solo `type=noticia` y `status=publicado`.
- `/noticias/[slug]`: detalle publicado o 404.
- `/blog`: solo `type=blog` y `status=publicado`.
- `/blog/[slug]`: detalle publicado o 404.

Listas se ordenan por `published_at desc, id desc`. Búsqueda consulta título y extracto. Categorías son filtros compartibles por URL. Paginación o límite explícito evita cargar el corpus completo.

## 4. Flujo editorial

1. Admin crea borrador y tipo.
2. Servidor valida campos, slug, categoría y medio.
3. Admin previsualiza como borrador mediante ruta autenticada no indexable.
4. Al publicar, servidor confirma escritura y luego invalida caché de lista y detalle.
5. Al despublicar, la URL pública deja de responder contenido y se invalida inmediatamente.

Cambiar `type` o slug después de publicar requiere advertencia. Las redirecciones permanentes quedan fuera de V1; por eso el CMS debe evitar cambios accidentales.

## 5. Media y Markdown

- Formatos de imagen y tamaño máximo se fijan en configuración común y se validan en cliente y servidor.
- El nombre de archivo no controla la ruta final.
- El render elimina HTML peligroso, scripts, eventos y URLs no permitidas.
- Encabezados respetan jerarquía; imágenes requieren `alt`; enlaces externos se distinguen y usan atributos seguros.

La V1 implementa un subconjunto deliberado: H2/H3, párrafos, listas, citas, énfasis, código inline y enlaces HTTP(S), internos o anclas. HTML crudo se muestra como texto. Imágenes dentro del cuerpo y edición WYSIWYG quedan fuera hasta existir una necesidad editorial comprobada.

## 6. Permisos

| Acción | Visitante | Usuario | Admin |
| --- | ---: | ---: | ---: |
| Leer publicados | Sí | Sí | Sí |
| Leer borradores | No | No | Sí |
| Crear/editar | No | No | Sí |
| Publicar/despublicar | No | No | Sí |
| Gestionar categorías | No | No | Sí |

Cada acción se autoriza en servidor y RLS; el menú no es control de acceso.

## 7. SEO y accesibilidad

- Metadata dinámica por artículo, canonical por tipo/slug y Open Graph con portada.
- Sitemap incluye solo publicados; borradores y previews llevan `noindex`.
- Fecha visible y máquina (`time`), autor público sin PII y estructura semántica de artículo.
- El buscador tiene etiqueta, resultados anunciables y estado vacío comprensible.

## 8. Errores

- Slug duplicado: error de campo; no crear registro parcial.
- Fallo de subida: no publicar referencia inexistente.
- Fallo de invalidación tras guardar: guardar resulta exitoso, se registra el fallo y se ofrece reintento; no se oculta.
- Registro inexistente o borrador público: 404, nunca detalle vacío.

## 9. Criterios de aceptación

- Un admin completa creación, preview, publicación, edición y despublicación de ambos tipos.
- La web pública refleja cada cambio desde Supabase sin cambiar archivos TypeScript.
- No hay contenido cruzado entre blog y noticias.
- Un anónimo no obtiene borradores ni datos privados del autor.
- Búsqueda, categoría y navegación funcionan con URL recargable y teclado.
- Metadata, sitemap, 404, portada y texto alternativo pasan pruebas automáticas/E2E.
