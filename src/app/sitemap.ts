import type { MetadataRoute } from "next";
import { listPublishedArticles } from "@/modules/content/repository.server";

export const dynamic = "force-dynamic";

const siteUrl = (
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolsadelahabana.com"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [news, posts] = await Promise.all([
		listPublishedArticles("noticia"),
		listPublishedArticles("blog"),
	]);
	const staticPaths = [
		"",
		"/acerca",
		"/blog",
		"/contacto",
		"/cotizar",
		"/historia",
		"/indices",
		"/instituto",
		"/mercados",
		"/noticias",
		"/privacidad",
		"/terminos",
	];

	return [
		...staticPaths.map((path) => ({ url: `${siteUrl}${path}` })),
		...news.map((article) => ({
			url: `${siteUrl}/noticias/${article.slug}`,
			lastModified: new Date(article.date),
		})),
		...posts.map((article) => ({
			url: `${siteUrl}/blog/${article.slug}`,
			lastModified: new Date(article.date),
		})),
	];
}
