# Lanzamiento del MVP editorial

**Estado:** Código listo; empaquetado para Cloudflare verificado en seco;
infraestructura remota sin preparar
**Corte:** 2026-09-28
**Decisión del propietario:** publicar solo Inicio, Noticias y Blog

Este documento es la lista corta. La versión completa de la V1 está en
[Puesta en marcha](PUESTA-EN-MARCHA.md); aquí solo queda lo que este alcance
necesita de verdad, y se dice explícitamente qué deja de ser un bloqueo.

---

## 1. Qué se publica

| Ruta | Estado |
| --- | --- |
| `/` | Portada editorial: hero, últimas noticias, últimas del blog |
| `/noticias`, `/noticias/[slug]` | Índice con búsqueda, categoría y página; detalle |
| `/blog`, `/blog/[slug]` | Igual que noticias |
| `/privacidad`, `/terminos` | Texto legal |
| `/login` | Acceso de quien administra, con contraseña; no envía ningún correo |
| `/admin/**` | Panel: artículos, categorías, usuarios y roles, auditoría |
| `/robots.txt`, `/sitemap.xml` | Solo lo anterior |

Todo lo demás —`/indices`, `/mercados`, `/cotizar`, `/instituto`, `/acerca`,
`/historia`, `/contacto`, `/registro`, `/cuenta`, `/recuperar-password`,
`/actualizar-password`, `/auth/callback` y los tres endpoints de formulario—
responde **404**. El código sigue en el repositorio.

**El sitio no envía ni recibe un solo correo.** No hay alta de suscriptores, ni
formularios, ni confirmación de cuenta, ni recuperación de contraseña. Las
únicas credenciales que existen son las de quien publica, y se crean a mano
(§3.3).

## 2. La bandera

`NEXT_PUBLIC_MVP_EDITORIAL` decide el alcance y **por defecto vale el
editorial**: si un despliegue olvida la variable, publica de menos, no de más.
Para recuperar el sitio completo hay que apagarla a mano
(`NEXT_PUBLIC_MVP_EDITORIAL=0`) y reconstruir.

Se incrusta en el build, no se lee en caliente: cambiar el alcance es
reconstruir y volver a desplegar. Es una decisión de producto, no un
interruptor de operación.

## 3. Lo que este alcance sí necesita

### 3.1 Proyecto Supabase con el esquema aplicado

Las **22 migraciones** de `supabase/migrations/` son la única fuente del
esquema. Hoy solo están aplicadas en local.

> **Comprobado el 2026-09-29 contra el proyecto remoto configurado:** está en
> el esquema de julio. `articles` existe, pero le falta `featured_image_path`,
> así que la consulta de la portada responde `42703` y **todas las páginas
> públicas darían error**. Tampoco existen `audit_events`, `course_offerings`,
> `newsletter_lists` ni `newsletter_campaigns`. Desplegar sin aplicar las
> migraciones sustituiría una cuenta atrás que funciona por un sitio roto.

```bash
supabase link --project-ref <ref-del-proyecto>
supabase db push
```

Además, en Storage: crear el bucket `editorial` con lectura pública. Las
portadas de artículos viven ahí y la web las sirve por URL pública.

**Comprobación.** `select count(*) from public.articles;` responde, el panel
abre y una portada subida se ve en la web.

> El esquema completo se aplica igualmente, incluidas las tablas de cursos,
> formularios y campañas. No se recorta la base para recortar el sitio: media
> migración es una migración que no se puede revertir con confianza.

### 3.2 Cuenta de Cloudflare confirmada

Antes de crear cualquier recurso: `wrangler whoami`, y que el propietario
confirme por escrito que la cuenta y la zona `bolsadelahabana.com` son de BVH.
Es el paso 5.3 de la lista completa y sigue vigente sin cambios.

### 3.3 La cuenta que publica

**No hace falta configurar SMTP ni proveedor de correo alguno.** La cuenta se
crea ya confirmada desde el panel de Supabase (Authentication → Users → *Add
user*, con *Auto Confirm User* marcado) y después se le da el rol:

```sql
update public.profiles set role = 'admin' where email = '<correo>';
```

Ese correo es solo el identificador con el que se entra; el sitio nunca le
escribe. El acceso usa contraseña (`signInWithPassword`), que no pasa por
ningún envío.

**Si se olvida la contraseña**, se restablece desde el mismo panel de Supabase.
Por eso `/recuperar-password` responde 404: sin correo saliente, esa pantalla
se quedaría esperando un mensaje que no existe, y prefiere no existir a mentir.

#### Añadir a más gente después

Es el mismo procedimiento, y conviene saberlo antes de necesitarlo: **el panel
no crea cuentas.** `/admin/usuarios` lista los perfiles que ya existen y cambia
su rol; no hay invitación ni alta, porque ambas cosas se harían por correo.

Para sumar a otra persona al equipo editorial:

1. Crearla en el panel de Supabase con *Auto Confirm User*, igual que la
   primera, y entregarle la contraseña por un canal fuera de banda.
2. Desde `/admin/usuarios`, darle el rol `admin`.

`set_profile_role` exige ser administrador y **prohíbe cambiar el rol propio**,
así que siempre queda alguien con acceso al panel. Si algún día interesa que la
gente se dé de alta sola o reciba una invitación, eso vuelve con el sitio
completo y su correo.

**Comprobación.** Entrar en `/login` con esa cuenta, llegar al panel, publicar
un artículo y verlo en la web. Sin que salga ningún correo de nada.

### 3.4 Preview real con OpenNext

Toda la evidencia actual es `next build` local. Nada de esto está probado en el
runtime de Cloudflare, y es el único riesgo técnico que queda:

```bash
pnpm preview
```

Sobre el preview desplegado, comprobar:

- publicar un artículo y verlo aparecer en la portada y en su índice;
- despublicarlo y ver que su URL deja de responder;
- que una portada subida se sirva y se vea (`images.unoptimized` en Workers);
- que la subida de portada no choque con el límite de 6 MB de Server Actions;
- que `robots.txt` y `sitemap.xml` lleven el origen del preview;
- que una página de error no filtre SQL.

Lo que falle aquí es del runtime, no de la aplicación local.

### 3.5 Variables del entorno

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_MVP_EDITORIAL` | `1` (o sin declarar) |
| `NEXT_PUBLIC_SITE_URL` | origen público exacto, sin barra final |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | del proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | del proyecto, **solo servidor** |
| `NEXT_PUBLIC_CONTACT_EMAIL` | correo del pie y de las páginas legales |

Y ninguna más. `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, las de Turnstile y
las del límite de envíos **se dejan sin declarar**: no hay nada que las use.

`NEXT_PUBLIC_CONTACT_EMAIL` está vacía a propósito: sin formulario de contacto
es la única vía que ofrece el sitio, y si no se declara el pie no promete
ninguna. **Decidir qué dirección es y quién la atiende.**

**Las tres `NEXT_PUBLIC_*` de esta tabla se incrustan al construir, no se leen
al arrancar.** Tienen que estar presentes en el paso de build —el de
`opennextjs-cloudflare build`, no solo como secreto del Worker—; declararlas
después con `wrangler secret put` no cambia nada de lo que ya se compiló. Un
build sin `NEXT_PUBLIC_CONTACT_EMAIL` publica un pie sin correo, y un build sin
`NEXT_PUBLIC_SITE_URL` deja canonical y sitemap apuntando al dominio por
defecto.

### 3.6 Revisión legal

`/privacidad` y `/terminos` se publican, así que su texto tiene que ser cierto
para este alcance. Dos cosas cambian respecto a la V1 completa:

- no se recoge ningún dato personal por la web: no hay formularios, ni alta de
  boletín, ni registro de visitantes;
- el único dato personal almacenado es el correo de quien publica, en
  `profiles`, creado a mano y nunca recogido del público;
- no se envía correo a nadie, así que no hay encargados de tratamiento por esa
  vía.

Revisar que ambos documentos digan eso y no otra cosa. La retención de datos
personales (punto 6.1 de la lista completa) se simplifica mucho, pero sigue
siendo una decisión del propietario.

## 4. Lo que deja de ser un bloqueo

| Bloqueo de la V1 | Por qué no aplica aquí |
| --- | --- |
| Turnstile | Solo protege formularios públicos, y no hay ninguno |
| Límite de envíos | Igual: sin endpoints públicos no hay nada que limitar |
| Resend | **No se usa.** El sitio no envía correo por ninguna vía |
| SMTP de Supabase | Tampoco: la cuenta se crea confirmada y se entra con contraseña |
| Registro y recuperación por correo | Rutas retiradas; la contraseña se restablece desde Supabase |
| Campañas de newsletter | El panel las conserva, pero no hay suscriptores ni alta pública |
| Cursos e inscripciones | Fuera del alcance publicado |
| Exportación de mensajes y solicitudes | No se recoge nada que exportar |

Todo esto sigue implementado y probado. Vuelve con la bandera.

## 5. Orden recomendado

`3.2` → `3.1` → `3.3` → `3.5` → `3.4` → `3.6` → promoción.

Confirmar la cuenta de Cloudflare va primero para no levantar recursos de BVH
en la cuenta equivocada. Las variables se fijan antes del preview porque las
`NEXT_PUBLIC_*` se incrustan al construir.

**Aparte del lanzamiento, no como paso suyo:** en el historial de Git hay una
clave de Resend. Este alcance no la usa y no la necesita, pero mientras exista,
quien tenga acceso al historial puede enviar correo como BVH. Conviene
revocarla en el panel de Resend cuando haya ocasión. No bloquea nada.

## 6. Los dos destinos

### Cómo se despliega de verdad

**El despliegue lo dispara el push.** Los Workers tienen la integración con
GitHub activada: un cambio en la rama que vigilan y Cloudflare compila y publica
por su cuenta. `scripts/deploy.mjs` es el camino manual, útil para `--dry-run` y
para publicar desde una máquina, pero **no es el que se usa normalmente**.

Eso tiene una consecuencia que costó un sitio caído: **las variables tienen que
estar en la configuración de build del Worker en Cloudflare**, no en un archivo
local. `.env.production.local` está en `.gitignore` y no viaja con el
repositorio, así que el runner de Cloudflare no lo ve. Un build sin ellas no
falla por su cuenta: publica un sitio que responde 500 y no deja entrar a nadie.

Por eso `next.config.ts` corta el build si faltan `NEXT_PUBLIC_SUPABASE_URL` o
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Un build fallido es mejor que un sitio mudo.
Si el build de Cloudflare falla con ese mensaje, lo que falta son las variables
en su configuración, no en el código.

En el panel de Cloudflare, por cada Worker: *Settings → Build → Variables and
Secrets*, y ahí las `NEXT_PUBLIC_*` de §3.5 con el valor que corresponda a su
dominio. Cada Worker necesita su propio `NEXT_PUBLIC_MVP_EDITORIAL` y su propio
`NEXT_PUBLIC_SITE_URL`; es lo que hace que un mismo repositorio publique dos
sitios distintos.

### La tabla

Dos Workers desde la misma rama `production`, con builds distintos porque
`NEXT_PUBLIC_MVP_EDITORIAL` y `NEXT_PUBLIC_SITE_URL` se incrustan al compilar:

| Worker | Dominio | `NEXT_PUBLIC_MVP_EDITORIAL` | Comando manual |
| --- | --- | --- | --- |
| `bvh` | `bolsadelahabana.com` | `1` | `pnpm deploy:sitio` |
| `bvh-app` | `app.bolsadelahabana.com` | `0` | `pnpm deploy:app` |

**La cuenta de Cloudflare importa.** El Worker `bvh` vive en la cuenta
`0105dae2…`, la que declara `.env.app`. Un `wrangler` autenticado en otra cuenta
responde «This Worker does not exist on your account» y no puede publicar ahí;
comprobar con `wrangler whoami` antes de intentarlo.

Ambos exigen estar en `production` y comprueban antes que `.env.production.local`
declare lo que cada uno necesita: el sitio completo persiste formularios y por
eso pide además `SUPABASE_SERVICE_ROLE_KEY`, que el editorial no usa.

Lo que se escriba después del destino se le pasa a wrangler. **`--dry-run`
compila y empaqueta sin publicar**, y es la forma de comprobar el camino entero
antes de tocar un dominio vivo:

```bash
pnpm deploy:sitio --dry-run
```

`pnpm deploy:sitio` no lleva `--env`: OpenNext descarta el entorno vacío, así
que el destino es el nivel superior de `wrangler.jsonc`, que es justo el worker
`bvh`. Wrangler avisa de que no se nombró entorno; es esperado y no indica que
vaya a publicar en otro sitio.

### Los dos dominios comparten base de datos

Tal como está `.env.production.local`, ambos Workers apuntan al mismo proyecto
Supabase. Eso significa que lo que se publique desde el panel del MVP aparece
también en el sitio completo, y que una prueba en `app.` toca datos reales.
Si `app.` debe ser un entorno de verdad aislado, necesita su propio proyecto
Supabase y su propio archivo de variables.

## 7. Promoción

**Guardarraíl vigente:** la rama `production` es hoy un marcador y **no se
fusiona ni se despliega sin que el propietario lo pida explícitamente**. Que la
aceptación pase no autoriza a promover.

```bash
pnpm deploy   # falla si la rama actual no es production
```

Smoke no destructivo después: portada, `/noticias`, `/blog`, un detalle
publicado, un 404 de sección retirada, `robots.txt`, `sitemap.xml` y el acceso
al panel. El rollback está en
[Runbook §9](RUNBOOK-OPERACION.md).

## 8. Verificación local de este recorte

```bash
pnpm check          # lint, typecheck, unitarias y build
pnpm test:e2e       # sitio completo: formularios, cursos, campañas
pnpm test:e2e:mvp   # este alcance: 404 de lo retirado, navegación, portada
```

Las dos tandas de E2E no comparten servidor: la bandera se incrusta al
construir, así que cada una levanta el suyo.
