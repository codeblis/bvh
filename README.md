# BVH · Bolsa de Valores de La Habana

Portal institucional en desarrollo para presentar la iniciativa BVH, publicar contenido económico y validar la experiencia de sus futuros servicios.

> Los índices, cotizaciones, empresas, métricas y perfiles incluidos actualmente son datos demostrativos. No constituyen información bursátil en tiempo real ni una oferta de inversión.

## Desarrollo local

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

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
