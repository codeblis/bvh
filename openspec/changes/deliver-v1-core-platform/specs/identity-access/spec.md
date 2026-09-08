## Purpose

Define el ciclo de identidad de la V1 y las fronteras de autorización que protegen perfiles, roles, datos personales y áreas administrativas.

## ADDED Requirements

### Requirement: Ciclo de autenticación completo
El sistema SHALL ofrecer registro por email y contraseña, verificación cuando esté configurada, login, logout, solicitud de recuperación y establecimiento de una contraseña nueva.

#### Scenario: Registro sujeto a confirmación
- **WHEN** una persona se registra y el entorno exige verificar el email
- **THEN** el sistema informa que debe confirmar la cuenta sin declarar una sesión inexistente

#### Scenario: Recuperación válida
- **WHEN** una persona usa un enlace temporal válido y define una contraseña aceptada
- **THEN** puede completar el flujo y volver a iniciar sesión con la nueva contraseña

### Requirement: Respuestas y redirecciones seguras
Los flujos de identidad MUST evitar enumerar cuentas y SHALL aceptar como destino posterior únicamente rutas locales permitidas.

#### Scenario: Callback externo
- **WHEN** el callback recibido usa otro host, protocolo relativo, barra invertida o codificación peligrosa
- **THEN** el sistema lo reemplaza por un destino local seguro

#### Scenario: Email desconocido
- **WHEN** se solicita recuperación para un email no registrado
- **THEN** la respuesta pública es indistinguible de una solicitud aceptada

### Requirement: Rol no controlable por el cliente
Toda identidad nueva SHALL obtener el rol efectivo `usuario`, y una persona MUST NOT poder elevar su propio rol mediante formularios, payloads, API ni actualización de perfil.

#### Scenario: Elevación manipulada
- **WHEN** un usuario envía `role=admin` al crear o actualizar su perfil
- **THEN** el sistema ignora o rechaza el campo y su rol permanece sin cambios

#### Scenario: Cambio administrativo
- **WHEN** un administrador autorizado cambia el rol de otra persona
- **THEN** el sistema registra actor, objetivo, valor anterior, valor nuevo y resultado

### Requirement: Autorización en profundidad
Cada página privada y cada mutación protegida SHALL comprobar sesión y rol en servidor, y la política de datos MUST seguir negando la operación si se omite o evade la interfaz.

#### Scenario: Invocación directa no autorizada
- **WHEN** un usuario normal invoca directamente una acción administrativa
- **THEN** el sistema la rechaza sin modificar datos

#### Scenario: Lectura anónima de perfiles
- **WHEN** un cliente anónimo intenta listar perfiles
- **THEN** no obtiene emails, roles ni otros campos privados

### Requirement: OAuth condicionado al entorno
El sistema SHALL mostrar un proveedor OAuth únicamente cuando esté configurado y probado en el entorno activo.

#### Scenario: Proveedor ausente
- **WHEN** no existe configuración funcional para un proveedor OAuth
- **THEN** su control no aparece como acción activa
