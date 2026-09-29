# BVH · Bolsa de Valores de La Habana

Portal institucional en desarrollo para presentar la iniciativa BVH, publicar contenido económico y validar la experiencia de sus futuros servicios.

> Los índices, cotizaciones, empresas, métricas y perfiles incluidos actualmente son datos demostrativos. No constituyen información bursátil en tiempo real ni una oferta de inversión.

## Alcance publicado

Por decisión del propietario, el primer lanzamiento expone **solo Inicio,
Noticias y Blog**. Lo controla `NEXT_PUBLIC_MVP_EDITORIAL`, cuyo valor por
defecto es ese alcance: si la variable falta, se publica de menos y no de más.
El resto de los módulos —`/indices`, `/mercados`, `/cotizar`, `/instituto`,
`/acerca`, `/historia`, `/contacto`, `/registro`, `/cuenta` y los endpoints de
formulario— responde 404 y su código permanece en el repositorio.

En este alcance **el sitio no envía ni recibe correo**: no hay formularios,
boletín, registro de visitantes, confirmación de cuenta ni recuperación de
contraseña. La cuenta que publica se crea ya confirmada desde el panel de
Supabase y entra con contraseña. Resend, Turnstile y el límite de envíos
quedan sin configurar porque nada los usa.

Para trabajar sobre el sitio completo, `NEXT_PUBLIC_MVP_EDITORIAL=0` y
reconstruir; la bandera se incrusta en el build. La lista de puesta en marcha
de este alcance está en
[docs/LANZAMIENTO-EDITORIAL.md](docs/LANZAMIENTO-EDITORIAL.md).

## Desarrollo local

El esquema vive en `supabase/migrations` y **solo está aplicado en el stack
local**. Apuntar `pnpm dev` a un proyecto Supabase remoto sin esas migraciones
deja el panel inaccesible y los formularios rotos, porque el código llama a
tablas y funciones que allí no existen.

```bash
pnpm install
supabase start          # requiere Docker en marcha
supabase db reset       # aplica todas las migraciones
pnpm dev
```

Las variables las toma `.env.development.local`, que Next antepone a
`.env.local`. Así puedes conservar en `.env.local` la configuración de un
proyecto remoto sin que interfiera con el desarrollo. Como mínimo necesita
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_SITE_URL`: sin la clave de servicio
ningún formulario público persiste, y sin el origen canónico los callbacks de
identidad pierden la sesión.

Para entrar al panel hace falta una cuenta con rol `admin`; un `supabase db
reset` borra las cuentas y hay que volver a crearla. El correo transaccional
puede quedarse sin configurar: el formulario se guarda igual y el aviso queda
reintentable desde el panel. Los correos de identidad llegan a Mailpit, en
<http://127.0.0.1:54324>.

## Validación

```bash
pnpm check
```

El comando ejecuta lint, TypeScript, pruebas y build de producción.

Los recorridos de Playwright van en dos tandas, porque el alcance se incrusta
al construir y un mismo servidor no puede servir las dos versiones:

```bash
pnpm test:e2e       # sitio completo: formularios, cursos y campañas
pnpm test:e2e:mvp   # MVP editorial: 404 de lo retirado, navegación y portada
```

## Desarrollo dirigido por especificaciones

Los cambios funcionales y arquitectónicos se gestionan con OpenSpec. El cambio activo de la V1 es [`deliver-v1-core-platform`](openspec/changes/deliver-v1-core-platform/proposal.md).

```bash
openspec status --change deliver-v1-core-platform
openspec validate deliver-v1-core-platform --strict --no-interactive
```

Consulta [docs/README.md](docs/README.md) para la autoridad documental y [docs/FLUJO-DESARROLLO.md](docs/FLUJO-DESARROLLO.md) para el ciclo completo.

## Integraciones

- Supabase: autenticación de usuarios.
- Resend: contacto, solicitudes de cotización y newsletters.
- OpenNext + Cloudflare Workers: build y despliegue.

Las integraciones fallan de forma segura cuando faltan variables de entorno: la interfaz no comunica un éxito que el servidor no haya confirmado. Consulta [.env.example](.env.example).

## Despliegue

Dos destinos, ambos desde la rama `production` y con builds distintos porque el
alcance se incrusta al compilar:

```bash
pnpm deploy:sitio   # worker bvh     → bolsadelahabana.com      (MVP editorial)
pnpm deploy:app     # worker bvh-app → app.bolsadelahabana.com  (sitio completo)
```

Lo que se pase después del destino llega a wrangler; `--dry-run` compila y
empaqueta sin publicar. Detalles y comprobaciones en
[docs/LANZAMIENTO-EDITORIAL.md](docs/LANZAMIENTO-EDITORIAL.md).

## Documentación

El mapa canónico de decisiones, especificaciones V1, operación e infraestructura está en [docs/README.md](docs/README.md). El [PRD](PRD.md) conserva la visión de producto; las decisiones técnicas vigentes se registran en los ADR.
