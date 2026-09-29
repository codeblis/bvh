# SPEC — Formularios públicos y correo

**Estado:** Objetivo; implementación local parcial  
**Última revisión:** 2026-09-05

## 1. Alcance V1

- contacto;
- solicitud de empresa/RIE-BVH;
- suscripción y baja de newsletter;
- avisos internos asociados a esos registros;
- correo de inscripción a cursos, todavía pendiente.

## 2. Contrato de entrada

Cada endpoint acepta solo JSON, corta el cuerpo al superar 32 KiB y valida con Zod. La validación del navegador es ayuda de UX, no frontera de seguridad. Rate limit y Turnstile deben ejecutarse antes de persistir; requieren recursos de la cuenta Cloudflare correcta.

El navegador no escribe directamente estas tablas. Las rutas usan una credencial `SUPABASE_SERVICE_ROLE_KEY` server-only para invocar funciones SQL cerradas a `anon` y `authenticated`. La credencial nunca lleva prefijo `NEXT_PUBLIC`.

## 3. Orden y estados

```text
validar → persistir registro + estado pending → responder error si falla
        → enviar con clave idempotente → registrar sent/failed → responder éxito
```

| Estado | Significado |
| --- | --- |
| `unknown` | Registro histórico anterior al seguimiento. |
| `pending` | Persistido; envío aún no completado. |
| `sent` | Proveedor aceptó el mensaje y se guardó su identificador. |
| `failed` | Falló el intento; el registro permanece reintentable. |

Un fallo de correo no borra la solicitud ni presenta el registro como perdido. El CMS muestra estado e intentos. Cada reintento usa una clave derivada de referencia e intento; si el proveedor respondió pero falló guardar el resultado, repetir conserva la clave y evita duplicar ese envío lógico.

## 4. Newsletter

- Email se normaliza a minúsculas y es único.
- Suscribir un email ya activo no duplica fila ni aviso.
- Reactivar una baja registra consentimiento nuevo y rota el token de baja.
- La baja requiere UUID válido y confirmación POST; visitar el enlace no modifica estado.
- `consented_at`, `subscribed_at` y `unsubscribed_at` conservan evidencia mínima.
- Campañas masivas y preferencias temáticas quedan fuera de V1.

## 5. Privacidad y auditoría

- Errores públicos no contienen SQL, credenciales ni datos de otras personas.
- Auditoría registra actor, recurso, acción y cambio de estado; no copia el cuerpo del formulario.
- El CMS selecciona campos explícitos y solo está disponible para admin.
- Retención, exportación y borrado legal deben definirse antes de producción.

## 6. Criterios de aceptación

- Si Postgres falla, no se intenta correo y el visitante recibe error.
- Si Resend falla, la fila permanece con `failed` y admin puede reintentar.
- Repetir el mismo reintento tras fallo de persistencia no duplica correo en Resend.
- Un cliente con la anon key no puede insertar ni invocar las funciones internas.
- Suscripción repetida no crea duplicados; baja válida desactiva y una segunda baja es inocua.
- Cuerpos grandes, JSON inválido y tipos de contenido incorrectos se rechazan.
- Rate limit/Turnstile bloquean repetición automatizada una vez configurada la cuenta correcta.
