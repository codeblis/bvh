# Evidencia E2E local de la V1

**Fecha:** 2026-09-08  
**Cambio:** `deliver-v1-core-platform`  
**Entorno:** Next.js 16.2.10, build de producción servido en Node, Chrome headless y Supabase local desechable.

## Ejecución reproducible

Requiere Docker Desktop activo, Supabase CLI y Google Chrome instalado.

```bash
supabase start -x realtime,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
supabase migration up --local
pnpm test:e2e
```

El ejecutor obtiene las claves del stack local mediante `supabase status` sin imprimirlas, exige `127.0.0.1` como host y pasa las variables al proceso de pruebas. Playwright compila la aplicación, levanta un servidor propio en el puerto 3100 y un proveedor de correo sintético en el 3101. La aplicación apunta a ese proveedor mediante `RESEND_BASE_URL` con una clave ficticia y direcciones `example.test`: ningún correo sale de la máquina y no se usan cuentas externas. Los datos sintéticos se eliminan al terminar; capturas y trazas de fallo quedan fuera de Git.

## Editorial: tarea 3.1

`e2e/editorial.e2e.ts`: **2 pruebas correctas** sobre build de producción.

- Login administrativo y creación desde el CMS, tanto de noticia como de blog.
- Borrador devuelve HTTP 404 al visitante sin sesión y no incluye el extracto privado.
- Preview administrativo renderiza el borrador con `noindex`; un visitante recibe login.
- Subida real a Storage local; portada pública con alt y píxeles cargados en navegador.
- Publicación visible en índice y detalle sin recompilar; separación por tipo.
- Title, description, canonical y tipo Open Graph coherentes.
- Edición visible en nuevas solicitudes y despublicación con confirmación.
- Sitemap incluye lo publicado y excluye lo despublicado; detalle vuelve a 404.

La primera prueba de login confundía `/login?callbackUrl=/admin` con el destino final por usar una expresión regular sobre la URL completa. Ahora comprueba `pathname` y el contenido administrativo. Otros ajustes corrigieron selectores ambiguos de los propios tests.

## Cursos: tarea 3.2

`e2e/courses.e2e.ts`: **1 recorrido completo correcto**, con admin, alumno y segundo participante independientes.

- Creación desde CMS; catálogo excluye cursos sin ofertas abiertas y el detalle explica el vacío.
- Dos ofertas con calendario y zona horaria explícitos; login conserva el destino de inscripción.
- Inscripción autenticada, reintento sin duplicados, cuenta propia y edición sin cupo.
- Reducción administrativa de capacidad rechazada cuando hay más participantes confirmados.
- Cancelación de inscripción, cierre/cancelación de edición y archivo del curso desde el CMS.
- Cierre bloquea nuevas inscripciones; archivo devuelve 404 público sin borrar el historial privado.

La prueba detectó que el historial perdía título/calendario al cerrar una oferta por depender de las políticas de lectura pública. La nueva RPC privada limita su proyección a inscripciones de `auth.uid()`; véase ADR-014. También se endureció la actualización administrativa: `confirmada` y `completada` ocupan cupo, comparten bloqueo transaccional y no admiten escrituras directas que evadan esa validación.

## Resultado conjunto

- `pnpm test:e2e`: **33/33 correctas**, 1,9 min de ejecución de Playwright, después de compilar y arrancar el servidor; incluye editorial, cursos, identidad, formularios, avisos, CMS por rol, categorías y roles, SEO, privacidad y accesibilidad.
- `pnpm test:db`: **66/66 correctas** (28 autorización, 10 historial privado, 7 capacidad administrativa, 9 privacidad de auditoría, 12 gestión de roles).
- `pnpm test:concurrency`: un único ganador del último cupo y reintento idempotente correctos.
- `pnpm check`: lint (164 archivos), tipos, **35 unitarias** y build correctos, con las variables de Supabase local inyectadas.
- `openspec validate deliver-v1-core-platform --strict --no-interactive`: correcto.
- `git diff --check` y comprobación Biome de las nuevas pruebas y módulo de identidad: correctos.

Esta es la evidencia de la tarea 4.1 al corte del 8 de septiembre. Los gates deben repetirse después de cualquier implementación posterior; no sustituyen la aceptación remota.

## Identidad: tarea 3.3

`pnpm test:e2e identity`: **3/3 correctas**, 22,0 s, con confirmación de email activada en Supabase local y mensajes reales capturados en Mailpit.

- Registro rechaza contraseñas cortas en servidor; aceptación no declara una sesión inexistente.
- El alumno no accede a `/cuenta` antes de confirmar; el enlace recibido establece sesión y abre su cuenta.
- Logout impide volver al área privada; recuperación establece una nueva contraseña, cierra la sesión local y permite login nuevo. La contraseña anterior deja de funcionar.
- Email desconocido recibe el mismo texto de recuperación; registro duplicado recibe el mismo aviso de aceptación. Login usa un mensaje genérico para credenciales incorrectas y cuentas desconocidas.
- Callback externo, protocolo relativo, traversal y escapes anidados se sustituyen por `/cuenta`. Usuarios normales no acceden al CMS.
- Intentar actualizar contraseña sin sesión falla. Enviar `role=admin` en signup, metadata y escritura directa de perfil no eleva privilegios.
- Limpieza elimina únicamente usuarios y correos sintéticos del recorrido.

La confirmación detectó un cambio accidental al host interno del servidor que perdía la sesión. Callback y proxy ahora usan el origen público configurado (ADR-015). Diez pruebas unitarias adicionales cubren validación, proyección de metadata, respuesta genérica, sesión y origen/callback; la suite unitaria total pasa **29 pruebas**.

## Formularios públicos: tarea 3.4

`pnpm test:e2e forms`: **3/3 correctas**, con contacto, RIE-BVH y newsletter sobre el build de producción.

- `Content-Type` ajeno a JSON, JSON roto, cuerpo mayor de 32 KiB y email inválido reciben 400 con un mensaje único y no crean filas en ninguna de las tres tablas.
- La clave anónima no inserta en `contact_messages`, `company_applications` ni `newsletter_subscriptions`, y tampoco invoca la RPC interna de suscripción: todas devuelven `42501`.
- Contacto y RIE-BVH persisten antes del correo, muestran la referencia y el aviso pendiente, y el CMS conserva la solicitud con su estado de entrega y el botón de reintento.
- Un visitante sin sesión que abre `/admin/mensajes` o `/admin/solicitudes` termina en `/login`.
- Newsletter normaliza mayúsculas y espacios, no duplica altas activas, conserva referencia e intentos al repetirse, y registra consentimiento.
- La baja exige token válido y confirmación por POST: el GET muestra el formulario sin cambiar el estado; el token rotado y uno inválido no desactivan nada.
- La reactivación reutiliza el mismo registro, renueva el consentimiento, rota el token y no expone tokens en la respuesta pública.

## Entrega de avisos y reintentos: tarea 3.5

`pnpm test:e2e notifications`: **3/3 correctas**, 30,8 s, contra el proveedor sintético local (`e2e/resend-stub.mjs`), que registra la clave idempotente de cada intento y responde según el modo pedido por la prueba: rechazo, aceptación o corte de conexión.

- Rechazo del proveedor: la solicitud queda persistida con `failed`, un intento, el error truncado, sin identificador de proveedor ni `notified_at`. El primer intento viaja con la referencia como clave idempotente.
- Reintento administrativo con el proveedor aceptando: la fila pasa a `sent` con dos intentos, identificador de proveedor y `notified_at`; el error anterior se limpia y el botón de reintento desaparece. El segundo intento usa la clave derivada `<referencia>-2`.
- Un registro ya enviado no ofrece reintento ni abre intentos nuevos en el proveedor.
- Resultado incierto: el proveedor recibe el correo y corta la conexión. Devolviendo la fila al estado sin resultado —`pending` con cero intentos, como si no hubiera podido guardarse la confirmación— el reintento **reutiliza la misma clave idempotente** antes de abrir un intento nuevo, y solo entonces la fila queda `sent` con un intento.
- Un fallo de entrega no altera el dato del formulario: la suscripción sigue activa y visible únicamente para administradores; el visitante sin sesión termina en `/login`.

Cuatro pruebas unitarias cubren el adaptador de correo (proveedor no configurado, transmisión de la clave lógica, rechazo que no se presenta como aceptación y aceptación seguida de corte de conexión) y dos más la derivación de la clave. La suite unitaria total pasa **35 pruebas**.

## CMS por rol: tarea 3.6

`pnpm test:e2e admin-cms`: **4/4 correctas**, con administrador, alumno autenticado y visitante en sesiones separadas.

Las once vistas del panel —resumen, mensajes, solicitudes, newsletter, artículos, cursos, inscripciones, auditoría, empresas, alta de empresa e índices— responden 200 con su encabezado para el administrador y ninguna cae en el límite de error. Para el visitante sin sesión todas terminan en `/login`; para un usuario autenticado sin rol, en `/cuenta`. En ninguno de los dos casos aparece el marco del panel.

La revisión encontró que **empresas e índices eran los dos módulos que aún incumplían el contrato**: ignoraban el error de lectura de Supabase —una consulta fallida se dibujaba como directorio vacío—, descartaban el error de escritura y redirigían como si se hubiera guardado, no validaban la entrada en servidor (un formulario incompleto no hacía nada ni lo explicaba) y borraban registros sin confirmación. Ahora ambos módulos siguen el mismo idioma que el editorial: la lectura fallida sube al límite de error de la sección, la escritura vuelve con `?error=` o `?saved=` y un aviso legible, y el borrado exige confirmación explícita.

Lo verificado sobre ese cambio:

- Alta correcta de empresa e índice: aviso de éxito, fila visible y valores numéricos guardados con su signo. El estado vacío desaparece al existir el primer registro.
- Nombre repetido: la base rechaza por unicidad y la vista muestra el motivo. No se crea una segunda fila; el fallo no se presenta como éxito.
- Entrada que el servidor rechaza (nombre demasiado corto o demasiado largo): aviso explícito y ninguna fila nueva, en vez del silencio anterior.
- Borrado destructivo: pide confirmación nombrando el registro; cancelarla lo conserva y aceptarla lo elimina con aviso.
- Identificador inexistente: 404. Identificador malformado: la consulta falla y la vista declara el fallo de carga con opción de reintentar; el mensaje SQL queda en el registro del servidor y el navegador solo recibe un digest.

## SEO e indexación: tarea 4.3

`pnpm test:e2e seo`: **4/4 correctas**, sobre el build de producción.

La revisión encontró que **no existía `robots.txt`** y que home, `/noticias`, `/blog` e `/instituto` heredaban el mismo título y la misma descripción del layout raíz, sin canonical: cuatro secciones distintas se anunciaban como la misma página. Además, el Open Graph del layout apuntaba con URL absoluta al dominio productivo, de modo que cualquier preview habría publicado enlaces e imágenes de producción.

Cambios y comprobaciones:

- `src/app/robots.ts` publica `Allow: /`, excluye `/admin`, `/cuenta`, `/auth`, `/newsletter` y `/actualizar-password`, y declara `Sitemap` y `host` con el origen configurado. La prueba verifica que no aparece el dominio productivo cuando el origen es local.
- Home, `/noticias`, `/blog` e `/instituto` declaran título propio y no repetido, descripción de más de 50 caracteres, canonical propio y Open Graph. Ninguna se declara `noindex`. Home obtuvo su canonical mediante un grupo de rutas, sin tocar el contenido de la página.
- El detalle publicado declara título con el titular, canonical de su ruta, `og:type=article` y ausencia de `noindex`; aparece en el sitemap junto a la home.
- El borrador no aparece en el sitemap y su ruta pública devuelve 404. Su vista previa administrativa se declara `noindex`.
- `/cuenta`, `/actualizar-password` y la baja del newsletter declaran `noindex`, además de quedar excluidas por `robots.txt`.
- El Open Graph del layout usa rutas relativas resueltas contra `metadataBase`, que ya dependía de `NEXT_PUBLIC_SITE_URL`.

## Fugas de datos y auditoría: tarea 4.4 (parcial)

`pnpm test:e2e privacy`: **4/4 correctas**. `supabase/tests/audit_privacy.test.sql`: **9/9 correctas**.

- Ni el HTML ni los scripts que carga la home contienen la clave de servicio, el nombre de esa variable ni la credencial del proveedor de correo. Se comprueba sobre seis rutas públicas y sobre cada script enlazado.
- Un fallo real de consulta detrás de una sesión administrativa muestra el límite de error de sección; el HTML no contiene el texto SQL —«invalid input syntax», «permission denied for», «duplicate key value»— que sí queda en el registro del servidor.
- La API pública responde a una entrada inválida con un único mensaje genérico, sin motivo interno ni estado del proveedor.
- El acuse de un formulario devuelve exactamente `ok`, `reference` y `notification`: ni identificadores internos ni el token de notificación, que además queda consumido en la base.
- Un usuario autenticado no ve datos de terceros en su área ni alcanza las vistas que los contienen; el correo ajeno no aparece en ninguna de las respuestas que recibe.
- La auditoría registra el hecho, no el contenido: cambiar nombre y correo de un perfil deja un evento con metadatos vacíos y sin rastro de esos valores, mientras que un cambio de estado sí conserva `old_status` y `new_status`. Ningún evento guarda claves distintas del estado. Un usuario sin rol lee cero eventos y un cliente anónimo ni siquiera puede consultar la tabla.

**Pendiente de esta tarea:** el producto no tiene ninguna exportación de datos, de modo que la neutralización de fórmulas en CSV no tiene sujeto que verificar y el escenario «Exportación segura» de `admin-cms` sigue sin demostrarse. Construir esa exportación es una decisión de producto con implicaciones de privacidad que la tarea 6.1 reserva al propietario.

## Accesibilidad y responsive: tarea 4.2 (parcial)

`pnpm test:e2e accessibility`: **6/6 correctas**.

La revisión encontró dos ausencias: **el sitio no respetaba `prefers-reduced-motion`** —el ticker se desplazaba 40 s en bucle infinito y los puntos pulsaban sin parar, sin alternativa— y **las páginas públicas no tenían región principal ni salto de navegación**, de modo que quien usa lector de pantalla o solo teclado debía recorrer la cabecera entera en cada página. Ambas están corregidas: `globals.css` neutraliza las tres animaciones y las transiciones cuando se pide menos movimiento, las doce páginas públicas envuelven su contenido en `<main id="contenido">` y la cabecera ofrece un enlace «Saltar al contenido» visible al recibir foco.

Lo verificado:

- Home, noticias, blog, instituto, contacto y login no producen scroll horizontal a 320, 768 ni 1280 px de ancho.
- Todos los controles visibles de contacto, login y registro tienen nombre accesible.
- El formulario de contacto se completa y envía **solo con teclado**: el foco recorre nombre, correo, asunto —resuelto escribiendo la inicial de la opción—, mensaje y botón en orden visual; el control enfocado conserva indicador visible; el envío persiste el mensaje y muestra el aviso de estado.
- Con `prefers-reduced-motion: reduce`, el ticker y el pulso quedan sin animación.
- El titular de la página y el botón de acción superan el contraste AA (3:1 para texto grande, 4,5:1 para el control). El cálculo resuelve los colores OKLCH del tema pintándolos en un lienzo, no interpretando su texto.
- En cada página pública hay exactamente una región principal y una cabecera; el primer tabulado enfoca el salto al contenido y activarlo lleva a `#contenido`.

**Pendiente de esta tarea:** el recorrido con lector de pantalla real (VoiceOver o NVDA) no puede automatizarse y sigue sin hacerse. Las comprobaciones anteriores cubren estructura, foco, nombres y contraste, que es lo que ese recorrido verificaría, pero no lo sustituyen.

## Categorías y roles: cobertura administrativa mínima

`pnpm test:e2e admin-taxonomy` : **3/3 correctas**. `supabase/tests/admin_roles.test.sql`: **12/12 correctas**.

El contrato exige que el CMS permita gestionar «categorías, usuarios y roles», y esas eran las dos pantallas que faltaban: la taxonomía editorial solo podía tocarse desde la base y el rol no tenía ninguna vía de cambio, porque el permiso por columnas de `profiles` excluye `role` y no existe política de actualización para administradores.

`set_profile_role` es ahora la única vía. Exige administrador, valida el rol contra la lista permitida y **prohíbe cambiar el rol propio**: como quien ejecuta la operación ya es administrador, esa sola regla garantiza que el panel nunca se queda sin ninguno. La auditoría pasa a describir también el rol anterior y el nuevo —un rol no es dato personal— y las categorías quedan bajo el mismo registro.

Lo verificado en base de datos: un usuario sin rol no puede promoverse ni promover a nadie, la escritura directa de `role` sigue denegada por permisos de columna, el anónimo no puede ni ejecutar la operación, un administrador sí promueve y retira el rol de cuentas ajenas, su propio cambio se rechaza, un rol fuera de lista y una cuenta inexistente se rechazan sin tocar nada, y la promoción queda auditada con actor, recurso y rol anterior y nuevo.

Lo verificado en navegador:

- Categorías: alta con slug propio, edición en línea, nombre duplicado rechazado con su motivo, y borrado que exige confirmación. Una categoría con artículos asignados no ofrece borrado y se marca «En uso», para que publicar no quede sin taxonomía.
- Usuarios: la búsqueda acota el listado y explica el vacío; promover abre el panel a esa cuenta de verdad y retirar el rol lo cierra otra vez; la fila propia no ofrece cambio de rol.
- Un usuario autenticado sin rol termina en `/cuenta` y un visitante en `/login`; su rol sigue intacto tras los intentos.

## Límites

Esta evidencia demuestra ejecución local sobre `next build`/`next start`; no demuestra caché ni compatibilidad del runtime OpenNext en Cloudflare. La prueba de correo mantiene el navegador que inició PKCE; no demuestra apertura entre dispositivos, entrega SMTP externa ni protección antiabuso. El proveedor de correo es un doble local: demuestra el contrato de la aplicación (estados, intentos y clave idempotente), no el comportamiento real de Resend ni su deduplicación efectiva, que solo pueden comprobarse en el preview autorizado con la credencial rotada. La revisión del CMS cubre carga, permiso, vacío, confirmación destructiva y errores de escritura reales, pero solo fuerza un fallo de lectura mediante un identificador malformado: no simula caída de la base ni pérdida de privilegios en mitad de una sesión. La revisión SEO cubre home, los tres índices y el detalle publicado, que es el alcance de la tarea; las páginas institucionales y de autenticación (`/acerca`, `/historia`, `/mercados`, `/indices`, `/contacto`, `/cotizar`, `/login`, `/registro`, `/recuperar-password`) siguen heredando título y descripción del layout raíz y no declaran canonical, porque son componentes cliente sin metadata propia. Tampoco se comprobó indexación real en un buscador ni datos estructurados. El preview remoto, la aceptación completa y las comprobaciones de accesibilidad continúan pendientes.
