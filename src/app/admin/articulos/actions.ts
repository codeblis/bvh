"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import { ARTICLE_STATUSES, ARTICLE_TYPES, inList } from "../_status";

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

export async function saveArticle(formData: FormData) {
	const { supabase, user } = await requireAdmin();

	const id = text(formData, "id");
	const title = text(formData, "title");
	const content = text(formData, "content");
	if (!title || !content) return;

	const slugInput = text(formData, "slug");
	const type = text(formData, "type");
	const status = text(formData, "status");
	const publishedAt = text(formData, "published_at");
	const categoryId = text(formData, "category_id");

	const safeStatus = inList(ARTICLE_STATUSES, status) ? status : "borrador";
	const payload = {
		title,
		slug: slugify(slugInput || title),
		type: inList(ARTICLE_TYPES, type) ? type : "noticia",
		status: safeStatus,
		excerpt: text(formData, "excerpt") || null,
		content,
		featured_image: text(formData, "featured_image") || null,
		category_id: categoryId || null,
		published_at: publishedAt
			? new Date(publishedAt).toISOString()
			: safeStatus === "publicado"
				? new Date().toISOString()
				: null,
	};

	if (id) {
		await supabase.from("articles").update(payload).eq("id", id);
	} else {
		await supabase.from("articles").insert({ ...payload, author_id: user.id });
	}

	revalidatePath("/admin/articulos");
	revalidatePath("/admin");
	redirect("/admin/articulos");
}

export async function deleteArticle(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (id) await supabase.from("articles").delete().eq("id", id);
	revalidatePath("/admin/articulos");
	revalidatePath("/admin");
}
