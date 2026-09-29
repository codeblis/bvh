> **Documentación canónica:** consulta primero [`docs/README.md`](docs/README.md), el cambio activo [`deliver-v1-core-platform`](openspec/changes/deliver-v1-core-platform/proposal.md), la [`SPEC V1`](docs/SPEC-V1-BVH.md) y el [`ADR`](docs/ADR-Arquitectura-BVH.md). El detalle de este archivo es una fotografía subordinada y puede quedar desactualizado; no reemplaza OpenSpec, specs, ADR, código ni migraciones.

## Objective
Rediseño completo del sitio BVH con glassmorphism, responsive mobile-first, gráficos Recharts en índices, y secciones de noticias/blog con buscador/categorías/populares y páginas de detalle.

## Design Tokens
- **Tema oscuro por defecto**: `className="dark"` en `<html>`. Light theme también definido.
- **Colores**: OKLCH, fondos oscuros ~19% lightness, foreground ~93%, gold primary `oklch(0.77 0.128 82)` en dark.
- **Gradientes**: `--gradient-hero` (radial), `--gradient-gold` (linear), `--shadow-elegant`, `--shadow-gold`.
- **Tipografía**: Playfair Display (serif, títulos) + Inter (sans, cuerpo).
- **Glassmorphism**: `bg-background/40`, `backdrop-blur-md`, `border-border/60`, `rounded-xl`.
- **Background utilities**: Custom `@utility` en globals.css para `bg-background`, `bg-card`, `bg-primary`, etc. con variantes de opacidad.
- **Animaciones**: `ticker-scroll` (40s linear infinite), `pulse-dot`, `fade-up`.

## Architecture
- **Framework**: Next.js 16.2.10 (Turbopack), App Router
- **Build**: `pnpm build` — rutas institucionales estáticas; contenido y cursos dinámicos desde Supabase
- **Layout**: Root layout (`src/app/layout.tsx`) solo tiene `<LiveTickerWrapper />` + children. Cada página incluye `SiteHeader` y `SiteFooter` explícitamente.
- **Barrel**: `src/components/bvh/index.ts` — re-exporta Logo, ThemeToggle, SiteHeader, SiteFooter, PageHero, LiveTicker, NewsletterSignup
- **Proxy**: `src/proxy.ts` refresca sesión y protege navegación de `/admin` y `/cuenta`; acciones y RLS siguen siendo la frontera real.
- **Dynamic routes**: `params` es Promise en Next.js 16 — se debe `await params` en Server Components
- **Server Components**: Las páginas públicas de contenido/cursos consultan repositorios server-only. Los formularios interactivos permanecen como islas cliente o Server Actions.

## Data Layer
- `src/modules/content` — tipos, validación y repositorio server-only para noticias/blog publicados
- `src/modules/courses` — tipos, validación, catálogo interactivo y repositorio server-only para cursos/ofertas
- `audit_events` — auditoría transaccional de cambios sensibles, visible solo para admin
- Supabase es la fuente canónica; no mantener arrays TypeScript como contenido productivo.

## Pages Directory
| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Landing |
| `/acerca` | Static | About |
| `/blog` | Dynamic | Blog desde Supabase con ArticleIndex |
| `/blog/[slug]` | Dynamic | Detalle publicado desde Supabase |
| `/contacto` | Static | Contact form |
| `/cotizar` | Static | Quote page |
| `/historia` | Static | History |
| `/indices` | Client | Indices con Recharts |
| `/instituto` | Dynamic | Catálogo de cursos/ofertas |
| `/instituto/cursos/[slug]` | Dynamic | Detalle e inscripción |
| `/login` | Client | Login por email/contraseña |
| `/mercados` | Static | Markets |
| `/noticias` | Dynamic | Noticias desde Supabase con ArticleIndex |
| `/noticias/[slug]` | Dynamic | Detalle publicado desde Supabase |
| `/registro` | Static | Registration |

## Completed
- Página /cotizar con beneficios hero-style (grid 3 columnas, --gradient-hero)
- Lucide reemplazó todos los emojis e inline SVGs (12+ archivos)
- LiveTicker global con doubled rows + CSS animation seamless (40s)
- Logo con cambio de tema vía MutationObserver
- Nav activo con `usePathname()`
- Footer con 7 botones sociales SVG inline
- Login por email/contraseña; OAuth no configurado queda oculto
- Responsive: hamburger menu mobile (useState + Lucide Menu/X), SiteHeader mobile drawer con onClick close, overflow-x-auto en tablas, padding responsivo (p-4 sm:p-6 md:p-8), flex-wrap, sticky condicional (lg:sticky lg:top-24)
- Página /indices con Recharts AreaChart, datos deterministas, sidebar navegable, live tick cada 3s, tabla resumen sincronizada (valores, var% día/semana/mes con colores por signo)
- Chart height responsive en índices
- ThemeToggle no fixed en mobile (login/registro)
- shadcn/ui configurado con @base-ui/react
- Radio cards registro con `grid-cols-1 sm:grid-cols-2`
- Timeline con `pl-16 pb-8 sm:pl-20 sm:pb-12`, dots `left-6 sm:left-8`
- ArticleIndex (ArticleIndex.tsx): componente compartido noticias/blog con search, categorías (flex-nowrap overflow-x-auto, single row), featured hero, grid 2-col, sidebar (últimas/populares/categorías), newsletter CTA. Último ítem impar ocupa md:col-span-2
- Article type con campo `image` (descripción textual de la imagen asociada)
- Páginas de detalle: `[slug]/page.tsx` para noticias y blog con hero compacto, imagen gradiente determinística 16:9, cuerpo del artículo, metadatos (autor/lectura/vistas), artículos relacionados, newsletter CTA
- NewsletterSignup: Client Component reutilizable para formulario de suscripción
- Spacing compacto en detail pages: `py-8 md:py-12` hero, `py-8 md:py-12` content, `mb-3 leading-6` paragraphs, `mt-8` footer, `mt-10` related/newsletter sections
- Legibilidad: body text `text-foreground/80` (en vez de `text-foreground` al 93% brillo) para reducir contraste en dark mode
- `.gitignore` limpio: conflictos merge resueltos, `.env*` ignorado, `.wrangler/state/` agregado
- `wrangler.jsonc` secrets removidos (bloque `vars` eliminado)

## Panel administrativo

- Armazón propio: cabecera con cuenta y salida, navegación agrupada (bandejas, contenido, instituto, gobierno, mercado) con contadores de trabajo pendiente, y cajón plegable en móvil.
- `src/app/admin/_ui.tsx` concentra las primitivas: cabecera de página, estado vacío, banderas de estado, campos, botones y formato de fechas. Las pantallas heredan de ahí.
- El editor de artículos separa manuscrito (titular en serif, entradilla, cuerpo) de la ficha de publicación, que vive fuera del `<form>` y se asocia con el atributo `form` porque la portada tiene su propia acción.
- El dorado se reserva a la acción principal de cada pantalla y a la sección activa; los estados se muestran como banderas y las cifras son tabulares.

## Pending / Next
- Aplicar y probar migraciones nuevas de seguridad y cursos en base desechable
- Completar Storage/preview editorial y protección antiabuso
- Contenido real para imágenes de artículos (actualmente gradientes determinísticos con descripción textual)
- Integración con Resend para newsletter
- Pruebas unitarias/componentes
- Meta tags dinámicos en slug pages para SEO
- Sistema de comentarios en blog posts
- Dark/light mode toggle real (actualmente hardcodeado "dark" en layout)

## Known Issues
- LSP errors pre-existentes en `globals.css` (sintaxis específica de Tailwind) y `LiveTicker.tsx` (índice de array como key)
- Credencial de Resend expuesta en git history — rotarla desde el proveedor sin registrar su valor
- No hay imágenes reales para artículos — se usan gradientes generados por hash del slug

## Relevant Files
- `src/components/bvh/ArticleIndex.tsx` — componente compartido noticias/blog
- `src/components/bvh/ArticleDetail.tsx` — (no creado, lógica inline en slug pages)
- `src/components/bvh/NewsletterSignup.tsx` — formulario newsletter Client Component
- `src/components/bvh/SiteHeader.tsx` — hamburger menu + mobile drawer
- `src/components/bvh/SiteFooter.tsx` — footer redes sociales
- `src/components/bvh/PageHero.tsx` — hero reutilizable
- `src/components/bvh/LiveTicker.tsx` — ticker global animado
- `src/components/bvh/LiveTickerWrapper.tsx` — wrapper layout
- `src/app/indices/page.tsx` — Recharts AreaChart, live tick 3s
- `src/app/noticias/page.tsx` — news index
- `src/app/noticias/[slug]/page.tsx` — news detail SSG
- `src/app/blog/page.tsx` — blog index
- `src/app/blog/[slug]/page.tsx` — blog detail SSG
- `src/modules/content/repository.server.ts` — consultas públicas de noticias/blog
- `src/modules/courses/repository.server.ts` — consultas públicas de cursos/ofertas
- `src/app/globals.css` — variables CSS, custom utilities, animaciones
- `src/app/layout.tsx` — root layout con LiveTickerWrapper
- `wrangler.jsonc` — Cloudflare config (secrets removidos)
- `.gitignore` — archivos ignorados
- `.env.example` — documentación de variables requeridas

## Commands
- `pnpm dev` — desarrollo
- `pnpm build` — build de producción
- `pnpm lint` — lint
