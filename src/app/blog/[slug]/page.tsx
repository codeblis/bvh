import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, User } from "lucide-react";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { NewsletterSignup } from "@/components/bvh/NewsletterSignup";
import { POSTS, getPost, getPostsRelacionados, BLOG_CONTENT } from "@/data/blog";

export function generateStaticParams() {
  return POSTS.map((a) => ({ slug: a.slug }));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CU", { day: "2-digit", month: "long", year: "numeric" });
}

function hashGradient(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const angle = Math.abs(h % 360);
  const hue1 = Math.abs(h * 7 % 360);
  const hue2 = (hue1 + 40 + Math.abs(h * 13 % 60)) % 360;
  return `linear-gradient(${angle}deg, oklch(0.55 0.09 ${hue1}), oklch(0.35 0.06 ${hue2}))`;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getPost(slug);
  if (!article) notFound();

  const content = BLOG_CONTENT[slug] ?? [article.excerpt];
  const relacionados = getPostsRelacionados(article);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-3xl px-6 py-8 md:py-12">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Volver al blog
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">{article.cat}</span>
            <span className="text-muted-foreground">{fmtDate(article.date)}</span>
          </div>
          <h1 className="mt-3 font-serif text-2xl leading-tight md:text-4xl">{article.title}</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{article.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" aria-hidden="true" />{article.author ?? "Redacción BVH"}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" aria-hidden="true" />{article.readMin ?? 4} min de lectura</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" aria-hidden="true" />{(article.views ?? 0).toLocaleString("es-CU")} vistas</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6">
        <div
          className="relative -mt-px flex aspect-video items-end overflow-hidden rounded-b-2xl"
          style={{ background: hashGradient(slug) }}
        >
          <div className="w-full bg-gradient-to-t from-black/60 to-transparent p-6">
            <p className="text-[11px] leading-relaxed text-white/70 italic max-w-xl">{article.image}</p>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-8 md:py-12">
        <div>
          {content.map((paragraph, i) => (
            <p key={i} className="mb-3 text-[14px] leading-6 text-foreground/80 last:mb-0">{paragraph}</p>
          ))}
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest">Categoría:</span>
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-primary">{article.cat}</span>
          </div>
          <Link href="/blog" className="text-primary hover:underline text-[11px] uppercase tracking-widest">← Volver al blog</Link>
        </footer>

        {relacionados.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-[10px] uppercase tracking-[0.24em] text-primary">Artículos relacionados</h2>
            <div className="grid gap-px bg-border rounded-xl overflow-hidden md:grid-cols-3">
              {relacionados.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="bg-background p-4 transition-colors hover:bg-card">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary mb-2">{r.cat}</div>
                  <h3 className="font-serif text-sm leading-snug text-foreground">{r.title}</h3>
                  <div className="mt-2 text-[10px] text-muted-foreground">{fmtDate(r.date)} · {r.readMin} min</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 rounded-2xl border border-border p-6 md:p-10 text-center" style={{ background: "var(--gradient-hero)" }}>
          <h3 className="font-serif text-xl leading-tight text-foreground md:text-2xl">
            Suscríbete al <span className="italic text-primary">boletín semanal</span>
          </h3>
          <p className="mt-3 max-w-lg mx-auto text-[13px] leading-relaxed text-muted-foreground">
            Un ensayo cada domingo en tu bandeja. Profundo, sin ruido.
          </p>
          <div className="mt-6">
            <NewsletterSignup cta="Suscribirme" placeholder="tu@correo.cu" hint="" />
          </div>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
