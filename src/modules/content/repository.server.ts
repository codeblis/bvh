import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { EDITORIAL_BUCKET } from "./media";
import type { ArticleSummary, ArticleType, PublishedArticle } from "./types";

const PUBLIC_ARTICLE_FIELDS =
	"id, slug, title, excerpt, content, featured_image_path, featured_image_alt, category_id, published_at, created_at, views, categories(name)";

function readingMinutes(content: string) {
	const words = content.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}

function toSummary(row: {
	id: string;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string;
	featured_image_path: string | null;
	featured_image_alt: string | null;
	category_id: string | null;
	published_at: string | null;
	created_at: string | null;
	views: number | null;
	categories: { name: string } | { name: string }[] | null;
}): ArticleSummary {
	const category = Array.isArray(row.categories)
		? row.categories[0]?.name
		: row.categories?.name;

	return {
		id: row.id,
		slug: row.slug,
		cat: category ?? "Sin categoría",
		date: row.published_at ?? row.created_at ?? new Date(0).toISOString(),
		title: row.title,
		excerpt: row.excerpt ?? "",
		author: "Redacción BVH",
		readMin: readingMinutes(row.content),
		views: row.views ?? 0,
		image: row.featured_image_path ?? undefined,
		imageAlt: row.featured_image_alt ?? undefined,
		categoryId: row.category_id,
	};
}

export async function listPublishedArticles(type: ArticleType) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("articles")
		.select(PUBLIC_ARTICLE_FIELDS)
		.eq("type", type)
		.eq("status", "publicado")
		.order("published_at", { ascending: false, nullsFirst: false })
		.order("id", { ascending: false })
		.limit(100);

	if (error) throw new Error(`No se pudo cargar ${type}: ${error.message}`);
	return (data ?? []).map((row) => withPublicCover(toSummary(row), supabase));
}

function withPublicCover(
	article: ArticleSummary,
	supabase: Awaited<ReturnType<typeof createClient>>,
) {
	if (!article.image) return article;
	if (/^https?:\/\//i.test(article.image)) return article;
	return {
		...article,
		image: supabase.storage.from(EDITORIAL_BUCKET).getPublicUrl(article.image)
			.data.publicUrl,
	};
}

export const getPublishedArticle = cache(
	async (type: ArticleType, slug: string): Promise<PublishedArticle | null> => {
		const supabase = await createClient();
		const { data, error } = await supabase
			.from("articles")
			.select(PUBLIC_ARTICLE_FIELDS)
			.eq("type", type)
			.eq("status", "publicado")
			.eq("slug", slug)
			.maybeSingle();

		if (error)
			throw new Error(`No se pudo cargar el artículo: ${error.message}`);
		if (!data) return null;

		return {
			...withPublicCover(toSummary(data), supabase),
			content: data.content,
		};
	},
);

export async function listRelatedArticles(
	article: PublishedArticle,
	type: ArticleType,
	limit = 3,
) {
	const supabase = await createClient();
	let query = supabase
		.from("articles")
		.select(PUBLIC_ARTICLE_FIELDS)
		.eq("type", type)
		.eq("status", "publicado")
		.neq("id", article.id)
		.order("published_at", { ascending: false, nullsFirst: false })
		.limit(limit);

	if (article.categoryId) query = query.eq("category_id", article.categoryId);

	const { data, error } = await query;
	if (error)
		throw new Error(`No se pudieron cargar relacionados: ${error.message}`);
	return (data ?? []).map((row) => withPublicCover(toSummary(row), supabase));
}
