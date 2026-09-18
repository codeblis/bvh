# BVH · Bolsa de Valores de La Habana

Portal institucional en desarrollo para presentar la iniciativa BVH, publicar contenido económico y validar la experiencia de sus futuros servicios.

> Los índices, cotizaciones, empresas, métricas y perfiles incluidos actualmente son datos demostrativos. No constituyen información bursátil en tiempo real ni una oferta de inversión.

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

El script `pnpm deploy` exige estar en la rama `production` y despliega el entorno `app` definido en `wrangler.jsonc`.

## Documentación

El mapa canónico de decisiones, especificaciones V1, operación e infraestructura está en [docs/README.md](docs/README.md). El [PRD](PRD.md) conserva la visión de producto; las decisiones técnicas vigentes se registran en los ADR.
