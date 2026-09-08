## Purpose

Define formularios públicos resistentes al abuso y una entrega de correo trazable que nunca pierda una solicitud válida por un fallo externo.

## ADDED Requirements

### Requirement: Entrada pública acotada
Los endpoints de contacto, solicitud RIE-BVH y newsletter MUST aceptar únicamente el formato documentado, limitar el tamaño, validar en servidor y aplicar protección antiabuso antes de persistir.

#### Scenario: Cuerpo inválido o excesivo
- **WHEN** una solicitud usa contenido no admitido, JSON inválido o supera el límite configurado
- **THEN** el sistema la rechaza sin persistir ni intentar correo

#### Scenario: Automatización abusiva
- **WHEN** un cliente supera el límite o falla la comprobación antiabuso configurada
- **THEN** el sistema bloquea la solicitud sin revelar reglas internas ni datos existentes

### Requirement: Persistencia anterior al correo
El sistema SHALL guardar una solicitud válida con estado de entrega antes de intentar cualquier correo y MUST conservarla si el proveedor falla.

#### Scenario: Base no disponible
- **WHEN** falla la persistencia
- **THEN** el sistema no intenta enviar correo y devuelve un error sin falso éxito

#### Scenario: Proveedor no disponible
- **WHEN** la solicitud quedó guardada pero falla el correo
- **THEN** el registro permanece con estado fallido y queda disponible para revisión y reintento

### Requirement: Reintento idempotente
Cada intento de correo SHALL usar una identidad lógica estable y registrar estado, número de intento e identificador del proveedor cuando exista, de modo que repetir tras una respuesta incierta no duplique el envío lógico.

#### Scenario: Resultado incierto
- **WHEN** el proveedor acepta el correo pero falla guardar su confirmación
- **THEN** el siguiente reintento reutiliza la misma clave idempotente antes de abrir un intento nuevo

### Requirement: Consentimiento y baja de newsletter
La suscripción SHALL normalizar el email, evitar duplicados activos y conservar evidencia mínima de consentimiento; la baja MUST requerir un token válido y confirmación mediante una acción explícita que no sea una visita GET.

#### Scenario: Suscripción repetida
- **WHEN** un email ya activo vuelve a suscribirse
- **THEN** el sistema no crea una segunda suscripción ni duplica el aviso lógico

#### Scenario: Enlace previsualizado
- **WHEN** un escáner o persona abre por GET un enlace de baja válido
- **THEN** el sistema muestra confirmación pero no cambia el estado hasta recibir POST

#### Scenario: Reactivación
- **WHEN** una dirección previamente dada de baja se suscribe de nuevo con consentimiento válido
- **THEN** el sistema reactiva el registro, renueva la evidencia temporal y rota el token de baja

### Requirement: Privacidad administrativa
Solo administradores SHALL consultar solicitudes, suscriptores y estados de entrega; las respuestas y logs públicos MUST excluir SQL, tokens y PII ajena.

#### Scenario: Cliente con clave pública
- **WHEN** un cliente intenta insertar directamente o invocar una operación interna de formularios
- **THEN** la política de datos rechaza la operación
