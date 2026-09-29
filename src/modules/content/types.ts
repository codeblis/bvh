export type ArticleType = "noticia" | "blog";

export type ArticleSummary = {
	id: string;
	slug: string;
	cat: string;
	date: string;
	title: string;
	excerpt: string;
	author?: string;
	readMin?: number;
	views?: number;
	image?: string;
	imageAlt?: string;
	categoryId?: string | null;
};

export type PublishedArticle = ArticleSummary & {
	content: string;
};
