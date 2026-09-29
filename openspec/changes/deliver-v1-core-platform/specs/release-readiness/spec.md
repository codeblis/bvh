## Purpose

Define la evidencia transversal necesaria para considerar la V1 de BVH entregable, promovible y recuperable más allá de una ejecución local exitosa.

## ADDED Requirements

### Requirement: Fuente de verdad productiva
Noticias, blog, cursos, perfiles y solicitudes SHALL proceder de servicios persistentes configurados por entorno; el sistema MUST NOT presentar datos de demostración incorporados al código como contenido productivo.

#### Scenario: Cambio administrado
- **WHEN** un administrador modifica un registro publicado
- **THEN** la web refleja la misma fuente persistente sin una edición de código

### Requirement: Gate reproducible
Una candidata de release MUST superar lint, tipos, pruebas unitarias, pruebas de integración y E2E de los flujos críticos, build reproducible y validación estricta de OpenSpec.

#### Scenario: Gate fallido
- **WHEN** falla cualquiera de los controles obligatorios o carece de evidencia
- **THEN** la candidata no se declara lista para producción

### Requirement: Datos y entornos verificables
Cada migración SHALL probarse de forma ascendente con datos representativos en una base desechable antes de promoción, y preview y producción MUST usar bases, Storage, secretos, callbacks y dominios separados.

#### Scenario: Migración no ensayada
- **WHEN** una migración solo existe en el repositorio pero no fue probada en una base desechable
- **THEN** su estado permanece pendiente y bloquea la promoción correspondiente

### Requirement: Calidad pública mínima
Los flujos críticos SHALL ser operables por teclado y a 320 px sin desbordamiento accidental; páginas públicas MUST tener estructura semántica, foco visible, contraste aceptable, reducción de movimiento y metadata coherente.

#### Scenario: Revisión accesible
- **WHEN** se recorren navegación, búsqueda, auth, formularios e inscripción solo con teclado
- **THEN** todas las acciones son alcanzables, tienen foco visible y comunican errores y estados

### Requirement: Observabilidad sin exposición
El sistema SHALL correlacionar operaciones relevantes mediante identificadores y estados consultables, y MUST NOT registrar secretos, tokens ni cuerpos completos con PII.

#### Scenario: Fallo externo investigable
- **WHEN** falla una entrega de correo u otro efecto externo
- **THEN** un operador autorizado puede localizar el registro, intento y resultado sin consultar datos sensibles en logs generales

### Requirement: Promoción y recuperación controladas
Despliegues, migraciones remotas, rotaciones y creación de recursos SHALL requerir autorización explícita, un objetivo comprobado y una estrategia de recuperación; la V1 MUST tener evidencia de restauración no productiva antes de aceptación final.

#### Scenario: Cuenta externa ambigua
- **WHEN** no se ha confirmado que una cuenta o proyecto externo pertenece a BVH
- **THEN** no se crea, modifica ni despliega ningún recurso en esa cuenta

#### Scenario: Restauración no ensayada
- **WHEN** no existe evidencia fechada de una restauración en entorno no productivo
- **THEN** la V1 no se declara operativamente terminada
