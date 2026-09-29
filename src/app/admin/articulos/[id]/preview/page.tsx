import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCover } from "@/components/bvh/ArticleCover";
import { MarkdownContent } from "@/components/bvh/MarkdownContent";
import { requireAdmin } from "@/lib/admin";
import { EDITORIAL_BUCKET } from "@/modules/content/media";

export const metadata: Metadata = {
	title: "Vista previa editorial · BVH",
	robots: { index: false, follow: false },
};

export default async function ArticlePreviewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const { supabase } = await requireAdmin();
	const { data: article, error } = await supabase
		.from("articles")
		.select(
			"id, title, slug, excerpt, content, type, status, published_at, created_at, featured_image_path, featured_image_alt, categories(name)",
		)
		.eq("id", id)
		.maybeSingle();
	if (error)
		throw new Error(`No se pudo cargar la vista previa: ${error.message}`);
	if (!article) notFound();

	const category = Array.isArray(article.categories)
		? article.categories[0]?.name
		: article.categories?.name;
	const coverUrl = article.featured_image_path
		? /^https?:\/\//i.test(article.featured_image_path)
			? article.featured_image_path
			: supabase.storage
					.from(EDITORIAL_BUCKET)
					.getPublicUrl(article.featured_image_path).data.publicUrl
		: undefined;
	const date = article.published_at ?? article.created_at;

	return (
		<div className="mx-auto max-w-3xl">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
				<span>
					Vista previa privada · {article.status ?? "borrador"} · {article.type}
				</span>
				<Link
					href={`/admin/articulos/${article.id}`}
					className="font-semibold underline"
				>
					Volver al editor
				</Link>
			</div>
			<header className="mb-6">
				<div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-primary">
					<span>{category ?? "Sin categoría"}</span>
					{date ? (
						<time dateTime={date}>
							{new Date(date).toLocaleDateString("es-CU")}
						</time>
					) : null}
				</div>
				<h1 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
					{article.title}
				</h1>
				{article.excerpt ? (
					<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
						{article.excerpt}
					</p>
				) : null}
			</header>
			<ArticleCover
				slug={article.slug}
				src={coverUrl}
				alt={article.featured_image_alt ?? undefined}
				className="mb-8 aspect-video w-full rounded-xl"
			/>
			<article>
				<MarkdownContent source={article.content} />
			</article>
		</div>
	);
}
