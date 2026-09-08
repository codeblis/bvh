# Infraestructura BVH

**Estado:** Actual (registro parcial basado en repositorio)  
**Corte:** 2026-09-06  
**Regla:** un recurso no comprobado figura como pendiente

## 1. Gate de salida V1

| Área | Estado | Evidencia/pendiente |
| --- | --- | --- |
| Aplicación Next.js | Actual | `package.json`: Next.js 16.2.10, React 19.2.4. |
| Runtime Cloudflare | Actual en configuración | OpenNext y `wrangler.jsonc`; despliegue vivo no verificado en esta auditoría. |
| Dominio raíz | Actual en configuración | `bolsadelahabana.com`. DNS/TLS vivo pendiente de comprobar. |
| Dominio app | Actual en configuración | `app.bolsadelahabana.com` en entorno `app`. DNS/TLS vivo pendiente. |
| Supabase | Actual | Migraciones y cliente presentes; proyecto remoto/backup no auditado. |
| Resend | Actual en código | Integración presente; credencial histórica expuesta debe rotarse. |
| Storage editorial | Actual local | Migración crea bucket/políticas/límites; aplicación remota y lifecycle por probar. |
| Preview aislado | Pendiente | No está demostrado por configuración del repo. |
| Backups y restore | Pendiente | Retención y ensayo no verificados. |
| Observabilidad | Actual (parcial) | Workers observability habilitada; alertas y correlación no verificadas. |
| Seguridad de formularios | Pendiente | Rate limiting y Turnstile faltantes. |

## 2. Topología actual conocida

```text
Internet
  └─ Cloudflare custom domain
       └─ OpenNext Worker + assets
            ├─ Supabase Auth/Postgres
            └─ Resend
```

`wrangler.jsonc` define `nodejs_compat`, assets `.open-next/assets`, observabilidad con muestreo configurado y dos nombres de Worker: base `bvh` y entorno `app` como `bvh-app`.

## 3. Datos

**Actual:** migraciones SQL para perfiles, categorías, artículos, comentarios, likes, bookmarks, cursos, inscripciones, empresas, índices, newsletter, contacto y solicitudes de empresas. RLS está habilitado.

**Bloqueado para release:** las migraciones de seguridad pasan pruebas por rol en base local desechable; aplicación y aceptación en preview siguen pendientes antes de producción.

**Actual local:** migraciones forward-only añaden `course_offerings`, auditoría, políticas de mínimo privilegio, Storage editorial, historial propio y estado observable/reintentable de avisos. Están aplicadas en Supabase local; faltan entornos remotos.

## 4. Entornos objetivo

| Recurso | Local | Preview | Producción |
| --- | --- | --- | --- |
| Aplicación | `pnpm dev` | Worker/URL aislado | dominio aprobado |
| Supabase | local o proyecto de desarrollo | proyecto preview | proyecto producción |
| Storage | bucket dev | bucket preview | bucket producción |
| Resend | destinatarios/dominio prueba | dominio prueba | dominio verificado |
| Turnstile | claves prueba | widget preview | widget producción |

Hoy solo el runtime local y configuración Cloudflare productiva aparecen claramente en repo. Los demás recursos requieren inventario y prueba.

## 5. Variables y secretos

Nombres esperados deben mantenerse en `.env.example`; valores viven en gestores locales/Cloudflare/Supabase, nunca aquí. Inventario mínimo por confirmar:

- URL y claves públicas de Supabase;
- `SUPABASE_SERVICE_ROLE_KEY`, server-only, para RPC cerradas de formularios y baja;
- clave de Resend, remitente y destinatarios operativos;
- secretos de Turnstile;
- URL pública/callback por entorno;
- configuración de observabilidad y alertas.

`NEXT_PUBLIC_SITE_URL` es obligatorio para callbacks y redirecciones de identidad y debe indicar el origen público exacto del entorno. No se infiere del host interno ni de encabezados reenviados. El stack local activa confirmación de email y admite callbacks de desarrollo en 3000 y E2E en `127.0.0.1:3100`; Mailpit captura el correo en 54324. Los comodines de callback locales no son una plantilla para producción.

**Bloqueado:** revocar y rotar la clave Resend expuesta en historial; luego verificar que el valor anterior ya no funciona. No registrar ninguno de ambos valores.

## 6. Dominios, DNS y correo

- Confirmar propietario y acceso de `bolsadelahabana.com`.
- Registrar A/AAAA/CNAME o custom domain efectivo, TLS y renovación automática.
- Configurar SPF, DKIM y DMARC del dominio remitente de Resend.
- Verificar callbacks de Auth para cada entorno; no usar producción en preview.
- Mantener aviso visible de que índices/datos demostrativos no son información bursátil real hasta validación de producto/legal.

## 7. Observabilidad y recuperación objetivo

- Logs estructurados con entorno, versión/commit, request ID, ruta, resultado y duración; sin tokens ni PII completa.
- Métricas: errores 5xx, auth, latencia, fallos de DB/email, abuso bloqueado y formularios pendientes.
- Alertas con propietario y canal comprobados.
- Backup administrado de Postgres y exportación/configuración de Storage según necesidad.
- Ensayo de restauración en entorno aislado antes del lanzamiento y periódicamente.

## 8. Evidencia operativa

Cada cambio de infraestructura registra fecha UTC, operador, recurso, cambio, verificación, rollback y ticket/commit. No se considera completado por existir una configuración local.
