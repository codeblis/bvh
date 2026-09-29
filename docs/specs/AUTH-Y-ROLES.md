# SPEC — Autenticación, sesión y roles

**Estado:** Objetivo; correcciones críticas pendientes  
**Última revisión:** 2026-09-04

## 1. Fuente de identidad

Supabase Auth identifica al usuario. `profiles` conserva datos de producto y un rol controlado. El navegador nunca recibe una credencial de servicio ni decide permisos.

Roles V1:

- `usuario`: perfil e inscripciones propias.
- `admin`: capacidades de usuario más contenido, cursos, usuarios, roles, formularios y operación.

`editor` se difiere hasta que el cliente confirme personas con responsabilidad editorial separada.

## 2. Flujos obligatorios

### Registro

1. Validar email, contraseña, aceptación y campos mínimos en servidor.
2. Crear identidad con rol efectivo `usuario`, aunque el payload solicite otro.
3. Enviar verificación mediante URL configurada por entorno.
4. Mostrar estado verificable; no declarar sesión si la cuenta requiere confirmación.

### Login y logout

- Error genérico para credenciales inválidas.
- Tras login, solo se acepta `callbackUrl` relativo incluido en allowlist; por defecto `/` o el área de usuario.
- Logout invalida sesión y páginas privadas no deben permanecer visibles por caché.

### Recuperación

1. Solicitud por email con respuesta no enumeradora.
2. Enlace único y temporal vuelve al dominio correcto del entorno.
3. Usuario define contraseña nueva con validación.
4. Sesiones anteriores se tratan según política documentada y el flujo termina en login/confirmación clara.

### OAuth

Fuera del mínimo obligatorio. Un proveedor solo aparece si está configurado y probado para el entorno. Botones decorativos o inactivos se ocultan.

## 3. Matriz de autorización

| Recurso/acción | Usuario | Admin |
| --- | ---: | ---: |
| Leer/editar perfil propio permitido | Sí | Sí |
| Cambiar rol propio | No | Solo otro admin mediante operación confiable |
| Ver inscripciones propias | Sí | Sí |
| Gestionar artículos/cursos | No | Sí |
| Gestionar usuarios/roles | No | Sí |
| Leer formularios y suscriptores | No | Sí |
| Acceder a secretos | No | No desde la aplicación |

## 4. Controles obligatorios

- Server Actions y Route Handlers llaman una función de autorización común y verifican el resultado de base.
- RLS limita cada tabla y operación. `profiles` no tiene lectura pública general.
- La actualización de perfil usa una lista positiva de columnas; `role`, `email` y campos internos quedan excluidos.
- El cambio de rol requiere admin, objetivo distinto, registro de actor/fecha y protección contra dejar el sistema sin administradores.
- Cookies usan opciones seguras del proveedor y entorno. No se registran tokens.
- Redirecciones rechazan esquema, host, `//`, barras invertidas y rutas no permitidas.
- Mensajes públicos no enumeran cuentas.

## 5. Estado actual conocido

- **Actual:** Supabase SSR y rutas/formularios de auth existen.
- **Bloqueado para release:** política de autoedición de `profiles` permite intentar cambiar `role`.
- **Bloqueado para release:** lectura pública de perfiles expone campos, incluido email.
- **Pendiente:** sanitizar `callbackUrl`.
- **Pendiente:** completar y probar recuperación de contraseña.
- **Pendiente:** ocultar OAuth no configurado.

## 6. Pruebas de aceptación

- Usuario nuevo siempre obtiene rol `usuario`.
- Payload manual con `role=admin` falla y el rol permanece igual.
- Anónimo no puede listar perfiles ni emails.
- Cada mutación admin llamada sin UI también rechaza rol insuficiente.
- Callback externo, protocol-relative y codificado termina en destino local seguro.
- Registro, verificación, login, logout y recuperación funcionan en local controlado, preview y producción.
- Pruebas de RLS cubren `anon`, `authenticated usuario` y `admin` por tabla sensible.
