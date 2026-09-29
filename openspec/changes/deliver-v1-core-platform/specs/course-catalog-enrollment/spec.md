## Purpose

Define un catálogo de formación administrable con ediciones concretas e inscripciones seguras, sin incluir cobro en línea en la primera versión.

## ADDED Requirements

### Requirement: Curso y oferta son entidades separadas
El sistema SHALL conservar la identidad y descripción del curso separadas de sus ofertas fechadas, de modo que un curso pueda tener múltiples ediciones con modalidad, fechas, precio, moneda, ubicación y capacidad propias.

#### Scenario: Varias ofertas
- **WHEN** un administrador crea dos ediciones para el mismo curso
- **THEN** ambas comparten el contenido base sin duplicarlo y mantienen disponibilidad y calendario independientes

### Requirement: Catálogo público coherente
El sistema SHALL mostrar únicamente cursos activos con ofertas visibles y SHALL resolver cada enlace público a un detalle con información vigente y estados comprensibles.

#### Scenario: Oferta publicada
- **WHEN** una persona abre el detalle de un curso con una oferta abierta
- **THEN** ve fechas, zona horaria, modalidad, precio informativo, moneda y disponibilidad de esa oferta

#### Scenario: Curso no publicable
- **WHEN** un curso está en borrador, archivado o no tiene oferta visible
- **THEN** el sistema no presenta una llamada a inscripción rota ni expone información privada de la oferta

### Requirement: Inscripción autenticada e idempotente
El sistema MUST requerir sesión para inscribirse y MUST garantizar que repetir la misma solicitud produce una sola inscripción por persona y oferta.

#### Scenario: Reintento de inscripción
- **WHEN** una persona autenticada solicita dos veces la misma inscripción
- **THEN** el sistema devuelve el mismo resultado lógico y existe una sola inscripción

#### Scenario: Retorno tras login
- **WHEN** una persona sin sesión inicia la inscripción
- **THEN** el sistema la dirige al login y solo conserva un destino local seguro para volver al curso

### Requirement: Cupo transaccional
El sistema SHALL decidir el último cupo de forma atómica y MUST impedir que las inscripciones confirmadas superen la capacidad configurada.

#### Scenario: Concurrencia por el último cupo
- **WHEN** dos solicitudes válidas compiten simultáneamente por el último cupo
- **THEN** como máximo una queda confirmada y la otra recibe el estado alternativo configurado

#### Scenario: Oferta cerrada
- **WHEN** una persona intenta inscribirse en una oferta cerrada, cancelada o finalizada
- **THEN** el sistema rechaza la inscripción sin consumir cupo

### Requirement: Historial y privacidad
Cancelar o archivar SHALL conservar ofertas e inscripciones históricas, y ningún visitante MUST poder leer PII de inscritos ni enlaces privados de clase.

#### Scenario: Cancelación conservadora
- **WHEN** un administrador cancela una oferta con inscripciones
- **THEN** el historial permanece consultable por actores autorizados y el catálogo refleja la cancelación

#### Scenario: Consulta anónima
- **WHEN** un visitante consulta datos públicos del curso
- **THEN** la respuesta no contiene participantes, emails ni URL privada de sesión

### Requirement: Gestión administrativa
Un administrador SHALL poder crear y editar cursos, administrar ofertas, consultar ocupación e inscripciones y cambiar estados con resultado visible y trazabilidad.

#### Scenario: Capacidad incoherente
- **WHEN** un administrador intenta reducir la capacidad por debajo del número de confirmados
- **THEN** el sistema rechaza la operación y explica el conflicto
