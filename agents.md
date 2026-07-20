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
- **Build**: `pnpm build` — 27 rutas SSG + 12 rutas SSG dinámicas (noticias/blog [slug])
- **Layout**: Root layout (`src/app/layout.tsx`) solo tiene `<LiveTickerWrapper />` + children. Cada página incluye `SiteHeader` y `SiteFooter` explícitamente.
- **Barrel**: `src/components/bvh/index.ts` — re-exporta Logo, ThemeToggle, SiteHeader, SiteFooter, PageHero, LiveTicker, NewsletterSignup
- **Middleware**: `src/middleware.ts` (edge runtime), warning de deprecación "middleware → proxy"
- **Dynamic routes**: `params` es Promise en Next.js 16 — se debe `await params` en Server Components
- **Server Components**: Las slug pages (`[slug]/page.tsx`) son Server Components con `generateStaticParams`. No pueden tener event handlers — el formulario newsletter se extrajo a `NewsletterSignup` Client Component.

## Data Layer
- `src/data/noticias.ts` — `NEWS: Article[]`, `CATEGORIES`, `NEWS_CONTENT: Record<string, string[]>`, helpers `getNoticia()`, `getNoticiasRelacionadas()`
- `src/data/blog.ts` — `POSTS: Article[]`, `CATEGORIES`, `BLOG_CONTENT: Record<string, string[]>`, helpers `getPost()`, `getPostsRelacionados()`
- `Article` type definido en `ArticleIndex.tsx` con: id, slug, cat, date, title, excerpt, author?, readMin?, views?, image?

## Pages Directory
| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Landing |
| `/acerca` | Static | About |
| `/blog` | Client | Blog index con ArticleIndex |
| `/blog/[slug]` | SSG | Blog detail (6 slugs) |
| `/contacto` | Static | Contact form |
| `/cotizar` | Static | Quote page |
| `/historia` | Static | History |
| `/indices` | Client | Indices con Recharts |
| `/instituto` | Static | Institute |
| `/login` | Static | OAuth login |
| `/mercados` | Static | Markets |
| `/noticias` | Client | News index con ArticleIndex |
| `/noticias/[slug]` | SSG | News detail (6 slugs) |
| `/registro` | Static | Registration |

## Completed
- Página /cotizar con beneficios hero-style (grid 3 columnas, --gradient-hero)
- Lucide reemplazó todos los emojis e inline SVGs (12+ archivos)
- LiveTicker global con doubled rows + CSS animation seamless (40s)
- Logo con cambio de tema vía MutationObserver
- Nav activo con `usePathname()`
- Footer con 7 botones sociales SVG inline
- Login: 5 botones OAuth solo icono (glassmorphism: bg-background/40, backdrop-blur-md, border-border/60, shadow-[var(--shadow-elegant)])
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

## Pending / Next
- Páginas de login y registro con funcionalidad real (actualmente estáticas)
- Contenido real para imágenes de artículos (actualmente gradientes determinísticos con descripción textual)
- Integración con Resend para newsletter
- Páginas de error 404 personalizadas
- Pruebas unitarias/componentes
- Meta tags dinámicos en slug pages para SEO
- Sistema de comentarios en blog posts
- Dark/light mode toggle real (actualmente hardcodeado "dark" en layout)

## Known Issues
- LSP errors pre-existentes en `globals.css` (Tailwind-specific syntax disabled), `middleware.ts` (forEach callback returns value), `LiveTicker.tsx` (array index as key)
- Middleware usa edge runtime experimental (warning en build)
- Resend API key `re_Sk8kCHuW_...` expuesta en git history — rotar desde dashboard
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
- `src/data/noticias.ts` — news data + content
- `src/data/blog.ts` — blog data + content
- `src/app/globals.css` — variables CSS, custom utilities, animaciones
- `src/app/layout.tsx` — root layout con LiveTickerWrapper
- `wrangler.jsonc` — Cloudflare config (secrets removidos)
- `.gitignore` — archivos ignorados
- `.env.example` — documentación de variables requeridas

## Commands
- `pnpm dev` — desarrollo
- `pnpm build` — build producción (27 rutas SSG + 12 dinámicas)
- `pnpm lint` — lint
