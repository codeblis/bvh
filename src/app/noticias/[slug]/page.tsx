import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, User } from "lucide-react";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { isEditorialScope } from "@/lib/scope";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { NewsletterSignup } from "@/components/bvh/NewsletterSignup";
import { ArticleCover } from "@/components/bvh/ArticleCover";
import { MarkdownContent } from "@/components/bvh/MarkdownContent";
import {
	getPublishedArticle,
	listRelatedArticles,
} from "@/modules/content/repository.server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const article = await getPublishedArticle("noticia", slug);
	if (!article) return {};
	return {
		title: `${article.title} | BVH`,
		description: article.excerpt,
		alternates: { canonical: `/noticias/${slug}` },
		openGraph: {
			title: article.title,
			description: article.excerpt,
			type: "article",
			publishedTime: article.date,
			images: article.image
				? [{ url: article.image, alt: article.imageAlt }]
				: undefined,
		},
	};
}

function fmtDate(iso: string) {
	return new Date(iso).toLocaleDateString("es-CU", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

export default async function NoticiaPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const article = await getPublishedArticle("noticia", slug);
	if (!article) notFound();

	const relacionadas = await listRelatedArticles(article, "noticia");

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main id="contenido">

			<div
				className="border-b border-border"
				style={{ background: "var(--gradient-hero)" }}
			>
				<div className="mx-auto max-w-3xl px-6 py-8 md:py-12">
					<Link
						href="/noticias"
						className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition"
					>
						<ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
						Volver a noticias
					</Link>
					<div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
						<span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
							{article.cat}
						</span>
						<span className="text-muted-foreground">
							{fmtDate(article.date)}
						</span>
					</div>
					<h1 className="mt-3 font-serif text-2xl leading-tight md:text-4xl">
						{article.title}
					</h1>
					<p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
						{article.excerpt}
					</p>
					<div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<User className="w-3.5 h-3.5" aria-hidden="true" />
							{article.author ?? "Redacción BVH"}
						</span>
						<span className="flex items-center gap-1.5">
							<Clock className="w-3.5 h-3.5" aria-hidden="true" />
							{article.readMin ?? 4} min de lectura
						</span>
						<span className="flex items-center gap-1.5">
							<Eye className="w-3.5 h-3.5" aria-hidden="true" />
							{(article.views ?? 0).toLocaleString("es-CU")} vistas
						</span>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-3xl px-6">
				<ArticleCover
					slug={slug}
					src={article.image}
					alt={article.imageAlt}
					className="-mt-px aspect-video w-full rounded-b-2xl"
				/>
			</div>

			<article className="mx-auto max-w-3xl px-6 py-8 md:py-12">
				<MarkdownContent source={article.content} />

				<footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-[12px] text-muted-foreground">
					<div className="flex items-center gap-2">
						<span className="text-[10px] uppercase tracking-widest">
							Categoría:
						</span>
						<span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-primary">
							{article.cat}
						</span>
					</div>
					<Link
						href="/noticias"
						className="text-primary hover:underline text-[11px] uppercase tracking-widest"
					>
						← Volver al listado
					</Link>
				</footer>

				{relacionadas.length > 0 && (
					<section className="mt-10">
						<h2 className="mb-4 text-[10px] uppercase tracking-[0.24em] text-primary">
							Noticias relacionadas
						</h2>
						<div className="grid gap-px bg-border rounded-xl overflow-hidden md:grid-cols-3">
							{relacionadas.map((r) => (
								<Link
									key={r.id}
									href={`/noticias/${r.slug}`}
									className="bg-background p-4 transition-colors hover:bg-card"
								>
									<div className="text-[10px] uppercase tracking-[0.2em] text-primary mb-2">
										{r.cat}
									</div>
									<h3 className="font-serif text-sm leading-snug text-foreground">
										{r.title}
									</h3>
									<div className="mt-2 text-[10px] text-muted-foreground">
										{fmtDate(r.date)} · {r.readMin} min
									</div>
								</Link>
							))}
						</div>
					</section>
				)}

				{isEditorialScope() ? null : (
				<div
					className="mt-10 rounded-2xl border border-border p-6 md:p-10 text-center"
					style={{ background: "var(--gradient-hero)" }}
				>
					<h3 className="font-serif text-xl leading-tight text-foreground md:text-2xl">
						Suscríbete al{" "}
						<span className="italic text-primary">boletín diario</span>
					</h3>
					<p className="mt-3 max-w-lg mx-auto text-[13px] leading-relaxed text-muted-foreground">
						Recibe cada mañana el resumen ejecutivo de lo que importa en la
						economía cubana.
					</p>
					<div className="mt-6">
						<NewsletterSignup
							lista="noticias"
							source="detalle-noticias"
							cta="Suscribirme"
							placeholder="tu@correo.cu"
							hint=""
						/>
					</div>
				</div>
				)}
			</article>

			</main>
			<SiteFooter />
		</div>
	);
}
