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

## Integraciones

- Supabase: autenticación de usuarios.
- Resend: contacto, solicitudes de cotización y newsletters.
- OpenNext + Cloudflare Workers: build y despliegue.

Las integraciones fallan de forma segura cuando faltan variables de entorno: la interfaz no comunica un éxito que el servidor no haya confirmado. Consulta [.env.example](.env.example).

## Despliegue

El script `pnpm deploy` exige estar en la rama `production` y despliega el entorno `app` definido en `wrangler.jsonc`.
