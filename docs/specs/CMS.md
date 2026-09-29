# SPEC — CMS BVH

**Estado:** Objetivo; implementación actual parcial  
**Última revisión:** 2026-09-04

## 1. Alcance mínimo

El CMS vive bajo `/admin` y administra:

- noticias y blog;
- categorías;
- cursos, ofertas e inscripciones;
- mensajes de contacto y solicitudes;
- newsletter y estado de entrega;
- usuarios y roles, solo para admin.

Empresas e índices pueden mantenerse, pero no retrasan los tres módulos obligatorios.

## 2. Contrato de toda mutación

```text
sesión → autorización → validación Zod → operación de base
      → comprobar error → auditoría → invalidación/efecto externo → resultado visible
```

- El ID, rol, estado y propiedad recibidos del cliente no se confían.
- La respuesta tiene éxito o error tipado; nunca se ignora un error de Supabase.
- No se muestra “guardado” hasta confirmar persistencia.
- Una mutación reintentable tiene clave o restricción de idempotencia.
- Efectos externos ocurren después de persistir y conservan estado para reintento.

## 3. Navegación y estados

- Dashboard muestra pendientes accionables, no métricas inventadas.
- Listas permiten buscar, filtrar por estado/tipo y paginar.
- Cada pantalla contempla carga, vacío, error, sin permiso y éxito.
- Formularios preservan datos cuando falla el servidor y enfocan el primer error.
- Acciones destructivas explican impacto y requieren confirmación.
- Cambios de estado usan lenguaje consistente con cada SPEC.

## 4. Publicación

El formulario editorial exige tipo, título, slug, extracto, cuerpo, categoría y portada/alt según política. Ofrece preview autenticado. Publicar y despublicar invalida la web pública solo después de confirmar base.

El formulario de cursos separa catálogo y ofertas. No permite publicar una oferta incoherente ni reducir cupo por debajo de confirmados.

## 5. Auditoría mínima

Toda operación sensible registra, sin secretos:

- actor;
- acción;
- tipo e ID del recurso;
- fecha UTC;
- resultado;
- identificador de solicitud;
- resumen de cambio cuando no contenga PII.

V1 requiere auditoría para publicación, despublicación, estados de inscripción, reintentos de correo y cambios de rol.

## 6. Permisos

La matriz canónica está en [Auth y roles](AUTH-Y-ROLES.md). El acceso a una página no concede acceso a su Server Action. Exportaciones con PII son solo de admin y deben generar evidencia.

## 7. Seguridad y privacidad

- Rutas y acciones son server-only cuando usan credenciales privilegiadas.
- Filtros no permiten seleccionar columnas sensibles arbitrarias.
- CSV neutraliza fórmulas al exportar.
- Logs y errores no incluyen tokens ni contenido personal completo.
- Subidas validan tipo, tamaño y ruta; no se ejecuta contenido activo.
- Sesiones expiradas llevan a login sin perder una redirección local segura.

## 8. Criterios de aceptación

- Admin completa los flujos de [Contenido](CONTENIDO.md) y [Cursos](CURSOS.md) sin Supabase Studio.
- Usuario y visitante reciben 403/redirect apropiado al invocar rutas y acciones admin.
- Admin puede revisar formularios, inscripciones y fallos de correo.
- Ningún error de base se convierte en mensaje de éxito.
- Publicar/despublicar actualiza sitio y sitemap según política de caché.
- Operaciones sensibles crean auditoría consultable.
- Navegación, diálogos y formularios son operables con teclado y lector de pantalla básico.
