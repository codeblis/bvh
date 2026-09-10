# Puesta en marcha de la V1

**Estado:** Procedimiento preparado, ninguna ejecución realizada
**Corte:** 2026-09-09

Este documento existe porque las once tareas que quedan del cambio
[`deliver-v1-core-platform`](../openspec/changes/deliver-v1-core-platform/proposal.md)
no dependen de escribir más código, sino de credenciales, cuentas y decisiones
que solo el propietario puede aportar. Aquí está cada una convertida en pasos
concretos con su comprobación, para que ejecutarlas sea seguir la lista y
guardar la evidencia.

**Reglas que no cambian en ninguna sección.** No se escribe el valor de ningún
secreto en el repositorio, en un ticket, en un mensaje ni en estos documentos:
solo su nombre y dónde vive. Cada paso se da por hecho cuando su comprobación
pasa, no cuando el comando termina. Todo lo que se ejecute deja fecha UTC,
operador, recurso, resultado y cómo revertirlo.

---

## 5.1 Rotar la credencial de Resend

**Desbloquea:** correo real en cualquier entorno. Hoy es el bloqueo más
antiguo: hay una clave de Resend en el historial de Git, y mientras siga viva
cualquiera con acceso al historial puede enviar correo como BVH.

**Quién:** propietario de la cuenta de Resend.

**Lo que hace fácil esta rotación:** la aplicación funciona sin clave. Si
`RESEND_API_KEY` está vacía, `deliverEmail` devuelve `resend_not_configured`,
el formulario **se guarda igual** y el aviso queda en estado `failed` para
reintentarlo desde el panel. Es decir: se puede quedar sin correo unos minutos
sin perder ni una solicitud.

1. En el panel de Resend, crear una clave nueva con permiso de envío y
   nombrarla por entorno (`bvh-preview`, `bvh-produccion`). Copiarla al gestor
   de secretos, no a un archivo del repositorio.
2. Revocar la clave antigua en el mismo panel.
3. Cargar la nueva donde corresponda: en local, `.env.local`; en Cloudflare,
   `wrangler secret put RESEND_API_KEY --env app`; en el preview, su propio
   almacén.
4. Confirmar el dominio remitente y ajustar `EMAIL_FROM` y `EMAIL_TO`. En
   preview, ambos deben ser direcciones de prueba.

**Comprobación.** La antigua debe estar muerta y la nueva viva:

```bash
# Con la clave ANTIGUA en la variable, sin escribirla en el comando.
# Debe responder 401 o 403.
read -rs OLD_KEY && curl -s -o /dev/null -w '%{http_code}\n' \
  -H "Authorization: Bearer $OLD_KEY" https://api.resend.com/domains; unset OLD_KEY
```

Después, desde el panel de BVH, enviar un mensaje de contacto de prueba y
comprobar que el aviso queda **Enviado** con su identificador de proveedor. Si
quedó **Falló**, el botón «Reintentar aviso» reutiliza la clave lógica y no
duplica el envío.

**Registrar:** fecha, operador, que la clave antigua responde 401 y que un
aviso nuevo sale correctamente. Ningún valor de clave.

**Reversión:** crear otra clave nueva. Una clave revocada no se recupera.

---

## 5.2 Preview aislado

**Desbloquea:** 5.5, 6.2 y 6.3. Sin un entorno donde probar sin tocar
producción, la aceptación no se puede hacer.

**Quién:** propietario de las cuentas de Supabase y Cloudflare.

1. Crear un **proyecto Supabase nuevo** para preview. No reutilizar el de
   producción ni copiarle datos reales.
2. Aplicar el esquema versionado:
   ```bash
   supabase link --project-ref <ref-del-preview>
   supabase db push
   ```
   Las dieciocho migraciones del repositorio son la única fuente del esquema;
   no se aplican cambios a mano en el panel de Supabase.
3. En Auth → URL Configuration, poner como *Site URL* la del preview y añadir
   `<url-del-preview>/auth/callback` a las redirecciones permitidas. Sin esto,
   confirmar la cuenta y recuperar contraseña fallan.
4. En Storage, crear el bucket `editorial` con lectura pública. Las portadas
   de artículos van ahí y la web las sirve por URL pública.
5. Cargar las variables del entorno preview:

   | Variable | Valor en preview |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | proyecto preview |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | proyecto preview |
   | `SUPABASE_SERVICE_ROLE_KEY` | proyecto preview, **solo servidor** |
   | `NEXT_PUBLIC_SITE_URL` | origen público exacto del preview |
   | `RESEND_API_KEY` | clave de preview de 5.1 |
   | `EMAIL_FROM` / `EMAIL_TO` | direcciones de prueba |

   `NEXT_PUBLIC_SITE_URL` no se infiere del host ni de encabezados
   reenviados: si está mal, el callback de identidad devuelve al origen
   equivocado y la sesión se pierde.

**Comprobación.** Que esté aislado se demuestra, no se supone:

- El `project-ref` del preview es distinto del de producción.
- `select count(*) from public.profiles;` en preview no devuelve cuentas
  reales.
- Un registro de prueba en preview **no** aparece en producción.
- La clave de servicio no viaja al navegador: `curl -s <url-preview> | grep -c
  "$SUPABASE_SERVICE_ROLE_KEY"` debe dar `0`. Esto ya está cubierto por la
  prueba `privacy` en local, pero conviene repetirlo contra el preview real.

**Registrar:** identificadores no secretos (project-ref, nombre del bucket,
URL del preview) y el resultado de cada comprobación.

---

## 5.3 Confirmar la cuenta de Cloudflare

**Desbloquea:** 5.4 y 5.5. Es una comprobación de propiedad, no una
configuración: evita crear recursos de BVH en la cuenta equivocada.

**Quién:** propietario.

1. `wrangler whoami` y anotar cuenta y su identificador.
2. Confirmar con el propietario que esa cuenta y la zona
   `bolsadelahabana.com` pertenecen a BVH. **Comprobar explícitamente que no
   corresponden a Yela Pérgolas**: es el riesgo que la tarea nombra.
3. Revisar que `wrangler.jsonc` apunta a lo acordado. Hoy declara el worker
   `bvh` en `bolsadelahabana.com` y el entorno `app` como `bvh-app` en
   `app.bolsadelahabana.com`.

**Comprobación.** El propietario confirma por escrito cuenta y zona, y los
identificadores anotados coinciden con los que devuelve `wrangler whoami`.

**Registrar:** identificador de cuenta y de zona —no son secretos— y la
confirmación del propietario. Si no coinciden, **no crear ningún recurso** y
parar aquí.

---

## 5.4 Rate limiting y Turnstile

**Desbloquea:** el último bloqueo crítico del relevo. Hoy los formularios
públicos aceptan cualquier volumen: validan la entrada, cortan cuerpos de más
de 32 KiB y exigen JSON, pero nada impide mil envíos por minuto.

**Aviso de estado:** a diferencia del resto de esta lista, esta tarea **no
está implementada en el código**, solo pendiente de configuración. Antes de
configurar hay que escribir: verificación de Turnstile en servidor contra
`siteverify`, y un límite por IP y por ventana en las tres rutas de
formulario. Puedo hacerlo detrás de variables de entorno, de modo que sin
claves el sitio siga funcionando como hoy y con claves quede activo.

Cuando exista el código, la configuración es:

1. Crear el widget de Turnstile en la cuenta confirmada en 5.3 y anotar la
   clave pública; la privada va al gestor de secretos.
2. Cargar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`.
3. Definir el límite: qué ventana, cuántos envíos y por qué clave.

**Comprobación.** Los tres casos que la tarea exige:

- una persona completa el formulario y pasa;
- una petición automatizada sin token es rechazada;
- **si el verificador de Turnstile no responde**, el formulario no se queda
  colgado ni acepta a ciegas: decide de forma explícita y segura.

Ese tercer caso es el que suele olvidarse y el que conviene probar cortando la
salida hacia `challenges.cloudflare.com`.

---

## 5.5 Preview real con OpenNext

**Desbloquea:** 6.3. Toda la evidencia actual es local sobre `next build`; no
demuestra el runtime de Cloudflare.

```bash
pnpm preview   # opennextjs-cloudflare build && preview
```

**Comprobación.** Sobre el preview desplegado, no en local:

- publicar y despublicar un artículo y ver el efecto en la web;
- que una portada subida se sirva y se vea;
- registro, confirmación por correo y recuperación de contraseña completos;
- un formulario que persiste y su aviso que sale;
- una página de error que no filtra SQL;
- `robots.txt` y `sitemap.xml` con el origen del preview, no el productivo.

**Registrar:** URL del preview, commit exacto probado y resultado de cada
punto. Lo que falle aquí es un fallo del runtime, no de la aplicación local.

---

## 6.1 Retención, exportación y borrado de datos personales

**Desbloquea:** 6.3. Es una conversación, no un comando.

Qué hay que decidir y dejar escrito:

- Cuánto se conservan mensajes de contacto, solicitudes RIE-BVH e
  inscripciones, y qué se hace al vencer el plazo.
- Si el panel debe exportar también mensajes y solicitudes. Hoy **solo se
  exporta el newsletter**, con fórmulas neutralizadas y descarga auditada;
  añadir las otras dos es trivial con el mismo ayudante, pero su contenido es
  texto libre con más datos personales.
- Cómo se atiende una petición de acceso o borrado, y quién responde.
- Que los avisos financieros del sitio digan la verdad mientras los índices
  sean demostrativos.
- Revisión legal de `/privacidad` y `/terminos`.

**Comprobación.** Los textos publicados coinciden con lo acordado y el
propietario lo aprueba por escrito.

---

## 6.2 Ensayo de restauración

**Desbloquea:** 6.3. Un respaldo que nunca se restauró no es un respaldo.

1. Tomar el respaldo administrado más reciente del proyecto productivo.
2. Restaurarlo en un proyecto **desechable**, nunca sobre preview ni
   producción.
3. Apuntar una aplicación local a esa base y recorrer el smoke: entrar al
   panel, abrir cada bandeja, ver un artículo publicado y un curso.

**Comprobación.** El smoke pasa sobre los datos recuperados y el recuento de
filas de las tablas principales es coherente con el origen.

**Registrar:** fecha, operador, duración de la restauración y resultado. No se
copia ni se cita información personal de los datos restaurados.

---

## 6.3 y 6.4 Aceptación y promoción

**Aceptación (6.3).** Sobre el preview de 5.5, recorrer los escenarios de las
seis specs de OpenSpec y los criterios AC-01 a AC-15 de
[`SPEC-V1-BVH`](SPEC-V1-BVH.md). Enlazar evidencia por criterio y obtener la
aprobación del propietario. Un criterio sin evidencia enlazada no está
aceptado.

**Promoción (6.4).** Solo con autorización explícita y sobre el commit exacto
aprobado:

1. Aplicar las migraciones aprobadas al proyecto productivo (`supabase db
   push` contra producción).
2. Promover el código. El script de despliegue **exige estar en la rama
   `production`**:
   ```bash
   pnpm deploy   # falla si la rama actual no es production
   ```
3. Smoke no destructivo en producción: home, un índice editorial, un detalle
   publicado, `robots.txt`, `sitemap.xml` y el acceso al panel.

**Guardarraíl vigente:** la rama `production` es hoy un marcador y **no se
fusiona ni se despliega sin que el propietario lo pida explícitamente**. Que
la aceptación pase no autoriza a promover.

**Reversión:** el runbook describe el rollback; véase
[`RUNBOOK-OPERACION`](RUNBOOK-OPERACION.md), sección 9. Conviene tenerlo leído
**antes** de desplegar, no durante el incidente.

---

## 4.2 Recorrido con lector de pantalla

No es de infraestructura, pero está bloqueado por la misma razón: requiere a
una persona.

Lo automatizable ya está cubierto —estructura, foco, nombres accesibles,
contraste, movimiento reducido y ausencia de desbordes a 320, 768 y 1280 px,
en el sitio público y en las trece vistas del panel—. Falta recorrer con
VoiceOver (macOS: `Cmd+F5`) o NVDA los flujos críticos: leer una noticia,
enviar el formulario de contacto, inscribirse en un curso y publicar un
artículo desde el panel.

**Qué anotar:** cada punto donde el orden de lectura no coincida con el
visual, un control se anuncie sin nombre o un cambio de estado no se anuncie.

---

## Orden recomendado

`5.1` → `5.3` → `5.2` → `5.4` → `5.5` → `6.1` → `6.2` → `6.3` → `6.4`.

La rotación de Resend va primero porque la credencial expuesta sigue viva y no
depende de nada. Confirmar la cuenta de Cloudflare va antes que crear el
preview para no levantar recursos en la cuenta equivocada. La promoción va
sola al final, y solo si el propietario la pide.
