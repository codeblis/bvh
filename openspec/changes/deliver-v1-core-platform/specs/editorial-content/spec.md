## Purpose

Define el contrato observable para publicar, descubrir y administrar noticias y artículos del blog sin depender de datos incorporados al código.

## ADDED Requirements

### Requirement: Fuente editorial única
El sistema SHALL obtener noticias y blog públicos de la misma fuente persistente que modifica el CMS, separando ambos por tipo y exponiendo únicamente registros publicados.

#### Scenario: Publicación visible sin reconstrucción
- **WHEN** un administrador publica un artículo válido desde el CMS
- **THEN** el artículo aparece en el índice y detalle públicos de su tipo sin editar datos TypeScript ni reconstruir el sitio

#### Scenario: Borrador no público
- **WHEN** un visitante solicita el slug de un borrador o de un registro inexistente
- **THEN** el sistema responde como contenido no encontrado y no revela sus datos

### Requirement: Ciclo editorial completo
El sistema MUST permitir a un administrador crear, editar, previsualizar, publicar y despublicar noticias y entradas del blog, validando título, slug, extracto, cuerpo, tipo y categoría antes de guardar.

#### Scenario: Preview autenticado
- **WHEN** un administrador previsualiza un borrador válido
- **THEN** ve su representación final en una ruta autenticada y no indexable

#### Scenario: Slug duplicado
- **WHEN** un administrador intenta guardar un slug ya usado por otro artículo del mismo tipo
- **THEN** el sistema muestra un error asociado al campo y no crea un registro parcial

### Requirement: Contenido y medios seguros
El sistema SHALL aceptar una portada con texto alternativo y un subconjunto documentado de Markdown, y MUST impedir HTML ejecutable, eventos, scripts y URLs peligrosas en la salida pública.

#### Scenario: Portada accesible
- **WHEN** se publica un artículo con portada
- **THEN** la página pública sirve el medio administrado con dimensiones apropiadas y texto alternativo no vacío

#### Scenario: Markdown hostil
- **WHEN** el cuerpo contiene HTML crudo o un enlace con protocolo no permitido
- **THEN** el sistema lo neutraliza sin ejecutar código ni crear navegación peligrosa

### Requirement: Descubrimiento compartible
Los índices SHALL ordenar por publicación descendente, ofrecer búsqueda y categoría, conservar esos filtros en la URL y limitar explícitamente el conjunto mostrado.

#### Scenario: Filtro recargable
- **WHEN** una persona busca texto y selecciona una categoría y luego recarga la URL
- **THEN** el índice conserva los filtros y muestra solo coincidencias del tipo correcto

#### Scenario: Estado vacío
- **WHEN** ningún artículo publicado coincide con los filtros
- **THEN** el sistema presenta un estado vacío comprensible y operable con teclado

### Requirement: Metadata editorial
Cada detalle publicado SHALL producir título, descripción, canonical y Open Graph derivados o configurados, y el sitemap MUST excluir borradores y previews.

#### Scenario: Artículo indexable
- **WHEN** un robot solicita la metadata de un artículo publicado
- **THEN** recibe valores coherentes con su tipo, slug, extracto y portada

#### Scenario: Borrador excluido
- **WHEN** se genera el sitemap
- **THEN** ningún borrador ni URL de preview queda incluido
