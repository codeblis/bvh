## Purpose

Define el CMS mínimo que permite operar la V1 sin recurrir a consolas de base de datos y sin confiar la seguridad a la navegación visual.

## ADDED Requirements

### Requirement: Cobertura administrativa mínima
El CMS SHALL permitir a un administrador gestionar noticias, blog, categorías, cursos, ofertas, inscripciones, formularios, newsletter, usuarios, roles y auditoría necesarios para la V1.

#### Scenario: Operación sin consola externa
- **WHEN** un administrador mantiene contenido, una oferta o el estado de una solicitud
- **THEN** completa el flujo desde el CMS y el resultado persistido queda visible

### Requirement: Contrato seguro de mutación
Toda mutación administrativa MUST repetir autorización, validar una lista positiva de entrada, comprobar el resultado persistente, registrar auditoría cuando corresponda e invalidar o ejecutar efectos externos solo después del guardado.

#### Scenario: Error de base
- **WHEN** la operación persistente falla
- **THEN** el CMS muestra un error accionable, conserva los datos recuperables y no informa éxito

#### Scenario: Payload manipulable
- **WHEN** el cliente envía identidad, rol, estado o propiedad que no puede decidir
- **THEN** el servidor deriva el valor confiable o rechaza la operación

### Requirement: Estados operables
Las pantallas administrativas SHALL contemplar carga, vacío, error, falta de permiso y éxito, y las listas SHALL permitir búsqueda, filtros relevantes y paginación o límites explícitos.

#### Scenario: Lista vacía
- **WHEN** una consulta autorizada no encuentra registros
- **THEN** el CMS muestra un estado vacío útil en lugar de datos inventados o una pantalla rota

#### Scenario: Sesión expirada
- **WHEN** expira la sesión durante una operación protegida
- **THEN** el sistema dirige al login con un retorno local seguro y no confirma la mutación

### Requirement: Acciones sensibles y auditoría
Publicación, despublicación, cambios de rol, cambios de inscripción y reintentos de correo SHALL registrar actor, acción, recurso, fecha UTC, resultado e identificador de solicitud sin copiar secretos o PII completa.

#### Scenario: Revisión de actividad
- **WHEN** un administrador consulta auditoría
- **THEN** puede identificar quién realizó una acción sensible, sobre qué recurso y con qué resultado

### Requirement: Confirmación y protección de datos
Las acciones destructivas SHALL explicar su impacto y requerir confirmación, y cualquier exportación de PII MUST restringirse a administradores y neutralizar contenido ejecutable de hojas de cálculo.

#### Scenario: Exportación segura
- **WHEN** un administrador autorizado exporta datos personales permitidos
- **THEN** el sistema registra la acción y neutraliza valores que podrían interpretarse como fórmulas

#### Scenario: Usuario sin privilegio
- **WHEN** un usuario normal solicita una exportación o acción destructiva administrativa
- **THEN** el sistema responde con denegación y no revela datos ni existencia innecesaria de registros
