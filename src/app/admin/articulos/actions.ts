"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
	createEditorialImagePath,
	EDITORIAL_BUCKET,
	isManagedEditorialPath,
	validateEditorialImage,
} from "@/modules/content/media";
import { parseArticleForm } from "@/modules/content/schemas";

const coverFormSchema = z.object({
	id: z.string().uuid(),
	alt: z.string().trim().min(3).max(300),
});

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

function editorPath(id: string, query: string) {
	return `/admin/articulos/${id || "nuevo"}?${query}`;
}

function revalidateArticle(type: string, slug?: string) {
	revalidatePath("/admin");
	revalidatePath("/admin/articulos");
	revalidatePath(type === "noticia" ? "/noticias" : "/blog");
	if (slug) {
		revalidatePath(type === "noticia" ? `/noticias/${slug}` : `/blog/${slug}`);
	}
}

export async function saveArticle(formData: FormData) {
	const { supabase, user } = await requireAdmin();
	const parsed = parseArticleForm(formData);
	const submittedId = text(formData, "id");
	if (!parsed.success) redirect(editorPath(submittedId, "error=invalid"));

	const {
		id,
		title,
		slug,
		type,
		status,
		excerpt,
		content,
		categoryId,
		publishedAt,
	} = parsed.data;
	let existing: {
		type: string;
		status: string | null;
		slug: string;
		published_at: string | null;
		featured_image_path: string | null;
		featured_image_alt: string | null;
	} | null = null;

	if (id) {
		const result = await supabase
			.from("articles")
			.select(
				"type, status, slug, published_at, featured_image_path, featured_image_alt",
			)
			.eq("id", id)
			.maybeSingle();
		if (result.error || !result.data)
			redirect(editorPath(id, "error=not-found"));
		existing = result.data;
	}

	if (
		existing?.status === "publicado" &&
		(existing.slug !== slug || existing.type !== type)
	) {
		redirect(editorPath(id ?? "", "error=identity"));
	}

	if (
		status === "publicado" &&
		(!excerpt ||
			!categoryId ||
			!existing?.featured_image_path ||
			!existing.featured_image_alt)
	) {
		redirect(editorPath(id ?? "", "error=incomplete-publish"));
	}

	const payload = {
		title,
		slug,
		type,
		status,
		excerpt,
		content,
		category_id: categoryId,
		published_at:
			status === "publicado"
				? publishedAt
					? new Date(publishedAt).toISOString()
					: (existing?.published_at ?? new Date().toISOString())
				: null,
	};

	let savedId = id;
	let saveError: { code?: string; message: string } | null = null;
	if (id) {
		const result = await supabase
			.from("articles")
			.update(payload)
			.eq("id", id)
			.select("id")
			.maybeSingle();
		saveError = result.error;
		if (!result.data && !saveError) redirect(editorPath(id, "error=not-found"));
	} else {
		const result = await supabase
			.from("articles")
			.insert({ ...payload, author_id: user.id })
			.select("id")
			.single();
		saveError = result.error;
		savedId = result.data?.id;
	}

	if (saveError) {
		const reason = saveError.code === "23505" ? "slug" : "save";
		redirect(editorPath(id ?? "", `error=${reason}`));
	}
	if (!savedId) redirect(editorPath(id ?? "", "error=save"));

	if (existing && (existing.type !== type || existing.slug !== slug)) {
		revalidateArticle(existing.type, existing.slug);
	}
	revalidateArticle(type, slug);
	redirect(editorPath(savedId, "saved=true"));
}

export async function uploadArticleCover(formData: FormData) {
	const { supabase } = await requireAdmin();
	const parsed = coverFormSchema.safeParse({
		id: text(formData, "id"),
		alt: text(formData, "featured_image_alt"),
	});
	if (!parsed.success) {
		redirect(editorPath(text(formData, "id"), "error=cover-fields"));
	}

	const file = formData.get("cover");
	if (!(file instanceof File)) {
		redirect(editorPath(parsed.data.id, "error=cover-file"));
	}
	const validation = validateEditorialImage(file);
	if (!validation.ok) {
		redirect(editorPath(parsed.data.id, `error=cover-${validation.error}`));
	}

	const articleResult = await supabase
		.from("articles")
		.select("id, type, slug, featured_image_path")
		.eq("id", parsed.data.id)
		.maybeSingle();
	if (articleResult.error || !articleResult.data) {
		redirect(editorPath(parsed.data.id, "error=not-found"));
	}

	const article = articleResult.data;
	const path = createEditorialImagePath(
		article.type as "noticia" | "blog",
		article.id,
		validation.extension,
	);
	const upload = await supabase.storage
		.from(EDITORIAL_BUCKET)
		.upload(path, file, {
			cacheControl: "31536000",
			contentType: file.type,
			upsert: false,
		});
	if (upload.error) redirect(editorPath(article.id, "error=cover-upload"));

	const update = await supabase
		.from("articles")
		.update({
			featured_image_path: path,
			featured_image_alt: parsed.data.alt,
		})
		.eq("id", article.id)
		.select("id")
		.maybeSingle();
	if (update.error || !update.data) {
		await supabase.storage.from(EDITORIAL_BUCKET).remove([path]);
		redirect(editorPath(article.id, "error=cover-save"));
	}

	let cleanupPending = false;
	if (isManagedEditorialPath(article.featured_image_path)) {
		const cleanup = await supabase.storage
			.from(EDITORIAL_BUCKET)
			.remove([article.featured_image_path as string]);
		cleanupPending = Boolean(cleanup.error);
	}

	revalidateArticle(article.type, article.slug);
	redirect(
		editorPath(
			article.id,
			cleanupPending ? "cover=updated&cleanup=pending" : "cover=updated",
		),
	);
}

export async function removeArticleCover(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (!z.string().uuid().safeParse(id).success) {
		redirect("/admin/articulos?error=invalid");
	}

	const articleResult = await supabase
		.from("articles")
		.select("type, slug, status, featured_image_path")
		.eq("id", id)
		.maybeSingle();
	if (articleResult.error || !articleResult.data) {
		redirect(editorPath(id, "error=not-found"));
	}
	const article = articleResult.data;
	if (article.status === "publicado") {
		redirect(editorPath(id, "error=published-cover"));
	}

	const update = await supabase
		.from("articles")
		.update({ featured_image_path: null, featured_image_alt: null })
		.eq("id", id);
	if (update.error) redirect(editorPath(id, "error=cover-remove"));

	let cleanupPending = false;
	if (isManagedEditorialPath(article.featured_image_path)) {
		const cleanup = await supabase.storage
			.from(EDITORIAL_BUCKET)
			.remove([article.featured_image_path as string]);
		cleanupPending = Boolean(cleanup.error);
	}

	revalidateArticle(article.type, article.slug);
	redirect(
		editorPath(
			id,
			cleanupPending ? "cover=removed&cleanup=pending" : "cover=removed",
		),
	);
}

export async function unpublishArticle(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (!id) redirect("/admin/articulos?error=invalid");

	const { data: article, error: readError } = await supabase
		.from("articles")
		.select("type, slug")
		.eq("id", id)
		.maybeSingle();
	if (readError || !article) redirect("/admin/articulos?error=unpublish");

	const { error } = await supabase
		.from("articles")
		.update({ status: "borrador", published_at: null })
		.eq("id", id);
	if (error) redirect("/admin/articulos?error=unpublish");

	revalidateArticle(article.type, article.slug);
	redirect("/admin/articulos");
}
