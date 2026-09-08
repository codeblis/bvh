import { z } from "zod";
import { slugify } from "@/lib/utils";

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => value || null);

export const articleFormSchema = z.object({
	id: z.string().uuid().optional(),
	title: z.string().trim().min(5).max(160),
	slug: z.string().trim().min(1).max(180),
	excerpt: optionalText(500),
	content: z.string().trim().min(20).max(100_000),
	type: z.enum(["noticia", "blog"]),
	status: z.enum(["borrador", "publicado"]),
	categoryId: z
		.union([z.literal(""), z.string().uuid()])
		.transform((value) => value || null),
	publishedAt: z
		.union([
			z.literal(""),
			z.string().refine((value) => !Number.isNaN(Date.parse(value))),
		])
		.transform((value) => value || undefined),
});

export function parseArticleForm(formData: FormData) {
	const title = String(formData.get("title") ?? "");
	const slug = slugify(String(formData.get("slug") ?? "") || title);

	return articleFormSchema.safeParse({
		id: String(formData.get("id") ?? "") || undefined,
		title,
		slug,
		excerpt: String(formData.get("excerpt") ?? ""),
		content: String(formData.get("content") ?? ""),
		type: String(formData.get("type") ?? ""),
		status: String(formData.get("status") ?? ""),
		categoryId: String(formData.get("category_id") ?? ""),
		publishedAt: String(formData.get("published_at") ?? ""),
	});
}
